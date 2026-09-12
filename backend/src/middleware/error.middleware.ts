import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Global Error Handling Middleware
 * Provides zero-crash tolerance and standardized JSON error responses.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Prevent double sending if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || undefined;

  // 1. Handle Malformed JSON body parser error
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && 'body' in err)) {
    statusCode = 400;
    message = 'Malformed JSON body payload in request.';
  }

  // 2. Handle PostgreSQL specific error codes
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        statusCode = 409;
        message = 'A resource with this unique identifier or key already exists.';
        if (err.detail) details = { detail: err.detail };
        break;

      case '23503': // foreign_key_violation
        statusCode = 400;
        message = 'Foreign key constraint violation: referenced entity does not exist.';
        if (err.detail) details = { detail: err.detail };
        break;

      case '23514': // check_violation
        statusCode = 400;
        message = 'Check constraint violation: input value out of allowed range.';
        if (err.detail) details = { detail: err.detail };
        break;

      case '22P02': // invalid_text_representation (e.g. invalid UUID format)
        statusCode = 400;
        message = 'Invalid input format or data type (e.g. malformed UUID or integer).';
        break;

      case '57014': // query_canceled (statement timeout)
        statusCode = 503;
        message = 'Database operation timed out. Please retry.';
        break;

      case '08006': // connection_failure
      case '08001': // sqlclient_unable_to_establish_sqlconnection
      case 'ECONNREFUSED':
      case 'ETIMEDOUT':
        statusCode = 503;
        message = 'Database connection error. Service temporarily unavailable.';
        break;
    }
  }

  // 3. Log unexpected errors (5xx)
  if (statusCode >= 500) {
    logger.error(`[500 Error] ${req.method} ${req.originalUrl}:`, {
      message: err.message,
      stack: err.stack,
      code: err.code,
    });
  } else {
    logger.debug(`[${statusCode} Client Error] ${req.method} ${req.originalUrl}: ${message}`);
  }

  // 4. Return sanitized JSON response
  res.status(statusCode).json({
    success: false,
    error: {
      statusCode,
      message,
      details,
      ...(env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
    },
  });
}

/**
 * 404 Route Not Found Middleware
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      statusCode: 404,
      message: `Cannot ${req.method} ${req.originalUrl} - Route not found.`,
    },
  });
}
