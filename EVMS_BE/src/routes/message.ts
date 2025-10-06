import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authenticatedOnly } from '../middleware/roleMiddleware.js';
import { sendMessage, listMessagesByConversation, getMessage } from '../controllers/messageController.js';

export const messageRouter = Router();

// Gửi message (user/staff thuộc conversation)
messageRouter.post('/', authMiddleware, authenticatedOnly, sendMessage);

// Lấy danh sách message theo conversation
messageRouter.get('/by-conversation/:conversationID', authMiddleware, listMessagesByConversation);

// Lấy chi tiết message
messageRouter.get('/:id', authMiddleware, getMessage);


