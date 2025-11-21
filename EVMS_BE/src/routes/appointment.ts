import { Router } from 'express';
import { createAppointment, listAppointments, getAppointmentById, listMyAppointments, cancelAppointment, assignTechnician, getAvailableTechnicians, getAppointmentsByUserId, updateAppointmentStatus, listTodayAwaitingPayment, listMyAssignedAppointments, getServiceByAppointmentId, countPendingAppointments, countConfirmedAndCancelledAppointments, countAllAppointments, countMyTodayAppointments, countMyTodayConfirmed, countMyTodayInProgress, getPeriodicVehicleForUser } from '../controllers/appointmentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const appointmentRouter = Router();

// Create appointment (authenticated users)
appointmentRouter.post('/', authMiddleware, createAppointment);

appointmentRouter.get('/', authMiddleware, listAppointments);

// Count total pending appointments (admin/staff)
// Request: GET /api/appointments/count/pending
// Response: { success: true, data: { totalPending: number } }
// Test: http://localhost:4000/api/appointments/count/pending
appointmentRouter.get('/count/pending', authMiddleware, countPendingAppointments);

// Count totals for confirmed and cancelled appointments (admin/staff)
// Request: GET /api/appointments/count/confirmed-cancelled
// Response: { success: true, data: { totalConfirmed: number, totalCancelled: number } }
// Test: http://localhost:4000/api/appointments/count/confirmed-cancelled
appointmentRouter.get('/count/confirmed-cancelled', authMiddleware, countConfirmedAndCancelledAppointments);

// Count total appointments (all statuses) (admin/staff)
// Request: GET /api/appointments/count/all
// Response: { success: true, data: { totalAll: number } }
// Test: http://localhost:4000/api/appointments/count/all
appointmentRouter.get('/count/all', authMiddleware, countAllAppointments);

// Get periodic vehicle for user by service/servicePackage
appointmentRouter.get('/periodic/vehicle', authMiddleware, getPeriodicVehicleForUser);

// Technician self counts (today)
appointmentRouter.get('/technician/me/count/today', authMiddleware, countMyTodayAppointments);
appointmentRouter.get('/technician/me/count/today/confirmed', authMiddleware, countMyTodayConfirmed);
appointmentRouter.get('/technician/me/count/today/in-progress', authMiddleware, countMyTodayInProgress);

// List today's awaiting payment appointments (admin/staff)
appointmentRouter.get('/today/awaiting-payment', authMiddleware, listTodayAwaitingPayment);

// List my appointments (current user)
appointmentRouter.get('/me', authMiddleware, listMyAppointments);

// List appointments assigned to current technician (or by technicianId for admin/staff)
appointmentRouter.get('/technician/me', authMiddleware, listMyAssignedAppointments);

// Get appointments by user ID
appointmentRouter.get('/user/:userId', authMiddleware, getAppointmentsByUserId);

// Get service or servicePackage by appointment id (must be before /:id route)
appointmentRouter.get('/:id/service', authMiddleware, getServiceByAppointmentId);

// Get available technicians (admin/staff only) - MUST be before /:id route
appointmentRouter.get('/technicians/available', authMiddleware, getAvailableTechnicians);

// Get appointment by id - MUST be after all specific routes
appointmentRouter.get('/:id', authMiddleware, getAppointmentById);

// Cancel appointment
appointmentRouter.patch('/:id/cancel', authMiddleware, cancelAppointment);

// Assign technician to appointment (admin/staff only)
appointmentRouter.patch('/:id/assign-technician', authMiddleware, assignTechnician);

// Update appointment status (admin/staff/technician)
appointmentRouter.patch('/:id/status', authMiddleware, updateAppointmentStatus);


