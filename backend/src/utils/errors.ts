export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(message: string, statusCode = 500, details?: any, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details?: any) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access. Valid bearer token required.') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden. You do not have permission to access this resource.') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource', id?: string | number) {
    super(id !== undefined ? `${resource} with identifier '${id}' was not found.` : `${resource} not found.`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict. Resource already exists or condition violated.') {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  constructor(details: any) {
    super('Validation Error', 422, details);
  }
}

export class DatabaseTimeoutError extends AppError {
  constructor(message = 'Database operation timed out. Please try again.') {
    super(message, 503);
  }
}
