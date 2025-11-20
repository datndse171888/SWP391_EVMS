import { Request, Response } from 'express';
import { Feedback } from '../models/Feedback.js';
import { User } from '../models/User.js';

// POST /api/feedbacks - Tạo feedback mới (customer)
export async function createFeedback(req: Request, res: Response) {
  try {
    const { rating, comment } = req.body;
    const userID = req.user?.id;

    if (!userID) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating phải từ 1-5' });
    }

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ message: 'Comment không được để trống' });
    }

    if (comment.length > 400) {
      return res.status(400).json({ message: 'Comment không được vượt quá 400 ký tự' });
    }

    // Create feedback
    const feedback = await Feedback.create({
      userID,
      rating,
      comment: comment.trim(),
      status: 'pending',
    });

    const populated = await Feedback.findById(feedback._id)
      .populate('userID', 'fullName email photoURL')
      .lean();

    return res.status(201).json({
      message: 'Gửi phản hồi thành công',
      feedback: populated,
    });
  } catch (error: any) {
    console.error('Error creating feedback:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

// GET /api/feedbacks/my - Lấy feedback của user hiện tại
export async function getMyFeedbacks(req: Request, res: Response) {
  try {
    const userID = req.user?.id;

    if (!userID) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const feedbacks = await Feedback.find({ userID })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      feedbacks,
    });
  } catch (error: any) {
    console.error('Error getting my feedbacks:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

// GET /api/feedbacks - Lấy tất cả feedbacks (admin)
export async function getAllFeedbacks(req: Request, res: Response) {
  try {
    const { status, rating, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (rating) query.rating = Number(rating);

    const skip = (Number(page) - 1) * Number(limit);

    const [feedbacks, total] = await Promise.all([
      Feedback.find(query)
        .populate('userID', 'fullName email photoURL phoneNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Feedback.countDocuments(query),
    ]);

    return res.json({
      success: true,
      feedbacks,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Error getting all feedbacks:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

// PATCH /api/feedbacks/:id/respond - Admin phản hồi feedback
export async function respondToFeedback(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { adminResponse, status } = req.body;

    if (!adminResponse || adminResponse.trim().length === 0) {
      return res.status(400).json({ message: 'Admin response không được để trống' });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      {
        adminResponse: adminResponse.trim(),
        status: status || 'reviewed',
        respondedAt: new Date(),
      },
      { new: true }
    ).populate('userID', 'fullName email photoURL');

    if (!feedback) {
      return res.status(404).json({ message: 'Không tìm thấy feedback' });
    }

    return res.json({
      message: 'Phản hồi thành công',
      feedback,
    });
  } catch (error: any) {
    console.error('Error responding to feedback:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

// DELETE /api/feedbacks/:id - Xóa feedback (admin hoặc user tự xóa)
export async function deleteFeedback(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userID = req.user?.id;
    const userRole = req.user?.role;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ message: 'Không tìm thấy feedback' });
    }

    // Chỉ admin hoặc chính user tạo feedback mới được xóa
    if (userRole !== 'admin' && feedback.userID.toString() !== userID) {
      return res.status(403).json({ message: 'Không có quyền xóa feedback này' });
    }

    await Feedback.findByIdAndDelete(id);

    return res.json({ message: 'Xóa feedback thành công' });
  } catch (error: any) {
    console.error('Error deleting feedback:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

