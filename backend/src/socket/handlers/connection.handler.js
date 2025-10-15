/**
 * Connection socket handler
 * Handles socket connection and disconnection events
 */

import { getAllStateData } from '../../stateColorManager.js';
import { SOCKET_EVENTS } from '../../utils/constants.js';

export const setupConnectionHandler = (io, socket) => {
  console.log('Client connected:', socket.id);

  // Send current state highlights to new client
  const currentData = getAllStateData();
  if (Object.keys(currentData.colors).length > 0) {
    socket.emit(SOCKET_EVENTS.STATE_HIGHLIGHTS_UPDATE, currentData);
  }

  // Handle disconnect
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    console.log('Client disconnected:', socket.id);
  });
};
