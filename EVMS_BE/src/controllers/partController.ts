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


