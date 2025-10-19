import { Router } from 'express';
import { createAppointment, listAppointments, getAppointmentById, listMyAppointments, cancelAppointment, assignTechnician, getAvailableTechnicians, updateAppointmentStatus } from '../controllers/appointmentController.js';
import { createVehicleConditionReport, getReportsByAppointment } from '../controllers/vehicleConditionReportController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const appointmentRouter = Router();

// Create appointment (authenticated users)
appointmentRouter.post('/', authMiddleware, createAppointment);

// List appointments (admin/staff only)
appointmentRouter.get('/', authMiddleware, listAppointments);

// List my appointments (current user)
appointmentRouter.get('/me', authMiddleware, listMyAppointments);

// Get appointment by id
appointmentRouter.get('/:id', authMiddleware, getAppointmentById);

// Cancel appointment
appointmentRouter.patch('/:id/cancel', authMiddleware, cancelAppointment);

// Assign technician to appointment (admin/staff only)
appointmentRouter.patch('/:id/assign-technician', authMiddleware, assignTechnician);

// Get available technicians (admin/staff only)
appointmentRouter.get('/technicians/available', authMiddleware, getAvailableTechnicians);

// Update appointment status (admin/staff/technician only)
appointmentRouter.patch('/:id/status', authMiddleware, updateAppointmentStatus);

// Vehicle Condition Reports for specific appointment
appointmentRouter.post('/:appointmentId/reports', authMiddleware, createVehicleConditionReport);
appointmentRouter.get('/:appointmentId/reports', authMiddleware, getReportsByAppointment);


