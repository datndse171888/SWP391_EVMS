import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Appointment } from '../models/Appointment.js';
import { Vehicle } from '../models/Vehicle.js';
import { getDefaultMaintenanceCycleMonths, computeNextMaintenanceDate, isDue } from '../utils/maintenance.js';
import { Technician } from '../models/Technician.js';
import { User } from '../models/User.js';
import { selectTechniciansForSlot } from '../services/technicianAssignment.js';

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

    // Check if user is verified (for customer role)
    if (req.user) {
      const account = await User.findById(req.user.id);
      if (account && account.role === 'customer' && !account.isVerified) {
        return res.status(403).json({ 
          message: 'Vui lòng xác thực tài khoản trước khi đặt lịch' 
        });
      }
    }

    // Validate ít nhất một trong serviceID hoặc servicePackageID
    if (!serviceID && !servicePackageID) {
      return res.status(400).json({ message: 'Phải chọn ít nhất một dịch vụ hoặc gói dịch vụ' });
    }

    // Validate ObjectId format for required fields
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      return res.status(400).json({ message: 'userID không hợp lệ' });
    }

    // Helper function to convert string to ObjectId or undefined
    const toObjectIdOrUndefined = (value: string | undefined): mongoose.Types.ObjectId | undefined => {
      if (!value || value.trim() === '') return undefined;
      if (!mongoose.Types.ObjectId.isValid(value)) return undefined;
      return new mongoose.Types.ObjectId(value);
    };

    // Parse bookingDate
    let parsedBookingDate: Date;
    try {
      parsedBookingDate = new Date(bookingDate);
      if (isNaN(parsedBookingDate.getTime())) {
        return res.status(400).json({ message: 'bookingDate không hợp lệ' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'bookingDate không hợp lệ' });
    }

    // ============================================
    // VALIDATION: Prevent creating a new periodic plan while another is active for the vehicle
    // Allow scheduling for the SAME active plan
    // ============================================
    try {
      if (vehicleID && (serviceID || servicePackageID)) {
        // Load selected config
        let selectedPeriodic = false;
        let selectedKey = '';
        if (servicePackageID && mongoose.Types.ObjectId.isValid(servicePackageID)) {
          const { ServicePackage } = await import('../models/ServicePackage.js');
          const pkg = (await ServicePackage.findById(servicePackageID).select('periodicEnabled intervalMonths defaultTotalVisits').lean()) as any;
          if (pkg?.periodicEnabled) { selectedPeriodic = true; selectedKey = `P:${servicePackageID}`; }
        } else if (serviceID && mongoose.Types.ObjectId.isValid(serviceID)) {
          const { Service } = await import('../models/Service.js');
          const svc = (await Service.findById(serviceID).select('periodicEnabled intervalMonths defaultTotalVisits').lean()) as any;
          if (svc?.periodicEnabled) { selectedPeriodic = true; selectedKey = `S:${serviceID}`; }
        }

        if (selectedPeriodic) {
          // Find existing periodic subscriptions for this vehicle based on completed appointments
          const all = await Appointment.find({
            vehicleID: new mongoose.Types.ObjectId(vehicleID),
            status: 'completed',
            $or: [{ serviceID: { $ne: null } }, { servicePackageID: { $ne: null } }]
          }).select('serviceID servicePackageID bookingDate').lean();

          // Group counts
          type Key = string; interface Group { first: Date; count: number; key: string; serviceID?: any; servicePackageID?: any }
          const groups = new Map<Key, Group>();
          const toKey = (a: any) => (a.serviceID ? `S:${a.serviceID}` : `P:${a.servicePackageID}`);
          for (const a of all) {
            const k = toKey(a);
            const g = groups.get(k);
            if (!g) groups.set(k, { first: a.bookingDate as any, count: 1, key: k, serviceID: a.serviceID, servicePackageID: a.servicePackageID });
            else { g.count += 1; if (new Date(a.bookingDate as any) < new Date(g.first)) g.first = a.bookingDate as any; }
          }

          // Evaluate each group to see if active
          for (const [, g] of groups) {
            let cfg: any = null;
            if (g.serviceID) {
              const { Service } = await import('../models/Service.js');
              cfg = await Service.findById(g.serviceID).select('periodicEnabled defaultTotalVisits').lean();
            } else if (g.servicePackageID) {
              const { ServicePackage } = await import('../models/ServicePackage.js');
              cfg = await ServicePackage.findById(g.servicePackageID).select('periodicEnabled defaultTotalVisits').lean();
            }
            if (!cfg?.periodicEnabled || !cfg?.defaultTotalVisits) continue;
            const remaining = Math.max(0, Number(cfg.defaultTotalVisits) - g.count);
            if (remaining > 0) {
              // There is an active periodic plan
              if (g.key !== selectedKey) {
                return res.status(409).json({
                  success: false,
                  message: 'Xe này đang có gói định kỳ còn hiệu lực. Vui lòng hoàn tất hoặc chọn gói/dịch vụ không định kỳ.'
                });
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('Periodic validation error:', e);
      // continue without blocking if validation fails unexpectedly
    }

    // ============================================
    // KIỂM TRA TRÙNG LỊCH VÀ TECHNICIANS
    // ============================================

    // 1. Kiểm tra user đã đặt lịch cho slot này chưa
    // Tính thời gian bắt đầu và kết thúc của appointment để check overlap chính xác
    const appointmentStart = new Date(parsedBookingDate);
    
    // Get duration để tính appointment end time
    let duration = 60; // Default, sẽ được update sau
    if (serviceID && mongoose.Types.ObjectId.isValid(serviceID)) {
      const { Service } = await import('../models/Service.js');
      const service = await Service.findById(serviceID).select('duration').lean();
      if (service && 'duration' in service && typeof service.duration === 'number') {
        duration = service.duration;
      }
    } else if (servicePackageID && mongoose.Types.ObjectId.isValid(servicePackageID)) {
      const { ServicePackage } = await import('../models/ServicePackage.js');
      const servicePackage = await ServicePackage.findById(servicePackageID).select('duration').lean();
      if (servicePackage && 'duration' in servicePackage && typeof servicePackage.duration === 'number') {
        duration = servicePackage.duration;
      }
    }
    
    const appointmentEnd = new Date(appointmentStart);
    appointmentEnd.setMinutes(appointmentEnd.getMinutes() + duration);
    
    // Check for existing appointments that overlap with this time slot
    const existingAppointments = await Appointment.find({
      userID: new mongoose.Types.ObjectId(userID),
      status: {
        $nin: ['cancelled', 'completed']
      }
    })
      .select('bookingDate serviceID servicePackageID')
      .lean();

    // Check overlap với từng existing appointment
    for (const existing of existingAppointments) {
      let existingDuration = 60; // default
      if (existing.serviceID) {
        const { Service } = await import('../models/Service.js');
        const service = await Service.findById(existing.serviceID).select('duration').lean();
        if (service && 'duration' in service && typeof service.duration === 'number') {
          existingDuration = service.duration;
        }
      } else if (existing.servicePackageID) {
        const { ServicePackage } = await import('../models/ServicePackage.js');
        const pkg = await ServicePackage.findById(existing.servicePackageID).select('duration').lean();
        if (pkg && 'duration' in pkg && typeof pkg.duration === 'number') {
          existingDuration = pkg.duration;
        }
      }
      
      const existingStart = new Date(existing.bookingDate);
      const existingEnd = new Date(existingStart);
      existingEnd.setMinutes(existingEnd.getMinutes() + existingDuration);
      
      // Check overlap: existing starts before this ends AND existing ends after this starts
      if (existingStart < appointmentEnd && existingEnd > appointmentStart) {
        return res.status(400).json({ 
          message: 'Bạn đã đặt lịch cho khung giờ này rồi. Vui lòng chọn khung giờ khác.' 
        });
      }
    }

    // 2. Xác định vehicleCategory và duration (đã lấy duration ở trên, chỉ cần lấy vehicleCategory)
    let vehicleCategory: 'CAR' | 'MOTOBIKE' | 'BICYCLE' = 'CAR';

    // Lấy vehicleCategory từ vehicleID
    if (vehicleID && mongoose.Types.ObjectId.isValid(vehicleID)) {
      const { Vehicle } = await import('../models/Vehicle.js');
      const vehicle = await Vehicle.findById(vehicleID).select('vehicleCategory').lean();
      if (vehicle && vehicle.vehicleCategory) {
        vehicleCategory = vehicle.vehicleCategory;
      }
    }

    // 3. Xác định số lượng technicians cần thiết (duration đã được tính ở bước 1)
    const requiredTechnicians = {
      CAR: { leader: 1, support: 2 },
      MOTOBIKE: { leader: 1, support: 1 },
      BICYCLE: { leader: 1, support: 1 }
    };
    const required = requiredTechnicians[vehicleCategory];

    // 4. Tính thời gian kết thúc của appointment (đã tính ở trên)
    // appointmentStart và appointmentEnd đã được tính ở bước 1

    // 5. Tìm tất cả appointments overlap với khoảng thời gian này
    const overlappingAppointments = await Appointment.find({
      bookingDate: {
        $lt: appointmentEnd // Appointment bắt đầu trước khi appointment này kết thúc
      },
      status: {
        $nin: ['cancelled', 'completed']
      }
    })
      .select('bookingDate serviceID servicePackageID technicianLeaderID technicianSupport1ID technicianSupport2ID')
      .lean();

    // Lọc appointments thực sự overlap (tính duration của từng appointment)
    const actualOverlappingAppointments = [];
    for (const apt of overlappingAppointments) {
      let aptDuration = 60; // default
      if (apt.serviceID) {
        const { Service } = await import('../models/Service.js');
        const service = await Service.findById(apt.serviceID).select('duration').lean();
        if (service && 'duration' in service && typeof service.duration === 'number') {
          aptDuration = service.duration;
        }
      } else if (apt.servicePackageID) {
        const { ServicePackage } = await import('../models/ServicePackage.js');
        const pkg = await ServicePackage.findById(apt.servicePackageID).select('duration').lean();
        if (pkg && 'duration' in pkg && typeof pkg.duration === 'number') {
          aptDuration = pkg.duration;
        }
      }

      const aptStart = new Date(apt.bookingDate);
      const aptEnd = new Date(aptStart);
      aptEnd.setMinutes(aptEnd.getMinutes() + aptDuration);

      // Check overlap: apt starts before this ends AND apt ends after this starts
      if (aptStart < appointmentEnd && aptEnd > appointmentStart) {
        actualOverlappingAppointments.push(apt);
      }
    }

    // 6. Đếm technicians đã được assign trong các appointments overlap
    const assignedLeaders = new Set<string>();
    const assignedSupports = new Set<string>();

    actualOverlappingAppointments.forEach(apt => {
      if (apt.technicianLeaderID) assignedLeaders.add(String(apt.technicianLeaderID));
      if (apt.technicianSupport1ID) assignedSupports.add(String(apt.technicianSupport1ID));
      if (apt.technicianSupport2ID) assignedSupports.add(String(apt.technicianSupport2ID));
    });

    // 7. Lấy tất cả active technicians (user không bị disabled)
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

    // 8. Tính số technicians available
    const availableLeaders = activeLeaders.length - assignedLeaders.size;
    const availableSupports = activeSupports.length - assignedSupports.size;

    // 9. Kiểm tra có đủ technicians không
    if (availableLeaders < required.leader || availableSupports < required.support) {
      return res.status(400).json({ 
        message: `Không còn đủ kỹ thuật viên cho khung giờ này. Hiện có ${availableLeaders} leader và ${availableSupports} support khả dụng.` 
      });
    }

    // 10. Tự động gán technician theo tiêu chí “ít việc nhất trong tuần” nếu FE không truyền
    let autoLeaderId: string | undefined = undefined;
    let autoSupport1Id: string | undefined = undefined;
    let autoSupport2Id: string | undefined = undefined;

    const missingAllProvided = !technicianLeaderID && !technicianSupport1ID && !technicianSupport2ID;
    if (missingAllProvided) {
      // Lấy danh sách active leaders/supports từ bước 7
      const pick = await selectTechniciansForSlot({
        startTime: appointmentStart,
        endTime: appointmentEnd,
        vehicleCategory,
        activeLeaders: activeLeaders.map(t => ({ _id: t._id as any, startDate: (t as any).startDate })) as any,
        activeSupports: activeSupports.map(t => ({ _id: t._id as any, startDate: (t as any).startDate })) as any,
        overlappingAppointments: actualOverlappingAppointments as any,
      });

      if (!pick.ok) {
        return res.status(400).json({ message: 'Không đủ kỹ thuật viên khả dụng để tự động gán cho lịch này' });
      }

      autoLeaderId = pick.leaders[0];
      autoSupport1Id = pick.supports[0];
      autoSupport2Id = required.support > 1 ? pick.supports[1] : undefined;
    }

    // ============================================
    // TẠO APPOINTMENT
    // ============================================

    const appointment = await Appointment.create({
      userID: new mongoose.Types.ObjectId(userID),
      vehicleID: toObjectIdOrUndefined(vehicleID),
      technicianLeaderID: toObjectIdOrUndefined(technicianLeaderID || autoLeaderId),
      technicianSupport1ID: toObjectIdOrUndefined(technicianSupport1ID || autoSupport1Id),
      technicianSupport2ID: toObjectIdOrUndefined(technicianSupport2ID || autoSupport2Id),
      serviceID: toObjectIdOrUndefined(serviceID),
      servicePackageID: toObjectIdOrUndefined(servicePackageID),
      bookingDate: parsedBookingDate,
      reason: reason || undefined,
      status: status || 'pending',
    });

    return res.status(201).json(appointment);
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    
    // Return more detailed error in development
    if (process.env.NODE_ENV === 'development') {
      return res.status(500).json({ 
        message: 'Lỗi máy chủ',
        error: error.message,
        stack: error.stack
      });
    }
    
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
    populates.push({ 
      path: 'technicianLeaderID', 
      select: '_id userID role introduction experience',
      populate: { path: 'userID', select: 'userName fullName email phoneNumber' }
    });
    populates.push({ 
      path: 'technicianSupport1ID', 
      select: '_id userID role introduction experience',
      populate: { path: 'userID', select: 'userName fullName email phoneNumber' }
    });
    populates.push({ 
      path: 'technicianSupport2ID', 
      select: '_id userID role introduction experience',
      populate: { path: 'userID', select: 'userName fullName email phoneNumber' }
    });
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

    // Return plain data array (no wrappers)
    return res.json(docs);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

// List today's appointments with status awaiting_payment (admin/staff)
export async function listTodayAwaitingPayment(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const role = req.user.role;
    if (role !== 'admin' && role !== 'staff') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const docs = await Appointment.find({
      status: 'awaiting_payment',
      bookingDate: { $gte: start, $lte: end }
    }).sort({ bookingDate: 1 });

    return res.json({ data: docs, pagination: { total: docs.length } });
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

// List appointments assigned to current technician
export async function listMyAssignedAppointments(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const role = req.user.role;
    if (role !== 'technician') {
      return res.status(403).json({ message: 'Chỉ kỹ thuật viên được phép xem danh sách này' });
    }

    // Resolve technicianId from current user
    // Resolve technician profile by userID (accept both ObjectId and string)
    const techDoc = (await Technician.findOne({ userID: req.user.id }).select('_id').lean() 
      || await Technician.findOne({ userID: new mongoose.Types.ObjectId(req.user.id) }).select('_id').lean()) as any;
    if (!techDoc) return res.status(404).json({ message: 'Không tìm thấy hồ sơ technician cho người dùng hiện tại' });
    const technicianId = String(techDoc._id);

    const params = parseListParams(req);
    const filter = buildBaseFilter(params);
    filter.$or = [
      { technicianLeaderID: technicianId },
      { technicianSupport1ID: technicianId },
      { technicianSupport2ID: technicianId },
    ];

    const select = buildSelect(params.fieldsParam) || '_id userID vehicleID serviceID servicePackageID bookingDate status technicianLeaderID technicianSupport1ID technicianSupport2ID createdAt updatedAt';
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

    // Technician: trả thẳng mảng dữ liệu
    return res.json(docs);
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function getAppointmentById(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const id = String(req.params.id);
    console.log('getAppointmentById - Requested ID:', id);
    console.log('getAppointmentById - User role:', req.user.role);
    console.log('getAppointmentById - User ID:', req.user.id);

    const includeParam = (req.query.include as string | undefined)?.trim();
    const fieldsParam = (req.query.fields as string | undefined)?.trim();
    const select = buildSelect(fieldsParam);
    const populates = buildPopulate(includeParam);

    const includeNextPeriodic = String((req.query as any).includeNextPeriodic || '')
      .toLowerCase() === 'true';

    type PeriodicInfo = {
      isPeriodicSubscription: boolean;
      serviceType?: 'service' | 'servicePackage';
      serviceName?: string;
      totalVisits?: number;
      completedVisits?: number;
      remainingVisits?: number;
      intervalMonths?: number;
      nextAppointment?: any | null;
      estimatedNextDate?: Date | null;
      subscriptionStatus?: 'active' | 'completed' | 'expired';
      lastCompletedDate?: Date | null;
    } | null;

    async function buildPeriodicInfo(appointmentDoc: any): Promise<PeriodicInfo> {
      try {
        if (!appointmentDoc) return null;
        if (!appointmentDoc.vehicleID) return null;

        const hasPackage = Boolean(appointmentDoc.servicePackageID);
        const hasService = Boolean(appointmentDoc.serviceID);
        if (!hasPackage && !hasService) return null;

        const now = new Date();
        let periodicEnabled = false;
        let intervalMonths: number | undefined = undefined;
        let totalVisits: number | undefined = undefined;
        let serviceName: string | undefined = undefined;
        let serviceType: 'service' | 'servicePackage' = hasPackage ? 'servicePackage' : 'service';

        if (hasPackage) {
          const { ServicePackage } = await import('../models/ServicePackage.js');
          const pkg = await ServicePackage.findById(appointmentDoc.servicePackageID)
            .select('periodicEnabled intervalMonths defaultTotalVisits name')
            .lean();
          if (!pkg) return null;
          periodicEnabled = Boolean((pkg as any).periodicEnabled);
          intervalMonths = (pkg as any).intervalMonths ?? undefined;
          totalVisits = (pkg as any).defaultTotalVisits ?? undefined;
          serviceName = (pkg as any).name;
        } else if (hasService) {
          const { Service } = await import('../models/Service.js');
          const svc = await Service.findById(appointmentDoc.serviceID)
            .select('periodicEnabled intervalMonths defaultTotalVisits name')
            .lean();
          if (!svc) return null;
          periodicEnabled = Boolean((svc as any).periodicEnabled);
          intervalMonths = (svc as any).intervalMonths ?? undefined;
          totalVisits = (svc as any).defaultTotalVisits ?? undefined;
          serviceName = (svc as any).name;
        }

        if (!periodicEnabled) return null;

        const completedFilter: any = {
          vehicleID: appointmentDoc.vehicleID,
          status: 'completed',
        };
        if (hasPackage) completedFilter.servicePackageID = appointmentDoc.servicePackageID;
        if (hasService) completedFilter.serviceID = appointmentDoc.serviceID;

        const [completedVisits, lastCompleted] = await Promise.all([
          Appointment.countDocuments(completedFilter),
          Appointment.findOne(completedFilter).sort({ bookingDate: -1 }).select('bookingDate').lean()
        ]);

        const nextFilter: any = {
          vehicleID: appointmentDoc.vehicleID,
          status: { $in: ['pending', 'confirmed'] },
          bookingDate: { $gt: now },
        };
        if (hasPackage) nextFilter.servicePackageID = appointmentDoc.servicePackageID;
        if (hasService) nextFilter.serviceID = appointmentDoc.serviceID;

        const nextAppointment = await Appointment.findOne(nextFilter)
          .sort({ bookingDate: 1 })
          .select('_id userID vehicleID serviceID servicePackageID bookingDate status technicianLeaderID technicianSupport1ID technicianSupport2ID')
          .lean();

        const remainingVisits = typeof totalVisits === 'number'
          ? Math.max(0, Number(totalVisits) - Number(completedVisits || 0))
          : undefined;

        const subscriptionStatus: 'active' | 'completed' | 'expired' | undefined =
          typeof remainingVisits === 'number'
            ? (remainingVisits > 0 ? 'active' : 'completed')
            : undefined;

        let estimatedNextDate: Date | null = null;
        if (!nextAppointment && subscriptionStatus !== 'completed' && intervalMonths && intervalMonths > 0) {
          const base = (lastCompleted?.bookingDate ? new Date(lastCompleted.bookingDate) : now);
          const est = new Date(base);
          est.setMonth(est.getMonth() + Number(intervalMonths));
          estimatedNextDate = est;
        }

        return {
          isPeriodicSubscription: true,
          serviceType,
          serviceName,
          totalVisits: typeof totalVisits === 'number' ? totalVisits : undefined,
          completedVisits: Number(completedVisits || 0),
          remainingVisits,
          intervalMonths: typeof intervalMonths === 'number' ? intervalMonths : undefined,
          nextAppointment: nextAppointment || null,
          estimatedNextDate,
          subscriptionStatus,
          lastCompletedDate: lastCompleted?.bookingDate ? new Date(lastCompleted.bookingDate) : null,
        };
      } catch (e) {
        console.error('buildPeriodicInfo error:', e);
        return null;
      }
    }

    let query = Appointment.findById(id);
    if (select) query = query.select(select);
    let doc = await query.populate(populates);

    if (!doc) {
      console.log('getAppointmentById - Appointment not found in database');
      return res.status(404).json({ message: 'Không tìm thấy appointment' });
    }

    console.log('getAppointmentById - Appointment found:', {
      id: doc._id,
      userID: doc.userID,
      technicianLeaderID: doc.technicianLeaderID,
      technicianSupport1ID: doc.technicianSupport1ID,
      technicianSupport2ID: doc.technicianSupport2ID
    });

    const role = req.user.role;
    if (role === 'admin' || role === 'staff') {
      if (includeNextPeriodic) {
        const periodicInfo = await buildPeriodicInfo(doc);
        return res.json({ data: doc, periodicInfo });
      }
      return res.json({ data: doc });
    }

    // Allow customer to view their own appointments
    if (role === 'customer' && String(doc.userID) === req.user.id) {
      if (includeNextPeriodic) {
        const periodicInfo = await buildPeriodicInfo(doc);
        return res.json({ data: doc, periodicInfo });
      }
      return res.json({ data: doc });
    }

    // Allow technician to view appointments they are assigned to
    if (role === 'technician') {
      // Resolve technician profile by userID (accept both ObjectId and string)
      const techDoc = (await Technician.findOne({ userID: req.user.id }).select('_id').lean()
        || await Technician.findOne({ userID: new mongoose.Types.ObjectId(req.user.id) }).select('_id').lean()) as any;
      if (!techDoc) {
        console.log('getAppointmentById - Technician profile not found');
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
      const technicianId = String(techDoc._id);
      console.log('getAppointmentById - Technician ID:', technicianId);

      const isAssigned =
        String(doc.technicianLeaderID) === technicianId ||
        String(doc.technicianSupport1ID) === technicianId ||
        String(doc.technicianSupport2ID) === technicianId;

      console.log('getAppointmentById - Is assigned:', isAssigned);

      if (isAssigned) {
        if (includeNextPeriodic) {
          const periodicInfo = await buildPeriodicInfo(doc);
          return res.json({ data: doc, periodicInfo });
        }
        return res.json({ data: doc });
      } else {
        console.log('getAppointmentById - Technician not assigned to this appointment');
      }
    }

    return res.status(403).json({ message: 'Insufficient permissions' });
  } catch (error) {
    console.error('getAppointmentById error:', error);
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

// Get Appointments by User ID API
export async function getAppointmentsByUserId(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userId = String(req.params.userId);
    const role = req.user.role;

    // Check permissions: user can only view their own appointments, admin/staff can view any
    if (role === 'customer' && userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể xem lịch hẹn của chính mình'
      });
    }

    // Parse query params for pagination and filtering
    const params = parseListParams(req);
    const filter = buildBaseFilter(params);
    filter.userID = userId;

    const select = buildSelect(params.fieldsParam);
    const populates = buildPopulate(params.includeParam);

    // Default populate if not specified
    if (populates.length === 0) {
      populates.push(
        { path: 'userID', select: 'userName fullName email phoneNumber' },
        { path: 'serviceID', select: 'name price duration' },
        { path: 'servicePackageID', select: 'name price duration description' }
      );
    }

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
    
    return res.status(200).json({
      success: true,
      data: docs,
      pagination: { 
        page: params.page, 
        limit: params.limit, 
        total, 
        totalPages 
      },
      filters: {
        userId,
        status: params.status,
        from: params.from,
        to: params.to,
        serviceId: params.serviceId,
        packageId: params.packageId,
      },
    });
  } catch (error) {
    console.error('Get appointments by userId error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy danh sách lịch hẹn'
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


// Update Appointment Status API
export async function updateAppointmentStatus(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Only admin, staff, technician can change status
    const role = req.user.role;
    if (role !== 'admin' && role !== 'staff' && role !== 'technician') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ admin, staff hoặc technician mới có thể thay đổi trạng thái'
      });
    }

    const appointmentId = String(req.params.id);
    const { status, reason, notes } = req.body as {
      status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
      reason?: string;
      notes?: string;
    };

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu trường status'
      });
    }

    const allowedStatuses = new Set(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']);
    if (!allowedStatuses.has(status)) {
      return res.status(400).json({
        success: false,
        message: 'Giá trị status không hợp lệ'
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn'
      });
    }

    const currentStatus = appointment.status;

    // Disallow changes from terminal states except to keep same
    if (currentStatus === 'completed' || currentStatus === 'cancelled') {
      if (status !== currentStatus) {
        return res.status(400).json({
          success: false,
          message: `Không thể chuyển trạng thái từ ${currentStatus}`
        });
      }
    }

    // Allowed transitions map
    const allowedTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled', 'no_show'],
      confirmed: ['in_progress', 'cancelled', 'no_show'],
      in_progress: ['completed', 'cancelled', 'no_show'],
      completed: [],
      cancelled: [],
      no_show: ['confirmed'] // allow re-confirming if customer returns
    };

    if (status !== currentStatus) {
      const nexts = allowedTransitions[currentStatus] || [];
      if (!nexts.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Chuyển trạng thái không hợp lệ: ${currentStatus} -> ${status}`
        });
      }
    }

    const updateData: any = { status };
    if (reason) {
      updateData.reason = appointment.reason ? `${appointment.reason} | ${reason}` : reason;
    }
    if (notes) {
      updateData.reason = updateData.reason
        ? `${updateData.reason} | Ghi chú: ${notes}`
        : `Ghi chú: ${notes}`;
    }

    const updated = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true }
    ).populate([
      { path: 'userID', select: 'userName email fullName phoneNumber' },
      { path: 'serviceID', select: 'name price duration description' },
      { path: 'servicePackageID', select: 'name price duration description' },
      { path: 'technicianLeaderID', select: 'userID', populate: { path: 'userID', select: 'userName fullName' } }
    ]);

    // Maintenance: vehicle-first-appointment logic (default cycle by vehicle type)
    if (status === 'completed' && updated && updated.vehicleID) {
      try {
        const vehicle = await Vehicle.findById(updated.vehicleID);
        if (vehicle) {
          const cycleMonths = vehicle.maintenanceCycleMonths || getDefaultMaintenanceCycleMonths(vehicle.vehicleCategory as any);
          const last = new Date();
          const next = computeNextMaintenanceDate(last, cycleMonths);
          vehicle.lastMaintenanceDate = last;
          vehicle.maintenanceCycleMonths = cycleMonths;
          vehicle.nextMaintenanceDate = next;
          vehicle.isMaintenanceDue = isDue(next);
          await vehicle.save();
        }
      } catch (e) {
        console.error('Failed to update vehicle maintenance info:', e);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái lịch hẹn thành công',
      data: updated
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi cập nhật trạng thái lịch hẹn'
    });
  }
}

// Get Service or ServicePackage by Appointment ID API
export async function getServiceByAppointmentId(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const appointmentId = String(req.params.id);

    // Find appointment
    const appointment = await Appointment.findById(appointmentId)
      .select('serviceID servicePackageID userID')
      .lean() as any;

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy lịch hẹn'
      });
    }

    // Check permissions
    const role = req.user.role;
    const isOwner = String(appointment.userID) === req.user.id;

    // Admin and staff can view any appointment's service/package
    // Customer can only view their own appointment's service/package
    // Technician can view if they are assigned to the appointment
    if (role === 'customer' && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể xem dịch vụ của lịch hẹn của chính mình'
      });
    }

    // If technician, check if they are assigned to this appointment
    if (role === 'technician') {
      const techDoc = await Technician.findOne({ userID: new mongoose.Types.ObjectId(req.user.id) })
        .select('_id')
        .lean() as any;
      
      if (techDoc) {
        const technicianId = String(techDoc._id);
        const fullAppointment = await Appointment.findById(appointmentId)
          .select('technicianLeaderID technicianSupport1ID technicianSupport2ID')
          .lean() as any;
        
        if (fullAppointment) {
          const isAssigned = 
            String(fullAppointment.technicianLeaderID) === technicianId ||
            String(fullAppointment.technicianSupport1ID) === technicianId ||
            String(fullAppointment.technicianSupport2ID) === technicianId;
          
          if (!isAssigned) {
            return res.status(403).json({
              success: false,
              message: 'Bạn chỉ có thể xem dịch vụ của lịch hẹn được phân công cho bạn'
            });
          }
        }
      }
    }

    // Check if appointment has serviceID or servicePackageID
    if (appointment.serviceID) {
      const { Service } = await import('../models/Service.js');
      const service = await Service.findById(appointment.serviceID).lean();

      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy dịch vụ'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Lấy thông tin dịch vụ thành công',
        data: {
          type: 'service',
          service: service
        }
      });
    } else if (appointment.servicePackageID) {
      const { ServicePackage } = await import('../models/ServicePackage.js');
      const servicePackage = await ServicePackage.findById(appointment.servicePackageID)
        .populate('services', '_id name price duration description vehicleCategory')
        .lean();

      if (!servicePackage) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy gói dịch vụ'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Lấy thông tin gói dịch vụ thành công',
        data: {
          type: 'servicePackage',
          servicePackage: servicePackage
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Lịch hẹn không có dịch vụ hoặc gói dịch vụ'
      });
    }

  } catch (error) {
    console.error('Get service by appointment ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi lấy thông tin dịch vụ'
    });
  }
}

// Dashboard: Count total pending appointments
export async function countPendingAppointments(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const role = req.user.role;
    if (role !== 'admin' && role !== 'staff') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    const total = await Appointment.countDocuments({ status: 'pending' });
    // Return plain object (no wrappers)
    return res.status(200).json({ totalPending: total });
  } catch (error) {
    console.error('Count pending appointments error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi thống kê' });
  }
}

// Dashboard: Count totals for confirmed and cancelled appointments
export async function countConfirmedAndCancelledAppointments(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const role = req.user.role;
    if (role !== 'admin' && role !== 'staff') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    const [confirmed, cancelled] = await Promise.all([
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
    ]);
    // Return plain object (no wrappers)
    return res.status(200).json({
      totalConfirmed: confirmed,
      totalCancelled: cancelled,
    });
  } catch (error) {
    console.error('Count confirmed/cancelled appointments error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi thống kê' });
  }
}

// Dashboard: Count total appointments (all statuses)
export async function countAllAppointments(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const role = req.user.role;
    if (role !== 'admin' && role !== 'staff') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    const total = await Appointment.countDocuments({});
    // Return plain object (no wrappers)
    return res.status(200).json({ totalAll: total });
  } catch (error) {
    console.error('Count all appointments error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi thống kê' });
  }
}

// Maintenance reminders list for staff/admin
export async function listMaintenanceReminders(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const role = req.user.role;
    if (role !== 'admin' && role !== 'staff') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const windowDaysRaw = parseInt(String(req.query.windowDays ?? '7'), 10);
    const windowDays = Math.min(Math.max(isNaN(windowDaysRaw) ? 7 : windowDaysRaw, 1), 60);
    const typeParam = String(req.query.type || 'all').toLowerCase(); // 'periodic' | 'vehicleschedule' | 'all'
    const hasAppointmentParam = (req.query.hasAppointment as string | undefined)?.toLowerCase(); // 'true' | 'false'
    const vehicleCategory = (req.query.vehicleCategory as string | undefined)?.toUpperCase() as ('CAR'|'MOTOBIKE'|'BICYCLE'|undefined);

    const page = Math.max(parseInt(String(req.query.page || '1'), 10) || 1, 1);
    const limitRaw = Math.max(parseInt(String(req.query.limit || '10'), 10) || 10, 1);
    const limit = Math.min(limitRaw, 100);
    const sortField = String(req.query.sort || 'dueDate');
    const order = String(req.query.order || 'asc');
    const includeParam = (req.query.include as string | undefined)?.trim();
    const include = new Set((includeParam || '').split(',').map(s => s.trim()).filter(Boolean));

    const now = new Date();
    const today = new Date(); today.setHours(0,0,0,0);
    const deadline = new Date(today); deadline.setDate(deadline.getDate() + windowDays);

    // Helper: due status
    const getDueStatus = (d: Date | null | undefined): 'overdue' | 'dueToday' | 'upcoming' | null => {
      if (!d) return null;
      const dd = new Date(d); dd.setHours(0,0,0,0);
      if (dd.getTime() < today.getTime()) return 'overdue';
      if (dd.getTime() === today.getTime()) return 'dueToday';
      if (dd.getTime() > today.getTime() && dd.getTime() <= deadline.getTime()) return 'upcoming';
      return null;
    };

    // 1) PERIODIC SUBSCRIPTIONS
    const periodicPipeline: any[] = [
      { $match: {
          vehicleID: { $ne: null },
          $or: [ { serviceID: { $ne: null } }, { servicePackageID: { $ne: null } } ],
          status: { $in: ['completed','pending','confirmed'] }
        }
      },
      { $addFields: {
          isCompleted: { $eq: ['$status', 'completed'] },
          isWindow: { $and: [ { $in: ['$status', ['pending','confirmed']] }, { $gte: ['$bookingDate', today] }, { $lte: ['$bookingDate', deadline] } ] }
        }
      },
      { $group: {
          _id: { vehicleID: '$vehicleID', serviceID: '$serviceID', servicePackageID: '$servicePackageID' },
          completedVisits: { $sum: { $cond: ['$isCompleted', 1, 0] } },
          lastCompletedDate: { $max: { $cond: ['$isCompleted', '$bookingDate', null] } },
          nextScheduledDate: { $min: { $cond: ['$isWindow', '$bookingDate', null] } }
        }
      }
    ];

    const periodicGroups = await Appointment.aggregate(periodicPipeline);

    // Collect IDs
    const vehicleIds: string[] = [];
    const serviceIds: string[] = [];
    const packageIds: string[] = [];
    for (const g of periodicGroups) {
      const vid = String(g._id.vehicleID);
      if (!vehicleIds.includes(vid)) vehicleIds.push(vid);
      if (g._id.serviceID) {
        const sid = String(g._id.serviceID);
        if (!serviceIds.includes(sid)) serviceIds.push(sid);
      }
      if (g._id.servicePackageID) {
        const pid = String(g._id.servicePackageID);
        if (!packageIds.includes(pid)) packageIds.push(pid);
      }
    }

    // Load vehicles map
    const vehicles = await Vehicle.find({ _id: { $in: vehicleIds } })
      .select('_id userID plateNumber vehicleCategory brand lastMaintenanceDate nextMaintenanceDate maintenanceCycleMonths')
      .lean();
    const vehicleMap = new Map<string, any>(vehicles.map(v => [String(v._id), v]));

    // Load config maps for services/packages
    const serviceMap = new Map<string, any>();
    const packageMap = new Map<string, any>();
    if (serviceIds.length > 0) {
      const { Service } = await import('../models/Service.js');
      const svcs = await Service.find({ _id: { $in: serviceIds } })
        .select('_id name periodicEnabled intervalMonths defaultTotalVisits')
        .lean();
      svcs.forEach(s => serviceMap.set(String(s._id), s));
    }
    if (packageIds.length > 0) {
      const { ServicePackage } = await import('../models/ServicePackage.js');
      const pkgs = await ServicePackage.find({ _id: { $in: packageIds } })
        .select('_id name periodicEnabled intervalMonths defaultTotalVisits')
        .lean();
      pkgs.forEach(p => packageMap.set(String(p._id), p));
    }

    type ReminderItem = {
      type: 'periodic' | 'vehicleSchedule';
      dueDate: Date;
      dueStatus: 'overdue' | 'dueToday' | 'upcoming';
      nextAppointment?: any | null;
      vehicle?: any;
      user?: any;
      periodicSummary?: any;
      scheduleSummary?: any;
    };

    const periodicItems: ReminderItem[] = [];

    for (const g of periodicGroups) {
      const vid = String(g._id.vehicleID);
      const veh = vehicleMap.get(vid);
      if (!veh) continue;
      if (vehicleCategory && veh.vehicleCategory !== vehicleCategory) continue;

      const isPkg = Boolean(g._id.servicePackageID);
      const cfg = isPkg ? packageMap.get(String(g._id.servicePackageID)) : serviceMap.get(String(g._id.serviceID));
      if (!cfg || !cfg.periodicEnabled) continue;

      const totalVisits = typeof cfg.defaultTotalVisits === 'number' ? cfg.defaultTotalVisits : undefined;
      const intervalMonths = typeof cfg.intervalMonths === 'number' ? cfg.intervalMonths : undefined;
      const completedVisits = Number(g.completedVisits || 0);
      const remainingVisits = typeof totalVisits === 'number' ? Math.max(0, totalVisits - completedVisits) : undefined;

      // Skip if fully completed and no nextScheduledDate
      if (typeof remainingVisits === 'number' && remainingVisits <= 0 && !g.nextScheduledDate) continue;

      const nextScheduledDate: Date | null = g.nextScheduledDate ? new Date(g.nextScheduledDate) : null;
      let dueDate: Date | null = nextScheduledDate;
      if (!dueDate && g.lastCompletedDate && intervalMonths) {
        dueDate = computeNextMaintenanceDate(new Date(g.lastCompletedDate), intervalMonths);
      }
      // Fallback: nếu chưa có lần hoàn thành và chưa đặt lịch, dùng vehicle.nextMaintenanceDate nếu có
      if (!dueDate && veh?.nextMaintenanceDate) {
        const vNext = new Date(veh.nextMaintenanceDate);
        if (!isNaN(vNext.getTime())) {
          dueDate = vNext;
        }
      }

      const dueStatus = getDueStatus(dueDate);
      if (!dueDate || !dueStatus) continue; // outside window

      // hasAppointment filter
      const hasNext = Boolean(nextScheduledDate);
      if (hasAppointmentParam === 'true' && !hasNext) continue;
      if (hasAppointmentParam === 'false' && hasNext) continue;

      // Resolve nextAppointment document if exists
      let nextAppointment: any | null = null;
      if (nextScheduledDate) {
        const filter: any = { vehicleID: g._id.vehicleID, status: { $in: ['pending','confirmed'] }, bookingDate: { $gte: nextScheduledDate } };
        if (isPkg) filter.servicePackageID = g._id.servicePackageID; else filter.serviceID = g._id.serviceID;
        nextAppointment = await Appointment.findOne(filter)
          .sort({ bookingDate: 1 })
          .select('_id userID vehicleID serviceID servicePackageID bookingDate status')
          .lean();
      }

      const item: ReminderItem = {
        type: 'periodic',
        dueDate: dueDate!,
        dueStatus,
        nextAppointment: nextAppointment || null,
      };

      if (include.has('vehicle')) {
        item.vehicle = { _id: veh._id, plateNumber: veh.plateNumber, vehicleCategory: veh.vehicleCategory, brand: veh.brand };
      }

      item.periodicSummary = {
        serviceType: isPkg ? 'servicePackage' : 'service',
        serviceId: isPkg ? String(g._id.servicePackageID) : String(g._id.serviceID),
        serviceName: cfg.name,
        totalVisits,
        completedVisits,
        remainingVisits,
        intervalMonths,
        vehicleID: vid,
      };

      periodicItems.push(item);
    }

    // 2) VEHICLE SCHEDULE REMINDERS
    const vehicleQuery: any = {
      $or: [
        { isMaintenanceDue: true },
        { nextMaintenanceDate: { $lte: deadline } }
      ]
    };
    if (vehicleCategory) vehicleQuery.vehicleCategory = vehicleCategory;

    const vehiclesDue = await Vehicle.find(vehicleQuery)
      .select('_id userID plateNumber vehicleCategory brand lastMaintenanceDate nextMaintenanceDate maintenanceCycleMonths')
      .lean();

    const vehicleItems: ReminderItem[] = [];
    for (const veh of vehiclesDue) {
      const dueDate: Date | null = veh.nextMaintenanceDate ? new Date(veh.nextMaintenanceDate) : null;
      const dueStatus = getDueStatus(dueDate);
      if (!dueDate || !dueStatus) continue;

      // Find next appointment for this vehicle (any service)
      const nextAppointment = await Appointment.findOne({
        vehicleID: veh._id,
        status: { $in: ['pending','confirmed'] },
        bookingDate: { $gt: now }
      })
        .sort({ bookingDate: 1 })
        .select('_id userID vehicleID serviceID servicePackageID bookingDate status')
        .lean();

      const hasNext = Boolean(nextAppointment);
      if (hasAppointmentParam === 'true' && !hasNext) continue;
      if (hasAppointmentParam === 'false' && hasNext) continue;

      const item: ReminderItem = {
        type: 'vehicleSchedule',
        dueDate: dueDate,
        dueStatus,
        nextAppointment: nextAppointment || null,
      };

      if (include.has('vehicle')) {
        item.vehicle = { _id: veh._id, plateNumber: veh.plateNumber, vehicleCategory: veh.vehicleCategory, brand: veh.brand };
      }

      item.scheduleSummary = {
        lastMaintenanceDate: veh.lastMaintenanceDate || null,
        nextMaintenanceDate: veh.nextMaintenanceDate || null,
        maintenanceCycleMonths: veh.maintenanceCycleMonths || null,
        vehicleID: String(veh._id)
      };

      vehicleItems.push(item);
    }

    // Merge according to type filter
    let items: ReminderItem[] = [];
    if (typeParam === 'periodic') items = periodicItems;
    else if (typeParam === 'vehicleschedule') items = vehicleItems;
    else items = periodicItems.concat(vehicleItems);

    // Include user if requested: fetch users for all involved vehicles
    if (include.has('user')) {
      const vIds = new Set<string>();
      for (const it of items) {
        const vehId = it.periodicSummary?.vehicleID || it.scheduleSummary?.vehicleID;
        if (vehId) vIds.add(String(vehId));
      }
      const vDocs = await Vehicle.find({ _id: { $in: Array.from(vIds) } }).select('_id userID').lean();
      const userIds = vDocs.map(v => String(v.userID));
      const users = await User.find({ _id: { $in: userIds } }).select('_id userName fullName email phoneNumber').lean();
      const uMap = new Map<string, any>(users.map(u => [String(u._id), u]));
      const vMap = new Map<string, any>(vDocs.map(v => [String(v._id), v]));
      for (const it of items) {
        const vehId = String(it.periodicSummary?.vehicleID || it.scheduleSummary?.vehicleID || '');
        const vdoc = vehId ? vMap.get(vehId) : null;
        const uid = vdoc ? String(vdoc.userID) : null;
        if (uid) it.user = uMap.get(uid) || undefined;
      }
    }

    // Sort
    items.sort((a, b) => {
      const av = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const bv = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return (order === 'desc' ? -1 : 1) * (av - bv);
    });

    // Pagination
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const paged = items.slice(start, start + limit);

    return res.status(200).json({
      success: true,
      data: paged,
      pagination: { page, limit, total, totalPages },
      filters: { windowDays: windowDays, type: typeParam, vehicleCategory, hasAppointment: hasAppointmentParam }
    });
  } catch (error) {
    console.error('listMaintenanceReminders error:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách nhắc hẹn bảo dưỡng' });
  }
}

// Technician dashboard counts - today (assigned to current technician)
async function resolveCurrentTechnicianId(userId: string) {
  const techDoc = (await Technician.findOne({ userID: userId }).select('_id').lean()
    || await Technician.findOne({ userID: new mongoose.Types.ObjectId(userId) }).select('_id').lean()) as any;
  return techDoc ? String(techDoc._id) : null;
}

function todayRange() {
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end = new Date(now); end.setHours(23, 59, 59, 999);
  return { start, end };
}

export async function countMyTodayAppointments(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (req.user.role !== 'technician') return res.status(403).json({ message: 'Chỉ kỹ thuật viên' });
    const technicianId = await resolveCurrentTechnicianId(req.user.id);
    if (!technicianId) return res.status(404).json({ message: 'Không tìm thấy hồ sơ technician' });
    const { start, end } = todayRange();
    const total = await Appointment.countDocuments({
      bookingDate: { $gte: start, $lte: end },
      status: { $nin: ['cancelled', 'no_show'] },
      $or: [
        { technicianLeaderID: technicianId },
        { technicianSupport1ID: technicianId },
        { technicianSupport2ID: technicianId },
      ],
    });
    return res.json({ total });
  } catch (e) {
    return res.status(500).json({ message: 'Lỗi máy chủ khi thống kê' });
  }
}

export async function countMyTodayConfirmed(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (req.user.role !== 'technician') return res.status(403).json({ message: 'Chỉ kỹ thuật viên' });
    const technicianId = await resolveCurrentTechnicianId(req.user.id);
    if (!technicianId) return res.status(404).json({ message: 'Không tìm thấy hồ sơ technician' });
    const { start, end } = todayRange();
    const total = await Appointment.countDocuments({
      bookingDate: { $gte: start, $lte: end },
      status: 'confirmed',
      $or: [
        { technicianLeaderID: technicianId },
        { technicianSupport1ID: technicianId },
        { technicianSupport2ID: technicianId },
      ],
    });
    return res.json({ total });
  } catch {
    return res.status(500).json({ message: 'Lỗi máy chủ khi thống kê' });
  }
}

export async function countMyTodayInProgress(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (req.user.role !== 'technician') return res.status(403).json({ message: 'Chỉ kỹ thuật viên' });
    const technicianId = await resolveCurrentTechnicianId(req.user.id);
    if (!technicianId) return res.status(404).json({ message: 'Không tìm thấy hồ sơ technician' });
    const { start, end } = todayRange();
    const total = await Appointment.countDocuments({
      bookingDate: { $gte: start, $lte: end },
      status: 'in_progress',
      $or: [
        { technicianLeaderID: technicianId },
        { technicianSupport1ID: technicianId },
        { technicianSupport2ID: technicianId },
      ],
    });
    return res.json({ total });
  } catch {
    return res.status(500).json({ message: 'Lỗi máy chủ khi thống kê' });
  }
}

// Send maintenance reminder email (admin/staff)
export async function sendMaintenanceReminderEmail(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const role = req.user.role;
    if (role !== 'admin' && role !== 'staff') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const { toEmail, fullName, dueDate, plateNumber, vehicleBrand, vehicleCategory, serviceName, remainingVisits } = req.body || {};
    if (!toEmail) return res.status(400).json({ message: 'Thiếu toEmail' });

    const { transporter } = await import('../services/emailService.js');

    const prettyDate = (() => {
      try { return new Date(dueDate).toLocaleString('vi-VN'); } catch { return String(dueDate || ''); }
    })();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
        <div style="background:#014091;color:#fff;padding:16px;border-radius:8px 8px 0 0;">
          <h2 style="margin:0;font-size:20px;">EVMS - Nhắc hẹn bảo dưỡng</h2>
        </div>
        <div style="border:1px solid #e5e7eb;border-top:none;padding:16px;border-radius:0 0 8px 8px;background:#fff;">
          <p>Chào ${fullName || 'Quý khách'},</p>
          <p>Đây là email nhắc nhở lịch bảo dưỡng định kỳ cho phương tiện của bạn.</p>
          <ul>
            ${plateNumber ? `<li><strong>Biển số:</strong> ${plateNumber}</li>` : ''}
            ${vehicleBrand ? `<li><strong>Hãng xe:</strong> ${vehicleBrand}</li>` : ''}
            ${vehicleCategory ? `<li><strong>Loại xe:</strong> ${vehicleCategory}</li>` : ''}
            ${serviceName ? `<li><strong>Gói/Dịch vụ:</strong> ${serviceName}</li>` : ''}
            ${typeof remainingVisits === 'number' ? `<li><strong>Số lần còn lại:</strong> ${remainingVisits}</li>` : ''}
            ${dueDate ? `<li><strong>Đến hạn:</strong> ${prettyDate}</li>` : ''}
          </ul>
          <p>Vui lòng phản hồi email hoặc đặt lịch sớm để đảm bảo phương tiện luôn trong tình trạng tốt nhất.</p>
          <p>Trân trọng,<br/>EVMS</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: 'EVMS <doantrinh489@gmail.com>',
      to: toEmail,
      subject: `Nhắc hẹn bảo dưỡng - ${plateNumber || ''} ${prettyDate}`.trim(),
      html,
    });

    return res.json({ success: true });
  } catch (e) {
    console.error('sendMaintenanceReminderEmail error:', e);
    return res.status(500).json({ message: 'Lỗi máy chủ khi gửi email nhắc hẹn' });
  }
}
