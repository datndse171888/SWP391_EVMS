import { Router } from 'express';
import { getTechnicianInfo, getTechnicianCertificates } from '../controllers/technicianController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

export const technicianRouter = Router();

// Info and certificates view
technicianRouter.get('/:userId/info', authMiddleware, getTechnicianInfo);
technicianRouter.get('/:userId/certificates', authMiddleware, getTechnicianCertificates);


