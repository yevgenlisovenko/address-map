/**
 * Connection socket handler
 * Handles socket connection and disconnection events
 */

import { getAllStateData } from '../../stateColorManager.js';
import { SOCKET_EVENTS } from '../../utils/constants.js';
import logger from '../../utils/logger.js';

export const setupConnectionHandler = (io, socket) => {
  logger.info('Client connected', {
    socketId: socket.id,
    address: socket.handshake.address
  });

  // Send current state highlights to new client
  const currentData = getAllStateData();
  if (Object.keys(currentData.colors).length > 0) {
    socket.emit(SOCKET_EVENTS.STATE_HIGHLIGHTS_UPDATE, currentData);
    logger.debug('Sent current state highlights to new client', {
      socketId: socket.id,
      stateCount: Object.keys(currentData.colors).length
    });
  }

  // Handle disconnect
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });
};
