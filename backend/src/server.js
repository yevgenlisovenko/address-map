import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config.js';
import { geocodeAddress } from './geocode.js';

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
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  try {
    const coordinates = await geocodeAddress(address);

    // Broadcast to all connected clients
    io.emit('add-pin', {
      address,
      ...coordinates,
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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle new address submissions via WebSocket
  socket.on('new-address', async (data) => {
    const { address } = data;

    if (!address) {
      socket.emit('error', { message: 'Address is required' });
      return;
    }

    try {
      console.log('Geocoding address:', address);
      const coordinates = await geocodeAddress(address);

      // Broadcast to all clients including sender
      io.emit('add-pin', {
        address,
        ...coordinates,
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

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
httpServer.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`WebSocket server ready for connections`);
});
