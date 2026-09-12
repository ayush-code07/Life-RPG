import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { AuthenticatedRequest } from '../types';

export class TaskController {
  /**
   * GET /api/profile/me/tasks
   * Lists tasks for the authenticated user, optionally filtered by ?status=
   */
  static async getMyTasks(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const tasks = await TaskService.getTasks(req.userId!, status);
      res.json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/profile/me/tasks
   * Create a new task/quest for the authenticated user
   */
  static async createTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const task = await TaskService.createTask(req.userId!, req.body);
      res.status(201).json({
        success: true,
        message: 'Task created successfully.',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tasks/:taskId
   * Retrieve single task detail (verified by ownership middleware)
   */
  static async getTaskById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      const task = await TaskService.getTaskById(taskId);
      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/tasks/:taskId
   * Update task definition (verified by ownership middleware)
   */
  static async updateTask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      const updated = await TaskService.updateTask(taskId, req.body);
      res.json({
        success: true,
        message: 'Task updated successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/tasks/:taskId
   * Delete task (verified by ownership middleware)
   */
  static async deleteTask(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      await TaskService.deleteTask(taskId);
      res.json({
        success: true,
        message: 'Task deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/tasks/:taskId/complete
   * ★ Core Action: Complete task atomically, awards XP, cascades levels & triggers streak
   */
  static async completeTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      const result = await TaskService.completeTask(taskId, req.userId!);
      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/profile/me/history
   * Retrieve task completion audit trail / activity feed
   */
  static async getHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const offset = parseInt(req.query.offset as string, 10) || 0;

      const history = await TaskService.getHistory(req.userId!, limit, offset);
      res.json({
        success: true,
        data: history.completions,
        pagination: {
          total: history.total,
          limit,
          offset,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
