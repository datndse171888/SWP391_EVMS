import { Router } from 'express';
import { getDashboardStats, getInventoryStats } from '../controllers/dashboardController.js';

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

