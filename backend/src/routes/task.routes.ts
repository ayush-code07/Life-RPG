import { Router } from 'express';
import { z } from 'zod';
import { TaskController } from '../controllers/task.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { verifyTaskOwnership } from '../middleware/ownership.middleware';
import { validate } from '../middleware/validation.middleware';

const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Task title is required').max(120, 'Title cannot exceed 120 characters'),
    description: z.string().max(1000).optional(),
    difficulty: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ]).optional().default(1),
    xp_reward: z.number().int().min(0).max(100000).optional(),
    status: z.enum(['pending', 'active', 'completed', 'archived']).optional().default('pending'),
    due_date: z.string().datetime().optional().nullable(),
    attribute_rewards: z.array(
      z.object({
        attribute_id: z.number().int().positive(),
        attribute_xp_value: z.number().int().min(1).max(50000),
      })
    ).optional(),
  }),
});

const updateTaskSchema = z.object({
  params: z.object({
    taskId: z.string().regex(/^\d+$/, 'taskId must be an integer'),
  }),
  body: z.object({
    title: z.string().min(1).max(120).optional(),
    description: z.string().max(1000).optional().nullable(),
    difficulty: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ]).optional(),
    xp_reward: z.number().int().min(0).max(100000).optional(),
    status: z.enum(['pending', 'active', 'completed', 'archived']).optional(),
    due_date: z.string().datetime().optional().nullable(),
    attribute_rewards: z.array(
      z.object({
        attribute_id: z.number().int().positive(),
        attribute_xp_value: z.number().int().min(1).max(50000),
      })
    ).optional(),
  }),
});

// Router for /api/tasks/:taskId
const tasksRouter = Router();
tasksRouter.use(authenticateToken);

// GET /api/tasks/:taskId
tasksRouter.get('/:taskId', verifyTaskOwnership, TaskController.getTaskById);

// PATCH /api/tasks/:taskId
tasksRouter.patch(
  '/:taskId',
  validate(updateTaskSchema),
  verifyTaskOwnership,
  TaskController.updateTask
);

// DELETE /api/tasks/:taskId
tasksRouter.delete('/:taskId', verifyTaskOwnership, TaskController.deleteTask);

// POST /api/tasks/:taskId/complete (Core action)
tasksRouter.post('/:taskId/complete', verifyTaskOwnership, TaskController.completeTask);

// Router for profile tasks (/api/profile/me/tasks & /api/profile/me/history)
export const profileTasksRouter = Router();
profileTasksRouter.use(authenticateToken);
profileTasksRouter.get('/tasks', TaskController.getMyTasks);
profileTasksRouter.post('/tasks', validate(createTaskSchema), TaskController.createTask);
profileTasksRouter.get('/history', TaskController.getHistory);

export default tasksRouter;
