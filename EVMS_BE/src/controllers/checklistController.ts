import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Checklist } from '../models/Checklist.js';
import { Technician } from '../models/Technician.js';
import { Appointment } from '../models/Appointment.js';
import { VehicleConditionReport } from '../models/VehicleConditionReport.js';

interface ChecklistTask {
  taskName: string;
  description: string;
  note?: string;
}

export async function createChecklist(req: Request, res: Response) {
  try {
    // Kiểm tra authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Lấy technicianID từ token (user hiện tại phải là leader)
    const technician = await Technician.findOne({ userID: req.user.id });
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy technician record cho user hiện tại'
      });
    }

    if (technician.role !== 'leader') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ technician leader được tạo checklist'
      });
    }

    const technicianID = technician._id;

    // Lấy dữ liệu từ body
    const { appointmentID, tasks } = req.body as {
      appointmentID: string;
      tasks: ChecklistTask[];
    };

    // Validation
    if (!appointmentID) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu appointmentID'
      });
    }

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu tasks hoặc tasks không hợp lệ. Phải là mảng có ít nhất 1 task'
      });
    }

    // Validation ObjectId format
    if (!mongoose.Types.ObjectId.isValid(appointmentID)) {
      return res.status(400).json({
        success: false,
        message: 'appointmentID không hợp lệ'
      });
    }

    // Kiểm tra Appointment tồn tại
    const appointment = await Appointment.findById(appointmentID);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy appointment'
      });
    }

    // Kiểm tra đã có vehicle condition report "before-service" chưa
    // Leader chỉ được tạo checklist sau khi ghi vehicle condition report đầu tiên
    const vehicleConditionReport = await VehicleConditionReport.findOne({
      appointmentID: new mongoose.Types.ObjectId(appointmentID),
      stage: 'before-service'
    });

    if (!vehicleConditionReport) {
      return res.status(400).json({
        success: false,
        message: 'Phải tạo vehicle condition report (before-service) trước khi tạo checklist'
      });
    }

    // Validation từng task
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      if (!task.taskName || !task.description) {
        return res.status(400).json({
          success: false,
          message: `Task ${i + 1}: Thiếu taskName hoặc description`
        });
      }
    }

    // Tạo nhiều tasks cùng lúc
    const tasksToCreate = tasks.map((task) => ({
      appointmentID: new mongoose.Types.ObjectId(appointmentID),
      technicianID: technicianID,
      taskName: task.taskName.trim(),
      description: task.description.trim(),
      note: task.note ? task.note.trim() : undefined,
      status: 'pending' as const,
    }));

    const createdTasks = await Checklist.insertMany(tasksToCreate);

    // Populate để trả về thông tin đầy đủ
    const populatedTasks = await Checklist.find({
      _id: { $in: createdTasks.map((t) => t._id) }
    })
      .populate({
        path: 'appointmentID',
        select: 'userID vehicleID bookingDate status'
      })
      .populate({
        path: 'technicianID',
        select: 'userID role introduction'
      })
      .sort({ createdAt: 1 }) // Sort theo thứ tự tạo
      .lean();

    return res.status(201).json(populatedTasks);
  } catch (error: any) {
    console.error('Error creating checklist:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi tạo checklist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ. Phải là: pending, in_progress, completed, hoặc skipped'
      });
    }

    const taskId = req.params.id;
    const existing: any = await Checklist.findById(taskId);
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy checklist task'
      });
    }

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
      return res.status(200).json({
        success: true,
        message: 'Trạng thái không thay đổi',
        data: { checklist: existing }
      });
    }

    if (!allowed[current]?.has(status)) {
      return res.status(409).json({
        success: false,
        message: 'Chuyển trạng thái không hợp lệ',
        currentStatus: current,
        targetStatus: status,
        allowedNext: Array.from(allowed[current] || []),
      });
    }

    const now = new Date();
    
    // Cập nhật timestamps
    if (status === 'in_progress' && !existing.startedAt) {
      existing.startedAt = now;
    }
    if (status === 'completed') {
      if (!existing.startedAt) existing.startedAt = now;
      existing.completedAt = now;
    }

    existing.status = status;
    const updated = await existing.save();

    // Nếu task được đánh completed, tự động chuyển task tiếp theo sang in_progress
    let nextTask = null;
    if (status === 'completed') {
      // Tìm task tiếp theo trong cùng appointment
      // Lấy task pending đầu tiên sau task hiện tại (theo thứ tự createdAt)
      const allTasks = await Checklist.find({
        appointmentID: existing.appointmentID
      })
        .sort({ createdAt: 1 })
        .select('_id status createdAt')
        .lean();

      // Tìm index của task hiện tại
      const currentTaskIndex = allTasks.findIndex(
        (task: any) => task._id.toString() === existing._id.toString()
      );

      // Tìm task pending đầu tiên sau task hiện tại
      if (currentTaskIndex !== -1 && currentTaskIndex < allTasks.length - 1) {
        const nextPendingTask = allTasks
          .slice(currentTaskIndex + 1)
          .find((task: any) => task.status === 'pending');

        if (nextPendingTask) {
          nextTask = await Checklist.findById(nextPendingTask._id);
          if (nextTask) {
            nextTask.status = 'in_progress';
            nextTask.startedAt = new Date();
            await nextTask.save();
          }
        }
      }
    }

    // Populate để trả về thông tin đầy đủ
    const populatedTask = await Checklist.findById(updated._id)
      .populate({
        path: 'appointmentID',
        select: 'userID vehicleID bookingDate status'
      })
      .populate({
        path: 'technicianID',
        select: 'userID role introduction'
      })
      .lean();

    let nextTaskPopulated = null;
    if (nextTask) {
      nextTaskPopulated = await Checklist.findById(nextTask._id)
        .populate({
          path: 'appointmentID',
          select: 'userID vehicleID bookingDate status'
        })
        .populate({
          path: 'technicianID',
          select: 'userID role introduction'
        })
        .lean();
    }

    return res.json({
      success: true,
      message: 'Cập nhật trạng thái checklist thành công',
      data: {
        checklist: populatedTask,
        nextTask: nextTaskPopulated,
        message: nextTaskPopulated
          ? 'Task tiếp theo đã được chuyển sang in_progress'
          : 'Không còn task nào để chuyển tiếp'
      }
    });
  } catch (error: any) {
    console.error('Error updating checklist status:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    const taskId = req.params.id;

    // Validation ObjectId format
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: 'Task ID không hợp lệ'
      });
    }

    const item = await Checklist.findById(taskId)
      .populate({
        path: 'appointmentID',
        select: 'userID vehicleID bookingDate status technicianLeaderID technicianSupport1ID technicianSupport2ID'
      })
      .populate({
        path: 'technicianID',
        select: 'userID role introduction experience'
      })
      .lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy checklist task'
      });
    }

    return res.json({
      success: true,
      data: { checklist: item }
    });
  } catch (error: any) {
    console.error('Error getting checklist by id:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function getAllChecklistByAppointment(req: Request, res: Response) {
  try {
    const { appointmentId } = req.params as any;

    // Validation ObjectId format
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: 'appointmentId không hợp lệ'
      });
    }

    // Kiểm tra Appointment tồn tại
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy appointment'
      });
    }

    // Lấy tất cả tasks của appointment, sort theo thứ tự tạo (task đầu tiên lên trước)
    const items = await Checklist.find({
      appointmentID: new mongoose.Types.ObjectId(appointmentId)
    })
      .populate({
        path: 'appointmentID',
        select: 'userID vehicleID bookingDate status technicianLeaderID technicianSupport1ID technicianSupport2ID'
      })
      .populate({
        path: 'technicianID',
        select: 'userID role introduction experience'
      })
      .sort({ createdAt: 1 }) // Sort theo thứ tự tạo, task đầu tiên lên trước
      .lean();

    // Tính toán thống kê
    const stats = {
      total: items.length,
      pending: items.filter((item: any) => item.status === 'pending').length,
      in_progress: items.filter((item: any) => item.status === 'in_progress').length,
      completed: items.filter((item: any) => item.status === 'completed').length,
      skipped: items.filter((item: any) => item.status === 'skipped').length,
    };

    // Xác định task hiện tại đang làm (in_progress đầu tiên, hoặc pending đầu tiên nếu không có in_progress)
    const currentTask =
      items.find((item: any) => item.status === 'in_progress') ||
      items.find((item: any) => item.status === 'pending');

    return res.json(items);
  } catch (error: any) {
    console.error('Error getting checklist by appointment:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}


