import { Router } from 'express';
import { getAllUsers, createUser, getCertificates, updateUser, updateUserStatus } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { staffOnly, adminOnly, authenticatedOnly } from '../middleware/roleMiddleware.js';

export const userRouter = Router();

userRouter.get('/', getAllUsers);
userRouter.post('/', createUser);
userRouter.get('/certificates', getCertificates);
// Update user info - user can update their own info
userRouter.put('/:userId', authMiddleware, updateUser);
// Update user status (enable/disable) - admin only (the system has single admin)
userRouter.patch('/:userId/status', authMiddleware, adminOnly, updateUserStatus);
