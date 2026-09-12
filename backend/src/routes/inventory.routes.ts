import { Router } from 'express';
import { z } from 'zod';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { verifyInventoryOwnership } from '../middleware/ownership.middleware';
import { validate } from '../middleware/validation.middleware';

const addInventorySchema = z.object({
  body: z.object({
    item_id: z.number().int().positive('Valid item_id is required'),
    quantity: z.number().int().positive().optional().default(1),
  }),
});

const updateInventorySchema = z.object({
  params: z.object({
    inventoryId: z.string().regex(/^\d+$/, 'inventoryId must be an integer'),
  }),
  body: z.object({
    quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  }),
});

// Router for /api/inventory/:inventoryId
const inventoryRouter = Router();
inventoryRouter.use(authenticateToken);

// PATCH /api/inventory/:inventoryId
inventoryRouter.patch(
  '/:inventoryId',
  validate(updateInventorySchema),
  verifyInventoryOwnership,
  InventoryController.updateQuantity
);

// DELETE /api/inventory/:inventoryId
inventoryRouter.delete(
  '/:inventoryId',
  verifyInventoryOwnership,
  InventoryController.removeItem
);

// Router for /api/profile/me/inventory
export const profileInventoryRouter = Router();
profileInventoryRouter.use(authenticateToken);
profileInventoryRouter.get('/inventory', InventoryController.getMyInventory);
profileInventoryRouter.post(
  '/inventory',
  validate(addInventorySchema),
  InventoryController.addItem
);

export default inventoryRouter;
