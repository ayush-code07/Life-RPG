import { Request, Response, NextFunction } from 'express';
import { AttributeService } from '../services/attribute.service';
import { AuthenticatedRequest } from '../types';

export class AttributeController {
  /**
   * GET /api/attributes
   * Public catalog of all attribute definitions
   */
  static async getAllAttributes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const attributes = await AttributeService.getAllAttributes();
      res.json({
        success: true,
        data: attributes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/profile/me/attributes
   * Get the authenticated user's current attribute values and XP
   */
  static async getMyAttributes(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const attributes = await AttributeService.getProfileAttributes(req.userId!);
      res.json({
        success: true,
        data: attributes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/profile/me/attributes
   * Initialize or seed attribute rows for the authenticated profile (e.g. at onboarding)
   */
  static async seedMyAttributes(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const attributes = await AttributeService.seedProfileAttributes(req.userId!);
      res.status(201).json({
        success: true,
        message: 'Profile attributes initialized successfully.',
        data: attributes,
      });
    } catch (error) {
      next(error);
    }
  }
}
