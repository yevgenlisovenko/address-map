/**
 * Coordinates socket handler
 * Handles new coordinate submissions via WebSocket
 */

import { validateCoordinates } from '../../validation.js';
import { SOCKET_EVENTS, PIN_TYPES, ERROR_MESSAGES } from '../../utils/constants.js';
import logger from '../../utils/logger.js';

export const setupCoordinatesHandler = (io, socket) => {
  socket.on(SOCKET_EVENTS.NEW_COORDINATES, (data) => {
    const { lat, lon, label, properties } = data;

    if (lat === undefined || lon === undefined) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: ERROR_MESSAGES.COORDINATES_REQUIRED });
      return;
    }

    // Validate properties if provided
    if (properties !== undefined && (typeof properties !== 'object' || Array.isArray(properties))) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: ERROR_MESSAGES.PROPERTIES_INVALID });
      return;
    }

    // Validate coordinates
    const validation = validateCoordinates(lat, lon);

    if (!validation.valid) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: validation.error });
      return;
    }

    try {
      logger.info('Adding coordinate pin via WebSocket', {
        lat: validation.lat,
        lon: validation.lon,
        label: label || 'none',
        socketId: socket.id
      });

      // Broadcast to all clients including sender
      io.emit(SOCKET_EVENTS.ADD_PIN, {
        type: PIN_TYPES.COORDINATES,
        lat: validation.lat,
        lon: validation.lon,
        displayName: label || `Coordinates: ${validation.lat}, ${validation.lon}`,
        properties: properties || {},
        timestamp: new Date().toISOString()
      });

      logger.info('Coordinate pin added via WebSocket', {
        lat: validation.lat,
        lon: validation.lon,
        socketId: socket.id
      });
    } catch (error) {
      logger.error('Error processing coordinates via WebSocket', {
        message: error.message,
        socketId: socket.id
      });
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: error.message
      });
    }
  });
};
