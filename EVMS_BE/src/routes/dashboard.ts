import { Router } from 'express';
import { getDashboardStats, getInventoryStats, getServiceStats } from '../controllers/dashboardController.js';

export const dashboardRouter = Router();

/**
 * GET /api/dashboard/stats
 * Lấy thống kê tổng quan cho Dashboard
 */
dashboardRouter.get('/stats', getDashboardStats);

/**
 * GET /api/dashboard/inventory-stats
 * Lấy thống kê tồn kho cho Dashboard
 */
dashboardRouter.get('/inventory-stats', getInventoryStats);

/**
 * GET /api/dashboard/service-stats
 * Lấy thống kê dịch vụ cho Dashboard
 */
dashboardRouter.get('/service-stats', getServiceStats);

