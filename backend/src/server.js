/**
 * Real-time Map Server
 * Main server file - Express and Socket.IO setup
 */

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { config } from './config.js';
import { initializeSocket } from './socket/index.js';
import { initializeDatabase, closeDatabase } from './database.js';
import { initializePollingService, stopPollingService } from './pollingService.js';
import { setDefaultColor } from './stateColorManager.js';
import routes from './routes/index.js';

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer);

// Store io instance in app for access in routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Mount all routes
app.use('/api', routes);

/**
 * Initialize database and polling services
 */
async function initializeServices() {
  try {
    // Initialize default state highlight color
    if (config.stateHighlight && config.stateHighlight.defaultColor) {
      setDefaultColor(config.stateHighlight.defaultColor);
      console.log(`Default state highlight color: ${config.stateHighlight.defaultColor}`);
    }

    // Initialize database connection if enabled
    if (config.database.enabled) {
      await initializeDatabase();
    }

    // Initialize polling service if enabled
    if (config.polling.enabled) {
      initializePollingService(io);
    }
  } catch (error) {
    console.error('Error initializing services:', error.message);
    console.error('Server will continue without database/polling features');
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown() {
  console.log('\nShutting down gracefully...');
  stopPollingService();
  await closeDatabase();
  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Start server
httpServer.listen(config.port, async () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`WebSocket server ready for connections`);

  // Initialize database and polling after server starts
  await initializeServices();
});
