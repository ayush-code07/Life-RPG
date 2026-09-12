import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';

export class ItemController {
  /**
   * GET /api/items
   * Public catalog of all items
   */
  static async getCatalog(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const items = await InventoryService.getCatalog();
      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/items/:itemId
   * Single item definition from catalog
   */
  static async getItemById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const itemId = parseInt(req.params.itemId, 10);
      const item = await InventoryService.getItemById(itemId);
      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }
}
