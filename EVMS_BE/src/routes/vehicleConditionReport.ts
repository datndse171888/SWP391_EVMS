import { Router } from 'express';
import { createVehicleConditionReport, getVehicleConditionReportsByAppointment } from '../controllers/vehicleConditionReportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { technicianSubroleMiddleware, technicianLeaderOnly, technicianAny } from '../middleware/technicianRole.js';

export const vehicleConditionReportRouter = Router();

// GET /api/vehicle-condition-reports/appointment/:appointmentId - Lấy danh sách reports của appointment (cả leader và member đều có thể xem)
vehicleConditionReportRouter.get('/appointment/:appointmentId', authMiddleware, roleMiddleware(['technician']), technicianSubroleMiddleware, technicianAny, getVehicleConditionReportsByAppointment);

// POST /api/vehicle-condition-reports - Tạo báo cáo tình trạng xe (chỉ technician leader)
vehicleConditionReportRouter.post('/', authMiddleware, roleMiddleware(['technician']), technicianSubroleMiddleware, technicianLeaderOnly, createVehicleConditionReport);

