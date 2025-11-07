import { Router } from 'express';
import { createBill, updateBillStatus, getBillById } from '../controllers/billController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

export const billRouter = Router();

// Tạo bill (pending)
billRouter.post('/', authMiddleware, roleMiddleware(['admin', 'staff']), createBill);

// Lấy bill theo ID (cần auth để đảm bảo security)
billRouter.get('/:id', authMiddleware, getBillById);

// Cập nhật trạng thái bill
billRouter.patch('/:id/status', authMiddleware, roleMiddleware(['admin', 'staff']), updateBillStatus);


