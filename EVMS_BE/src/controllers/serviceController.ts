import { Request, Response } from 'express';
import { Service } from '../models/Service.js';

export async function createService(req: Request, res: Response) {
  try {
    const { name, price, duration, description, image, status, vehicleType } = req.body;
    if (!name || price === undefined || duration === undefined || !vehicleType) {
      return res.status(400).json({ message: 'Thiếu name, price, duration hoặc vehicleType' });
    }

    const created = await Service.create({ name, price, duration, description, image, status, vehicleType });
    return res.status(201).json({ message: 'Tạo dịch vụ thành công', service: created });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Tên dịch vụ đã tồn tại' });
    }
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function getServices(req: Request, res: Response) {
  try {
    const page = Math.max(parseInt(String(req.query.page || '1'), 10), 1);
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || '10'), 10), 1), 100);
    const q = (req.query.q as string) || '';
    const status = (req.query.status as string) || undefined;
    const vehicleType = (req.query.vehicleType as string) || undefined;

    const filter: any = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (status) filter.status = status;
    if (vehicleType) filter.vehicleType = vehicleType;

    const [items, total] = await Promise.all([
      Service.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Service.countDocuments(filter),
    ]);
    return res.json({ items, page, limit, total });
  } catch {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function getServiceById(req: Request, res: Response) {
  try {
    const service = await Service.findById(req.params.id).lean();
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    return res.json({ service });
  } catch {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function updateService(req: Request, res: Response) {
  try {
    const { name, price, duration, description, image, status, vehicleType } = req.body;
    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      { name, price, duration, description, image, status, vehicleType },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    return res.json({ message: 'Cập nhật thành công', service: updated });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Tên dịch vụ đã tồn tại' });
    }
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function deleteService(req: Request, res: Response) {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    return res.json({ message: 'Xóa dịch vụ thành công' });
  } catch {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}


