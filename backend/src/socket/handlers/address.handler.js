/**
 * Address socket handler
 * Handles new address submissions via WebSocket
 */

import { geocodeAddress } from '../../geocode.js';
import { SOCKET_EVENTS, PIN_TYPES, ERROR_MESSAGES } from '../../utils/constants.js';

export const setupAddressHandler = (io, socket) => {
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
      console.log('Geocoding address:', address);
      const coordinates = await geocodeAddress(address);

      // Broadcast to all clients including sender
      io.emit(SOCKET_EVENTS.ADD_PIN, {
        type: PIN_TYPES.ADDRESS,
        address,
        ...coordinates,
        properties: properties || {},
        timestamp: new Date().toISOString()
      });

      console.log('Pin added:', coordinates.displayName);
    } catch (error) {
      console.error('Error processing address:', error.message);
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: error.message,
        address
      });
    }
  });
};
