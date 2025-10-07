import { Request, Response } from 'express';
import { Part } from '../models/Part.js';

export async function getParts(req: Request, res: Response) {
  try {
    const page = Math.max(parseInt(String(req.query.page || '1'), 10), 1);
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || '10'), 10), 1), 100);
    const q = (req.query.q as string) || '';
    const status = (req.query.status as string) || undefined;

    const filter: any = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      Part.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Part.countDocuments(filter),
    ]);

    return res.json({ items, page, limit, total });
  } catch {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function updatePart(req: Request, res: Response) {
  try {
    const { name, description, manufacturer, partNumber, price, status, warrantyPeriod, warrantyCondition } = req.body;
    const updated = await Part.findByIdAndUpdate(
      req.params.id,
      { name, description, manufacturer, partNumber, price, status, warrantyPeriod, warrantyCondition },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy phụ tùng' });
    return res.json({ message: 'Cập nhật thành công', part: updated });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Tên phụ tùng hoặc mã phụ tùng đã tồn tại' });
    }
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function createPart(req: Request, res: Response) {
  try {
    const { name, description, manufacturer, partNumber, price, status, warrantyPeriod, warrantyCondition } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Thiếu name hoặc price' });
    }

    const created = await Part.create({
      name,
      description,
      manufacturer,
      partNumber,
      price,
      status,
      warrantyPeriod,
      warrantyCondition,
    });
    return res.status(201).json({ message: 'Tạo phụ tùng thành công', part: created });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Tên phụ tùng hoặc mã phụ tùng đã tồn tại' });
    }
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}


