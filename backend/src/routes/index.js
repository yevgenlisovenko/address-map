/**
 * Route aggregator
 * Combines all route modules
 */

import express from 'express';
import healthRoutes from './health.routes.js';
import addressRoutes from './address.routes.js';
import coordinatesRoutes from './coordinates.routes.js';
import highlightRoutes from './highlight.routes.js';
import pollingRoutes from './polling.routes.js';
import configRoutes from './config.routes.js';

const router = express.Router();

// Mount route modules
// Health check is at root level (/health)
router.use('/', healthRoutes);

// API routes (all prefixed with /api in server.js)
router.use('/', addressRoutes);
router.use('/', coordinatesRoutes);
router.use('/', highlightRoutes);
router.use('/', pollingRoutes);
router.use('/config', configRoutes);

export default router;
