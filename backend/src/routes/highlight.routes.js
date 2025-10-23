/**
 * State highlighting routes
 */

import express from 'express';
import * as highlightController from '../controllers/highlight.controller.js';

const router = express.Router();

/**
 * Set state highlights
 * POST /api/highlight
 */
router.post('/highlight', highlightController.setHighlights);

/**
 * Get current state highlights
 * GET /api/highlight
 */
router.get('/highlight', highlightController.getHighlights);

export default router;
