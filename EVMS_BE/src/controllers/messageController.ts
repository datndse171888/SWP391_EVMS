import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Message } from '../models/Message.js';
import { Conversation } from '../models/Conversation.js';
import { User } from '../models/User.js';

export async function sendMessage(req: Request, res: Response) { 
  try {
    const { conversationID, content } = req.body as {
      conversationID?: string;
      content?: string;
    };

    if (!conversationID || !mongoose.Types.ObjectId.isValid(conversationID)) {
      return res.status(400).json({ message: 'conversationID không hợp lệ' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'content không được rỗng' });
    }

    const currentUserId = req.user?.id?.toString();
    if (!currentUserId || !mongoose.Types.ObjectId.isValid(currentUserId)) {
      return res.status(401).json({ message: 'Không xác thực được người dùng' });
    }

    const conv = await Conversation
      .findById(conversationID)
      .select('userID staffID')
      .lean() as unknown as { userID: mongoose.Types.ObjectId; staffID?: mongoose.Types.ObjectId | null } | null;
    if (!conv) {
      return res.status(404).json({ message: 'Không tìm thấy conversation' });
    }

    const sender = await User.findById(currentUserId).select('_id role isDisabled').lean();
    if (!sender) {
      return res.status(404).json({ message: 'senderID không tồn tại' });
    }

    // Check membership: sender must be userID or staffID
    const isUser = conv.userID && String(conv.userID) === currentUserId;
    const isStaff = conv.staffID ? String(conv.staffID) === currentUserId : false;
    if (!isUser && !isStaff) {
      return res.status(403).json({ message: 'Người gửi không thuộc cuộc hội thoại này' });
    }

    const message = await Message.create({ conversationID, senderID: currentUserId, content: content.trim() });
    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('Lỗi gửi message:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi gửi tin nhắn' });
  }
}

export async function listMessagesByConversationID(req: Request, res: Response) {
  try {
    const { conversationID } = req.params as { conversationID: string };

    if (!mongoose.Types.ObjectId.isValid(conversationID)) {
      return res.status(400).json({ message: 'conversationID không hợp lệ' });
    }

    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Message.find({ conversationID })
        .sort({ timestamp: 1 })
        .skip(skip)
        .limit(limit)
        .populate('senderID', 'userName role photoURL')
        .lean(),
      Message.countDocuments({ conversationID }),
    ]);

    return res.status(200).json({
      success: true,
      data: items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit,
      },
    });
  } catch (error) {
    console.error('Lỗi lấy messages:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách tin nhắn' });
  }
}



