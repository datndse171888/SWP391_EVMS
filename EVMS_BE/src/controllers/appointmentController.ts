import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment.js';
import { Technician } from '../models/Technician.js';
import { User } from '../models/User.js';

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


// Helpers for list endpoints
function parseListParams(req: Request) {
  const page = Math.max(parseInt(String(req.query.page || '1'), 10) || 1, 1);
  const limitRaw = Math.max(parseInt(String(req.query.limit || '10'), 10) || 10, 1);
  const limit = Math.min(limitRaw, 100);
  const sortField = String(req.query.sort || 'bookingDate');
  const order = String(req.query.order || 'desc');
  const sort: Record<string, 1 | -1> = { [sortField]: order === 'asc' ? 1 : -1 };

  const statusParam = (req.query.status as string | undefined)?.trim();
  const status = statusParam ? statusParam.split(',').map(s => s.trim()).filter(Boolean) : undefined;

  const from = req.query.from ? new Date(String(req.query.from)) : undefined;
  const to = req.query.to ? new Date(String(req.query.to)) : undefined;

  const serviceId = (req.query.serviceId as string | undefined)?.trim();
  const packageId = (req.query.packageId as string | undefined)?.trim();
  const technicianId = (req.query.technicianId as string | undefined)?.trim();
  const userId = (req.query.userId as string | undefined)?.trim();

  const fieldsParam = (req.query.fields as string | undefined)?.trim();
  const includeParam = (req.query.include as string | undefined)?.trim();

  return {
    page,
    limit,
    sort,
    status,
    from,
    to,
    serviceId,
    packageId,
    technicianId,
    userId,
    fieldsParam,
    includeParam,
  };
}

const ALLOWED_APPOINTMENT_FIELDS = new Set([
  '_id',
  'userID',
  'vehicleID',
  'technicianLeaderID',
  'technicianSupport1ID',
  'technicianSupport2ID',
  'serviceID',
  'servicePackageID',
  'bookingDate',
  'reason',
  'status',
  'createdAt',
  'updatedAt',
]);

function buildSelect(fieldsParam?: string) {
  if (!fieldsParam) return undefined;
  const fields = fieldsParam.split(',').map(f => f.trim()).filter(Boolean);
  const selected = fields.filter(f => ALLOWED_APPOINTMENT_FIELDS.has(f));
  if (selected.length === 0) return undefined;
  return selected.join(' ');
}

function buildPopulate(includeParam?: string) {
  if (!includeParam) return [] as any[];
  const include = new Set(includeParam.split(',').map(s => s.trim()).filter(Boolean));
  const populates: any[] = [];
  if (include.has('user')) {
    populates.push({ path: 'userID', select: '_id userName fullName email phoneNumber photoURL gender role' });
  }
  if (include.has('service')) {
    populates.push({ path: 'serviceID', select: '_id name price duration' });
  }
  if (include.has('package')) {
    populates.push({ path: 'servicePackageID', select: '_id name price description' });
  }
  if (include.has('technicians')) {
    populates.push({ path: 'technicianLeaderID', select: '_id fullName phoneNumber' });
    populates.push({ path: 'technicianSupport1ID', select: '_id fullName phoneNumber' });
    populates.push({ path: 'technicianSupport2ID', select: '_id fullName phoneNumber' });
  }
  return populates;
}

function buildBaseFilter(params: ReturnType<typeof parseListParams>) {
  const filter: any = {};
  if (params.status && params.status.length > 0) {
    filter.status = { $in: params.status };
  }
  if (params.from || params.to) {
    filter.bookingDate = {} as any;
    if (params.from) filter.bookingDate.$gte = params.from;
    if (params.to) filter.bookingDate.$lte = params.to;
  }
  if (params.serviceId) filter.serviceID = params.serviceId;
  if (params.packageId) filter.servicePackageID = params.packageId;
  if (params.technicianId) {
    filter.$or = [
      { technicianLeaderID: params.technicianId },
      { technicianSupport1ID: params.technicianId },
      { technicianSupport2ID: params.technicianId },
    ];
  }
  return filter;
}

