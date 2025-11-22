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
  technicianID?: string; // Optional: cho phép gán technician khi tạo task
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

    // Ràng buộc leader phải là leader được assign của appointment
    if (!appointment.technicianLeaderID || String(appointment.technicianLeaderID) !== String(technicianID)) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ leader được assign của appointment mới được tạo checklist'
      });
    }

    // Chỉ cho phép tạo checklist khi appointment đang in_progress
    if (appointment.status !== 'in_progress') {
      return res.status(409).json({
        success: false,
        message: 'Chỉ appointment đang in_progress mới tạo checklist'
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

    // Lấy danh sách technicians trong appointment (leader + 2 supports)
    const appointmentTechnicians = [
      appointment.technicianLeaderID,
      appointment.technicianSupport1ID,
      appointment.technicianSupport2ID
    ].filter((id): id is mongoose.Types.ObjectId => id != null);

    // Validation từng task
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      if (!task.taskName || !task.description) {
        return res.status(400).json({
          success: false,
          message: `Task ${i + 1}: Thiếu taskName hoặc description`
        });
      }

      // Nếu có technicianID trong task, validate nó thuộc danh sách technicians của appointment
      if (task.technicianID) {
        if (!mongoose.Types.ObjectId.isValid(task.technicianID)) {
          return res.status(400).json({
            success: false,
            message: `Task ${i + 1}: technicianID không hợp lệ`
          });
        }

        const taskTechnicianId = new mongoose.Types.ObjectId(task.technicianID);
        const isValidTechnician = appointmentTechnicians.some(
          (techId) => techId.toString() === taskTechnicianId.toString()
        );

        if (!isValidTechnician) {
          return res.status(400).json({
            success: false,
            message: `Task ${i + 1}: technicianID phải thuộc danh sách technicians của appointment (leader, support1, hoặc support2)`
          });
        }
      }
    }

    // Tạo nhiều tasks cùng lúc
    const tasksToCreate = tasks.map((task) => ({
      appointmentID: new mongoose.Types.ObjectId(appointmentID),
      technicianID: task.technicianID 
        ? new mongoose.Types.ObjectId(task.technicianID) 
        : technicianID, // Nếu không có technicianID, mặc định gán cho leader
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
        message: 'Chỉ technician leader được cập nhật checklist'
      });
    }

    const { appointmentID, technicianID, taskName, description, note } = req.body as any;
    const existing: any = await Checklist.findById(req.params.id);
    
    if (!existing) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy checklist' 
      });
    }

    // Nếu cập nhật technicianID, validate nó thuộc appointment
    if (technicianID) {
      if (!mongoose.Types.ObjectId.isValid(technicianID)) {
        return res.status(400).json({
          success: false,
          message: 'technicianID không hợp lệ'
        });
      }

      const appointment = await Appointment.findById(existing.appointmentID);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy appointment'
        });
      }

      const appointmentTechnicians = [
        appointment.technicianLeaderID,
        appointment.technicianSupport1ID,
        appointment.technicianSupport2ID
      ].filter((id): id is mongoose.Types.ObjectId => id != null);

      const newTechnicianId = new mongoose.Types.ObjectId(technicianID);
      const isValidTechnician = appointmentTechnicians.some(
        (techId) => techId && techId.toString() === newTechnicianId.toString()
      );

      if (!isValidTechnician) {
        return res.status(400).json({
          success: false,
          message: 'technicianID phải thuộc danh sách technicians của appointment (leader, support1, hoặc support2)'
        });
      }

      existing.technicianID = newTechnicianId;
    }

    existing.appointmentID = appointmentID ? new mongoose.Types.ObjectId(appointmentID) : existing.appointmentID;
    existing.taskName = taskName ?? existing.taskName;
    existing.description = description ?? existing.description;
    existing.note = note !== undefined ? note : existing.note;

    const updated = await existing.save();
    
    // Populate để trả về thông tin đầy đủ
    const populatedTask = await Checklist.findById(updated._id)
      .populate({
        path: 'appointmentID',
        select: 'userID vehicleID bookingDate status technicianLeaderID technicianSupport1ID technicianSupport2ID'
      })
      .populate({
        path: 'technicianID',
        select: 'userID role introduction experience'
      })
      .lean();

    return res.json({ 
      success: true,
      message: 'Cập nhật checklist thành công', 
      data: { checklist: populatedTask }
    });
  } catch (error: any) {
    console.error('Error updating checklist:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi máy chủ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function updateStatusChecklist(req: Request, res: Response) {
  try {
    const { status } = req.body as any;
    
    // Chỉ có 3 status: pending (chưa làm), completed (đã làm), skipped (bỏ qua)
    if (!['pending', 'completed', 'skipped'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ. Phải là: pending (chưa làm), completed (đã làm), hoặc skipped (bỏ qua)'
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

    // Enforce transitions:
    // - pending -> completed hoặc skipped
    // - completed -> không thể thay đổi
    // - skipped -> có thể chuyển về pending hoặc completed
    const current = existing.status as string;
    const allowed: Record<string, Set<string>> = {
      pending: new Set(['completed', 'skipped']),
      completed: new Set([]), // Không thể thay đổi sau khi completed
      skipped: new Set(['pending', 'completed']), // Có thể un-skip
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
    if (status === 'completed') {
      if (!existing.startedAt) existing.startedAt = now;
      existing.completedAt = now;
    } else if (status === 'pending' && current === 'skipped') {
      // Khi un-skip, reset timestamps
      existing.startedAt = undefined;
      existing.completedAt = undefined;
    } else if (status === 'pending') {
      // Nếu chuyển về pending, set startedAt khi bắt đầu làm
      if (!existing.startedAt) existing.startedAt = now;
    }

    existing.status = status;
    const updated = await existing.save();

    // Populate để trả về thông tin đầy đủ
    const populatedTask = await Checklist.findById(updated._id)
      .populate({
        path: 'appointmentID',
        select: 'userID vehicleID bookingDate status technicianLeaderID technicianSupport1ID technicianSupport2ID'
      })
      .populate({
        path: 'technicianID',
        select: 'userID role introduction experience'
      })
      .lean();

    return res.json({
      success: true,
      message: 'Cập nhật trạng thái checklist thành công',
      data: {
        checklist: populatedTask
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

export async function assignTechnicianToTask(req: Request, res: Response) {
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
        message: 'Chỉ technician leader được gán task cho technician'
      });
    }

    const taskId = req.params.id;
    const { technicianID } = req.body as { technicianID: string };

    // Validation
    if (!technicianID) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu technicianID'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: 'Task ID không hợp lệ'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(technicianID)) {
      return res.status(400).json({
        success: false,
        message: 'technicianID không hợp lệ'
      });
    }

    // Tìm task
    const task: any = await Checklist.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy task'
      });
    }

    // Lấy appointment để kiểm tra danh sách technicians
    const appointment = await Appointment.findById(task.appointmentID);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy appointment'
      });
    }

    // Validate technicianID phải thuộc danh sách technicians của appointment
    const appointmentTechnicians = [
      appointment.technicianLeaderID,
      appointment.technicianSupport1ID,
      appointment.technicianSupport2ID
    ].filter((id): id is mongoose.Types.ObjectId => id != null);

    const newTechnicianId = new mongoose.Types.ObjectId(technicianID);
    const isValidTechnician = appointmentTechnicians.some(
      (techId) => techId && techId.toString() === newTechnicianId.toString()
    );

    if (!isValidTechnician) {
      return res.status(400).json({
        success: false,
        message: 'technicianID phải thuộc danh sách technicians của appointment (leader, support1, hoặc support2)'
      });
    }

    // Kiểm tra technician có tồn tại không
    const assignedTechnician = await Technician.findById(newTechnicianId);
    if (!assignedTechnician) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy technician'
      });
    }

    // Cập nhật technicianID
    task.technicianID = newTechnicianId;
    const updated = await task.save();

    // Populate để trả về thông tin đầy đủ
    const populatedTask = await Checklist.findById(updated._id)
      .populate({
        path: 'appointmentID',
        select: 'userID vehicleID bookingDate status technicianLeaderID technicianSupport1ID technicianSupport2ID'
      })
      .populate({
        path: 'technicianID',
        select: 'userID role introduction experience'
      })
      .lean();

    return res.json({
      success: true,
      message: 'Gán technician cho task thành công',
      data: { checklist: populatedTask }
    });
  } catch (error: any) {
    console.error('Error assigning technician to task:', error);
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
      completed: items.filter((item: any) => item.status === 'completed').length,
      skipped: items.filter((item: any) => item.status === 'skipped').length,
    };

    // Xác định task hiện tại đang làm (pending đầu tiên)
    const currentTask = items.find((item: any) => item.status === 'pending');

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


