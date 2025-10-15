/**
 * Coordinates socket handler
 * Handles new coordinate submissions via WebSocket
 */

import { validateCoordinates } from '../../validation.js';
import { SOCKET_EVENTS, PIN_TYPES, ERROR_MESSAGES } from '../../utils/constants.js';

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
      console.log('Adding coordinate pin:', validation.lat, validation.lon);

      // Broadcast to all clients including sender
      io.emit(SOCKET_EVENTS.ADD_PIN, {
        type: PIN_TYPES.COORDINATES,
        lat: validation.lat,
        lon: validation.lon,
        displayName: label || `Coordinates: ${validation.lat}, ${validation.lon}`,
        properties: properties || {},
        timestamp: new Date().toISOString()
      });

      console.log('Coordinate pin added');
    } catch (error) {
      console.error('Error processing coordinates:', error.message);
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: error.message
      });
    }
  });
};
