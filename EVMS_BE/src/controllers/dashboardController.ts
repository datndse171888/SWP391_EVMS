import { Request, Response } from 'express';
import { User } from '../models/User.js';

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

