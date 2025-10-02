import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { env } from '../config/env.js';

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

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Thiếu email hoặc password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    if (user.isDisabled) {
      return res.status(403).json({ message: 'Tài khoản đã bị vô hiệu hóa' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    const secret: Secret | undefined = env.jwtSecret as unknown as Secret;
    if (!secret) {
      return res.status(500).json({ message: 'Thiếu JWT_SECRET' });
    }

    const payload = { sub: String(user._id), role: user.role } as const;
    const token = jwt.sign(
      payload,
      secret as Secret,
      { expiresIn: (env.jwtExpiresIn || '1d') as any } as any
    );

    return res.status(200).json({
      accessToken: token,
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
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}


export async function loginWithGoogle(req: Request, res: Response) {
  try {
    // Accept both camelCase and snake-case-like fields from FE
    const { email, username, userName: userNameInput, photoUrl, photoURL: photoURLInput } = req.body as {
      email?: string;
      username?: string;
      userName?: string;
      photoUrl?: string;
      photoURL?: string;
    };

    if (!email) {
      return res.status(400).json({ message: 'Thiếu email' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Helper to generate a short random string
    const randomText = (len: number) => Math.random().toString(36).slice(2, 2 + len);

    // Derive username: prefer provided username, else userNameInput, else from email prefix
    const baseUserName = (username || userNameInput || normalizedEmail.split('@')[0]).trim();
    const formattedUserName = `${baseUserName}-${randomText(5)}`;

    const normalizedPhoto = (photoUrl ?? photoURLInput ?? '').toString();

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Create a random password hash (Google users will not use password login)
      const randomPassword = Math.random().toString(36).slice(-12) + Date.now().toString(36);
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        email: normalizedEmail,
        userName: formattedUserName,
        passwordHash,
        photoURL: normalizedPhoto,
        role: 'customer',
      });
    } else {
      if (user.isDisabled) {
        return res.status(403).json({
          message:
            'Tài khoản của bạn đã bị khóa! Vui lòng liên hệ quản trị viên để được hỗ trợ',
        });
      }

      // Update minimal profile fields if empty
      if (!user.photoURL && normalizedPhoto) {
        user.photoURL = normalizedPhoto;
      }
      if (!user.userName) {
        user.userName = baseUserName;
      }
      await user.save();
    }

    const secret: Secret | undefined = env.jwtSecret as unknown as Secret;
    if (!secret) {
      return res.status(500).json({ message: 'Thiếu JWT_SECRET' });
    }

    const payload = { sub: String(user._id), role: user.role } as const;
    const token = jwt.sign(
      payload,
      secret as Secret,
      { expiresIn: (env.jwtExpiresIn || '1d') as any } as any
    );

    // Respond in a way compatible with both current FE and the provided snippet
    return res.status(200).json({
      message: 'Đăng nhập thành công!',
      data: {
        id: user._id,
        username: user.userName,
        email: user.email,
        role: user.role,
        isVerified: true,
        token,
      },
      accessToken: token,
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
    return res.status(500).json({ message: 'Đã xảy ra lỗi khi xử lý đăng nhập Google' });
  }
}


