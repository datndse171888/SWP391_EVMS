import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Inventory } from '../models/Inventory.js';
import { Part } from '../models/Part.js';

/**
 * GET /api/dashboard/stats
 * Lấy thống kê tổng quan cho Dashboard
 * - Tổng số users
 * - Số lượng users theo role
 * - Số lượng users theo status (active/disabled)
 */
export async function getDashboardStats(req: Request, res: Response) {
  try {
    // Lấy tất cả users (chỉ lấy các field cần thiết để tối ưu performance)
    const users = await User.find({}, { role: 1, isDisabled: 1 }).lean();

    // Tính tổng số users
    const totalUsers = users.length;

    // Đếm users theo role
    const usersByRole: Record<string, number> = {};
    users.forEach(user => {
      const role = user.role || 'customer';
      usersByRole[role] = (usersByRole[role] || 0) + 1;
    });

    // Đếm số technicians
    const totalTechnicians = usersByRole['technician'] || 0;

    // Đếm users theo status
    let activeUsers = 0;
    let disabledUsers = 0;
    users.forEach(user => {
      if (user.isDisabled) {
        disabledUsers++;
      } else {
        activeUsers++;
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
    // Lấy tất cả inventory items với thông tin part
    const inventories = await Inventory.find({})
      .populate('partID', 'category price')
      .lean();

    // Tính tổng số items
    let totalItems = 0;
    let totalValue = 0;
    let lowStockCount = 0;
    const byCategory: Record<string, number> = {};

    inventories.forEach((inv: any) => {
      const quantity = inv.quantity || 0;
      totalItems += quantity;

      // Tính tổng giá trị (quantity * price)
      if (inv.partID && inv.partID.price) {
        totalValue += quantity * inv.partID.price;
      }

      // Đếm low stock
      if (inv.status === 'low_stock' || inv.status === 'out_of_stock') {
        lowStockCount++;
      }

      // Đếm theo category
      if (inv.partID && inv.partID.category) {
        const category = inv.partID.category;
        byCategory[category] = (byCategory[category] || 0) + quantity;
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

