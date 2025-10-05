import { Router } from 'express';
import { getAllUsers, createUser, getCertificates, getTechnicianInfo, getTechnicianCertificates, updateUserStatus } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { staffOnly, adminOnly, authenticatedOnly } from '../middleware/roleMiddleware.js';

export const userRouter = Router();

userRouter.get('/', getAllUsers);
userRouter.post('/', createUser);
userRouter.get('/certificates', getCertificates);
userRouter.get('/:userId/technician', getTechnicianInfo);
userRouter.get('/:userId/certificates', getTechnicianCertificates);
// Update user status (enable/disable) - admin or staff only
userRouter.patch('/:userId/status', authMiddleware, staffOnly, updateUserStatus);
