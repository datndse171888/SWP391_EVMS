import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Inventory, InventoryStatus } from '../models/Inventory.js';
import { Part } from '../models/Part.js';

// Helper function để tính status từ quantity
function calculateStatus(quantity: number): InventoryStatus {
  const LOW_STOCK_THRESHOLD = 10;
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'in_stock';
}

export async function getInventories(req: Request, res: Response) {
  try {
    const page = Math.max(parseInt(String(req.query.page || '1'), 10), 1);
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || '8'), 10), 1), 100);
    const partID = req.query.partID as string | undefined;
    const lowStock = req.query.lowStock === 'true';
    const status = req.query.status as InventoryStatus | undefined;

    const filter: any = {};
    if (partID) {
      filter.partID = partID;
    }
    if (status) {
      filter.status = status;
    } else if (lowStock) {
      filter.status = 'low_stock'; // Filter theo status thay vì quantity
    }

    const [items, total] = await Promise.all([
      Inventory.find(filter)
        .populate('partID', 'name partNumber price status category')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Inventory.countDocuments(filter),
    ]);

    return res.json({ items, page, limit, total });
  } catch {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

// Trả về danh sách tồn kho với đầy đủ thông tin Part (populate toàn bộ Part)
export async function getInventoriesWithFullPart(req: Request, res: Response) {
  try {
    const page = Math.max(parseInt(String(req.query.page || '1'), 10), 1);
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || '8'), 10), 1), 100);
    const partID = req.query.partID as string | undefined;
    const lowStock = req.query.lowStock === 'true';
    const status = req.query.status as InventoryStatus | undefined;

    const filter: any = {};
    if (partID) {
      filter.partID = partID;
    }
    if (status) {
      filter.status = status;
    } else if (lowStock) {
      filter.status = 'low_stock';
    }

    const [items, total] = await Promise.all([
      Inventory.find(filter)
        .populate('partID')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Inventory.countDocuments(filter),
    ]);

    return res.json({ items, page, limit, total });
  } catch {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

// Trả về toàn bộ tồn kho với đầy đủ Part, KHÔNG phân trang (dùng cho FE phân trang client-side)
export async function getAllInventoriesWithFullPart(req: Request, res: Response) {
  try {
    const partID = req.query.partID as string | undefined;
    const lowStock = req.query.lowStock === 'true';
    const status = req.query.status as InventoryStatus | undefined;

    const filter: any = {};
    if (partID) filter.partID = partID;
    if (status) filter.status = status; else if (lowStock) filter.status = 'low_stock';

    const items = await Inventory.find(filter)
      .populate('partID')
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({ items, total: items.length });
  } catch {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function getInventoryById(req: Request, res: Response) {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate('partID', 'name partNumber price status category')
      .lean();
    if (!inventory) {
      return res.status(404).json({ message: 'Không tìm thấy tồn kho' });
    }
    return res.json({ inventory });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function getInventoryByPartId(req: Request, res: Response) {
  try {
    const inventory = await Inventory.findOne({ partID: req.params.partID })
      .populate('partID', 'name partNumber price status category')
      .lean();
    if (!inventory) {
      return res.status(404).json({ message: 'Không tìm thấy tồn kho cho phụ tùng này' });
    }
    return res.json({ inventory });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function createOrUpdateInventory(req: Request, res: Response) {
  try {
    const { partID, quantity, status } = req.body;

    // Validate input
    if (!partID || quantity === undefined) {
      return res.status(400).json({ message: 'Thiếu partID hoặc quantity' });
    }

    if (quantity < 0) {
      return res.status(400).json({ message: 'Số lượng không thể âm' });
    }

    if (!mongoose.Types.ObjectId.isValid(partID)) {
      return res.status(400).json({ message: 'partID không hợp lệ' });
    }

    // Kiểm tra partID có tồn tại không
    const part = await Part.findById(partID);
    if (!part) {
      return res.status(404).json({ message: 'Không tìm thấy phụ tùng' });
    }

    // Tính status nếu không được cung cấp
    const calculatedStatus = status || calculateStatus(quantity);

    // Kiểm tra xem đã có inventory chưa
    const existingInventory = await Inventory.findOne({ partID });

    let inventory;
    
    if (existingInventory) {
      // LƯU INVENTORY VÀO DATABASE (UPDATE)
      existingInventory.quantity = quantity;
      existingInventory.status = calculatedStatus;
      await existingInventory.save();
      console.log('[DB] Inventory updated:', existingInventory._id);
      inventory = await Inventory.findById(existingInventory._id).populate('partID', 'name partNumber price status category');
    } else {
      // LƯU INVENTORY VÀO DATABASE (CREATE)
      const inventoryData = {
        partID: part._id,
        quantity: quantity,
        status: calculatedStatus,
      };
      
      const createdInventory = await Inventory.create(inventoryData);
      console.log('[DB] Inventory saved:', createdInventory._id);
      
      inventory = await Inventory.findById(createdInventory._id).populate('partID', 'name partNumber price status category');
    }

    if (!inventory) {
      return res.status(500).json({ message: 'Không thể tạo hoặc cập nhật tồn kho' });
    }

    return res.json({ message: 'Cập nhật tồn kho thành công', inventory });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Phụ tùng này đã có tồn kho' });
    }
    
    if (error?.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((err: any) => err.message);
      return res.status(400).json({ 
        message: 'Dữ liệu không hợp lệ', 
        errors: validationErrors 
      });
    }

    return res.status(500).json({ 
      message: 'Lỗi máy chủ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export async function updateInventoryQuantity(req: Request, res: Response) {
  try {
    const { quantity, status } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ message: 'Thiếu quantity' });
    }

    if (quantity < 0) {
      return res.status(400).json({ message: 'Số lượng không thể âm' });
    }

    // Lấy inventory hiện tại để kiểm tra chỉ được tăng
    const existing = await Inventory.findById(req.params.id).populate('partID', 'name partNumber price status category');
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy tồn kho' });
    }

    if (quantity < existing.quantity) {
      return res.status(400).json({ message: 'Chỉ được tăng số lượng (không được giảm)' });
    }

    // Tính status nếu không được cung cấp
    const calculatedStatus = status || calculateStatus(quantity);

    existing.quantity = quantity;
    existing.status = calculatedStatus;
    const inventory = await existing.save();

    if (!inventory) {
      return res.status(404).json({ message: 'Không tìm thấy tồn kho' });
    }

    return res.json({ message: 'Cập nhật số lượng thành công', inventory });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function deleteInventory(req: Request, res: Response) {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Không tìm thấy tồn kho' });
    }
    return res.json({ message: 'Xóa tồn kho thành công' });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

