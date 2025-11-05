import { Router } from 'express';
import { getParts, updatePart, createPart, getPartById, createPartWithInventory } from '../controllers/partController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

export const partRouter = Router();

// Public list
partRouter.get('/', getParts);
partRouter.get('/:id', getPartById);

// Admin/staff manage
partRouter.post('/', authMiddleware, roleMiddleware(['admin, staff']), createPart);
partRouter.post('/with-inventory', authMiddleware, roleMiddleware(['admin', 'staff']), createPartWithInventory);
partRouter.put('/:id', authMiddleware, roleMiddleware(['admin, staff']), updatePart);


