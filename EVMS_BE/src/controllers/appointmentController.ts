import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment.js';

export async function createAppointment(req: Request, res: Response) {
  try {
    const {
      userID,
      vehicleID,
      technicianLeaderID,
      technicianSupport1ID,
      technicianSupport2ID,
      serviceID,
      servicePackageID,
      bookingDate,
      reason,
      status,
    } = req.body;

    if (!userID || !bookingDate) {
      return res.status(400).json({ message: 'Thiếu userID hoặc bookingDate' });
    }

    const appointment = await Appointment.create({
      userID,
      vehicleID,
      technicianLeaderID,
      technicianSupport1ID,
      technicianSupport2ID,
      serviceID,
      servicePackageID,
      bookingDate,
      reason,
      status,
    });

    return res.status(201).json({
      message: 'Tạo lịch hẹn thành công',
      appointment,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}


