import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Vehicle } from '../models/Vehicle.js';
import { User } from '../models/User.js';

export async function createVehicle(req: Request, res: Response) {
  try {
    const { 
      VIN, 
      vehicleType, 
      plateNumber, 
      brand, 
      year, 
      mileage, 
      batteryCapacity, 
      status = 'active' 
    } = req.body;

    // Validation bắt buộc
    if (!VIN || !vehicleType || !plateNumber || !brand || !year || !mileage || !batteryCapacity) {
      return res.status(400).json({ 
        success: false,
        message: 'Thiếu thông tin bắt buộc: VIN, vehicleType, plateNumber, brand, year, mileage, batteryCapacity' 
      });
    }

    // Kiểm tra userID từ token hoặc body
    let userID: mongoose.Types.ObjectId;
    
    if (req.user?.id) {
      // Lấy từ token (user đang đăng nhập)
      userID = new mongoose.Types.ObjectId(req.user.id);
    } else if (req.body.userID) {
      // Lấy từ body (admin tạo cho user khác)
      userID = new mongoose.Types.ObjectId(req.body.userID);
    } else {
      return res.status(400).json({ 
        success: false,
        message: 'Thiếu thông tin userID' 
      });
    }

    // Kiểm tra user tồn tại
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy người dùng' 
      });
    }

    // Kiểm tra VIN đã tồn tại
    const existingVIN = await Vehicle.findOne({ VIN: VIN.toUpperCase() });
    if (existingVIN) {
      return res.status(400).json({ 
        success: false,
        message: 'VIN đã tồn tại trong hệ thống' 
      });
    }

    // Kiểm tra biển số đã tồn tại
    const existingPlate = await Vehicle.findOne({ plateNumber: plateNumber.toUpperCase() });
    if (existingPlate) {
      return res.status(400).json({ 
        success: false,
        message: 'Biển số xe đã tồn tại trong hệ thống' 
      });
    }

    // Validation kiểu dữ liệu
    if (typeof year !== 'number' || year < 1900 || year > new Date().getFullYear() + 1) {
      return res.status(400).json({ 
        success: false,
        message: 'Năm sản xuất không hợp lệ' 
      });
    }

    if (typeof mileage !== 'number' || mileage < 0 || mileage > 9999999) {
      return res.status(400).json({ 
        success: false,
        message: 'Số km không hợp lệ' 
      });
    }

    if (typeof batteryCapacity !== 'number' || batteryCapacity < 0 || batteryCapacity > 1000) {
      return res.status(400).json({ 
        success: false,
        message: 'Dung lượng pin không hợp lệ' 
      });
    }

    // Validation vehicleType
    const validVehicleTypes = ['car', 'motorcycle', 'truck', 'bus', 'other'];
    if (!validVehicleTypes.includes(vehicleType)) {
      return res.status(400).json({ 
        success: false,
        message: 'Loại xe không hợp lệ. Phải là: car, motorcycle, truck, bus, hoặc other' 
      });
    }

    // Validation status
    const validStatuses = ['active', 'inactive', 'maintenance', 'retired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Trạng thái không hợp lệ. Phải là: active, inactive, maintenance, hoặc retired' 
      });
    }

    // Tạo vehicle mới
    const vehicle = await Vehicle.create({
      userID,
      VIN: VIN.toUpperCase(),
      vehicleType,
      plateNumber: plateNumber.toUpperCase(),
      brand: brand.trim(),
      year,
      mileage,
      batteryCapacity,
      status
    });

    // Populate thông tin user
    const populatedVehicle = await Vehicle.findById(vehicle._id)
      .populate('userID', 'userName email fullName phoneNumber')
      .lean();

    return res.status(201).json({
      success: true,
      message: 'Tạo thông tin xe thành công',
      data: {
        vehicle: populatedVehicle
      }
    });

  } catch (error) {
    console.error('Lỗi khi tạo thông tin xe:', error);
    
    // Duplicate key error
    if ((error as any)?.code === 11000) {
      const field = (error as any)?.keyPattern?.VIN ? 'VIN' : 'plateNumber';
      return res.status(400).json({ 
        success: false,
        message: `${field} đã tồn tại trong hệ thống` 
      });
    }
    
    // Validation error
    if ((error as any)?.name === 'ValidationError') {
      const errors = Object.values((error as any).errors).map((err: any) => err.message);
      return res.status(422).json({ 
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi máy chủ khi tạo thông tin xe' 
    });
  }
}

export async function getAllVehicles(req: Request, res: Response) {
  try {
    const {
      page = '1',
      limit = '10',
      search = '',
      status,
      vehicleType,
      userID
    } = req.query as Record<string, string>;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const filter: any = {};

    if (status) {
      filter.status = status;
    }
    if (vehicleType) {
      filter.vehicleType = vehicleType;
    }
    if (userID && mongoose.Types.ObjectId.isValid(userID)) {
      filter.userID = new mongoose.Types.ObjectId(userID);
    }

    if (search) {
      const keyword = search.trim().toUpperCase();
      filter.$or = [
        { VIN: keyword },
        { plateNumber: keyword },
        { brand: new RegExp(search.trim(), 'i') }
      ];
    }

    const [items, total] = await Promise.all([
      Vehicle.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('userID', 'userName email fullName phoneNumber')
        .lean(),
      Vehicle.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: { items, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } }
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách xe:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách xe' });
  }
}

export async function getVehicleByID(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID xe không hợp lệ' });
    }

    const vehicle = await Vehicle.findById(id)
      .populate('userID', 'userName email fullName phoneNumber')
      .lean();

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy xe' });
    }

    return res.status(200).json({ success: true, data: { vehicle } });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin xe:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy thông tin xe' });
  }
}

