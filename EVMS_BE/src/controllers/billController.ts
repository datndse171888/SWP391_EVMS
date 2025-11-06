import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Bill, IBill, BillStatus, BillItem } from '../models/Bill.js';
import { Part } from '../models/Part.js';
import { decreaseInventoryByPartId } from './inventoryController.js';

// POST /api/bills
// Tạo bill với status 'pending'
export async function createBill(req: Request, res: Response) {
  try {
    const { appointmentID, items, subtotal, tax, totalAmount, dueDate, description } = req.body as {
      appointmentID?: string;
      items?: BillItem[];
      subtotal?: number;
      tax?: number;
      totalAmount?: number;
      dueDate?: string | Date;
      description?: string;
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

    // Validate và populate thông tin Part từ database
    const billItems: BillItem[] = [];
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        // Chỉ cần partID và quantity từ frontend
        if (!item.partID || !mongoose.Types.ObjectId.isValid(item.partID)) {
          return res.status(400).json({ message: 'items[].partID không hợp lệ' });
        }
        if (isNaN(Number(item.quantity)) || Number(item.quantity) < 1) {
          return res.status(400).json({ message: 'items[].quantity phải >= 1' });
        }

        // Lấy thông tin Part từ database
        const part = await Part.findById(item.partID);
        if (!part) {
          return res.status(404).json({ message: `Không tìm thấy linh kiện với ID: ${item.partID}` });
        }

        // Tính toán lineTotal từ price và quantity
        const unitPrice = part.price;
        const quantity = Number(item.quantity);
        const lineTotal = unitPrice * quantity;

        billItems.push({
          partID: new mongoose.Types.ObjectId(item.partID),
          inventoryID: item.inventoryID ? new mongoose.Types.ObjectId(item.inventoryID) : undefined,
          partName: part.name,
          partNumber: part.partNumber || part._id.toString(), // Dùng partNumber hoặc partID làm fallback
          unitPrice: unitPrice,
          quantity: quantity,
          lineTotal: lineTotal,
        });
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
      items: billItems,
      subtotal: Number(subtotal),
      tax: taxValue,
      totalAmount: computedTotal,
      status: 'pending',
      description: description || undefined, // Ghi chú/mô tả cho bill
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

// GET /api/bills/:id
// Lấy thông tin bill theo ID
export async function getBillById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    const bill = await Bill.findById(id);
    if (!bill) {
      return res.status(404).json({ message: 'Không tìm thấy hoá đơn' });
    }

    return res.json({ data: bill });
  } catch (error: any) {
    console.error('Error getting bill:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}


