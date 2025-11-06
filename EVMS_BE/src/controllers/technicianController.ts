import { Request, Response } from 'express';
import { Technician } from '../models/Technician.js';
import { TechnicianCertificate } from '../models/TechnicianCertificate.js';

export async function getTechnicianInfo(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const technician = await Technician.findOne({ userID: userId }).lean() as any;
    if (!technician) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin technician' });
    }

    return res.status(200).json({
      success: true,
      data: {
        technician: {
          id: technician._id,
          introduction: technician.introduction,
          role: technician.role,
          experience: technician.experience,
          startDate: technician.startDate,
        }
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin technician:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy thông tin technician' });
  }
}

export async function getTechnicianCertificates(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const technician = await Technician.findOne({ userID: userId }).lean() as any;
    if (!technician) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy technician' });
    }

    const certificates = await TechnicianCertificate.find({ technicianID: technician._id })
      .populate('certificateID', 'name description issuingAuthority')
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        certificates: certificates.map((cert: any) => ({
          certificateID: cert.certificateID,
          issuedDate: cert.issuedDate,
          expiryDate: cert.expiryDate,
          status: cert.status,
          note: cert.note,
          certificateImage: cert.certificateImage,
        }))
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy chứng chỉ technician:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy chứng chỉ technician' });
  }
}

// Get technician by ID with user info
export async function getTechnicianById(req: Request, res: Response) {
  try {
    const { technicianId } = req.params;
    const mongoose = (await import('mongoose')).default;

    if (!mongoose.Types.ObjectId.isValid(technicianId)) {
      return res.status(400).json({ success: false, message: 'Technician ID không hợp lệ' });
    }

    const technician = await Technician.findById(technicianId)
      .populate('userID', 'userName fullName email phoneNumber')
      .lean() as any;

    if (!technician) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy technician' });
    }

    return res.status(200).json({
      success: true,
      data: {
        technician: {
          id: technician._id,
          userID: technician.userID,
          user: technician.userID, // Include full user info
          introduction: technician.introduction,
          role: technician.role,
          experience: technician.experience,
          startDate: technician.startDate,
        }
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin technician:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy thông tin technician' });
  }
}


