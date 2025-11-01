import { Request, Response } from 'express';
import { SlotTime } from '../models/SlotTime.js';
import { Technician } from '../models/Technician.js';
import { Appointment } from '../models/Appointment.js';

// Get Available Slot Times API
export async function getAvailableSlotTimes(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const dateParam = req.query.date as string | undefined;
    const vehicleCategoryParam = req.query.vehicleCategory as string | undefined;

    // Date is required
    if (!dateParam) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu tham số date (format: YYYY-MM-DD)'
      });
    }

    // Vehicle category is required
    if (!vehicleCategoryParam) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu tham số vehicleCategory (CAR, MOTOBIKE, hoặc BICYCLE)'
      });
    }

    // Validate vehicle category
    const validCategories = ['CAR', 'MOTOBIKE', 'BICYCLE'];
    if (!validCategories.includes(vehicleCategoryParam.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle category không hợp lệ. Sử dụng: CAR, MOTOBIKE, hoặc BICYCLE'
      });
    }

    const vehicleCategory = vehicleCategoryParam.toUpperCase() as 'CAR' | 'MOTOBIKE' | 'BICYCLE';

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateParam)) {
      return res.status(400).json({
        success: false,
        message: 'Định dạng date không hợp lệ. Sử dụng format: YYYY-MM-DD'
      });
    }

    // Parse date and create date range for the day
    const selectedDate = new Date(dateParam);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Ngày không hợp lệ'
      });
    }

    // Set to start of day (00:00:00)
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    // Set to end of day (23:59:59)
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Determine required technicians based on vehicle category
    const requiredTechnicians = {
      CAR: { leader: 1, support: 2 },
      MOTOBIKE: { leader: 1, support: 1 },
      BICYCLE: { leader: 1, support: 1 }
    };

    const required = requiredTechnicians[vehicleCategory];

    // Get all available slots in the day
    const slotTimes = await SlotTime.find({
      status: 'available',
      startTime: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      endTime: {
        $gte: new Date() // Only slots that haven't ended
      }
    })
      .sort({ startTime: 1 })
      .lean();

    // Get active technicians (user not disabled)
    const [activeLeaders, activeSupports] = await Promise.all([
      Technician.find({ role: 'leader' })
        .populate({
          path: 'userID',
          select: 'isDisabled',
          match: { isDisabled: false }
        })
        .lean(),
      Technician.find({ role: 'member' })
        .populate({
          path: 'userID',
          select: 'isDisabled',
          match: { isDisabled: false }
        })
        .lean()
    ]);

    // Filter only technicians with active users
    const activeLeadersCount = activeLeaders.filter(tech => tech.userID).length;
    const activeSupportsCount = activeSupports.filter(tech => tech.userID).length;

    // Filter slots that have enough technicians available
    const availableSlots = [];

    for (const slot of slotTimes) {
      // Get appointments in this slot time range (not cancelled or completed)
      const appointments = await Appointment.find({
        bookingDate: {
          $gte: slot.startTime,
          $lt: slot.endTime
        },
        status: {
          $nin: ['cancelled', 'completed']
        }
      }).select('technicianLeaderID technicianSupport1ID technicianSupport2ID').lean();

      // Count assigned technicians
      const assignedLeaders = new Set<string>();
      const assignedSupports = new Set<string>();

      appointments.forEach(apt => {
        if (apt.technicianLeaderID) {
          assignedLeaders.add(String(apt.technicianLeaderID));
        }
        if (apt.technicianSupport1ID) {
          assignedSupports.add(String(apt.technicianSupport1ID));
        }
        if (apt.technicianSupport2ID) {
          assignedSupports.add(String(apt.technicianSupport2ID));
        }
      });

      // Calculate available technicians
      const availableLeaders = activeLeadersCount - assignedLeaders.size;
      const availableSupports = activeSupportsCount - assignedSupports.size;

      // Check if slot has enough technicians
      if (availableLeaders >= required.leader && availableSupports >= required.support) {
        availableSlots.push({
          _id: slot._id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: slot.status,
          createdAt: slot.createdAt,
          updatedAt: slot.updatedAt,
          availableTechnicians: {
            leaders: availableLeaders,
            supports: availableSupports
          }
        });
      }
    }

    return res.status(200).json(availableSlots);

  } catch (error) {
    console.error('Get available slot times error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách available slot times'
    });
  }
}

