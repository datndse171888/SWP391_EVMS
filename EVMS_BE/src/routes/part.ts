import { Router } from 'express';
import { getParts, updatePart, createPart, getPartById, createPartWithInventory, updatePartWithInventory, countAllParts } from '../controllers/partController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

export const partRouter = Router();

// Public list
partRouter.get('/', getParts);
partRouter.get('/:id', getPartById);

// Admin/staff manage
partRouter.post('/', authMiddleware, roleMiddleware(['admin', 'staff']), createPart);
partRouter.post('/with-inventory', authMiddleware, roleMiddleware(['admin', 'staff']), createPartWithInventory);
partRouter.put('/:id', authMiddleware, roleMiddleware(['admin', 'staff']), updatePart);
partRouter.put('/:id/with-inventory', authMiddleware, roleMiddleware(['admin', 'staff']), updatePartWithInventory);

// Count total parts
// Request: GET /api/parts/count/all
// Response: { totalParts: number }
// Test: http://localhost:4000/api/parts/count/all
partRouter.get('/count/all', countAllParts);


