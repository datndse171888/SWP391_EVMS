import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, userName, fullName, phoneNumber, photoURL, role, gender } = req.body;

    if (!email || !password || !userName) {
      return res.status(400).json({ message: 'Thiếu email, password hoặc userName' });
    }

    const existed = await User.findOne({ $or: [{ email }, { userName }] }).lean();
    if (existed) {
      return res.status(400).json({ message: 'Email hoặc userName đã tồn tại' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      userName,
      passwordHash,
      fullName,
      phoneNumber,
      photoURL,
      role,
      gender,
    });

    return res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        userName: user.userName,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
        role: user.role,
        gender: user.gender,
        isDisabled: user.isDisabled,
      },
    });
  } catch (error) {
    // Duplicate key (email hoặc userName đã tồn tại)
    if ((error as any)?.code === 11000) {
      return res.status(400).json({ message: 'Email hoặc userName đã tồn tại' });
    }
    // Validation error
    if ((error as any)?.name === 'ValidationError') {
      return res.status(422).json({ message: 'Dữ liệu không hợp lệ' });
    }
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}


