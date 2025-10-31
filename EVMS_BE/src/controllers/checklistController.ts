import { Request, Response } from 'express';
import { Checklist } from '../models/Checklist.js';

export async function createChecklist(req: Request, res: Response) {
  try {
    const { appointmentID, technicianID, taskName, description, note } = req.body as any;
    if (!appointmentID || !technicianID || !taskName) {
      return res.status(400).json({ message: 'Thiếu appointmentID, technicianID hoặc taskName' });
    }
    // Create with default status 'pending'; timestamps are handled by schema
    const created = await Checklist.create({ appointmentID, technicianID, taskName, description, note });
    return res.status(201).json({ message: 'Tạo checklist thành công', checklist: created });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function updateChecklist(req: Request, res: Response) {
  try {
    const { appointmentID, technicianID, taskName, description, note } = req.body as any;
    const existing: any = await Checklist.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Không tìm thấy checklist' });

    existing.appointmentID = appointmentID ?? existing.appointmentID;
    existing.technicianID = technicianID ?? existing.technicianID;
    existing.taskName = taskName ?? existing.taskName;
    existing.description = description ?? existing.description;
    existing.note = note ?? existing.note;

    const updated = await existing.save();
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy checklist' });
    return res.json({ message: 'Cập nhật checklist thành công', checklist: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function updateStatusChecklist(req: Request, res: Response) {
  try {
    const { status } = req.body as any;
    if (!['pending', 'in_progress', 'completed', 'skipped'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }
    const existing: any = await Checklist.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Không tìm thấy checklist' });

    // Enforce forward-only transitions:
    // pending -> in_progress -> completed; allow skipped from pending/in_progress
    // Block any downgrade or completed->* transitions
    const current = existing.status as string;
    const allowed: Record<string, Set<string>> = {
      pending: new Set(['in_progress', 'skipped']),
      in_progress: new Set(['completed', 'skipped']),
      completed: new Set([]),
      skipped: new Set([]),
    };
    if (current === status) {
      return res.status(200).json({ message: 'Trạng thái không thay đổi', checklist: existing });
    }
    if (!allowed[current]?.has(status)) {
      return res.status(409).json({
        message: 'Chuyển trạng thái không hợp lệ',
        currentStatus: current,
        targetStatus: status,
        allowedNext: Array.from(allowed[current] || []),
      });
    }

    const now = new Date();
    if (status === 'in_progress' && !existing.startedAt) {
      existing.startedAt = now;
    }
    if (status === 'completed') {
      if (!existing.startedAt) existing.startedAt = now;
      existing.completedAt = now;
    }
    // For pending/skipped: keep timestamps as-is (no clearing)

    existing.status = status;
    const updated = await existing.save();
    return res.json({ message: 'Cập nhật trạng thái checklist thành công', checklist: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function deleteChecklist(req: Request, res: Response) {
  try {
    const deleted = await Checklist.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy checklist' });
    return res.json({ message: 'Xóa checklist thành công' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function getChecklistById(req: Request, res: Response) {
  try {
    const item = await Checklist.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ message: 'Không tìm thấy checklist' });
    return res.json({ checklist: item });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function getAllChecklistByAppointment(req: Request, res: Response) {
  try {
    const { appointmentId } = req.params as any;
    const items = await Checklist.find({ appointmentID: appointmentId }).sort({ createAt: -1 }).lean();
    return res.json({ items, count: items.length });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}


