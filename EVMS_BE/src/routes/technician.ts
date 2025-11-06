import { Router } from 'express';
import { getTechnicianInfo, getTechnicianCertificates, getTechnicianById } from '../controllers/technicianController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

export const technicianRouter = Router();

// Get technician by ID with user info
technicianRouter.get('/id/:technicianId', authMiddleware, getTechnicianById);

// Info and certificates view (by userId)
technicianRouter.get('/:userId/info', authMiddleware, getTechnicianInfo);
technicianRouter.get('/:userId/certificates', authMiddleware, getTechnicianCertificates);


