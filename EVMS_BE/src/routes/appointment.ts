import { Router } from 'express';
import { createAppointment, listAppointments, getAppointmentById, listMyAppointments, cancelAppointment, assignTechnician, getAvailableTechnicians, getAppointmentsByUserId, updateAppointmentStatus, listTodayAwaitingPayment } from '../controllers/appointmentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const appointmentRouter = Router();

// Create appointment (authenticated users)
appointmentRouter.post('/', authMiddleware, createAppointment);

// List appointments (admin/staff only)
appointmentRouter.get('/', authMiddleware, listAppointments);

// List today's awaiting payment appointments (admin/staff)
appointmentRouter.get('/today/awaiting-payment', authMiddleware, listTodayAwaitingPayment);

// List my appointments (current user)
appointmentRouter.get('/me', authMiddleware, listMyAppointments);

// Get appointments by user ID
appointmentRouter.get('/user/:userId', authMiddleware, getAppointmentsByUserId);

// Get appointment by id
appointmentRouter.get('/:id', authMiddleware, getAppointmentById);

// Cancel appointment
appointmentRouter.patch('/:id/cancel', authMiddleware, cancelAppointment);

// Assign technician to appointment (admin/staff only)
appointmentRouter.patch('/:id/assign-technician', authMiddleware, assignTechnician);

// Update appointment status (admin/staff/technician)
appointmentRouter.patch('/:id/status', authMiddleware, updateAppointmentStatus);

// Get available technicians (admin/staff only)
appointmentRouter.get('/technicians/available', authMiddleware, getAvailableTechnicians);


