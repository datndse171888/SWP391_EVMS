import { Request, Response } from 'express';
import { Part } from '../models/Part.js';
import { Inventory } from '../models/Inventory.js';
import { InventoryStatus } from '../models/Inventory.js';

// Helper function để tính status từ quantity
function calculateInventoryStatus(quantity: number): InventoryStatus {
  const LOW_STOCK_THRESHOLD = 10;
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'in_stock';
}

export async function getParts(req: Request, res: Response) {
  try {
    const page = Math.max(parseInt(String(req.query.page || '1'), 10), 1);
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || '10'), 10), 1), 100);
    const q = (req.query.q as string) || '';
    const status = (req.query.status as string) || undefined;

    const filter: any = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { partNumber: { $regex: q, $options: 'i' } }
      ];
    }
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

    if (price < 1000) {
      return res.status(400).json({ message: 'Giá phải từ 1.000 VNĐ trở lên' });
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

export async function getPartById(req: Request, res: Response) {
  try {
    const part = await Part.findById(req.params.id).lean();
    if (!part) {
      return res.status(404).json({ message: 'Không tìm thấy linh kiện' });
    }
    return res.json({ part });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

export async function createPartWithInventory(req: Request, res: Response) {
  try {
    const { 
      name, description, manufacturer, partNumber, price, status, 
      warrantyPeriod, warrantyCondition, category,
      quantity, inventoryStatus 
    } = req.body;

    // Validate Part data
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Tên linh kiện là bắt buộc' });
    }

    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 1000) {
      return res.status(400).json({ message: 'Giá phải từ 1.000 VNĐ trở lên' });
    }

    if (!category) {
      return res.status(400).json({ message: 'Danh mục là bắt buộc' });
    }

    const validCategories = ['tires', 'oil', 'filters', 'brakes', 'electrical', 'cooling', 'suspension', 'transmission', 'accessories'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: `Danh mục không hợp lệ. Danh mục hợp lệ: ${validCategories.join(', ')}` });
    }

    // Validate Inventory data nếu có quantity
    if (quantity !== undefined && quantity !== null) {
      const qty = Number(quantity);
      if (isNaN(qty) || qty < 0) {
        return res.status(400).json({ message: 'Số lượng không thể âm' });
      }
    }

    // NGUYÊN LÝ TẠO RECORD TRONG MONGODB VỚI MONGOOSE:
    // 1. Model.create(data) - Tạo trực tiếp (không cần new Model())
    // 2. new Model(data).save() - Tạo instance rồi save
    // 3. Cả 2 cách đều có thể dùng với transaction session
    
    // Kiểm tra duplicate trước khi tạo (để trả về lỗi chi tiết)
    const trimmedName = name.trim();
    const trimmedPartNumber = partNumber?.trim();
    
    // Kiểm tra tên trùng (case-insensitive)
    const existingPartByName = await Part.findOne({ 
      name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
    });
    
    // Kiểm tra mã trùng (chỉ nếu có partNumber và không rỗng)
    let existingPartByNumber = null;
    if (trimmedPartNumber && trimmedPartNumber.length > 0) {
      // Query exact match (case-insensitive) cho partNumber
      // Sử dụng collation để match không phân biệt hoa thường
      existingPartByNumber = await Part.findOne({ 
        partNumber: trimmedPartNumber 
      }).collation({ locale: 'en', strength: 2 });
    }
    
    // Trả về lỗi chi tiết cho từng field
    if (existingPartByName && existingPartByNumber) {
      return res.status(400).json({ 
        message: 'Tên và mã linh kiện đã tồn tại',
        errors: {
          name: 'Tên linh kiện đã tồn tại',
          partNumber: 'Mã linh kiện đã tồn tại'
        }
      });
    }
    
    if (existingPartByName) {
      return res.status(400).json({ 
        message: 'Tên linh kiện đã tồn tại',
        errors: {
          name: 'Tên linh kiện đã tồn tại'
        }
      });
    }
    
    if (existingPartByNumber) {
      return res.status(400).json({ 
        message: 'Mã linh kiện đã tồn tại',
        errors: {
          partNumber: 'Mã linh kiện đã tồn tại'
        }
      });
    }
    
    // Start transaction để đảm bảo cả Part và Inventory đều được tạo hoặc không tạo gì cả
    const session = await Part.db.startSession();
    session.startTransaction();

    try {
      // CÁCH 1: Tạo Part trực tiếp với Model.create()
      // Part.create() trả về array nếu truyền vào array, hoặc single document nếu truyền object
      const partData = {
        name: trimmedName,
        description: description?.trim() || undefined,
        manufacturer: manufacturer?.trim() || undefined,
        partNumber: trimmedPartNumber || undefined,
        price: Number(price),
        status: (status || 'active') as 'active' | 'inactive' | 'hidden',
        warrantyPeriod: warrantyPeriod ? Number(warrantyPeriod) : undefined,
        warrantyCondition: warrantyCondition?.trim() || undefined,
        category: category as any,
      };

      // LƯU PART VÀO DATABASE
      const createdPart = await Part.create([partData], { session });
      const part = createdPart[0];
      console.log('[DB] Part saved:', part._id);

      let inventory = null;
      
      // Tạo Inventory nếu có quantity (>= 0)
      if (quantity !== undefined && quantity !== null && Number(quantity) >= 0) {
        const qty = Number(quantity);
        const calculatedStatus = inventoryStatus || calculateInventoryStatus(qty);
        
        const inventoryData = {
          partID: part._id,
          quantity: qty,
          status: calculatedStatus,
        };

        // LƯU INVENTORY VÀO DATABASE
        const newInventory = new Inventory(inventoryData);
        await newInventory.save({ session });
        inventory = newInventory;
        console.log('[DB] Inventory saved:', inventory._id);
      }

      // COMMIT TRANSACTION - LƯU TẤT CẢ VÀO DATABASE
      await session.commitTransaction();
      console.log('[DB] Transaction committed - All data saved to database');

      return res.status(201).json({ 
        message: 'Tạo linh kiện và tồn kho thành công', 
        part: part,
        inventory: inventory 
      });
    } catch (createError: any) {
      // Rollback transaction - nếu có lỗi, không lưu gì cả
      await session.abortTransaction();
      console.error('[DB] Transaction aborted - No data saved:', createError.message);
      throw createError;
    } finally {
      // Luôn end session dù thành công hay thất bại
      session.endSession();
    }
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Tên phụ tùng hoặc mã phụ tùng đã tồn tại' });
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


// Update Part and its Inventory together (transactional)
export async function updatePartWithInventory(req: Request, res: Response) {
  try {
    const partId = req.params.id;
    const {
      name, description, manufacturer, partNumber, price, status,
      warrantyPeriod, warrantyCondition, category,
      quantity, inventoryStatus
    } = req.body;

    // Find existing part first
    const existingPart = await Part.findById(partId);
    if (!existingPart) {
      return res.status(404).json({ message: 'Không tìm thấy linh kiện' });
    }

    // Duplicate checks only if fields provided and changed
    if (name && name.trim() && name.trim().toLowerCase() !== existingPart.name.toLowerCase()) {
      const dupByName = await Part.findOne({
        name: { $regex: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
      if (dupByName) {
        return res.status(400).json({ message: 'Tên linh kiện đã tồn tại', errors: { name: 'Tên linh kiện đã tồn tại' } });
      }
    }

    if (partNumber && partNumber.trim() && partNumber.trim() !== (existingPart.partNumber || '')) {
      const dupByNumber = await Part.findOne({ partNumber: partNumber.trim() }).collation({ locale: 'en', strength: 2 });
      if (dupByNumber) {
        return res.status(400).json({ message: 'Mã linh kiện đã tồn tại', errors: { partNumber: 'Mã linh kiện đã tồn tại' } });
      }
    }

    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 1000)) {
      return res.status(400).json({ message: 'Giá phải từ 1.000 VNĐ trở lên' });
    }

    if (category !== undefined) {
      const validCategories = ['tires', 'oil', 'filters', 'brakes', 'electrical', 'cooling', 'suspension', 'transmission', 'accessories'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ message: 'Danh mục không hợp lệ' });
      }
    }

    // Begin transaction
    const session = await Part.db.startSession();
    session.startTransaction();
    try {
      // Update part (only provided fields)
      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (description !== undefined) updateData.description = description?.trim() || undefined;
      if (manufacturer !== undefined) updateData.manufacturer = manufacturer?.trim() || undefined;
      if (partNumber !== undefined) updateData.partNumber = partNumber?.trim() || undefined;
      if (price !== undefined) updateData.price = Number(price);
      if (status !== undefined) updateData.status = status as 'active' | 'inactive';
      if (warrantyPeriod !== undefined) updateData.warrantyPeriod = warrantyPeriod ? Number(warrantyPeriod) : undefined;
      if (warrantyCondition !== undefined) updateData.warrantyCondition = warrantyCondition?.trim() || undefined;
      if (category !== undefined) updateData.category = category;

      const updatedPart = await Part.findByIdAndUpdate(partId, updateData, { new: true, session, runValidators: true });
      if (!updatedPart) {
        await session.abortTransaction();
        return res.status(404).json({ message: 'Không tìm thấy linh kiện' });
      }

      // Update or create inventory if quantity provided
      let inventoryDoc = await Inventory.findOne({ partID: partId }).session(session);

      if (quantity !== undefined && quantity !== null) {
        const qty = Number(quantity);
        if (isNaN(qty) || qty < 0) {
          await session.abortTransaction();
          return res.status(400).json({ message: 'Số lượng không thể âm' });
        }
        const calcStatus = (inventoryStatus as any) || calculateInventoryStatus(qty);
        if (inventoryDoc) {
          inventoryDoc.quantity = qty;
          inventoryDoc.status = calcStatus;
          await inventoryDoc.save({ session });
        } else {
          inventoryDoc = await Inventory.create([{ partID: updatedPart._id, quantity: qty, status: calcStatus }], { session }).then(arr => arr[0]);
        }
      }

      await session.commitTransaction();

      // Populate minimal inventory for response consistency
      return res.json({ message: 'Cập nhật linh kiện và tồn kho thành công', part: updatedPart, inventory: inventoryDoc });
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Tên phụ tùng hoặc mã phụ tùng đã tồn tại' });
    }
    return res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}


