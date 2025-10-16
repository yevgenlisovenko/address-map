/**
 * Socket.IO initialization and setup
 * Configures Socket.IO server and registers all event handlers
 */

import { Server } from 'socket.io';
import { config } from '../config.js';
import { SOCKET_EVENTS } from '../utils/constants.js';
import { setupConnectionHandler } from './handlers/connection.handler.js';
import { setupAddressHandler } from './handlers/address.handler.js';
import { setupCoordinatesHandler } from './handlers/coordinates.handler.js';
import { setupInitialStateHandler } from './handlers/initialState.handler.js';
import logger from '../utils/logger.js';

/**
 * Initialize Socket.IO server
 * @param {http.Server} httpServer - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST']
    }
  });

  // Setup connection handlers
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    // Setup all event handlers for this socket
    setupConnectionHandler(io, socket);
    setupAddressHandler(io, socket);
    setupCoordinatesHandler(io, socket);
    setupInitialStateHandler(io, socket);
  });

  logger.info('Socket.IO server initialized', {
    corsOrigin: config.corsOrigin
  });

  return io;
};
