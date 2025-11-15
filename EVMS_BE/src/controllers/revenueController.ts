import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment.js';
import { Payment } from '../models/Payment.js';
import { Service } from '../models/Service.js';
import { ServicePackage } from '../models/ServicePackage.js';

/**
 * GET /api/revenue/overview
 * Lấy tổng quan doanh thu theo khoảng thời gian
 * Tính doanh thu từ Appointment có status = 'completed'
 * Query params: period (day|week|month|year), startDate, endDate
 */
export async function getRevenueOverview(req: Request, res: Response) {
  try {
    const { period = 'month', startDate, endDate } = req.query;

    // Xác định khoảng thời gian
    let start: Date;
    let end: Date = new Date();

    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    } else {
      // Mặc định theo period
      switch (period) {
        case 'day':
          start = new Date();
          start.setHours(0, 0, 0, 0);
          break;
        case 'week':
          start = new Date();
          start.setDate(start.getDate() - 7);
          break;
        case 'year':
          start = new Date();
          start.setFullYear(start.getFullYear() - 1);
          break;
        case 'month':
        default:
          start = new Date();
          start.setMonth(start.getMonth() - 1);
          break;
      }
    }

    // Ưu tiên tính theo Payment (status = completed). Nếu không có bản ghi, fallback Appointment.
    const paymentStats = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $project: {
          amount: 1,
          paymentMethod: 1,
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        }
      },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$amount' },
                totalTransactions: { $sum: 1 }
              }
            }
          ],
          byDate: [
            {
              $group: {
                _id: '$date',
                revenue: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          byPaymentMethod: [
            {
              $group: {
                _id: '$paymentMethod',
                revenue: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const hasPayments = Array.isArray(paymentStats) && paymentStats[0]?.totals?.length > 0;

    // Fallback: Aggregation theo Appointment (completed) -> Service/ServicePackage để lấy price
    const appointmentStats = await Appointment.aggregate([
      {
        $match: {
          status: 'completed',
          updatedAt: { $gte: start, $lte: end }
        }
      },
      {
        $facet: {
          // Appointments với Service
          withService: [
            { $match: { serviceID: { $exists: true, $ne: null } } },
            {
              $lookup: {
                from: 'services',
                localField: 'serviceID',
                foreignField: '_id',
                as: 'service'
              }
            },
            { $unwind: '$service' },
            {
              $project: {
                price: '$service.price',
                date: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
                updatedAt: 1
              }
            }
          ],
          // Appointments với ServicePackage
          withPackage: [
            { $match: { servicePackageID: { $exists: true, $ne: null } } },
            {
              $lookup: {
                from: 'servicepackages',
                localField: 'servicePackageID',
                foreignField: '_id',
                as: 'package'
              }
            },
            { $unwind: '$package' },
            {
              $project: {
                price: '$package.price',
                date: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
                updatedAt: 1
              }
            }
          ]
        }
      },
      {
        $project: {
          allAppointments: { $concatArrays: ['$withService', '$withPackage'] }
        }
      },
      { $unwind: '$allAppointments' },
      { $replaceRoot: { newRoot: '$allAppointments' } },
      {
        $facet: {
          total: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: '$price' },
                totalTransactions: { $sum: 1 }
              }
            }
          ],
          byDate: [
            {
              $group: {
                _id: '$date',
                revenue: { $sum: '$price' },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);

    // Compose response data from either payments or appointments
    let totalRevenue = 0;
    let totalTransactions = 0;
    let byDate: Array<{ date: string; revenue: number; count: number }> = [];
    let byPaymentMethod: Record<string, { revenue: number; count: number }> = {};

    if (hasPayments) {
      const p = paymentStats[0];
      totalRevenue = p.totals[0]?.totalRevenue || 0;
      totalTransactions = p.totals[0]?.totalTransactions || 0;
      byDate = (p.byDate || []).map((item: any) => ({
        date: item._id,
        revenue: item.revenue,
        count: item.count
      }));
      byPaymentMethod = (p.byPaymentMethod || []).reduce((acc: any, item: any) => {
        acc[item._id] = { revenue: item.revenue, count: item.count };
        return acc;
      }, {} as Record<string, { revenue: number; count: number }>);
    } else {
      const a = appointmentStats[0];
      const aTotalRevenue = a?.total?.[0]?.totalRevenue || 0;
      const aTotalTransactions = a?.total?.[0]?.totalTransactions || 0;
      totalRevenue = aTotalRevenue;
      totalTransactions = aTotalTransactions;
      byDate = (a?.byDate || []).map((item: any) => ({
        date: item._id,
        revenue: item.revenue,
        count: item.count
      }));
      // Không có Payment -> mặc định CASH
      byPaymentMethod = { CASH: { revenue: totalRevenue, count: totalTransactions } };
    }

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalTransactions,
        averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
        byPaymentMethod,
        byDate,
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error in getRevenueOverview:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy tổng quan doanh thu',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * GET /api/revenue/top-services
 * Lấy top 5 dịch vụ có doanh thu cao nhất
 * Tính từ Appointment completed
 * Query params: period (day|week|month|year), limit (default: 5)
 */
export async function getTopServices(req: Request, res: Response) {
  try {
    const { period = 'month', limit = 5 } = req.query;

    // Xác định khoảng thời gian
    let start: Date;
    const end: Date = new Date();

    switch (period) {
      case 'day':
        start = new Date();
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start = new Date();
        start.setDate(start.getDate() - 7);
        break;
      case 'year':
        start = new Date();
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'month':
      default:
        start = new Date();
        start.setMonth(start.getMonth() - 1);
        break;
    }

    // Aggregation: Appointment (completed) -> Service
    const topServices = await Appointment.aggregate([
      {
        $match: {
          status: 'completed',
          updatedAt: { $gte: start, $lte: end },
          serviceID: { $exists: true, $ne: null }
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceID',
          foreignField: '_id',
          as: 'service'
        }
      },
      { $unwind: '$service' },
      {
        $group: {
          _id: '$service._id',
          serviceName: { $first: '$service.name' },
          vehicleCategory: { $first: '$service.vehicleCategory' },
          servicePrice: { $first: '$service.price' },
          totalBookings: { $sum: 1 }
        }
      },
      {
        $addFields: {
          totalRevenue: { $multiply: ['$servicePrice', '$totalBookings'] }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit as string) }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        topServices: topServices.map(item => ({
          serviceID: item._id,
          serviceName: item.serviceName || 'Dịch vụ',
          vehicleCategory: item.vehicleCategory,
          totalRevenue: item.totalRevenue,
          totalBookings: item.totalBookings,
          averageRevenue: item.servicePrice
        })),
        period: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error in getTopServices:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy top dịch vụ',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * GET /api/revenue/comparison
 * So sánh doanh thu giữa các kỳ
 * Tính từ Appointment completed
 */
export async function getRevenueComparison(req: Request, res: Response) {
  try {
    const now = new Date();

    // Tháng này
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Tháng trước
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Helper function: ưu tiên Payment completed, nếu không có thì fallback Appointment
    const calculateRevenue = async (start: Date, end: Date) => {
      const paymentAgg = await Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, revenue: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]);
      if (paymentAgg.length > 0) {
        return paymentAgg[0];
      }

      const result = await Appointment.aggregate([
        {
          $match: {
            status: 'completed',
            updatedAt: { $gte: start, $lte: end }
          }
        },
        {
          $facet: {
            withService: [
              { $match: { serviceID: { $exists: true, $ne: null } } },
              {
                $lookup: {
                  from: 'services',
                  localField: 'serviceID',
                  foreignField: '_id',
                  as: 'service'
                }
              },
              { $unwind: '$service' },
              { $project: { price: '$service.price' } }
            ],
            withPackage: [
              { $match: { servicePackageID: { $exists: true, $ne: null } } },
              {
                $lookup: {
                  from: 'servicepackages',
                  localField: 'servicePackageID',
                  foreignField: '_id',
                  as: 'package'
                }
              },
              { $unwind: '$package' },
              { $project: { price: '$package.price' } }
            ]
          }
        },
        {
          $project: {
            all: { $concatArrays: ['$withService', '$withPackage'] }
          }
        },
        { $unwind: '$all' },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$all.price' },
            count: { $sum: 1 }
          }
        }
      ]);

      return result[0] || { revenue: 0, count: 0 };
    };

    const [thisMonth, lastMonth] = await Promise.all([
      calculateRevenue(thisMonthStart, thisMonthEnd),
      calculateRevenue(lastMonthStart, lastMonthEnd)
    ]);

    const thisMonthRevenue = thisMonth.revenue || 0;
    const lastMonthRevenue = lastMonth.revenue || 0;
    const thisMonthCount = thisMonth.count || 0;
    const lastMonthCount = lastMonth.count || 0;

    const revenueGrowth = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    const transactionGrowth = lastMonthCount > 0
      ? ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        thisMonth: {
          revenue: thisMonthRevenue,
          transactions: thisMonthCount,
          period: {
            start: thisMonthStart.toISOString(),
            end: thisMonthEnd.toISOString()
          }
        },
        lastMonth: {
          revenue: lastMonthRevenue,
          transactions: lastMonthCount,
          period: {
            start: lastMonthStart.toISOString(),
            end: lastMonthEnd.toISOString()
          }
        },
        growth: {
          revenue: revenueGrowth,
          transactions: transactionGrowth
        }
      }
    });
  } catch (error) {
    console.error('Error in getRevenueComparison:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi so sánh doanh thu',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

