import { Router } from 'express';
import { 
  createVehicleConditionReport, 
  getReportsByAppointment, 
  getReportById, 
  updateReport, 
  deleteReport, 
  getAllReports 
} from '../controllers/vehicleConditionReportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const vehicleConditionReportRouter = Router();

// Get all reports (admin/staff only)
vehicleConditionReportRouter.get('/', authMiddleware, getAllReports);

// Get single report by ID
vehicleConditionReportRouter.get('/:id', authMiddleware, getReportById);

// Update report
vehicleConditionReportRouter.patch('/:id', authMiddleware, updateReport);

// Delete report (admin/staff only)
vehicleConditionReportRouter.delete('/:id', authMiddleware, deleteReport);
