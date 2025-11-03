import { Router } from 'express';
import { getAvailableSlotTimes } from '../controllers/slotTimeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const slotTimeRouter = Router();

// Get available slot times
// Query params: date (required, YYYY-MM-DD), technicianId (optional)
slotTimeRouter.get('/available', authMiddleware, getAvailableSlotTimes);

