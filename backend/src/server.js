/**
 * Real-time Map Server
 * Main server file - Express and Socket.IO setup
 */

// Load environment variables from .env file
import 'dotenv/config';

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { config } from './config.js';
import { initializeSocket } from './socket/index.js';
import { initializeDatabase, closeDatabase } from './database.js';
import { initializePollingService, stopPollingService } from './pollingService.js';
import { setDefaultColor, loadStateFromFile } from './stateColorManager.js';
import { pinStorageManager } from './pinStorageManager.js';
import routes from './routes/index.js';
import logger from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer);

// Store cleanup interval reference
let pinCleanupInterval = null;

// Store io instance in app for access in routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json({ limit: config.ai.bodyLimit }));

// Mount all routes
app.use('/api', routes);

// 404 handler for undefined routes (must be after all routes)
app.use(notFoundHandler);

// Centralized error handling middleware (must be last)
app.use(errorHandler);

/**
 * Initialize database and polling services
 */
async function initializeServices() {
  try {
    // Initialize default state highlight color
    if (config.stateHighlight && config.stateHighlight.defaultColor) {
      setDefaultColor(config.stateHighlight.defaultColor);
      logger.info(`Default state highlight color: ${config.stateHighlight.defaultColor}`);
    }

    // Load state highlights from file (persisted from previous session)
    loadStateFromFile();

    // Initialize database connection if enabled
    if (config.database.enabled) {
      await initializeDatabase();
    }

    // Initialize polling service if enabled
    if (config.polling.enabled) {
      initializePollingService(io);
    }

    // Initialize pin cleanup interval
    pinCleanupInterval = setInterval(() => {
      const beforeStats = pinStorageManager.getStats();
      const validCount = pinStorageManager.cleanupOldPins();
      const afterStats = pinStorageManager.getStats();

      if (beforeStats.expiredPins > 0) {
        logger.info('Pin cleanup completed', {
          removedExpired: beforeStats.expiredPins - afterStats.expiredPins,
          remainingValid: validCount,
          memoryWaste: afterStats.memoryWaste
        });
      }
    }, config.pinStorage.cleanupInterval);

    logger.info('Pin cleanup interval initialized', {
      intervalMs: config.pinStorage.cleanupInterval,
      intervalMinutes: config.pinStorage.cleanupInterval / 60000
    });
  } catch (error) {
    logger.error('Error initializing services:', { message: error.message, stack: error.stack });
    logger.warn('Server will continue without database/polling features');
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal) {
  logger.info(`${signal} received, starting graceful shutdown`);

  // Stop accepting new pins
  if (pinCleanupInterval) {
    clearInterval(pinCleanupInterval);
    logger.info('Pin cleanup interval stopped');
  }

  stopPollingService();

  // Flush pins to disk
  await pinStorageManager.forceFlush();
  logger.info('Pins flushed to disk');

  await closeDatabase();

  // Close HTTP server
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force exit after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

// Handle graceful shutdown
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start server
httpServer.listen(config.port, async () => {
  logger.info(`Service "${config.service.name}" started`);
  logger.info(`Server running on http://localhost:${config.port}`);
  logger.info('WebSocket server ready for connections');
  logger.info(`Environment: ${config.service.environment}`);

  // Initialize database and polling after server starts
  await initializeServices();
});
