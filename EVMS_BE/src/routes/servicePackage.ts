import { Router } from 'express';
import { createServicePackage, getServicePackages, getServicePackageById, updateServicePackage, deleteServicePackage } from '../controllers/servicePackageController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

export const servicePackageRouter = Router();

// Public
servicePackageRouter.get('/', getServicePackages);
servicePackageRouter.get('/:id', getServicePackageById);

// Admin/staff manage
servicePackageRouter.post('/', authMiddleware, roleMiddleware(['admin']), createServicePackage);
servicePackageRouter.put('/:id', authMiddleware, roleMiddleware(['admin']), updateServicePackage);
servicePackageRouter.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteServicePackage);


