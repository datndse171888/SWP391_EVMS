import { Router } from 'express';
import { register, login, loginWithGoogle, updateProfile } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { customerOnly, authenticatedOnly } from '../middleware/roleMiddleware.js';

export const authRouter = Router();

// Public routes
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/google-login', loginWithGoogle);

// Protected routes
authRouter.get('/profile', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Customer self-update profile
authRouter.put('/profile', authMiddleware, authenticatedOnly, updateProfile);

authRouter.put('/change-password', authMiddleware, (req, res) => {
  // TODO: Implement password change
  res.json({ message: 'Password change not implemented yet' });
});


