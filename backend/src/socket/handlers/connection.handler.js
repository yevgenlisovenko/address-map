/**
 * Connection socket handler
 * Handles socket connection and disconnection events
 */

import { pinStorageManager } from '../../pinStorageManager.js';
import { SOCKET_EVENTS } from '../../utils/constants.js';
import { config } from '../../config.js';
import logger from '../../utils/logger.js';

export const setupConnectionHandler = (io, socket) => {
  logger.info('Client connected', {
    socketId: socket.id,
    address: socket.handshake.address
  });

  // Handle pin requests with time window
  socket.on(SOCKET_EVENTS.REQUEST_PINS, (data) => {
    const timeWindowKey = data?.timeWindow || config.pinStorage.defaultTimeWindow;
    const timeWindowMs = config.pinStorage.timeWindowOptions[timeWindowKey];
    const startingTime = data?.startingTime || Date.now() - config.pinStorage.defaultTimeWindow;

    if (!timeWindowMs) {
      logger.warn('Invalid time window requested', {
        socketId: socket.id,
        timeWindow: timeWindowKey
      });
      socket.emit(SOCKET_EVENTS.INITIAL_PINS, {
        pins: [],
        error: 'Invalid time window'
      });
      return;
    }

    const pins = pinStorageManager.getPinsStartingFrom(startingTime); 

    socket.emit(SOCKET_EVENTS.INITIAL_PINS, {
      pins: pins,
      timeWindow: timeWindowKey,
      timeWindowMs: timeWindowMs,
      startingTime: startingTime,
      count: pins.length
    });

    logger.info('Sent pins to client', {
      socketId: socket.id,
      timeWindow: timeWindowKey,
      startingTime: startingTime,
      pinCount: pins.length,
      oldestPin: pins[pins.length - 1]?.timestamp,
      newestPin: pins[0]?.timestamp
    });
  });

  // Send default time window on connection
  const defaultTimeWindow = config.pinStorage.defaultTimeWindow;
  const defaultTimeWindowMs = config.pinStorage.timeWindowOptions[defaultTimeWindow];
  const initialStartingTime = Date.now() - config.pinStorage.defaultTimeWindow;
  const initialPins = pinStorageManager.getPinsStartingFrom(initialStartingTime);

  socket.emit(SOCKET_EVENTS.INITIAL_PINS, {
    pins: initialPins,
    timeWindow: defaultTimeWindow,
    timeWindowMs: defaultTimeWindowMs,
    startingTime: initialStartingTime,
    count: initialPins.length
  });

  logger.info('Sent initial pins to client', {
    socketId: socket.id,
    timeWindow: defaultTimeWindow,
    pinCount: initialPins.length
  });

  // Handle disconnect
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });
};
