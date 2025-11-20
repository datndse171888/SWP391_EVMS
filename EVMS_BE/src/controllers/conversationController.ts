import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation.js';
import { User } from '../models/User.js';
import { Message } from '../models/Message.js';

// Helper function: Lấy hoặc tạo system bot user
async function getOrCreateSystemBot(): Promise<mongoose.Types.ObjectId> {
  const BOT_EMAIL = 'evms.bot@system.local';
  const BOT_USERNAME = 'EVMS Bot';
  
  const botUser = await User.findOne({ email: BOT_EMAIL }).select('_id');
  
  if (botUser) {
    return botUser._id;
  }
  
  // Tạo bot user nếu chưa tồn tại
  // Lưu ý: passwordHash có thể là một hash dummy vì bot user không đăng nhập
  const dummyPasswordHash = '$2b$10$dummy.hash.for.system.bot.user.never.used';
  const newBotUser = await User.create({
    userName: BOT_USERNAME,
    email: BOT_EMAIL,
    passwordHash: dummyPasswordHash,
    fullName: 'EVMS Support Bot',
    role: 'staff',
    isDisabled: false,
    isVerified: true,
  });
  
  return newBotUser._id;
}

export async function createConversation(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Ưu tiên lấy userID từ token (an toàn hơn), fallback body.userID để tương thích FE cũ
    const tokenUserId = (req.user?.id as string | undefined) || undefined;
    const bodyUserId = (req.body as { userID?: string })?.userID;
    const userID = tokenUserId || bodyUserId;

    if (!userID || !mongoose.Types.ObjectId.isValid(userID)) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'userID không hợp lệ (sai định dạng ObjectId)' });
    }

    const existedUser = await User.findById(userID).session(session).select('_id').lean();
    if (!existedUser) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'userID không tồn tại' });
    }

    // Tạo conversation
    const conversation = await Conversation.create([
      {
        userID,
        status: 'open',
        createdAt: new Date(),
      },
    ], { session });

    let firstMessage: any | null = null;
    try {
      const botUserID = await getOrCreateSystemBot();
      const msgs = await Message.create([
        {
          conversationID: conversation[0]._id,
          senderID: botUserID,
          content: 'Xin chào! Chào mừng bạn đến với EVMS. Tôi có thể hỗ trợ gì cho bạn?',
          timestamp: new Date(),
        },
      ], { session });
      firstMessage = msgs[0];
    } catch (messageError) {
      // Log lỗi nhưng KHÔNG hủy giao dịch tạo conversation
      console.error('Lỗi tạo tin nhắn chào:', messageError);
    }

    await session.commitTransaction();
    return res.status(201).json({ success: true, data: conversation[0], firstMessage });
  } catch (error) {
    await session.abortTransaction();
    console.error('Lỗi tạo conversation:', error);
    if ((error as any)?.code === 11000) {
      return res.status(400).json({ message: 'Trùng khóa duy nhất. Có thể còn index unique cũ trên trường conversationID, hãy drop index đó.' });
    }
    return res.status(500).json({ message: 'Lỗi máy chủ khi tạo cuộc hội thoại' });
  } finally {
    session.endSession();
  }
}

export async function getConversationByID(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'conversation id không hợp lệ' });
    }

    const conv = await Conversation.findById(id)
      .populate('userID', 'userName fullName email photoURL')
      .lean();
    if (!conv) {
      return res.status(404).json({ message: 'Không tìm thấy conversation' });
    }
    return res.status(200).json({ success: true, data: conv });
  } catch (error) {
    console.error('Lỗi lấy conversation:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi lấy cuộc hội thoại' });
  }
}

// Customer lấy conversation của chính họ
export async function getMyConversation(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (!req.user) {
      await session.abortTransaction();
      return res.status(401).json({ message: 'Yêu cầu đăng nhập' });
    }
    const userID = req.user.id as string;

    if (!mongoose.Types.ObjectId.isValid(userID)) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'userID không hợp lệ' });
    }

    // Tìm conversation mới nhất của user (ưu tiên open/assigned). Nếu không có, tự tạo 1 conv + tin nhắn chào.
    let conv = await Conversation.findOne({ 
      userID,
      status: { $in: ['open', 'assigned'] }
    })
      .sort({ createdAt: -1 })
      .session(session)
      .lean();

    if (!conv) {
      // Thử lấy bất kỳ conversation mới nhất
      conv = await Conversation.findOne({ userID }).sort({ createdAt: -1 }).session(session).lean();
    }

    if (!conv) {
      // Auto create when first open chat
      const created = await Conversation.create([
        { userID, status: 'open', createdAt: new Date() },
      ], { session });

      // Tạo tin nhắn chào
      try {
        const botUserID = await getOrCreateSystemBot();
        await Message.create([
          {
            conversationID: created[0]._id,
            senderID: botUserID,
            content: 'Xin chào! Chào mừng bạn đến với EVMS. Tôi có thể hỗ trợ gì cho bạn?',
            timestamp: new Date(),
          },
        ], { session });
      } catch (e) {
        console.error('Lỗi tạo tin nhắn chào (auto):', e);
      }
      await session.commitTransaction();
      return res.status(200).json({ success: true, data: created[0] });
    }

    await session.commitTransaction();
    return res.status(200).json({ success: true, data: conv });
  } catch (error) {
    await session.abortTransaction();
    console.error('Lỗi lấy conversation của user:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi lấy cuộc hội thoại' });
  } finally {
    session.endSession();
  }
}

