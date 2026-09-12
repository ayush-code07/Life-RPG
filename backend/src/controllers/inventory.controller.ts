import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';
import { AuthenticatedRequest } from '../types';

export class InventoryController {
  /**
   * GET /api/profile/me/inventory
   * List owned items + quantities for authenticated user
   */
  static async getMyInventory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const inventory = await InventoryService.getProfileInventory(req.userId!);
      res.json({
        success: true,
        data: inventory,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/profile/me/inventory
   * Add item to inventory (loot drop or quest reward)
   */
  static async addItem(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { item_id, quantity } = req.body;
      const item = await InventoryService.addItemToInventory(
        req.userId!,
        item_id,
        quantity || 1
      );
      res.status(201).json({
        success: true,
        message: 'Item added to inventory.',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/inventory/:inventoryId
   * Update quantity (use or consume item)
   */
  static async updateQuantity(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const inventoryId = parseInt(req.params.inventoryId, 10);
      const { quantity } = req.body;
      const updated = await InventoryService.updateQuantity(inventoryId, quantity);

      res.json({
        success: true,
        message: quantity === 0 ? 'Item consumed and removed.' : 'Inventory quantity updated.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/inventory/:inventoryId
   * Remove item from inventory completely
   */
  static async removeItem(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const inventoryId = parseInt(req.params.inventoryId, 10);
      await InventoryService.removeItem(inventoryId);
      res.json({
        success: true,
        message: 'Item removed from inventory.',
      });
    } catch (error) {
      next(error);
    }
  }
}
