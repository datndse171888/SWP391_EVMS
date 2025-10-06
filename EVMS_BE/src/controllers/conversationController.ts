import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation.js';
import { User } from '../models/User.js';

export async function createConversation(req: Request, res: Response) {
  try {
    const { userID } = req.body as { userID?: string };

    if (!userID || !mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ message: 'userID không hợp lệ (sai định dạng ObjectId)' });
    }

    const existedUser = await User.findById(userID).select('_id').lean();
    if (!existedUser) {
      return res.status(404).json({ message: 'userID không tồn tại' });
    }

    const conversation = await Conversation.create({
      userID,
      status: 'open',
      createdAt: new Date(),
      closedAt: null,
    });

    return res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    console.error('Lỗi tạo conversation:', error);
    if ((error as any)?.code === 11000) {
      return res.status(400).json({ message: 'Trùng khóa duy nhất. Có thể còn index unique cũ trên trường conversationID, hãy drop index đó.' });
    }
    return res.status(500).json({ message: 'Lỗi máy chủ khi tạo cuộc hội thoại' });
  }
}

export async function getConversationByID(req: Request, res: Response) {
  try {
    const { id } = req.params as { id: string };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'conversation id không hợp lệ' });
    }

    const conv = await Conversation.findById(id).lean();
    if (!conv) {
      return res.status(404).json({ message: 'Không tìm thấy conversation' });
    }
    return res.status(200).json({ success: true, data: conv });
  } catch (error) {
    console.error('Lỗi lấy conversation:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi lấy cuộc hội thoại' });
  }
}

export async function getAllConversation(req: Request, res: Response) {
  try {
    const { status, userID, staffID } = req.query as {
      status?: 'open' | 'assigned' | 'closed';
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

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Lỗi assign conversation:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi gán nhân viên' });
  }
}

// export async function closeConversation(req: Request, res: Response) {
//   try {
//     const { id } = req.params as { id: string };
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: 'conversation id không hợp lệ' });
//     }

//     const updated = await Conversation.findOneAndUpdate(
//       { _id: id },
//       { status: 'closed', closedAt: new Date() },
//       { new: true }
//     );

//     if (!updated) {
//       return res.status(404).json({ message: 'Không tìm thấy conversation' });
//     }

//     return res.status(200).json({ success: true, data: updated });
//   } catch (error) {
//     console.error('Lỗi đóng conversation:', error);
//     return res.status(500).json({ message: 'Lỗi máy chủ khi đóng cuộc hội thoại' });
//   }
// }




