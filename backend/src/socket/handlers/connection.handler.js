/**
 * Connection socket handler
 * Handles socket connection and disconnection events
 */

import { SOCKET_EVENTS } from '../../utils/constants.js';
import logger from '../../utils/logger.js';

export const setupConnectionHandler = (io, socket) => {
  logger.info('Client connected', {
    socketId: socket.id,
    address: socket.handshake.address
  });

  // Handle disconnect
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });
};
