import { Router } from 'express';
import { getParts, updatePart, createPart, getPartById } from '../controllers/partController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

export const partRouter = Router();

// Public list
partRouter.get('/', getParts);
partRouter.get('/:id', getPartById);

// Admin/staff manage
partRouter.post('/', authMiddleware, roleMiddleware(['admin']), createPart);
partRouter.put('/:id', authMiddleware, roleMiddleware(['admin']), updatePart);


