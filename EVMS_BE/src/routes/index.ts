import { Router } from 'express';
import { authRouter } from './auth.js';
import { demoRouter } from './demo.js';

import { userRouter } from './user.js';

export const router = Router();

router.get('/health', (_req, res) => { res.json({ status: 'ok' }); });
router.use('/auth', authRouter);
router.use('/demo', demoRouter);
router.use('/users', userRouter);
