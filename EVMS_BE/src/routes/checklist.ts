import { Router } from 'express';
import { createChecklist, updateChecklist, deleteChecklist, getChecklistById, getAllChecklistByAppointment, updateStatusChecklist } from '../controllers/checklistController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { technicianSubroleMiddleware, technicianLeaderOnly, technicianAny } from '../middleware/technicianRole.js';

export const checklistRouter = Router();

// Query
checklistRouter.get('/:id', getChecklistById);
checklistRouter.get('/appointment/:appointmentId', getAllChecklistByAppointment);

// Manage
checklistRouter.post('/', authMiddleware, roleMiddleware(['technician']), technicianSubroleMiddleware, technicianLeaderOnly, createChecklist);
checklistRouter.put('/:id', authMiddleware, roleMiddleware(['technician']), technicianSubroleMiddleware, technicianLeaderOnly, updateChecklist);
checklistRouter.delete('/:id', authMiddleware, roleMiddleware(['technician']), technicianSubroleMiddleware, technicianLeaderOnly, deleteChecklist);
checklistRouter.patch('/:id/status', authMiddleware, roleMiddleware(['technician']), technicianSubroleMiddleware, technicianAny, updateStatusChecklist);


