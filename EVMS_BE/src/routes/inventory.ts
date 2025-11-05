import { Router } from 'express';
import {
  getInventories,
  getInventoriesWithFullPart,
  getAllInventoriesWithFullPart,
  getInventoryById,
  getInventoryByPartId,
  createOrUpdateInventory,
  updateInventoryQuantity,
  deleteInventory,
} from '../controllers/inventoryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

export const inventoryRouter = Router();

// Public - xem danh sách tồn kho
inventoryRouter.get('/', getInventories);
// Trả về đầy đủ thông tin Part kèm theo mỗi inventory
inventoryRouter.get('/with-parts', getInventoriesWithFullPart);
// Trả về toàn bộ (không phân trang)
inventoryRouter.get('/with-parts/all', getAllInventoriesWithFullPart);
inventoryRouter.get('/part/:partID', getInventoryByPartId); // Phải đặt trước /:id để tránh conflict
inventoryRouter.get('/:id', getInventoryById);

// Admin/staff manage - quản lý tồn kho
inventoryRouter.post('/', authMiddleware, roleMiddleware(['admin', 'staff']), createOrUpdateInventory);
inventoryRouter.put('/:id', authMiddleware, roleMiddleware(['admin', 'staff']), updateInventoryQuantity);
inventoryRouter.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteInventory);

