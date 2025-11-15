import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { sendForgotPasswordEmail, sendVerificationEmail } from '../services/emailService.js';

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Chưa đăng nhập' });
    }

    const { fullName, phoneNumber, photoURL, gender, userName } = req.body as Partial<{
      fullName: string;
      phoneNumber: string;
      photoURL: string;
      gender: string;
      userName: string;
    }>;

    // Chỉ cho phép cập nhật các field cho phép
    const update: any = {};
    if (typeof fullName === 'string') update.fullName = fullName.trim();
    if (typeof photoURL === 'string') update.photoURL = photoURL.trim();
    if (typeof gender === 'string') update.gender = gender.trim();
    if (typeof userName === 'string' && userName.trim()) update.userName = userName.trim();
    
    // Validate phone number if provided
    if (typeof phoneNumber === 'string') {
      const trimmedPhone = phoneNumber.trim();
      
      // If phone number is provided, it must be valid
      if (trimmedPhone !== '') {
        // Must start with 0
        if (!trimmedPhone.startsWith('0')) {
          return res.status(400).json({ 
            success: false,
            message: 'Số điện thoại phải bắt đầu từ số 0' 
          });
        }
        
        // Must be exactly 10 digits
        if (trimmedPhone.length !== 10) {
          return res.status(400).json({ 
            success: false,
            message: 'Số điện thoại phải có đúng 10 số' 
          });
        }
        
        // Must be all digits
        if (!/^\d+$/.test(trimmedPhone)) {
          return res.status(400).json({ 
            success: false,
            message: 'Số điện thoại chỉ được chứa số' 
          });
        }
        
        update.phoneNumber = trimmedPhone;
      } else {
        // Allow empty phone number (optional field)
        update.phoneNumber = trimmedPhone;
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Không có dữ liệu để cập nhật' 
      });
    }

    // Nếu đổi username, kiểm tra trùng
    if (update.userName) {
      const existed = await User.findOne({ userName: update.userName, _id: { $ne: userId } }).lean();
      if (existed) {
        return res.status(400).json({ message: 'userName đã tồn tại' });
      }
    }

    const updated = await User.findByIdAndUpdate(userId, update, { new: true })
      .select('-passwordHash')
      .lean() as any;

    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật hồ sơ thành công',
      data: {
        user: {
          id: updated._id,
          email: updated.email,
          userName: updated.userName,
          fullName: updated.fullName,
          phoneNumber: updated.phoneNumber,
          photoURL: updated.photoURL,
          role: updated.role,
          gender: updated.gender,
          isDisabled: updated.isDisabled,
        },
      },
    });
  } catch (error) {
    // Validation error
    if ((error as any)?.name === 'ValidationError') {
      return res.status(422).json({ message: 'Dữ liệu không hợp lệ' });
    }
    return res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật hồ sơ' });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { email, password, userName, fullName, phoneNumber, photoURL, role, gender } = req.body;

    if (!email || !password || !userName) {
      return res.status(400).json({ message: 'Thiếu email, password hoặc userName' });
    }

    // Format inputs
    const formatEmail = email.toLowerCase().trim();
    const formatUserName = userName.trim();
    const formatPassword = password;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formatEmail)) {
      return res.status(400).json({ message: 'Email không hợp lệ' });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[`~!@#$%^&*\-_=+/\\|/?><,.]).{8,}$/;
    if (!passwordRegex.test(formatPassword)) {
      return res.status(400).json({ 
        message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt' 
      });
    }

    // Check for duplicates
    const existed = await User.findOne({ 
      $or: [
        { email: formatEmail }, 
        { userName: formatUserName },
        ...(phoneNumber ? [{ phoneNumber: phoneNumber.trim() }] : [])
      ] 
    }).lean();
    if (existed) {
      return res.status(400).json({ message: 'Email, userName hoặc số điện thoại đã tồn tại' });
    }

    // Generate OTP (6 digits)
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash password
    const passwordHash = await bcrypt.hash(formatPassword, 10);

    // Create user with verification token
    const user = await User.create({
      email: formatEmail,
      userName: formatUserName,
      passwordHash,
      fullName: fullName?.trim(),
      phoneNumber: phoneNumber?.trim(),
      photoURL: photoURL?.trim(),
      role: role || 'customer',
      gender: gender?.trim(),
      verificationToken,
      verificationTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      isVerified: false,
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.userName, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue even if email fails, but log the error
    }

    return res.status(201).json({
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
      data: {
        id: user._id,
        email: user.email,
        userName: user.userName,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
        role: user.role,
        gender: user.gender,
        isVerified: false,
        // Only include token in development mode for testing
        ...(process.env.NODE_ENV === 'development' && { verificationToken }),
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
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Thiếu email hoặc password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    if (user.isDisabled) {
      return res.status(403).json({ message: 'Tài khoản đã bị vô hiệu hóa' });
    }

    // ⚠️ KHÔNG check isVerified ở đây
    // User vẫn có thể login dù chưa verify
    // Hệ thống sẽ hiển thị cảnh báo và chặn các tính năng quan trọng ở frontend

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
        isVerified: user.isVerified,
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
        isVerified: true, // Google login users are auto-verified
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
        isVerified: user.isVerified ?? true, // Google login users are auto-verified
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Đã xảy ra lỗi khi xử lý đăng nhập Google' });
  }
}

// Forgot Password API
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body as { email: string };

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email là bắt buộc'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản với email này'
      });
    }

    // Check if user is disabled
    if (user.isDisabled) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên'
      });
    }

    // Create reset token using JWT
    const secret: Secret | undefined = env.jwtSecret as unknown as Secret;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi cấu hình máy chủ'
      });
    }

    const resetToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        type: 'password-reset',
        exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
      },
      secret
    );

    // Send reset email
    try {
      await sendForgotPasswordEmail(user.email, resetToken);

      return res.status(200).json({
        success: true,
        message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.',
        data: {
          email: user.email,
          // For testing purposes, include token in response (remove in production)
          ...(env.nodeEnv === 'development' && { resetToken })
        }
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Không thể gửi email. Vui lòng thử lại sau.'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xử lý yêu cầu đặt lại mật khẩu'
    });
  }
}

// Reset Password API
export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body as {
      token: string;
      newPassword: string;
    };

    // Validate input
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token và mật khẩu mới là bắt buộc'
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    // Verify reset token
    const secret: Secret | undefined = env.jwtSecret as unknown as Secret;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi cấu hình máy chủ'
      });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return res.status(400).json({
          success: false,
          message: 'Token đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu mới.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    // Validate token type
    if (decoded.type !== 'password-reset') {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Check if user is disabled
    if (user.isDisabled) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị khóa'
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await User.findByIdAndUpdate(user._id, { passwordHash });

    return res.status(200).json({
      success: true,
      message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.',
      data: {
        email: user.email,
        userName: user.userName
      }
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi đặt lại mật khẩu'
    });
  }
}

// Check OTP for email verification
export async function checkOTP(req: Request, res: Response) {
  try {
    const { verifyCode } = req.body;

    if (!verifyCode) {
      return res.status(400).json({ 
        success: false,
        message: 'Mã xác thực là bắt buộc' 
      });
    }

    // Find user with valid OTP that hasn't expired
    const user = await User.findOne({
      verificationToken: verifyCode,
      verificationTokenExpiresAt: { $gt: new Date() }, // Still valid
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Mã không hợp lệ hoặc đã hết hạn' 
      });
    }

    // Update verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    return res.status(200).json({ 
      success: true,
      message: 'Xác nhận tài khoản thành công' 
    });
  } catch (error) {
    console.error('Check OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xác thực OTP'
    });
  }
}

// Send new verification email
export async function sendNewVerifyEmail(req: Request, res: Response) {
  try {
    const { email, userName } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email là bắt buộc' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Người dùng không tồn tại' 
      });
    }

    // If already verified, no need to resend
    if (user.isVerified) {
      return res.status(400).json({ 
        success: false,
        message: 'Tài khoản đã được xác thực' 
      });
    }

    // Generate new OTP
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new token
    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = verificationTokenExpiresAt;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(
        user.email,
        userName || user.userName,
        verificationToken
      );

      return res.status(200).json({ 
        success: true,
        message: 'Mã OTP đã được gửi đến email của bạn',
        // Only include token in development mode for testing
        ...(process.env.NODE_ENV === 'development' && { verificationToken }),
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Không thể gửi email. Vui lòng thử lại sau.'
      });
    }
  } catch (error) {
    console.error('Send new verify email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi gửi email xác thực'
    });
  }
}