export async function listAppointments(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const role = req.user.role;
    if (role !== 'admin' && role !== 'staff') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const params = parseListParams(req);
    const filter = buildBaseFilter(params);

    if (params.userId) {
      filter.userID = params.userId;
    }

    const select = buildSelect(params.fieldsParam);
    const populates = buildPopulate(params.includeParam);

    const skip = (params.page - 1) * params.limit;
    const [total, docs] = await Promise.all([
      Appointment.countDocuments(filter),
      (() => {
        let query = Appointment.find(filter)
          .sort(params.sort)
          .skip(skip)
          .limit(params.limit);
        if (select) query = query.select(select);
        return query.populate(populates);
      })(),
    ]);

    const totalPages = Math.ceil(total / params.limit) || 1;
    return res.json({
      data: docs,
      pagination: { page: params.page, limit: params.limit, total, totalPages },
      filters: {
        status: params.status,
        from: params.from,
        to: params.to,
        serviceId: params.serviceId,
        packageId: params.packageId,
        technicianId: params.technicianId,
        userId: params.userId,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function listMyAppointments(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const params = parseListParams(req);
    const filter = buildBaseFilter(params);
    filter.userID = req.user.id;

    const select = buildSelect(params.fieldsParam);
    const populates = buildPopulate(params.includeParam);

    const skip = (params.page - 1) * params.limit;
    const [total, docs] = await Promise.all([
      Appointment.countDocuments(filter),
      (() => {
        let query = Appointment.find(filter)
          .sort(params.sort)
          .skip(skip)
          .limit(params.limit);
        if (select) query = query.select(select);
        return query.populate(populates);
      })(),
    ]);

    const totalPages = Math.ceil(total / params.limit) || 1;
    return res.json({
      data: docs,
      pagination: { page: params.page, limit: params.limit, total, totalPages },
      filters: {
        status: params.status,
        from: params.from,
        to: params.to,
        serviceId: params.serviceId,
        packageId: params.packageId,
        technicianId: params.technicianId,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function getAppointmentById(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const id = String(req.params.id);
    const includeParam = (req.query.include as string | undefined)?.trim();
    const fieldsParam = (req.query.fields as string | undefined)?.trim();
    const select = buildSelect(fieldsParam);
    const populates = buildPopulate(includeParam);

    let query = Appointment.findById(id);
    if (select) query = query.select(select);
    let doc = await query.populate(populates);
    if (!doc) return res.status(404).json({ message: 'Không tìm thấy appointment' });

    const role = req.user.role;
    if (role === 'admin' || role === 'staff') {
      return res.json({ data: doc });
    }

    // Tối thiểu: chỉ cho phép chủ sở hữu xem; có thể mở rộng cho technician khi có liên kết user-technician
    if (role === 'customer' && String(doc.userID) === req.user.id) {
      return res.json({ data: doc });
    }

    return res.status(403).json({ message: 'Insufficient permissions' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

// Cancel Appointment API
export async function cancelAppointment(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const appointmentId = String(req.params.id);
    const { reason } = req.body as { reason?: string };

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn'
      });
    }

    // Check permissions
    const role = req.user.role;
    const isOwner = String(appointment.userID) === req.user.id;

    if (role === 'customer' && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể hủy lịch hẹn của chính mình'
      });
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Lịch hẹn đã được hủy trước đó'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy lịch hẹn đã hoàn thành'
      });
    }

    if (appointment.status === 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy lịch hẹn đang thực hiện'
      });
    }

    // Check if appointment is too close to booking date (optional business rule)
    const now = new Date();
    const bookingDate = new Date(appointment.bookingDate);
    const timeDiff = bookingDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    // Only allow cancellation if appointment is more than 2 hours away (business rule)
    if (role === 'customer' && hoursDiff < 2 && hoursDiff > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy lịch hẹn trong vòng 2 giờ trước giờ hẹn'
      });
    }

    // Update appointment status
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        status: 'cancelled',
        ...(reason && { reason: `${appointment.reason ? appointment.reason + ' | ' : ''}Lý do hủy: ${reason}` })
      },
      { new: true }
    ).populate([
      { path: 'userID', select: 'userName email fullName' },
      { path: 'serviceID', select: 'name price duration' },
      { path: 'servicePackageID', select: 'name price duration' },
      { path: 'technicianLeaderID', select: 'userID', populate: { path: 'userID', select: 'userName fullName' } }
    ]);

    return res.status(200).json({
      success: true,
      message: 'Hủy lịch hẹn thành công',
      data: {
        appointment: updatedAppointment,
        cancelledAt: new Date(),
        cancelledBy: {
          id: req.user.id,
          role: req.user.role,
          name: req.user.fullName || req.user.userName
        }
      }
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi hủy lịch hẹn'
    });
  }
}