export async function updateVehicle(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validation vehicleID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: 'ID xe không hợp lệ' 
      });
    }

    // Tìm xe trong database
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy xe' 
      });
    }

    // Kiểm tra quyền sở hữu
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Yêu cầu đăng nhập' 
      });
    }

    const currentUserID = new mongoose.Types.ObjectId(req.user.id);
    const vehicleOwnerID = new mongoose.Types.ObjectId(vehicle.userID);

    // Chỉ owner hoặc admin mới được cập nhật
    if (!currentUserID.equals(vehicleOwnerID) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Bạn không có quyền cập nhật xe này' 
      });
    }

    // Validation dữ liệu đầu vào (chỉ validate các field được gửi)
    const updateFields: any = {};

    if (updateData.VIN !== undefined) {
      if (typeof updateData.VIN !== 'string' || updateData.VIN.trim() === '') {
        return res.status(400).json({ 
          success: false,
          message: 'VIN không hợp lệ' 
        });
      }
      
      // Kiểm tra VIN không trùng với xe khác
      const existingVIN = await Vehicle.findOne({ 
        VIN: updateData.VIN.toUpperCase(), 
        _id: { $ne: id } 
      });
      if (existingVIN) {
        return res.status(400).json({ 
          success: false,
          message: 'VIN đã tồn tại trong hệ thống' 
        });
      }
      
      updateFields.VIN = updateData.VIN.toUpperCase();
    }

    if (updateData.plateNumber !== undefined) {
      if (typeof updateData.plateNumber !== 'string' || updateData.plateNumber.trim() === '') {
        return res.status(400).json({ 
          success: false,
          message: 'Biển số xe không hợp lệ' 
        });
      }
      
      // Kiểm tra biển số không trùng với xe khác
      const existingPlate = await Vehicle.findOne({ 
        plateNumber: updateData.plateNumber.toUpperCase(), 
        _id: { $ne: id } 
      });
      if (existingPlate) {
        return res.status(400).json({ 
          success: false,
          message: 'Biển số xe đã tồn tại trong hệ thống' 
        });
      }
      
      updateFields.plateNumber = updateData.plateNumber.toUpperCase();
    }

    if (updateData.vehicleType !== undefined) {
      const validVehicleTypes = ['car', 'motorcycle', 'truck', 'bus', 'other'];
      if (!validVehicleTypes.includes(updateData.vehicleType)) {
        return res.status(400).json({ 
          success: false,
          message: 'Loại xe không hợp lệ. Phải là: car, motorcycle, truck, bus, hoặc other' 
        });
      }
      updateFields.vehicleType = updateData.vehicleType;
    }

    if (updateData.brand !== undefined) {
      if (typeof updateData.brand !== 'string' || updateData.brand.trim() === '') {
        return res.status(400).json({ 
          success: false,
          message: 'Thương hiệu không hợp lệ' 
        });
      }
      updateFields.brand = updateData.brand.trim();
    }

    if (updateData.year !== undefined) {
      if (typeof updateData.year !== 'number' || updateData.year < 1900 || updateData.year > new Date().getFullYear() + 1) {
        return res.status(400).json({ 
          success: false,
          message: 'Năm sản xuất không hợp lệ' 
        });
      }
      updateFields.year = updateData.year;
    }

    if (updateData.mileage !== undefined) {
      if (typeof updateData.mileage !== 'number' || updateData.mileage < 0 || updateData.mileage > 9999999) {
        return res.status(400).json({ 
          success: false,
          message: 'Số km không hợp lệ' 
        });
      }
      updateFields.mileage = updateData.mileage;
    }

    if (updateData.batteryCapacity !== undefined) {
      if (typeof updateData.batteryCapacity !== 'number' || updateData.batteryCapacity < 0 || updateData.batteryCapacity > 1000) {
        return res.status(400).json({ 
          success: false,
          message: 'Dung lượng pin không hợp lệ' 
        });
      }
      updateFields.batteryCapacity = updateData.batteryCapacity;
    }

    if (updateData.status !== undefined) {
      const validStatuses = ['active', 'inactive', 'maintenance', 'retired'];
      if (!validStatuses.includes(updateData.status)) {
        return res.status(400).json({ 
          success: false,
          message: 'Trạng thái không hợp lệ. Phải là: active, inactive, maintenance, hoặc retired' 
        });
      }
      updateFields.status = updateData.status;
    }

    // Kiểm tra có dữ liệu để cập nhật không
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Không có dữ liệu để cập nhật' 
      });
    }

    // Cập nhật xe
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('userID', 'userName email fullName phoneNumber');

    if (!updatedVehicle) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy xe sau khi cập nhật' 
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin xe thành công',
      data: {
        vehicle: {
          id: updatedVehicle._id,
          userID: updatedVehicle.userID,
          VIN: updatedVehicle.VIN,
          vehicleType: updatedVehicle.vehicleType,
          plateNumber: updatedVehicle.plateNumber,
          brand: updatedVehicle.brand,
          year: updatedVehicle.year,
          mileage: updatedVehicle.mileage,
          batteryCapacity: updatedVehicle.batteryCapacity,
          status: updatedVehicle.status,
          createdAt: updatedVehicle.createdAt,
          updatedAt: updatedVehicle.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin xe:', error);
    
    // Duplicate key error
    if ((error as any)?.code === 11000) {
      const field = (error as any)?.keyPattern?.VIN ? 'VIN' : 'plateNumber';
      return res.status(400).json({ 
        success: false,
        message: `${field} đã tồn tại trong hệ thống` 
      });
    }
    
    // Validation error
    if ((error as any)?.name === 'ValidationError') {
      const errors = Object.values((error as any).errors).map((err: any) => err.message);
      return res.status(422).json({ 
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi máy chủ khi cập nhật thông tin xe' 
    });
  }
}
