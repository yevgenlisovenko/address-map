/**
 * AI Routes
 * Defines endpoints for AI analysis
 */

import express from 'express';
import { analyzeMarkers, getPrompts } from '../controllers/ai.controller.js';

const router = express.Router();

/**
 * POST /api/ai/analyze
 * Analyze markers using AI
 */
router.post('/analyze', analyzeMarkers);

/**
 * GET /api/ai/prompts
 * Get available AI prompts
 */
router.get('/prompts', getPrompts);

export default router;
