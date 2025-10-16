import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { createConversation, assignConversation, getConversationByID, getAllConversation } from '../controllers/conversationController.js';

export const conversationRouter = Router();

// Tạo conversation (yêu cầu đăng nhập)
conversationRouter.post('/', authMiddleware, roleMiddleware(['customer']), createConversation);

// Danh sách conversations (yêu cầu đăng nhập)
conversationRouter.get('/', authMiddleware, roleMiddleware(['admin','staff']), getAllConversation);

// Lấy chi tiết conversation (yêu cầu đăng nhập)
conversationRouter.get('/:id', authMiddleware, roleMiddleware(['admin','staff']), getConversationByID);

// Gán staff vào conversation (staff/admin)
conversationRouter.patch('/:id/assign', authMiddleware, roleMiddleware(['staff']), assignConversation);

// Đóng conversation (staff/admin)
// conversationRouter.patch('/:id/close', authMiddleware, roleMiddleware(['staff']), closeConversation);


