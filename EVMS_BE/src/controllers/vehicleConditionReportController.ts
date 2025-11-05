import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { VehicleConditionReport } from '../models/VehicleConditionReport.js';
import { Appointment } from '../models/Appointment.js';
import { Technician } from '../models/Technician.js';

export async function createVehicleConditionReport(req: Request, res: Response) {
  try {
    const { appointmentID, technicianId: technicianIdFromBody, stage, details, image } = req.body;

    // Validation bắt buộc
    if (!appointmentID || !stage || !details) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: appointmentID, stage, details'
      });
    }

    // Tự động lấy technicianId từ token nếu không có trong body
    let technicianId: mongoose.Types.ObjectId;
    if (technicianIdFromBody) {
      technicianId = new mongoose.Types.ObjectId(technicianIdFromBody);
    } else {
      // Lấy technicianId từ token (user hiện tại)
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      const technician = await Technician.findOne({ userID: req.user.id });
      if (!technician) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy technician record cho user hiện tại'
        });
      }
      
      technicianId = technician._id;
    }

    // Validation stage enum
    const validStages = ['before-service', 'after-service'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: 'Stage không hợp lệ. Phải là: before-service hoặc after-service'
      });
    }

    // Validation ObjectId format
    if (!mongoose.Types.ObjectId.isValid(appointmentID)) {
      return res.status(400).json({
        success: false,
        message: 'appointmentID không hợp lệ'
      });
    }

    // Validation ObjectId format cho technicianId (nếu có trong body)
    if (technicianIdFromBody && !mongoose.Types.ObjectId.isValid(technicianIdFromBody)) {
      return res.status(400).json({
        success: false,
        message: 'technicianId không hợp lệ'
      });
    }

    // Kiểm tra Appointment tồn tại
    const appointment = await Appointment.findById(appointmentID);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy appointment'
      });
    }

    // Kiểm tra Technician tồn tại
    const technician = await Technician.findById(technicianId);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy technician'
      });
    }

    // Kiểm tra technician có phải là leader không (vì middleware đã check nhưng double check để chắc chắn)
    if (technician.role !== 'leader') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ technician leader mới được tạo báo cáo tình trạng xe'
      });
    }

    // Kiểm tra xem đã có report với cùng appointmentID và stage chưa
    // Mỗi appointment chỉ có thể có:
    // - 1 report với stage = "before-service" (trước khi sửa)
    // - 1 report với stage = "after-service" (sau khi sửa)
    // Tổng cộng tối đa 2 reports cho mỗi appointment
    const existingReport = await VehicleConditionReport.findOne({
      appointmentID: new mongoose.Types.ObjectId(appointmentID),
      stage: stage
    });

    if (existingReport) {
      const stageName = stage === 'before-service' ? 'trước khi sửa' : 'sau khi sửa';
      return res.status(400).json({
        success: false,
        message: `Đã tồn tại báo cáo tình trạng xe ${stageName} cho appointment này. Mỗi appointment chỉ có thể có 1 báo cáo cho mỗi stage (before-service và after-service).`
      });
    }

    // Tạo vehicle condition report
    const reportData: any = {
      appointmentID: new mongoose.Types.ObjectId(appointmentID),
      technicianId: technicianId, // Đã là ObjectId rồi
      stage: stage,
      details: details.trim()
    };

    // Chỉ thêm image nếu có
    if (image && image.trim()) {
      reportData.image = image.trim();
    }

    const vehicleConditionReport = await VehicleConditionReport.create(reportData);

    // Populate để trả về thông tin đầy đủ
    const populatedReport = await VehicleConditionReport.findById(vehicleConditionReport._id)
      .populate({
        path: 'appointmentID',
        select: 'userID vehicleID bookingDate status'
      })
      .populate({
        path: 'technicianId',
        select: 'userID role'
      })
      .lean();

    if (!populatedReport) {
      return res.status(500).json({
        success: false,
        message: 'Không thể lấy thông tin báo cáo sau khi tạo'
      });
    }

    return res.status(201).json(populatedReport);
  } catch (error: any) {
    console.error('Error creating vehicle condition report:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tạo báo cáo tình trạng xe',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

