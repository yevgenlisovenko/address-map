/**
 * Address socket handler
 * Handles new address submissions via WebSocket
 */

import { geocodeAddress } from '../../geocode.js';
import { SOCKET_EVENTS, PIN_TYPES, ERROR_MESSAGES } from '../../utils/constants.js';
import logger from '../../utils/logger.js';
import { pinStorageManager } from '../../pinStorageManager.js';
import { createSocketErrorHandler } from '../utils/errorHandler.js';

export const setupAddressHandler = (io, socket) => {
  // Create error handler for this socket
  const handleError = createSocketErrorHandler(socket);
  socket.on(SOCKET_EVENTS.NEW_ADDRESS, async (data) => {
    const { address, properties } = data;

    if (!address) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: ERROR_MESSAGES.ADDRESS_REQUIRED });
      return;
    }

    // Validate properties if provided
    if (properties !== undefined && (typeof properties !== 'object' || Array.isArray(properties))) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: ERROR_MESSAGES.PROPERTIES_INVALID });
      return;
    }

    try {
      logger.info('Geocoding address via WebSocket', { address, socketId: socket.id });
      const coordinates = await geocodeAddress(address);

      // Create pin object
      const pin = {
        type: PIN_TYPES.ADDRESS,
        address,
        ...coordinates,
        properties: properties || {},
        timestamp: new Date().toISOString()
      };

      // Broadcast to all clients including sender
      io.emit(SOCKET_EVENTS.ADD_PIN, pin);

      // Store pin for historical data
      pinStorageManager.addPin(pin);

      logger.info('Pin added via WebSocket', {
        address,
        displayName: coordinates.displayName,
        lat: coordinates.lat,
        lon: coordinates.lon,
        socketId: socket.id
      });
    } catch (error) {
      handleError(error, 'address-geocoding', { address });
    }
  });
};
