import { Router } from 'express';
import { createChecklist, updateChecklist, deleteChecklist, getChecklistById, getAllChecklistByAppointment, updateStatusChecklist } from '../controllers/checklistController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

export const checklistRouter = Router();

// Query
checklistRouter.get('/:id', getChecklistById);
checklistRouter.get('/appointment/:appointmentId', getAllChecklistByAppointment);

// Manage
checklistRouter.post('/', authMiddleware, roleMiddleware(['technician']), createChecklist);
checklistRouter.put('/:id', authMiddleware, roleMiddleware(['technician']), updateChecklist);
checklistRouter.delete('/:id', authMiddleware, roleMiddleware(['technician']), deleteChecklist);
checklistRouter.patch('/:id/status', authMiddleware, roleMiddleware(['technician']), updateStatusChecklist);


