import { Router } from 'express';
import { getDashboardStats, getInventoryStats, getServiceStats } from '../controllers/dashboardController.js';
import { cacheMiddleware } from '../middleware/cache.js';

export const dashboardRouter = Router();

/**
 * GET /api/dashboard/stats
 * Lấy thống kê tổng quan cho Dashboard
 * Cache: 30 seconds
 */
dashboardRouter.get('/stats', cacheMiddleware(30), getDashboardStats);

/**
 * GET /api/dashboard/inventory-stats
 * Lấy thống kê tồn kho cho Dashboard
 * Cache: 60 seconds
 */
dashboardRouter.get('/inventory-stats', cacheMiddleware(60), getInventoryStats);

/**
 * GET /api/dashboard/service-stats
 * Lấy thống kê dịch vụ cho Dashboard
 * Cache: 60 seconds
 */
dashboardRouter.get('/service-stats', cacheMiddleware(60), getServiceStats);

