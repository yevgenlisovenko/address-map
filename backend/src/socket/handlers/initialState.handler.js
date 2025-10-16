/**
 * Initial state socket handler
 * Handles client requests for initial state highlights
 */

import { getAllStateData } from '../../stateColorManager.js';
import { SOCKET_EVENTS } from '../../utils/constants.js';
import logger from '../../utils/logger.js';

export const setupInitialStateHandler = (io, socket) => {
  socket.on(SOCKET_EVENTS.REQUEST_INITIAL_STATE, () => {
    logger.debug('Client requested initial state', {
      socketId: socket.id
    });

    const currentData = getAllStateData();
    const stateCount = Object.keys(currentData.colors).length;

    // Send current state highlights to requesting client
    socket.emit(SOCKET_EVENTS.STATE_HIGHLIGHTS_UPDATE, currentData);

    if (stateCount > 0) {
      logger.debug('Sent initial state highlights to client', {
        socketId: socket.id,
        stateCount: stateCount,
        groupCount: currentData.groups.length
      });
    } else {
      logger.debug('No state highlights to send to client', {
        socketId: socket.id
      });
    }
  });
};
