/**
 * Configuration routes
 * API endpoints for client configuration
 */

import express from 'express';
import { getConfig } from '../controllers/config.controller.js';

const router = express.Router();

// GET /api/config - Get client configuration
router.get('/', getConfig);

export default router;