// Assign Technician to Appointment API
export async function assignTechnician(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check permissions - only admin and staff can assign technicians
    const role = req.user.role;
    if (role !== 'admin' && role !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin và staff mới có thể phân công technician'
      });
    }

    const appointmentId = String(req.params.id);
    const {
      technicianLeaderID,
      technicianSupport1ID,
      technicianSupport2ID,
      notes
    } = req.body as {
      technicianLeaderID?: string;
      technicianSupport1ID?: string;
      technicianSupport2ID?: string;
      notes?: string;
    };

    // Validate at least one technician is provided
    if (!technicianLeaderID && !technicianSupport1ID && !technicianSupport2ID) {
      return res.status(400).json({
        success: false,
        message: 'Phải chỉ định ít nhất một technician'
      });
    }

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn'
      });
    }

    // Check if appointment can be assigned technicians
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Không thể phân công technician cho lịch hẹn đã hủy'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Không thể phân công technician cho lịch hẹn đã hoàn thành'
      });
    }

    // Validate technician IDs and check if they exist
    const technicianIds = [technicianLeaderID, technicianSupport1ID, technicianSupport2ID]
      .filter(Boolean) as string[];

    if (technicianIds.length > 0) {
      // Check for duplicate technician assignments
      const uniqueIds = new Set(technicianIds);
      if (uniqueIds.size !== technicianIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Không thể phân công cùng một technician vào nhiều vị trí'
        });
      }

      // Verify all technicians exist and are active
      const technicians = await Technician.find({
        _id: { $in: technicianIds }
      }).populate('userID', 'userName fullName isDisabled role');

      if (technicians.length !== technicianIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Một hoặc nhiều technician không tồn tại'
        });
      }

      // Check if any technician is disabled or not a technician role
      const invalidTechnicians = technicians.filter(tech => {
        const user = tech.userID as any;
        return user.isDisabled || user.role !== 'technician';
      });

      if (invalidTechnicians.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Một hoặc nhiều technician không khả dụng hoặc không có quyền'
        });
      }

      // Check technician availability for the appointment time (optional business rule)
      const appointmentDate = new Date(appointment.bookingDate);
      const startTime = new Date(appointmentDate.getTime() - 30 * 60 * 1000); // 30 min before
      const endTime = new Date(appointmentDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours after

      const conflictingAppointments = await Appointment.find({
        _id: { $ne: appointmentId }, // Exclude current appointment
        bookingDate: { $gte: startTime, $lte: endTime },
        status: { $in: ['confirmed', 'in_progress'] },
        $or: [
          { technicianLeaderID: { $in: technicianIds } },
          { technicianSupport1ID: { $in: technicianIds } },
          { technicianSupport2ID: { $in: technicianIds } }
        ]
      }).populate('technicianLeaderID technicianSupport1ID technicianSupport2ID', 'userID')
        .populate({
          path: 'technicianLeaderID technicianSupport1ID technicianSupport2ID',
          populate: { path: 'userID', select: 'userName fullName' }
        });

      if (conflictingAppointments.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Một hoặc nhiều technician đã có lịch hẹn trùng thời gian',
          conflicts: conflictingAppointments.map(apt => ({
            appointmentId: apt._id,
            bookingDate: apt.bookingDate,
            conflictingTechnicians: [
              apt.technicianLeaderID,
              apt.technicianSupport1ID,
              apt.technicianSupport2ID
            ].filter(Boolean)
          }))
        });
      }
    }

    // Update appointment with technician assignments
    const updateData: any = {};
    if (technicianLeaderID !== undefined) updateData.technicianLeaderID = technicianLeaderID || null;
    if (technicianSupport1ID !== undefined) updateData.technicianSupport1ID = technicianSupport1ID || null;
    if (technicianSupport2ID !== undefined) updateData.technicianSupport2ID = technicianSupport2ID || null;

    // Update status to confirmed if it was pending
    if (appointment.status === 'pending') {
      updateData.status = 'confirmed';
    }

    // Add notes to reason if provided
    if (notes) {
      updateData.reason = appointment.reason
        ? `${appointment.reason} | Ghi chú phân công: ${notes}`
        : `Ghi chú phân công: ${notes}`;
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true }
    ).populate([
      { path: 'userID', select: 'userName email fullName phoneNumber' },
      { path: 'serviceID', select: 'name price duration description' },
      { path: 'servicePackageID', select: 'name price duration description' },
      {
        path: 'technicianLeaderID',
        select: 'userID introduction experience role',
        populate: { path: 'userID', select: 'userName fullName phoneNumber email' }
      },
      {
        path: 'technicianSupport1ID',
        select: 'userID introduction experience role',
        populate: { path: 'userID', select: 'userName fullName phoneNumber email' }
      },
      {
        path: 'technicianSupport2ID',
        select: 'userID introduction experience role',
        populate: { path: 'userID', select: 'userName fullName phoneNumber email' }
      }
    ]);

    return res.status(200).json({
      success: true,
      message: 'Phân công technician thành công',
      data: {
        appointment: updatedAppointment,
        assignedAt: new Date(),
        assignedBy: {
          id: req.user.id,
          role: req.user.role,
          name: req.user.fullName || req.user.userName
        },
        techniciansAssigned: {
          leader: technicianLeaderID ? true : false,
          support1: technicianSupport1ID ? true : false,
          support2: technicianSupport2ID ? true : false
        }
      }
    });

  } catch (error) {
    console.error('Assign technician error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi phân công technician'
    });
  }
}

// Get Available Technicians API (helper for assignment)
export async function getAvailableTechnicians(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check permissions - only admin and staff can view technicians
    const role = req.user.role;
    if (role !== 'admin' && role !== 'staff') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin và staff mới có thể xem danh sách technician'
      });
    }

    // Get all active technicians
    const technicians = await Technician.find({})
      .populate({
        path: 'userID',
        select: 'userName fullName email phoneNumber isDisabled role',
        match: { isDisabled: false, role: 'technician' }
      })
      .lean();

    // Filter out technicians with disabled users
    const availableTechnicians = technicians
      .filter(tech => tech.userID) // Only include technicians with valid user
      .map(tech => ({
        id: tech._id,
        technicianID: tech.technicianID,
        user: tech.userID,
        introduction: tech.introduction,
        role: tech.role,
        experience: tech.experience,
        startDate: tech.startDate,
        createdAt: tech.createdAt,
        updatedAt: tech.updatedAt
      }));

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách technician thành công',
      data: {
        technicians: availableTechnicians,
        total: availableTechnicians.length
      }
    });

  } catch (error) {
    console.error('Get available technicians error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách technician'
    });
  }
}