export async function getAllConversation(req: Request, res: Response) {
  try {
    const { status, userID, staffID } = req.query as {
      status?: 'open' | 'assigned';
      userID?: string;
      staffID?: string;
    };

    const filter: any = {};
    if (status) filter.status = status;
    if (userID && mongoose.Types.ObjectId.isValid(userID)) filter.userID = userID;
    if (staffID && mongoose.Types.ObjectId.isValid(staffID)) filter.staffID = staffID;

    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Conversation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Conversation.countDocuments(filter),
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
    console.error('Lỗi list conversations:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách cuộc hội thoại' });
  }
}

export async function getAllConversationOpen(req: Request, res: Response) {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const skip = (page - 1) * limit;

    // Tìm bot user ID để exclude
    const BOT_EMAIL = 'evms.bot@system.local';
    const botUser = await User.findOne({ email: BOT_EMAIL }).select('_id');
    const botUserID = botUser?._id;

    const conversations = await Conversation.find({ status: 'open' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userID', 'userName fullName email photoURL')
      .lean();

    // Lấy tin nhắn mới nhất cho mỗi conversation (exclude bot messages)
    const conversationIds = conversations.map((conv) => conv._id);
    const lastMessages = await Message.aggregate([
      { $match: { conversationID: { $in: conversationIds } } },
      ...(botUserID ? [{ $match: { senderID: { $ne: botUserID } } }] : []),
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$conversationID',
          lastMessage: { $first: '$$ROOT' },
        },
      },
    ]);

    // Map last messages theo conversationID
    const lastMessageMap = new Map(
      lastMessages.map((item) => [String(item._id), item.lastMessage])
    );

    // Gắn last message vào mỗi conversation
    const items = conversations.map((conv) => ({
      ...conv,
      lastMessage: lastMessageMap.get(String(conv._id)) || null,
    }));

    const total = await Conversation.countDocuments({ status: 'open' });

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
    console.error('Lỗi lấy danh sách conversation open:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách cuộc hội thoại mở' });
  }
}

export async function getAllConversationAssigned(req: Request, res: Response) {
  try {
    // Lấy staffID từ token
    if (!req.user) {
      return res.status(401).json({ message: 'Yêu cầu đăng nhập' });
    }
    const staffID = req.user.id as string;

    if (!mongoose.Types.ObjectId.isValid(staffID)) {
      return res.status(400).json({ message: 'staffID không hợp lệ (sai định dạng ObjectId)' });
    }

    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const skip = (page - 1) * limit;

    // Tìm bot user ID để exclude
    const BOT_EMAIL = 'evms.bot@system.local';
    const botUser = await User.findOne({ email: BOT_EMAIL }).select('_id');
    const botUserID = botUser?._id;

    // Lấy conversations có status 'assigned' và staffID khớp với staff hiện tại
    const conversations = await Conversation.find({ 
      status: 'assigned',
      staffID: staffID 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userID', 'userName fullName email photoURL')
      .lean();

    // Lấy tin nhắn mới nhất cho mỗi conversation (exclude bot messages)
    const conversationIds = conversations.map((conv) => conv._id);
    const lastMessages = await Message.aggregate([
      { $match: { conversationID: { $in: conversationIds } } },
      ...(botUserID ? [{ $match: { senderID: { $ne: botUserID } } }] : []),
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$conversationID',
          lastMessage: { $first: '$$ROOT' },
        },
      },
    ]);

    // Map last messages theo conversationID
    const lastMessageMap = new Map(
      lastMessages.map((item) => [String(item._id), item.lastMessage])
    );

    // Gắn last message vào mỗi conversation
    const items = conversations.map((conv) => ({
      ...conv,
      lastMessage: lastMessageMap.get(String(conv._id)) || null,
    }));

    const total = await Conversation.countDocuments({ 
      status: 'assigned',
      staffID: staffID 
    });

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
    console.error('Lỗi lấy danh sách conversation assigned:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách cuộc hội thoại đã được gán' });
  }
}

export async function assignConversation(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    // Lấy staffID từ token
    if (!req.user) {
      return res.status(401).json({ message: 'Yêu cầu đăng nhập' });
    }
    const staffID = req.user.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'conversation id không hợp lệ' });
    }
    if (!staffID || !mongoose.Types.ObjectId.isValid(staffID)) {
      return res.status(400).json({ message: 'staffID không hợp lệ (sai định dạng ObjectId)' });
    }

    const staff = await User.findById(staffID).select('_id role isDisabled').lean();
    if (!staff) {
      return res.status(404).json({ message: 'staffID không tồn tại' });
    }

    // Atomic guard: chỉ gán nếu conversation đang mở và chưa có staff
    const updated = await Conversation.findOneAndUpdate(
      { _id: id, status: 'open', $or: [{ staffID: null }, { staffID: { $exists: false } }] },
      { staffID, status: 'assigned' },
      { new: true }
    );

    if (!updated) {
      // Có thể do không tồn tại hoặc đã được người khác nhận trước đó
      const exists = await Conversation.findById(id).select('status staffID').lean();
      if (!exists) {
        return res.status(404).json({ message: 'Không tìm thấy conversation' });
      }
      return res.status(409).json({ message: 'Conversation đã được nhận hoặc không còn ở trạng thái open' });
    }

    const populated = await Conversation.findById(updated._id)
      .populate('userID', 'userName fullName email photoURL')
      .lean();

    // Lấy tin nhắn mới nhất (exclude bot messages)
    const BOT_EMAIL = 'evms.bot@system.local';
    const botUser = await User.findOne({ email: BOT_EMAIL }).select('_id');
    const botUserID = botUser?._id;

    const filter: any = { conversationID: updated._id };
    if (botUserID) {
      filter.senderID = { $ne: botUserID };
    }

    const lastMessage = await Message.findOne(filter)
      .sort({ timestamp: -1 })
      .lean();

    const result = {
      ...populated,
      lastMessage: lastMessage || null,
    };

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Lỗi assign conversation:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi gán nhân viên' });
  }
}





