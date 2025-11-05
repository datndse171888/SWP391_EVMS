import { Router } from 'express';
import { createVehicleConditionReport } from '../controllers/vehicleConditionReportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { technicianSubroleMiddleware, technicianLeaderOnly } from '../middleware/technicianRole.js';

export const vehicleConditionReportRouter = Router();

// POST /api/vehicle-condition-reports - Tạo báo cáo tình trạng xe (chỉ technician leader)
vehicleConditionReportRouter.post('/', authMiddleware, roleMiddleware(['technician']), technicianSubroleMiddleware, technicianLeaderOnly, createVehicleConditionReport);

