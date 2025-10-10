import { Router } from 'express';
import { createAppointment, listAppointments, getAppointmentById, listMyAppointments } from '../controllers/appointmentController.js';
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


