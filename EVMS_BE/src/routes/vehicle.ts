import { Router } from 'express';
import { createVehicle, updateVehicle } from '../controllers/vehicleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const vehicleRouter = Router();

// POST /api/vehicles - Tạo thông tin xe mới
vehicleRouter.post('/', authMiddleware, createVehicle);

// PUT /api/vehicles/:id - Cập nhật thông tin xe
vehicleRouter.put('/:id', authMiddleware, updateVehicle);
