import { query } from '../config/database';
import { InventoryItem, Item } from '../types';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class InventoryService {
  /**
   * Retrieves all items in the public catalog
   */
  static async getCatalog(): Promise<Item[]> {
    const { rows } = await query<Item>(
      'SELECT item_id, item_name, item_type, description, rarity FROM public.items ORDER BY item_id ASC'
    );
    return rows;
  }

  /**
   * Retrieves a single item definition
   */
  static async getItemById(itemId: number): Promise<Item> {
    const { rows } = await query<Item>(
      'SELECT item_id, item_name, item_type, description, rarity FROM public.items WHERE item_id = $1',
      [itemId]
    );

    if (!rows.length) {
      throw new NotFoundError('Catalog item', itemId);
    }

    return rows[0];
  }

  /**
   * Retrieves all inventory items owned by a user
   */
  static async getProfileInventory(userId: string): Promise<InventoryItem[]> {
    const { rows } = await query<InventoryItem>(
      `SELECT inv.inventory_id, inv.profile_id, inv.item_id, inv.quantity, inv.acquired_at,
              i.item_name, i.item_type, i.description, i.rarity
       FROM public.inventory inv
       JOIN public.items i ON inv.item_id = i.item_id
       WHERE inv.profile_id = $1
       ORDER BY inv.acquired_at DESC`,
      [userId]
    );
    return rows;
  }

  /**
   * Adds an item to a user's inventory (loot drop or reward)
   */
  static async addItemToInventory(
    userId: string,
    itemId: number,
    quantity = 1
  ): Promise<InventoryItem> {
    if (quantity <= 0) {
      throw new BadRequestError('Quantity must be greater than 0.');
    }

    // Verify item exists
    await this.getItemById(itemId);

    const { rows } = await query(
      `INSERT INTO public.inventory (profile_id, item_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (profile_id, item_id)
       DO UPDATE SET quantity = inventory.quantity + EXCLUDED.quantity
       RETURNING inventory_id, profile_id, item_id, quantity, acquired_at`,
      [userId, itemId, quantity]
    );

    const created = rows[0];
    const fullItem = await this.getItemById(itemId);

    return {
      ...created,
      item_name: fullItem.item_name,
      item_type: fullItem.item_type,
      description: fullItem.description,
      rarity: fullItem.rarity,
    };
  }

  /**
   * Updates the quantity of an owned item (e.g. use/consume)
   */
  static async updateQuantity(
    inventoryId: number,
    quantity: number
  ): Promise<InventoryItem | null> {
    if (quantity < 0) {
      throw new BadRequestError('Quantity cannot be negative.');
    }

    // If quantity is 0, delete the inventory entry
    if (quantity === 0) {
      await this.removeItem(inventoryId);
      return null;
    }

    const { rows } = await query(
      `UPDATE public.inventory
       SET quantity = $1
       WHERE inventory_id = $2
       RETURNING inventory_id, profile_id, item_id, quantity, acquired_at`,
      [quantity, inventoryId]
    );

    if (!rows.length) {
      throw new NotFoundError('Inventory record', inventoryId);
    }

    const updated = rows[0];
    const fullItem = await this.getItemById(updated.item_id);

    return {
      ...updated,
      item_name: fullItem.item_name,
      item_type: fullItem.item_type,
      description: fullItem.description,
      rarity: fullItem.rarity,
    };
  }

  /**
   * Removes an inventory item entry completely
   */
  static async removeItem(inventoryId: number): Promise<void> {
    const res = await query('DELETE FROM public.inventory WHERE inventory_id = $1', [inventoryId]);
    if (res.rowCount === 0) {
      throw new NotFoundError('Inventory record', inventoryId);
    }
  }
}
