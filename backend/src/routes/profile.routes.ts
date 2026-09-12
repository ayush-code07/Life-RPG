import { Router } from 'express';
import { z } from 'zod';
import { ProfileController } from '../controllers/profile.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

const updateProfileSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username cannot exceed 50 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and dashes')
      .optional(),
    coins: z.number().int().min(0).optional(),
    equipped_gear: z.array(z.any()).optional(),
    active_theme: z.string().optional(),
    active_badge: z.string().optional(),
  }),
});

// All profile routes require Supabase JWT authentication
router.use(authenticateToken);

// GET /api/profile/me
router.get('/me', ProfileController.getMyProfile);

// PATCH /api/profile/me
router.patch('/me', validate(updateProfileSchema), ProfileController.updateMyProfile);

// GET /api/profile/me/streak
router.get('/me/streak', ProfileController.getStreak);

export default router;
