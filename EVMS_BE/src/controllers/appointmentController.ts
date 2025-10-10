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


