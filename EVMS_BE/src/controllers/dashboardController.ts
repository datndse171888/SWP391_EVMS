import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Inventory } from '../models/Inventory.js';
import { Part } from '../models/Part.js';
import { Service } from '../models/Service.js';
import { Appointment } from '../models/Appointment.js';
import mongoose from 'mongoose';
import { Technician } from '../models/Technician.js';
import { Checklist } from '../models/Checklist.js';

/**
 * GET /api/dashboard/stats
 * Lấy thống kê tổng quan cho Dashboard
 * - Tổng số users
 * - Số lượng users theo role
 * - Số lượng users theo status (active/disabled)
 */
export async function getDashboardStats(req: Request, res: Response) {
  try {
    // Sử dụng MongoDB aggregation để tối ưu performance
    const stats = await User.aggregate([
      {
        $facet: {
          // Đếm tổng users
          total: [{ $count: 'count' }],
          // Đếm theo role
          byRole: [
            { $group: { _id: '$role', count: { $sum: 1 } } }
          ],
          // Đếm theo status
          byStatus: [
            { $group: { _id: '$isDisabled', count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    const result = stats[0];

    // Parse kết quả
    const totalUsers = result.total[0]?.count || 0;

    const usersByRole: Record<string, number> = {};
    result.byRole.forEach((item: any) => {
      usersByRole[item._id || 'customer'] = item.count;
    });

    const totalTechnicians = usersByRole['technician'] || 0;

    let activeUsers = 0;
    let disabledUsers = 0;
    result.byStatus.forEach((item: any) => {
      if (item._id === true) {
        disabledUsers = item.count;
      } else {
        activeUsers = item.count;
      }
    });

    // Trả về response
    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTechnicians,
        usersByRole,
        usersByStatus: {
          active: activeUsers,
          disabled: disabledUsers
        }
      }
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê dashboard',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * GET /api/dashboard/inventory-stats
 * Lấy thống kê linh kiện cho Dashboard
 * - Tổng số loại linh kiện (Part count)
 * - Tổng số lượng tồn kho
 * - Số lượng theo category
 * - Số lượng low stock
 */
export async function getInventoryStats(req: Request, res: Response) {
  try {
    // Đếm số loại linh kiện từ Part collection
    const partStats = await Part.aggregate([
      {
        $facet: {
          // Đếm tổng số Part
          total: [{ $count: 'count' }],
          // Đếm theo category
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    // Tính tổng số lượng tồn kho từ Inventory
    const inventoryStats = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    const partResult = partStats[0];

    // Parse kết quả
    const totalParts = partResult.total[0]?.count || 0; // Số loại linh kiện
    const totalQuantity = inventoryStats[0]?.totalQuantity || 0; // Tổng số lượng tồn kho

    const byCategory: Record<string, number> = {};
    partResult.byCategory.forEach((item: any) => {
      if (item._id) {
        byCategory[item._id] = item.count;
      }
    });

    // Trả về response
    return res.status(200).json({
      success: true,
      data: {
        totalItems: totalParts, // Số loại linh kiện (Part count)
        totalQuantity, // Tổng số lượng tồn kho
        byCategory, // Số loại linh kiện theo category
        lowStockCount: 0 // Deprecated, giữ lại để tương thích
      }
    });
  } catch (error) {
    console.error('Error in getInventoryStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê tồn kho',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * GET /api/dashboard/service-stats
 * Lấy thống kê dịch vụ cho Dashboard
 * - Tổng số dịch vụ
 * - Số lượng theo vehicleCategory (CAR, BICYCLE, MOTOBIKE)
 * - Số lượng theo tên dịch vụ (top services)
 */
export async function getServiceStats(req: Request, res: Response) {
  try {
    // Sử dụng MongoDB aggregation để tối ưu performance
    const stats = await Service.aggregate([
      {
        $facet: {
          // Đếm tổng services
          total: [{ $count: 'count' }],
          // Đếm theo vehicleCategory
          byVehicleCategory: [
            { $group: { _id: '$vehicleCategory', count: { $sum: 1 } } }
          ],
          // Đếm theo tên (top 10 services)
          byName: [
            { $group: { _id: '$name', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ]);

    const result = stats[0];

    // Parse kết quả
    const totalServices = result.total[0]?.count || 0;

    const byVehicleCategory: Record<string, number> = {};
    result.byVehicleCategory.forEach((item: any) => {
      byVehicleCategory[item._id || 'OTHER'] = item.count;
    });

    const byName: Record<string, number> = {};
    result.byName.forEach((item: any) => {
      byName[item._id || 'Unknown'] = item.count;
    });

    // Trả về response
    return res.status(200).json({
      success: true,
      data: {
        totalServices,
        byVehicleCategory,
        byName
      }
    });
  } catch (error) {
    console.error('Error in getServiceStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê dịch vụ',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Technician Overview (dashboard)
export async function getTechnicianOverview(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (req.user.role !== 'technician') return res.status(403).json({ message: 'Chỉ kỹ thuật viên được phép xem' });

    // Resolve technicianId from user
    const techDoc = (await Technician.findOne({ userID: req.user.id }).select('_id').lean()
      || await Technician.findOne({ userID: new mongoose.Types.ObjectId(req.user.id) }).select('_id').lean()) as any;
    if (!techDoc) return res.status(404).json({ message: 'Không tìm thấy hồ sơ technician' });
    const technicianId = String(techDoc._id);

    const range = String(req.query.range || 'week'); // today | week | month

    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);
    start.setHours(0, 0, 0, 0);
    if (range === 'today') {
      // already set
    } else if (range === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    } else {
      // week (default) - start from Monday
      const day = start.getDay(); // 0-6 (Sun-Sat)
      const diff = (day === 0 ? -6 : 1 - day); // move to Monday
      start.setDate(start.getDate() + diff);
    }

    // Helper: match appointments assigned to current technician
    const baseMatch = {
      bookingDate: { $gte: start, $lte: end },
      $or: [
        { technicianLeaderID: new mongoose.Types.ObjectId(technicianId) },
        { technicianSupport1ID: new mongoose.Types.ObjectId(technicianId) },
        { technicianSupport2ID: new mongoose.Types.ObjectId(technicianId) },
      ],
    } as any;

    // Today range for quick KPIs
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const [todayTotal, todayConfirmed, todayInProgress, upcoming, inventoryAgg, appointmentStatsAgg, checklistPendingAgg, appointmentAwaitingAgg, checklistProgressAgg, performanceAgg] = await Promise.all([
      Appointment.countDocuments({
        bookingDate: { $gte: todayStart, $lte: todayEnd },
        status: { $nin: ['cancelled', 'no_show'] },
        $or: baseMatch.$or,
      }),
      Appointment.countDocuments({
        bookingDate: { $gte: todayStart, $lte: todayEnd },
        status: 'confirmed',
        $or: baseMatch.$or,
      }),
      Appointment.countDocuments({
        bookingDate: { $gte: todayStart, $lte: todayEnd },
        status: 'in_progress',
        $or: baseMatch.$or,
      }),
      Appointment.find({
        bookingDate: { $gte: new Date() },
        status: { $in: ['confirmed', 'in_progress'] },
        $or: baseMatch.$or,
      })
        .sort({ bookingDate: 1 })
        .limit(5)
        .select('_id bookingDate status userID serviceID servicePackageID')
        .populate([{ path: 'userID', select: 'fullName userName' }, { path: 'serviceID', select: 'name' }, { path: 'servicePackageID', select: 'name' }])
        .lean(),
      // Inventory counts via quantity thresholds (consistent with calculateStatus)
      Inventory.aggregate([
        {
          $group: {
            _id: null,
            totalLowStock: {
              $sum: {
                $cond: [{ $and: [{ $gt: ['$quantity', 0] }, { $lte: ['$quantity', 10] }] }, 1, 0]
              }
            },
            totalInStock: {
              $sum: {
                $cond: [{ $gt: ['$quantity', 10] }, 1, 0]
              }
            }
          }
        }
      ]),
      // Ô trái: Appointments confirmed + awaiting_payment
      Appointment.aggregate([
        {
          $match: {
            ...baseMatch,
            status: { $in: ['confirmed', 'awaiting_payment'] }
          }
        },
        {
          $group: {
            _id: null,
            confirmedAndAwaiting: { $sum: 1 },
            awaitingPayment: {
              $sum: { $cond: [{ $eq: ['$status', 'awaiting_payment'] }, 1, 0] }
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            }
          }
        }
      ]),
      // Ô phải: Checklist in_progress (pending) + awaiting_payment (từ appointments)
      // Lấy checklist pending của technician
      Checklist.aggregate([
        {
          $match: {
            technicianID: new mongoose.Types.ObjectId(technicianId),
            status: 'pending', // in_progress = pending trong checklist
            createdAt: { $gte: start, $lte: end }
          }
        },
        {
          $count: 'pendingCount'
        }
      ]),
      // Đếm appointments awaiting_payment của technician (để cộng vào ô phải)
      Appointment.aggregate([
        {
          $match: {
            ...baseMatch,
            status: 'awaiting_payment'
          }
        },
        {
          $count: 'awaitingCount'
        }
      ]),
      // Vòng tròn tiến độ: Đếm checklist completed và pending của technician
      Checklist.aggregate([
        {
          $match: {
            technicianID: new mongoose.Types.ObjectId(technicianId),
            createdAt: { $gte: start, $lte: end },
            status: { $in: ['completed', 'pending'] }
          }
        },
        {
          $group: {
            _id: null,
            completed: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            }
          }
        }
      ]),
      // Performance per day (awaiting_payment + completed - tech làm việc tới đó)
      Appointment.aggregate([
        { $match: { ...baseMatch, status: { $in: ['awaiting_payment', 'completed'] } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$bookingDate' } },
            completed: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
    ]);

    const inv = inventoryAgg[0] || { totalLowStock: 0, totalInStock: 0 };
    const appStats = appointmentStatsAgg[0] || { confirmedAndAwaiting: 0, awaitingPayment: 0, pending: 0 };
    const checklistPending = checklistPendingAgg[0]?.pendingCount || 0;
    const appointmentAwaiting = appointmentAwaitingAgg[0]?.awaitingCount || 0;
    const checklistProgress = checklistProgressAgg[0] || { completed: 0, pending: 0 };
    
    // Ô trái: Tổng confirmed + awaiting_payment
    const leftTotal = appStats.confirmedAndAwaiting || 0;
    // Phần trăm ô trái: awaiting_payment / pending
    const leftPercent = appStats.pending > 0 
      ? Math.round((appStats.awaitingPayment / appStats.pending) * 1000) / 10 
      : 0;
    
    // Ô phải: Checklist pending + appointments awaiting_payment
    const rightTotal = checklistPending + appointmentAwaiting;
    // Phần trăm ô phải: awaiting_payment / pending (checklist)
    const rightPercent = checklistPending > 0 
      ? Math.round((appointmentAwaiting / checklistPending) * 1000) / 10 
      : 0;
    
    // Vòng tròn tiến độ: completed / (completed + pending) (checklist)
    const totalChecklists = (checklistProgress.completed || 0) + (checklistProgress.pending || 0);
    const gaugeProgressRate = totalChecklists > 0
      ? Math.round((checklistProgress.completed / totalChecklists) * 1000) / 10
      : 0;

    return res.json({
      stats: {
        totalToday: todayTotal,
        confirmedToday: todayConfirmed,
        inProgressToday: todayInProgress,
      },
      inventory: {
        totalLowStock: inv.totalLowStock || 0,
        totalInStock: inv.totalInStock || 0,
      },
      progress: {
        // Ô trái
        leftTotal, // confirmed + awaiting_payment
        leftPercent, // awaiting_payment / pending
        // Ô phải
        rightTotal, // checklist pending + appointments awaiting_payment
        rightPercent, // awaiting_payment / pending (checklist)
        // Vòng tròn tiến độ
        gaugeProgressRate, // completed / pending (checklist)
      },
      performance: performanceAgg.map((p: any) => ({ label: p._id, completed: p.completed })),
      upcoming,
      range,
    });
  } catch (error) {
    console.error('getTechnicianOverview error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi lấy tổng quan technician' });
  }
}

