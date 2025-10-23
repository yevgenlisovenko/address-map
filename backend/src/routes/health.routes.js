/**
 * Health check routes
 */

import express from 'express';

const router = express.Router();

/**
 * Health check endpoint
 * GET /health
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

export default router;
