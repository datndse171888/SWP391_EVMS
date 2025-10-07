import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { sendMessage, listMessagesByConversationID } from '../controllers/messageController.js';

export const messageRouter = Router();

// Gửi message (user/staff thuộc conversation)
messageRouter.post('/', authMiddleware, roleMiddleware(['customer','staff']), sendMessage);

// Lấy danh sách message theo conversation
messageRouter.get('/by-conversation/:conversationID', authMiddleware, listMessagesByConversationID);


