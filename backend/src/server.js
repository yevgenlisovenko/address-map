import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config.js';
import { geocodeAddress } from './geocode.js';
import { validateCoordinates } from './validation.js';
import { initializeDatabase, closeDatabase } from './database.js';
import { initializePollingService, stopPollingService, triggerPoll, getPollingStatus } from './pollingService.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// REST API endpoint to submit addresses
app.post('/api/address', async (req, res) => {
  const { address, properties } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  // Validate properties if provided
  if (properties !== undefined && (typeof properties !== 'object' || Array.isArray(properties))) {
    return res.status(400).json({ error: 'Properties must be an object' });
  }

  try {
    const coordinates = await geocodeAddress(address);

    // Broadcast to all connected clients
    io.emit('add-pin', {
      type: 'address',
      address,
      ...coordinates,
      properties: properties || {},
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: coordinates
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// REST API endpoint to submit coordinates
app.post('/api/coordinates', async (req, res) => {
  const { lat, lon, label, properties } = req.body;

  if (lat === undefined || lon === undefined) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  // Validate properties if provided
  if (properties !== undefined && (typeof properties !== 'object' || Array.isArray(properties))) {
    return res.status(400).json({ error: 'Properties must be an object' });
  }

  // Validate coordinates
  const validation = validateCoordinates(lat, lon);

  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    // Broadcast to all connected clients
    io.emit('add-pin', {
      type: 'coordinates',
      lat: validation.lat,
      lon: validation.lon,
      displayName: label || `Coordinates: ${validation.lat}, ${validation.lon}`,
      properties: properties || {},
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        lat: validation.lat,
        lon: validation.lon
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// TODO remove later
// REST API endpoint to get polling status
app.get('/api/polling/status', (req, res) => {
  try {
    const status = getPollingStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TODO remove later
// REST API endpoint to manually trigger a poll
app.post('/api/polling/trigger', async (req, res) => {
  try {
    const result = await triggerPoll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle new address submissions via WebSocket
  socket.on('new-address', async (data) => {
    const { address, properties } = data;

    if (!address) {
      socket.emit('error', { message: 'Address is required' });
      return;
    }

    // Validate properties if provided
    if (properties !== undefined && (typeof properties !== 'object' || Array.isArray(properties))) {
      socket.emit('error', { message: 'Properties must be an object' });
      return;
    }

    try {
      console.log('Geocoding address:', address);
      const coordinates = await geocodeAddress(address);

      // Broadcast to all clients including sender
      io.emit('add-pin', {
        type: 'address',
        address,
        ...coordinates,
        properties: properties || {},
        timestamp: new Date().toISOString()
      });

      console.log('Pin added:', coordinates.displayName);
    } catch (error) {
      console.error('Error processing address:', error.message);
      socket.emit('error', {
        message: error.message,
        address
      });
    }
  });

  // Handle new coordinate submissions via WebSocket
  socket.on('new-coordinates', (data) => {
    const { lat, lon, label, properties } = data;

    if (lat === undefined || lon === undefined) {
      socket.emit('error', { message: 'Latitude and longitude are required' });
      return;
    }

    // Validate properties if provided
    if (properties !== undefined && (typeof properties !== 'object' || Array.isArray(properties))) {
      socket.emit('error', { message: 'Properties must be an object' });
      return;
    }

    // Validate coordinates
    const validation = validateCoordinates(lat, lon);

    if (!validation.valid) {
      socket.emit('error', { message: validation.error });
      return;
    }

    try {
      console.log('Adding coordinate pin:', validation.lat, validation.lon);

      // Broadcast to all clients including sender
      io.emit('add-pin', {
        type: 'coordinates',
        lat: validation.lat,
        lon: validation.lon,
        displayName: label || `Coordinates: ${validation.lat}, ${validation.lon}`,
        properties: properties || {},
        timestamp: new Date().toISOString()
      });

      console.log('Coordinate pin added');
    } catch (error) {
      console.error('Error processing coordinates:', error.message);
      socket.emit('error', {
        message: error.message
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Initialize database and polling service
async function initializeServices() {
  try {
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

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  stopPollingService();
  await closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  stopPollingService();
  await closeDatabase();
  process.exit(0);
});

// Start server
httpServer.listen(config.port, async () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`WebSocket server ready for connections`);

  // Initialize database and polling after server starts
  await initializeServices();
});
