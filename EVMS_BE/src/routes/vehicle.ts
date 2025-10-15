import { Router } from 'express';
import { createVehicle, updateVehicle, getAllVehicles, getVehicleByID } from '../controllers/vehicleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const vehicleRouter = Router();

// POST /api/vehicles - Tạo thông tin xe mới
vehicleRouter.post('/', authMiddleware, createVehicle);

// GET /api/vehicles - Lấy danh sách xe (có phân trang, filter)
vehicleRouter.get('/', authMiddleware, getAllVehicles);

// GET /api/vehicles/:id - Lấy chi tiết xe theo ID
vehicleRouter.get('/:id', authMiddleware, getVehicleByID);

// PUT /api/vehicles/:id - Cập nhật thông tin xe
vehicleRouter.put('/:id', authMiddleware, updateVehicle);
