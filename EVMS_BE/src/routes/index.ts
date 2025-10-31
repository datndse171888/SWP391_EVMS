import { Router } from 'express';
import { authRouter } from './auth.js';
import { demoRouter } from './demo.js';
import { appointmentRouter } from './appointment.js';
import { serviceRouter } from './service.js';
import { servicePackageRouter } from './servicePackage.js';
import { conversationRouter } from './conversation.js';
import { messageRouter } from './message.js';
import { partRouter } from './part.js';
import { serviceOrderRouter } from './serviceOrder.js';
import { vehicleConditionReportRouter } from './vehicleConditionReport.js';

import { userRouter } from './user.js';

export const router = Router();

router.get('/health', (_req, res) => { res.json({ status: 'ok' }); });
router.use('/auth', authRouter);
router.use('/demo', demoRouter);
router.use('/users', userRouter);
router.use('/appointments', appointmentRouter);
router.use('/services', serviceRouter);
router.use('/service-packages', servicePackageRouter);
router.use('/conversations', conversationRouter);
router.use('/messages', messageRouter);
router.use('/parts', partRouter);
router.use('/service-orders', serviceOrderRouter);
router.use('/vehicle-condition-reports', vehicleConditionReportRouter);
