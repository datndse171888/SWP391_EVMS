import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';

export const dashboardRouter = Router();

/**
 * GET /api/dashboard/stats
 * Lấy thống kê tổng quan cho Dashboard
 */
dashboardRouter.get('/stats', getDashboardStats);

