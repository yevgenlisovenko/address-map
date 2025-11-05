/**
 * Socket Error Handler Utility
 * Provides centralized error handling for socket event handlers
 */

import logger from '../../utils/logger.js';
import { SOCKET_EVENTS } from '../../utils/constants.js';

/**
 * Handle socket errors consistently
 * Logs errors and emits standardized error events to clients
 *
 * @param {Object} socket - Socket.IO socket instance
 * @param {Error} error - The error object
 * @param {string} context - Context description (e.g., 'geocoding', 'coordinates')
 * @param {Object} metadata - Additional metadata for logging
 */
export const handleSocketError = (socket, error, context, metadata = {}) => {
  // Determine if this is a production environment
  const isProduction = process.env.NODE_ENV === 'production';

  // Log the error with context
  logger.error(`Socket error in ${context}`, {
    socketId: socket.id,
    message: error.message,
    stack: error.stack,
    ...metadata
  });

  // Prepare error response for client
  const errorResponse = {
    message: isProduction && !error.isOperational
      ? 'An error occurred processing your request'
      : error.message,
    context
  };

  // Add additional metadata if present (only in development)
  if (!isProduction && metadata) {
    errorResponse.metadata = metadata;
  }

  // Emit error to the specific client
  socket.emit(SOCKET_EVENTS.ERROR, errorResponse);
};

/**
 * Wrap a socket event handler with error handling
 * Catches both sync and async errors and handles them consistently
 *
 * @param {Function} handler - The async event handler function
 * @param {string} context - Context description for error logging
 * @returns {Function} Wrapped handler with error handling
 *
 * @example
 * socket.on('new-address', withErrorHandling(async (data) => {
 *   // handler logic
 * }, 'address-geocoding'));
 */
export const withErrorHandling = (handler, context) => {
  return async (data) => {
    try {
      await handler(data);
    } catch (error) {
      handleSocketError(this, error, context, { data });
    }
  };
};

/**
 * Create a socket error handler wrapper for a specific socket instance
 * Returns a bound error handler that can be reused
 *
 * @param {Object} socket - Socket.IO socket instance
 * @returns {Function} Bound error handler
 *
 * @example
 * const handleError = createSocketErrorHandler(socket);
 * handleError(error, 'geocoding', { address });
 */
export const createSocketErrorHandler = (socket) => {
  return (error, context, metadata) => {
    handleSocketError(socket, error, context, metadata);
  };
};
