/**
 * Coordinates submission routes
 */

import express from 'express';
import * as coordinatesController from '../controllers/coordinates.controller.js';

const router = express.Router();

/**
 * Submit coordinates directly
 * POST /api/coordinates
 */
router.post('/coordinates', coordinatesController.submitCoordinates);

export default router;
