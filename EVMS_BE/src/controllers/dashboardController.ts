import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Inventory } from '../models/Inventory.js';
import { Part } from '../models/Part.js';
import { Service } from '../models/Service.js';

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
 * Lấy thống kê tồn kho cho Dashboard
 * - Tổng số items trong kho
 * - Tổng giá trị tồn kho
 * - Số lượng theo category
 * - Số lượng low stock
 */
export async function getInventoryStats(req: Request, res: Response) {
  try {
    // Sử dụng MongoDB aggregation với lookup để tối ưu performance
    const stats = await Inventory.aggregate([
      {
        $lookup: {
          from: 'parts',
          localField: 'partID',
          foreignField: '_id',
          as: 'part'
        }
      },
      {
        $unwind: {
          path: '$part',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $facet: {
          // Tính tổng items và value
          totals: [
            {
              $group: {
                _id: null,
                totalItems: { $sum: '$quantity' },
                totalValue: { $sum: { $multiply: ['$quantity', { $ifNull: ['$part.price', 0] }] } }
              }
            }
          ],
          // Đếm theo category
          byCategory: [
            {
              $group: {
                _id: '$part.category',
                count: { $sum: '$quantity' }
              }
            }
          ],
          // Đếm low stock
          lowStock: [
            {
              $match: {
                $or: [
                  { status: 'low_stock' },
                  { status: 'out_of_stock' }
                ]
              }
            },
            { $count: 'count' }
          ]
        }
      }
    ]);

    const result = stats[0];

    // Parse kết quả
    const totalItems = result.totals[0]?.totalItems || 0;
    const totalValue = result.totals[0]?.totalValue || 0;
    const lowStockCount = result.lowStock[0]?.count || 0;

    const byCategory: Record<string, number> = {};
    result.byCategory.forEach((item: any) => {
      if (item._id) {
        byCategory[item._id] = item.count;
      }
    });

    // Trả về response
    return res.status(200).json({
      success: true,
      data: {
        totalItems,
        totalValue,
        byCategory,
        lowStockCount
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

