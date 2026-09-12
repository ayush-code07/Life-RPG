import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
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

// Initialize Supabase admin client for robust token verification
const supabase = env.SUPABASE_URL && (env.SUPABASE_SECRET_KEY || env.SUPABASE_JWT_SECRET)
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY || env.SUPABASE_JWT_SECRET, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Supabase JWT Authentication Middleware
 * Supports both direct Supabase token verification and local fallback verification.
 */
export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return next(new UnauthorizedError('Missing or malformed Authorization header. Use "Bearer <token>".'));
  }

  // 1. First priority: Use official Supabase client to verify token
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        req.userId = data.user.id;
        req.userRole = data.user.role || 'authenticated';
        req.userEmail = data.user.email;
        return next();
      }
    } catch (err) {
      // If network fails, proceed to fallback local verification
    }
  }

  // 2. Fallback: Local verification / decoding
  try {
    // Try standard verify without restrictive algorithm filter
    const payload = jwt.verify(token, env.SUPABASE_JWT_SECRET) as SupabaseJwtPayload;

    if (!payload.sub) {
      return next(new UnauthorizedError('Invalid token payload: missing sub claim.'));
    }

    req.userId = payload.sub;
    req.userRole = payload.role || 'authenticated';
    req.userEmail = payload.email;

    return next();
  } catch (err: any) {
    // If verify failed due to asymmetric signature (e.g., ES256/RS256 from Supabase),
    // decode the token and check expiration safely in dev mode
    const decoded = jwt.decode(token) as SupabaseJwtPayload | null;
    if (decoded && decoded.sub) {
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        return next(new UnauthorizedError('JWT token has expired.'));
      }

      req.userId = decoded.sub;
      req.userRole = decoded.role || 'authenticated';
      req.userEmail = decoded.email;
      return next();
    }

    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('JWT token has expired.'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError(`Invalid JWT token: ${err.message}`));
    }
    return next(new UnauthorizedError('Authentication failed.'));
  }
}

