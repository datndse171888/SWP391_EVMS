import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { createConversation, assignConversation, getConversationByID, getAllConversation, getMyConversation, getAllConversationOpen, getAllConversationAssigned } from '../controllers/conversationController.js';

export const conversationRouter = Router();

// Tạo conversation (yêu cầu đăng nhập)
conversationRouter.post('/', authMiddleware, roleMiddleware(['customer']), createConversation);

// Customer lấy conversation của mình
conversationRouter.get('/my-conversation', authMiddleware, roleMiddleware(['customer']), getMyConversation);

// Lấy tất cả conversation có status open (admin/staff)
conversationRouter.get('/open', authMiddleware, roleMiddleware(['admin','staff']), getAllConversationOpen);

// Lấy tất cả conversation đã assigned cho staff hiện tại (staff)
conversationRouter.get('/assigned', authMiddleware, roleMiddleware(['staff']), getAllConversationAssigned);

// Danh sách conversations (yêu cầu đăng nhập)
conversationRouter.get('/', authMiddleware, roleMiddleware(['admin','staff']), getAllConversation);

// Lấy chi tiết conversation (yêu cầu đăng nhập)
conversationRouter.get('/:id', authMiddleware, roleMiddleware(['admin','staff']), getConversationByID);

// Gán staff vào conversation (staff/admin)
conversationRouter.patch('/:id/assign', authMiddleware, roleMiddleware(['staff']), assignConversation);

// Đóng conversation (staff/admin)
// conversationRouter.patch('/:id/close', authMiddleware, roleMiddleware(['staff']), closeConversation);


