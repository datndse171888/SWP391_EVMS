import { Router } from 'express';
import { getParts, updatePart, createPart } from '../controllers/partController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

export const partRouter = Router();

// Public list
partRouter.get('/', getParts);

// Admin/staff manage
partRouter.post('/', authMiddleware, roleMiddleware(['admin']), createPart);
partRouter.put('/:id', authMiddleware, roleMiddleware(['admin']), updatePart);


