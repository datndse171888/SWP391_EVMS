import { Router } from 'express';
import { getRevenueOverview, getTopServices, getRevenueComparison } from '../controllers/revenueController.js';
import { cacheMiddleware } from '../middleware/cache.js';

export const revenueRouter = Router();

/**
 * GET /api/revenue/overview
 * Lấy tổng quan doanh thu theo khoảng thời gian
 * Cache: 60 seconds
 */
revenueRouter.get('/overview', cacheMiddleware(60), getRevenueOverview);

/**
 * GET /api/revenue/top-services
 * Lấy top 5 dịch vụ có doanh thu cao nhất
 * Cache: 60 seconds
 */
revenueRouter.get('/top-services', cacheMiddleware(60), getTopServices);

/**
 * GET /api/revenue/comparison
 * So sánh doanh thu giữa các kỳ
 * Cache: 60 seconds
 */
revenueRouter.get('/comparison', cacheMiddleware(60), getRevenueComparison);

