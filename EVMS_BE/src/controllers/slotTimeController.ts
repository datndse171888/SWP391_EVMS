import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SlotTime } from '../models/SlotTime.js';
import { Technician } from '../models/Technician.js';
import { Appointment } from '../models/Appointment.js';
import { User } from '../models/User.js';

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
    let slotTimes = await SlotTime.find({
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

    // If no slots exist in database, create default hourly slots for the day
    if (slotTimes.length === 0) {
      console.log(`[SlotTime] No slots found in DB for ${dateParam}, creating default slots`);
      const defaultSlots = [];
      const baseDate = new Date(dateParam + 'T00:00:00');
      
      for (let hour = 7; hour <= 16; hour++) {
        if (hour === 12) continue; // Skip 12:00 (lunch break)
        
        const slotStart = new Date(baseDate);
        slotStart.setHours(hour, 0, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setHours(hour + 1, 0, 0, 0);
        
        // Only create slots for future times
        const now = new Date();
        if (slotStart >= now) {
          defaultSlots.push({
            _id: new mongoose.Types.ObjectId(),
            technicianID: new mongoose.Types.ObjectId(), // Dummy ID - not used
            startTime: slotStart,
            endTime: slotEnd,
            status: 'available',
            createdAt: new Date(),
            updatedAt: new Date(),
            __v: 0
          } as any); // Type assertion to bypass Mongoose type checking for default slots
        }
      }
      console.log(`[SlotTime] Created ${defaultSlots.length} default slots`);
      slotTimes = defaultSlots;
    } else {
      console.log(`[SlotTime] Found ${slotTimes.length} slots in DB for ${dateParam}`);
    }

    // Get active technicians (user not disabled)
    const allTechnicians = await Technician.find().lean();
    const allUserIDs = allTechnicians.map(t => t.userID).filter(Boolean);
    const activeUsers = await User.find({ 
      _id: { $in: allUserIDs },
      isDisabled: false 
    }).select('_id').lean();
    
    const activeUserIDs = new Set(activeUsers.map(u => String(u._id)));
    
    const activeLeaders = allTechnicians.filter(t => 
      t.role === 'leader' && t.userID && activeUserIDs.has(String(t.userID))
    );
    const activeSupports = allTechnicians.filter(t => 
      t.role === 'member' && t.userID && activeUserIDs.has(String(t.userID))
    );

    const activeLeadersCount = activeLeaders.length;
    const activeSupportsCount = activeSupports.length;
    
    console.log(`[SlotTime] Active technicians: ${activeLeadersCount} leaders, ${activeSupportsCount} supports`);
    console.log(`[SlotTime] Required for ${vehicleCategory}: ${required.leader} leaders, ${required.support} supports`);
    
    // If we don't have enough technicians at all, return empty immediately
    if (activeLeadersCount < required.leader || activeSupportsCount < required.support) {
      console.warn(`[SlotTime] ⚠️ Not enough technicians! Have ${activeLeadersCount}/${required.leader} leaders, ${activeSupportsCount}/${required.support} supports`);
      return res.status(200).json([]);
    }

    // Get current user ID from token
    const currentUserID = req.user?.id;

    // Get all active appointments that could potentially overlap with slots in this day
    // Query appointments that start before end of day (could overlap with slots)
    const now = new Date();
    const allAppointments = await Appointment.find({
      bookingDate: {
        $lt: endOfDay // Appointment starts before end of day
      },
      status: {
        $nin: ['cancelled', 'completed']
      }
    })
      .select('userID bookingDate serviceID servicePackageID technicianLeaderID technicianSupport1ID technicianSupport2ID')
      .lean();

    // Get duration from services and packages
    const { Service } = await import('../models/Service.js');
    const { ServicePackage } = await import('../models/ServicePackage.js');

    // Filter slots that have enough technicians available
    const availableSlots = [];

    for (const slot of slotTimes) {
      // Find appointments that overlap with this slot
      const overlappingAppointments = [];
      
      for (const apt of allAppointments) {
        const appointmentStart = new Date(apt.bookingDate);
        
        // Get duration from service or service package
        let duration = 60; // Default 1 hour in minutes
        if (apt.serviceID) {
          const service = await Service.findById(apt.serviceID).select('duration').lean();
          if (service && 'duration' in service && typeof service.duration === 'number') {
            duration = service.duration;
          }
        } else if (apt.servicePackageID) {
          const pkg = await ServicePackage.findById(apt.servicePackageID).select('duration').lean();
          if (pkg && 'duration' in pkg && typeof pkg.duration === 'number') {
            duration = pkg.duration;
          }
        }
        
        // Calculate appointment end time
        const appointmentEnd = new Date(appointmentStart);
        appointmentEnd.setMinutes(appointmentEnd.getMinutes() + duration);
        
        // Check overlap: appointment starts before slot ends AND appointment ends after slot starts
        if (appointmentStart < slot.endTime && appointmentEnd > slot.startTime) {
          overlappingAppointments.push(apt);
        }
      }

      // Check if current user has already booked this slot
      const userHasBooked = currentUserID && overlappingAppointments.some(apt => {
        return String(apt.userID) === String(currentUserID);
      });

      // Skip slot if user has already booked it
      if (userHasBooked) {
        continue;
      }

      // Count assigned technicians from overlapping appointments
      const assignedLeaders = new Set<string>();
      const assignedSupports = new Set<string>();

      overlappingAppointments.forEach(apt => {
        if (apt.technicianLeaderID) assignedLeaders.add(String(apt.technicianLeaderID));
        if (apt.technicianSupport1ID) assignedSupports.add(String(apt.technicianSupport1ID));
        if (apt.technicianSupport2ID) assignedSupports.add(String(apt.technicianSupport2ID));
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

    console.log(`[SlotTime] Returning ${availableSlots.length} available slots for ${dateParam}, vehicleCategory: ${vehicleCategory}`);
    return res.status(200).json(availableSlots);

  } catch (error) {
    console.error('Get available slot times error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách available slot times'
    });
  }
}

