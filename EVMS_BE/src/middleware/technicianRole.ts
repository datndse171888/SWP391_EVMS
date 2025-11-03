import { Request, Response, NextFunction } from 'express';
import { Technician } from '../models/Technician.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
  }
}

export async function technicianSubroleMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || req.user.role !== 'technician') return next();
    if (req.user.technicianRole === 'leader' || req.user.technicianRole === 'member') return next();
    const tech = await Technician.findOne({ userID: req.user.id }).lean();
    if (tech && 'role' in tech && (tech.role === 'leader' || tech.role === 'member')) {
      req.user.technicianRole = tech.role as 'leader' | 'member';
    }
    return next();
  } catch {
    return res.status(500).json({ message: 'Lỗi xác định vai trò kỹ thuật viên' });
  }
}

export function technicianLeaderOnly(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'technician') {
    return res.status(403).json({ message: 'Yêu cầu vai trò technician' });
  }
  if (req.user.technicianRole !== 'leader') {
    return res.status(403).json({ message: 'Chỉ leader được phép thực hiện' });
  }
  return next();
}

export function technicianAny(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'technician') {
    return res.status(403).json({ message: 'Yêu cầu vai trò technician' });
  }
  const sub = req.user.technicianRole;
  if (sub !== 'leader' && sub !== 'member') {
    return res.status(403).json({ message: 'Thiếu phân vai trò technician' });
  }
  return next();
}


