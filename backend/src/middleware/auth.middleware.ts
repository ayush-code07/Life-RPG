import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../types';
import { UnauthorizedError } from '../utils/errors';

export interface SupabaseJwtPayload {
  sub: string; // User UUID
  aud?: string;
  role?: string;
  email?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
  exp?: number;
  iat?: number;
}

/**
 * Supabase JWT Authentication Middleware
 * Validates HS256 tokens locally with zero external network overhead.
 */
export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return next(new UnauthorizedError('Missing or malformed Authorization header. Use "Bearer <token>".'));
  }

  try {
    const payload = jwt.verify(token, env.SUPABASE_JWT_SECRET, {
      algorithms: ['HS256'],
    }) as SupabaseJwtPayload;

    if (!payload.sub) {
      return next(new UnauthorizedError('Invalid token payload: missing sub claim.'));
    }

    req.userId = payload.sub;
    req.userRole = payload.role || 'authenticated';
    req.userEmail = payload.email;

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('JWT token has expired.'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError(`Invalid JWT token: ${err.message}`));
    }
    return next(new UnauthorizedError('Authentication failed.'));
  }
}
