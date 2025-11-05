import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Bill, IBill, BillStatus, BillItem } from '../models/Bill.js';
import { decreaseInventoryByPartId } from './inventoryController.js';

// POST /api/bills
// Tạo bill với status 'pending'
export async function createBill(req: Request, res: Response) {
  try {
    const { appointmentID, items, subtotal, tax, totalAmount, dueDate } = req.body as {
      appointmentID?: string;
      items?: BillItem[];
      subtotal?: number;
      tax?: number;
      totalAmount?: number;
      dueDate?: string | Date;
    };

    if (!appointmentID) {
      return res.status(400).json({ message: 'Thiếu appointmentID' });
    }
    if (!mongoose.Types.ObjectId.isValid(appointmentID)) {
      return res.status(400).json({ message: 'appointmentID không hợp lệ' });
    }
    if (subtotal === undefined || isNaN(Number(subtotal)) || Number(subtotal) < 0) {
      return res.status(400).json({ message: 'subtotal không hợp lệ' });
    }
    const taxValue = tax !== undefined ? Number(tax) : 0;
    if (isNaN(taxValue) || taxValue < 0) {
      return res.status(400).json({ message: 'tax không hợp lệ' });
    }
    const computedTotal = totalAmount !== undefined ? Number(totalAmount) : Number(subtotal) + taxValue;
    if (isNaN(computedTotal) || computedTotal < 0) {
      return res.status(400).json({ message: 'totalAmount không hợp lệ' });
    }

    // Validate items nếu có
    const billItems: BillItem[] = items || [];
    if (Array.isArray(items)) {
      for (const item of items) {
        if (!item.partID || !mongoose.Types.ObjectId.isValid(item.partID)) {
          return res.status(400).json({ message: 'items[].partID không hợp lệ' });
        }
        if (!item.partName || !item.partNumber) {
          return res.status(400).json({ message: 'items[].partName và partNumber là bắt buộc' });
        }
        if (isNaN(Number(item.unitPrice)) || Number(item.unitPrice) < 0) {
          return res.status(400).json({ message: 'items[].unitPrice không hợp lệ' });
        }
        if (isNaN(Number(item.quantity)) || Number(item.quantity) < 1) {
          return res.status(400).json({ message: 'items[].quantity phải >= 1' });
        }
        if (isNaN(Number(item.lineTotal)) || Number(item.lineTotal) < 0) {
          return res.status(400).json({ message: 'items[].lineTotal không hợp lệ' });
        }
      }
    }

    const generatedNumber = `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const issue = new Date();
    const due = dueDate ? new Date(dueDate) : new Date(issue.getTime() + 7 * 24 * 60 * 60 * 1000);

    const bill = await Bill.create({
      appointmentID: new mongoose.Types.ObjectId(appointmentID),
      billNumber: generatedNumber,
      issueDate: issue,
      dueDate: due,
      items: billItems.map(item => ({
        partID: new mongoose.Types.ObjectId(item.partID),
        inventoryID: item.inventoryID ? new mongoose.Types.ObjectId(item.inventoryID) : undefined,
        partName: item.partName,
        partNumber: item.partNumber,
        unitPrice: Number(item.unitPrice),
        quantity: Number(item.quantity),
        lineTotal: Number(item.lineTotal),
      })),
      subtotal: Number(subtotal),
      tax: taxValue,
      totalAmount: computedTotal,
      status: 'pending',
    } as Partial<IBill>);

    return res.status(201).json({ message: 'Tạo hoá đơn thành công', bill });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'billNumber đã tồn tại, thử lại' });
    }
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

// PATCH /api/bills/:id/status
// Cập nhật trạng thái bill: pending | paid | overdue | cancelled
// Khi chuyển sang 'paid' thì trừ kho từ bill.items
export async function updateBillStatus(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const id = req.params.id;
    const { status } = req.body as { status?: BillStatus };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }
    const allowed: BillStatus[] = ['pending', 'paid', 'overdue', 'cancelled'];
    if (!status || !allowed.includes(status)) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }

    const bill = await Bill.findById(id).session(session);
    if (!bill) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Không tìm thấy hoá đơn' });
    }

    // Nếu chuyển sang 'paid' thì trừ kho từ bill.items
    if (status === 'paid' && bill.items && bill.items.length > 0) {
      for (const item of bill.items) {
        const result = await decreaseInventoryByPartId(item.partID, item.quantity, session);
        if (!result.success) {
          await session.abortTransaction();
          return res.status(result.message?.includes('Không tìm thấy') ? 404 : 400).json({
            message: result.message?.replace('partID này', `linh kiện: ${item.partName}`) || 'Lỗi giảm tồn kho',
          });
        }
      }
    }

    bill.status = status;
    const updated = await bill.save({ session });

    await session.commitTransaction();
    return res.json({ message: 'Cập nhật trạng thái thành công', bill: updated });
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Error updating bill status:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  } finally {
    session.endSession();
  }
}


