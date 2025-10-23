/**
 * Centralized Error Handling Middleware
 * Handles all errors in the application and sends appropriate responses
 */

import logger from '../utils/logger.js';
import { AppError } from '../utils/errors.js';

/**
 * Error handler middleware
 * Must be registered AFTER all routes
 *
 * @param {Error} err - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const errorHandler = (err, req, res, next) => {
  // Default error properties
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let isOperational = err.isOperational || false;

  // Log error details
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    statusCode,
    message: err.message,
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
  };

  // Log based on error type
  if (statusCode >= 500) {
    logger.error('Server Error:', errorLog);
  } else if (statusCode >= 400) {
    logger.warn('Client Error:', errorLog);
  }

  // Handle specific error types
  if (err instanceof AppError) {
    // Custom application errors - already formatted
    const response = {
      error: message,
    };

    // Add additional details for validation errors
    if (err.details) {
      response.details = err.details;
    }

    // Add retry-after header for rate limit errors
    if (err.retryAfter) {
      res.setHeader('Retry-After', err.retryAfter);
    }

    return res.status(statusCode).json(response);
  }

  // Handle syntax errors (malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.warn('Invalid JSON in request body:', {
      method: req.method,
      path: req.path,
      error: err.message,
    });

    return res.status(400).json({
      error: 'Invalid JSON in request body',
    });
  }

  // Handle MongoDB/Database errors (if using MongoDB in future)
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    logger.error('Database Error:', {
      name: err.name,
      message: err.message,
      code: err.code,
    });

    return res.status(500).json({
      error: 'Database operation failed',
    });
  }

  // Handle MSSQL errors
  if (err.name === 'RequestError' || err.name === 'ConnectionError') {
    logger.error('MSSQL Error:', {
      name: err.name,
      message: err.message,
      code: err.code,
      number: err.number,
    });

    return res.status(500).json({
      error: 'Database operation failed',
    });
  }

  // Handle validation errors from express-validator (if added in future)
  if (err.array && typeof err.array === 'function') {
    const errors = err.array();
    logger.warn('Validation Error:', { errors });

    return res.status(400).json({
      error: 'Validation failed',
      details: errors,
    });
  }

  // Development vs Production error responses
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    // Detailed error in development
    return res.status(statusCode).json({
      error: message,
      stack: err.stack,
      details: err,
    });
  } else {
    // Generic error in production (don't leak implementation details)
    // Only send detailed errors for operational errors
    if (isOperational) {
      return res.status(statusCode).json({
        error: message,
      });
    } else {
      // Programming or unknown errors - hide details
      logger.error('Non-operational error occurred:', err);
      return res.status(500).json({
        error: 'An unexpected error occurred',
      });
    }
  }
};

/**
 * 404 Not Found Handler
 * Handles requests to non-existent routes
 * Should be registered BEFORE the error handler
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
export const notFoundHandler = (req, res, next) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    query: req.query,
  });

  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
};
