import { Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AuthenticatedRequest } from '../types';
import { ForbiddenError, NotFoundError } from '../utils/errors';

/**
 * Ensures the requesting user owns the specified task
 */
export async function verifyTaskOwnership(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const taskId = parseInt(req.params.taskId, 10);
  if (isNaN(taskId)) {
    return next(new NotFoundError('Task', req.params.taskId));
  }

  try {
    const { rows } = await query(
      'SELECT profile_id FROM public.tasks WHERE task_id = $1',
      [taskId]
    );

    if (!rows.length) {
      return next(new NotFoundError('Task', taskId));
    }

    if (rows[0].profile_id !== req.userId) {
      return next(new ForbiddenError('You do not own this task.'));
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Ensures the requesting user owns the specified inventory item
 */
export async function verifyInventoryOwnership(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const inventoryId = parseInt(req.params.inventoryId, 10);
  if (isNaN(inventoryId)) {
    return next(new NotFoundError('Inventory item', req.params.inventoryId));
  }

  try {
    const { rows } = await query(
      'SELECT profile_id FROM public.inventory WHERE inventory_id = $1',
      [inventoryId]
    );

    if (!rows.length) {
      return next(new NotFoundError('Inventory item', inventoryId));
    }

    if (rows[0].profile_id !== req.userId) {
      return next(new ForbiddenError('You do not own this inventory record.'));
    }

    next();
  } catch (error) {
    next(error);
  }
}
