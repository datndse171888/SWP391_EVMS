import { Router } from 'express';
import { createChecklist, updateChecklist, deleteChecklist, getChecklistById, getAllChecklistByAppointment, updateStatusChecklist, assignTechnicianToTask } from '../controllers/checklistController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { technicianSubroleMiddleware, technicianLeaderOnly, technicianAny } from '../middleware/technicianRole.js';

export const checklistRouter = Router();

// Query - Support và Leader có thể xem
// Lưu ý: Route cụ thể phải đặt trước route generic
checklistRouter.get('/appointment/:appointmentId', authMiddleware, roleMiddleware(['technician']), technicianSubroleMiddleware, technicianAny, getAllChecklistByAppointment);
checklistRouter.get('/:id', authMiddleware, roleMiddleware(['technician']), technicianSubroleMiddleware, technicianAny, getChecklistById);

// Manage
checklistRouter.post('/', authMiddleware, roleMiddleware(['technician']), technicianSubroleMiddleware, technicianLeaderOnly, createChecklist);
checklistRouter.put('/:id', authMiddleware, roleMiddleware(['technician']), technicianSubroleMiddleware, technicianLeaderOnly, updateChecklist);
checklistRouter.delete('/:id', authMiddleware, roleMiddleware(['technician']), technicianSubroleMiddleware, technicianLeaderOnly, deleteChecklist);
checklistRouter.patch('/:id/status', authMiddleware, roleMiddleware(['technician']), technicianSubroleMiddleware, technicianAny, updateStatusChecklist);
checklistRouter.patch('/:id/assign-technician', authMiddleware, roleMiddleware(['technician']), technicianSubroleMiddleware, technicianLeaderOnly, assignTechnicianToTask);


