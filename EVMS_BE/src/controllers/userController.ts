import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Technician } from '../models/Technician.js';
import { TechnicianCertificate } from '../models/TechnicianCertificate.js';
import { Certificate } from '../models/Certificate.js';

export async function updateUser(req: Request, res: Response) {
  try {
    const { userId } = req.params as { userId: string };
    const updateData = req.body as Partial<{
      fullName: string;
      phoneNumber: string;
      photoUrl: string;
      email: string;
    }>;

    if (!req.user) {
      return res.status(401).json({ message: 'Yêu cầu đăng nhập' });
    }

    // Chỉ cho phép user cập nhật thông tin của chính mình
    if (req.user.id !== userId) {
      return res.status(403).json({ message: 'Không được phép cập nhật thông tin người khác' });
    }

    // Tìm user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Cập nhật các field được phép
    if (updateData.fullName !== undefined) user.fullName = updateData.fullName;
    if (updateData.phoneNumber !== undefined) user.phoneNumber = updateData.phoneNumber;
    if (updateData.photoUrl !== undefined) user.photoUrl = updateData.photoUrl;
    if (updateData.email !== undefined) user.email = updateData.email;

    await user.save();

    // Trả về user đã cập nhật (không bao gồm password)
    const sanitized = await User.findById(userId).select('-passwordHash').lean();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: { user: sanitized }
    });
  } catch (error) {
    console.error('Lỗi cập nhật thông tin người dùng:', error);
    return res.status(500).json({ message: 'Lỗi server' });
  }
}

export async function updateUserStatus(req: Request, res: Response) {
  try {
    const { userId } = req.params as { userId: string };
    const { isDisabled } = req.body as { isDisabled?: boolean };

    if (typeof isDisabled !== 'boolean') {
      return res.status(400).json({ message: 'Thiếu hoặc sai kiểu isDisabled (boolean)' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Yêu cầu đăng nhập' });
    }

    // Không cho tự vô hiệu hóa/chỉnh trạng thái chính mình
    if (req.user.id === userId) {
      return res.status(400).json({ message: 'Không thể thay đổi trạng thái tài khoản của chính bạn' });
    }

    // Tìm user mục tiêu
    const target = await User.findById(userId);
    if (!target) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Theo yêu cầu hệ thống chỉ có 1 admin và admin chỉ đổi 3 role còn lại
    // Không cho phép đổi trạng thái tài khoản có role 'admin' (kể cả bởi admin)
    if (target.role === 'admin') {
      return res.status(403).json({ message: 'Không được phép thay đổi trạng thái tài khoản admin' });
    }

    target.isDisabled = isDisabled;
    await target.save();

    const sanitized = await User.findById(userId).select('-passwordHash').lean();

    return res.status(200).json({
      success: true,
      message: isDisabled ? 'Đã vô hiệu hóa tài khoản' : 'Đã kích hoạt tài khoản',
      data: { user: sanitized }
    });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái người dùng:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật trạng thái người dùng' });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role as string;
    const search = req.query.search as string;
    const status = req.query.status as string;

    // Tạo filter object
    const filter: any = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status === 'active') {
      filter.isDisabled = false;
    } else if (status === 'disabled') {
      filter.isDisabled = true;
    }

    // Lấy tổng số users
    const totalUsers = await User.countDocuments(filter);
    
    // Lấy danh sách users với phân trang
    const users = await User.find(filter)
      .select('-passwordHash') // Loại bỏ passwordHash
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo mới nhất
      .lean();

    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách users:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách users'
    });
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    const { 
      email, 
      password, 
      userName, 
      fullName, 
      phoneNumber, 
      photoURL, 
      role, 
      gender,
      // Technician specific fields
      introduction,
      experience,
      startDate,
      certificates,
      techRole
    } = req.body;

    // Validation
    if (!email || !password || !userName) {
      return res.status(400).json({ message: 'Thiếu email, password hoặc userName' });
    }

    if (!role || !['staff', 'technician'].includes(role)) {
      return res.status(400).json({ message: 'Role phải là staff hoặc technician' });
    }

    // Validation cho technician
    if (role === 'technician') {
      if (!introduction || !experience || !startDate) {
        return res.status(400).json({ message: 'Technician thiếu thông tin: introduction, experience, startDate' });
      }
      if (techRole && !['leader', 'member'].includes(String(techRole))) {
        return res.status(400).json({ message: 'techRole phải là leader hoặc member' });
      }
    }

    // Kiểm tra email và userName đã tồn tại
    const existed = await User.findOne({ $or: [{ email }, { userName }] }).lean();
    if (existed) {
      return res.status(400).json({ message: 'Email hoặc userName đã tồn tại' });
    }

    // Tạo password hash
    const passwordHash = await bcrypt.hash(password, 10);

    // Tạo user
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

    let technician = null;
    let technicianCertificates = [];

    // Nếu là technician, tạo thông tin technician
    if (role === 'technician') {
      const normalizedExperience = Number(experience);
      const normalizedStartDate = new Date(startDate);
      const normalizedTechRole = (techRole === 'leader' || techRole === 'member') ? techRole : 'member';
      technician = await Technician.create({
        userID: user._id,
        introduction,
        role: normalizedTechRole,
        experience: isNaN(normalizedExperience) ? 0 : normalizedExperience,
        startDate: normalizedStartDate,
      });

      // Tạo certificates nếu có
      if (certificates && Array.isArray(certificates)) {
        for (const cert of certificates) {
          if (cert.certificateID && cert.issuedDate && cert.expiryDate && cert.status) {
            const technicianCert = await TechnicianCertificate.create({
              technicianCertificateID: new mongoose.Types.ObjectId(),
              technicianID: technician._id,
              certificateID: cert.certificateID,
              issuedDate: new Date(cert.issuedDate),
              expiryDate: new Date(cert.expiryDate),
              status: cert.status,
              note: cert.note || '',
              certificateImage: cert.certificateImage || '',
            });
            technicianCertificates.push(technicianCert);
          }
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Tạo người dùng thành công',
      data: {
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
        technician: technician ? {
          id: technician._id,
          introduction: technician.introduction,
          role: technician.role,
          experience: technician.experience,
          startDate: technician.startDate,
        } : null,
        certificates: technicianCertificates
      }
    });
  } catch (error) {
    console.error('Lỗi khi tạo user:', error);
    
    // Duplicate key error
    if ((error as any)?.code === 11000) {
      return res.status(400).json({ message: 'Email hoặc userName đã tồn tại' });
    }
    
    // Validation error
    if ((error as any)?.name === 'ValidationError') {
      return res.status(422).json({ message: 'Dữ liệu không hợp lệ' });
    }
    
    return res.status(500).json({ message: 'Lỗi máy chủ khi tạo người dùng' });
  }
}

export async function getCertificates(req: Request, res: Response) {
  try {
    const certificates = await Certificate.find({}).lean();
    
    return res.status(200).json({
      success: true,
      data: certificates
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách certificates:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách certificates'
    });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    const user = await User.findById(userId).select('-passwordHash').lean();
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi lấy thông tin người dùng' });
  }
}

// Technician-specific APIs have been moved to technicianController.ts