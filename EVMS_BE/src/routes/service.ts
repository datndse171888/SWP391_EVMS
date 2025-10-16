import { Router } from 'express';
import { createService, getServices, getServiceById, updateService, deleteService } from '../controllers/serviceController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

export const serviceRouter = Router();

// Public list and get
serviceRouter.get('/', getServices);
serviceRouter.get('/:id', getServiceById);

// Admin/staff manage
serviceRouter.post('/', authMiddleware, roleMiddleware(['admin']), createService);
serviceRouter.put('/:id', authMiddleware, roleMiddleware(['admin']), updateService);
serviceRouter.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteService); 


