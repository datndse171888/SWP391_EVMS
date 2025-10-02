import { Router } from 'express';
import { register, login, loginWithGoogle } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const authRouter = Router();

// Public routes
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/google-login', loginWithGoogle);

// Protected routes
authRouter.get('/profile', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

authRouter.put('/profile', authMiddleware, (req, res) => {
  // TODO: Implement profile update
  res.json({ message: 'Profile update not implemented yet' });
});

authRouter.put('/change-password', authMiddleware, (req, res) => {
  // TODO: Implement password change
  res.json({ message: 'Password change not implemented yet' });
});


