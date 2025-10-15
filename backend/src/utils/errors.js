/**
 * Custom Error Classes
 * Provides specific error types for better error handling
 */

/**
 * Base class for custom application errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error - 400
 * Used for request validation failures
 */
export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, true);
    this.details = details;
  }
}

/**
 * Not Found Error - 404
 * Used when a requested resource is not found
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, true);
  }
}

/**
 * Database Error - 500
 * Used for database-related errors
 */
export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, 500, true);
    this.originalError = originalError;
  }
}

/**
 * Geocoding Error - 500
 * Used for geocoding API failures
 */
export class GeocodingError extends AppError {
  constructor(message = 'Geocoding failed', address = null) {
    super(message, 500, true);
    this.address = address;
  }
}

/**
 * External API Error - 502
 * Used for third-party API failures
 */
export class ExternalAPIError extends AppError {
  constructor(message = 'External API request failed', service = null) {
    super(message, 502, true);
    this.service = service;
  }
}

/**
 * Configuration Error - 500
 * Used for configuration-related errors
 */
export class ConfigurationError extends AppError {
  constructor(message = 'Configuration error') {
    super(message, 500, false);
  }
}

/**
 * Rate Limit Error - 429
 * Used when rate limits are exceeded
 */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', retryAfter = null) {
    super(message, 429, true);
    this.retryAfter = retryAfter;
  }
}
