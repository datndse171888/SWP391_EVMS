import { Router } from 'express';
import { createFeedback, getMyFeedbacks, getAllFeedbacks, respondToFeedback, deleteFeedback } from '../controllers/feedbackController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

export const feedbackRouter = Router();

// POST /api/feedbacks - Tạo feedback mới (tất cả user đã đăng nhập)
feedbackRouter.post('/', authMiddleware, createFeedback);

// GET /api/feedbacks/my - Lấy feedback của user hiện tại
feedbackRouter.get('/my', authMiddleware, getMyFeedbacks);

// GET /api/feedbacks - Lấy tất cả feedbacks (admin)
feedbackRouter.get('/', authMiddleware, roleMiddleware(['admin']), getAllFeedbacks);

// PATCH /api/feedbacks/:id/respond - Admin phản hồi feedback
feedbackRouter.patch('/:id/respond', authMiddleware, roleMiddleware(['admin']), respondToFeedback);

// DELETE /api/feedbacks/:id - Xóa feedback
feedbackRouter.delete('/:id', authMiddleware, deleteFeedback);

