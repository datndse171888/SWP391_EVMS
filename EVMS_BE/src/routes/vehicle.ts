import { Router } from 'express';
import { createVehicle, updateVehicle, getAllVehicles, getVehicleByID, getUserVehicles, getVehicleMaintenance, getMyMaintenanceSummary, getVehiclePeriodicStatus, listMyPeriodicSubscriptions } from '../controllers/vehicleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const vehicleRouter = Router();

// POST /api/vehicles - Tạo thông tin xe mới
vehicleRouter.post('/', authMiddleware, createVehicle);

// GET /api/vehicles - Lấy danh sách xe (có phân trang, filter)
vehicleRouter.get('/', authMiddleware, getAllVehicles);

// GET /api/vehicles/user - Lấy xe của user hiện tại
vehicleRouter.get('/user', authMiddleware, getUserVehicles);

// GET /api/vehicles/:id - Lấy chi tiết xe theo ID
vehicleRouter.get('/:id', authMiddleware, getVehicleByID);

// Maintenance info
vehicleRouter.get('/:id/maintenance', authMiddleware, getVehicleMaintenance);
vehicleRouter.get('/maintenance/my', authMiddleware, getMyMaintenanceSummary);
vehicleRouter.get('/:id/periodic-status', authMiddleware, getVehiclePeriodicStatus);
vehicleRouter.get('/periodic/my', authMiddleware, listMyPeriodicSubscriptions);

// PUT /api/vehicles/:id - Cập nhật thông tin xe
vehicleRouter.put('/:id', authMiddleware, updateVehicle);
