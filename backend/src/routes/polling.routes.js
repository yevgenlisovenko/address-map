/**
 * Polling service routes
 * TODO: remove later - these are temporary endpoints
 */

import express from 'express';
import * as pollingController from '../controllers/polling.controller.js';

const router = express.Router();

/**
 * Get polling status
 * GET /api/polling/status
 * TODO: remove later
 */
router.get('/polling/status', pollingController.getStatus);

/**
 * Manually trigger a poll
 * POST /api/polling/trigger
 * TODO: remove later
 */
router.post('/polling/trigger', pollingController.trigger);

export default router;
