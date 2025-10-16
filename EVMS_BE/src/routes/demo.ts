import { Router } from 'express';
import { authMiddleware, adminOnly, staffOnly, technicianOnly, customerOnly } from '../middleware/index.js';
import { Part } from '../models/Part.js';

export const demoRouter = Router();

// Demo routes để test middleware
demoRouter.get('/public', (req, res) => {
  res.json({ message: 'Public route - không cần authentication' });
});

demoRouter.get('/protected', authMiddleware, (req, res) => {
  res.json({ 
    message: 'Protected route - cần authentication',
    user: req.user 
  });
});

demoRouter.get('/admin-only', authMiddleware, adminOnly, (req, res) => {
  res.json({ 
    message: 'Admin only route',
    user: req.user 
  });
});

demoRouter.get('/staff-only', authMiddleware, staffOnly, (req, res) => {
  res.json({ 
    message: 'Staff only route (admin cũng được)',
    user: req.user 
  });
});

demoRouter.get('/technician-only', authMiddleware, technicianOnly, (req, res) => {
  res.json({ 
    message: 'Technician only route (admin, staff cũng được)',
    user: req.user 
  });
});

demoRouter.get('/customer-only', authMiddleware, customerOnly, (req, res) => {
  res.json({ 
    message: 'Customer only route',
    user: req.user 
  });
});

// Test permission-based access
demoRouter.get('/users', authMiddleware, adminOnly, (req, res) => {
  res.json({ 
    message: 'User management - chỉ admin',
    users: [
      { id: 1, name: 'Admin User', role: 'admin' },
      { id: 2, name: 'Staff User', role: 'staff' },
      { id: 3, name: 'Technician User', role: 'technician' },
      { id: 4, name: 'Customer User', role: 'customer' }
    ]
  });
});

demoRouter.get('/services', authMiddleware, staffOnly, (req, res) => {
  res.json({ 
    message: 'Service management - admin và staff',
    services: [
      { id: 1, name: 'Bảo dưỡng ô tô điện', price: 500000 },
      { id: 2, name: 'Bảo dưỡng xe máy điện', price: 200000 },
      { id: 3, name: 'Bảo dưỡng xe đạp điện', price: 100000 }
    ]
  });
});

demoRouter.get('/appointments', authMiddleware, technicianOnly, (req, res) => {
  res.json({ 
    message: 'Appointment management - admin, staff, technician',
    appointments: [
      { id: 1, customer: 'Nguyễn Văn A', service: 'Bảo dưỡng ô tô điện', date: '2024-01-15' },
      { id: 2, customer: 'Trần Thị B', service: 'Bảo dưỡng xe máy điện', date: '2024-01-16' }
    ]
  });
});

demoRouter.get('/my-appointments', authMiddleware, customerOnly, (req, res) => {
  res.json({ 
    message: 'My appointments - chỉ customer',
    appointments: [
      { id: 1, service: 'Bảo dưỡng ô tô điện', date: '2024-01-15', status: 'confirmed' },
      { id: 2, service: 'Bảo dưỡng xe máy điện', date: '2024-01-20', status: 'pending' }
    ]
  });
});

// Seed: tạo 1 Part mẫu (admin)
demoRouter.post('/seed-part', authMiddleware, adminOnly, async (_req, res) => {
  try {
    const seed = {
      name: 'Oil Filter Standard',
      description: 'Oil filter tiêu chuẩn cho xe phổ thông',
      manufacturer: 'OEM',
      partNumber: 'OF-STD-001',
      price: 120000,
      status: 'active' as const,
      warrantyPeriod: 12,
      warrantyCondition: 'tháng',
    };

    const existing = await Part.findOne({ name: seed.name, partNumber: seed.partNumber });
    if (existing) {
      return res.json({ message: 'Đã tồn tại part mẫu', partId: existing._id, part: existing });
    }

    const created = await Part.create(seed);
    return res.status(201).json({ message: 'Tạo part mẫu thành công', partId: created._id, part: created });
  } catch (e) {
    return res.status(500).json({ message: 'Lỗi khi seed Part' });
  }
});
