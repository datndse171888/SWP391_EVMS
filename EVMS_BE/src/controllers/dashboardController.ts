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

