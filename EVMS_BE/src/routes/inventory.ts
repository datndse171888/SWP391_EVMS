import { Router } from 'express';
import {
  getInventories,
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
inventoryRouter.get('/part/:partID', getInventoryByPartId); // Phải đặt trước /:id để tránh conflict
inventoryRouter.get('/:id', getInventoryById);

// Admin/staff manage - quản lý tồn kho
inventoryRouter.post('/', authMiddleware, roleMiddleware(['admin', 'staff']), createOrUpdateInventory);
inventoryRouter.put('/:id', authMiddleware, roleMiddleware(['admin', 'staff']), updateInventoryQuantity);
inventoryRouter.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteInventory);

