import { Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';
import { AuthenticatedRequest } from '../types';

export class ProfileController {
  /**
   * GET /api/profile/me
   * Retrieves the authenticated user's profile and progression stats
   */
  static async getMyProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Auto-ensure profile row exists in case it was created directly through auth
      await ProfileService.ensureProfile(req.userId!, undefined, req.userEmail);
      const profile = await ProfileService.getProfileById(req.userId!);
      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/profile/me
   * Updates profile settings (e.g. username)
   */
  static async updateMyProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const updated = await ProfileService.updateProfile(req.userId!, req.body);
      res.json({
        success: true,
        message: 'Profile updated successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/profile/me/streak
   * Retrieves streak status and recent activity days
   */
  static async getStreak(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await ProfileService.ensureProfile(req.userId!, undefined, req.userEmail);
      const streakInfo = await ProfileService.getStreak(req.userId!);
      res.json({
        success: true,
        data: streakInfo,
      });
    } catch (error) {
      next(error);
    }
  }
}
