/**
 * AI Controller
 * Handles AI analysis requests from frontend
 */

import { config } from '../config.js';
import openaiService from '../services/openai.service.js';

/**
 * Analyze markers using AI
 * @route POST /api/ai/analyze
 */
export const analyzeMarkers = async (req, res) => {
  try {
    // Check if AI is enabled
    if (!config.ai.enabled) {
      return res.status(503).json({
        error: 'AI_NOT_ENABLED',
        message: 'AI analysis is not enabled on this server'
      });
    }

    const { promptId, markers } = req.body;

    // Validate request
    if (!promptId || !markers || !Array.isArray(markers)) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'promptId and markers array are required'
      });
    }

    // Find the prompt configuration
    const promptConfig = config.ai.prompts.find(p => p.id === promptId);
    if (!promptConfig) {
      return res.status(400).json({
        error: 'INVALID_PROMPT',
        message: `Prompt ID '${promptId}' not found`
      });
    }

    // Filter markers based on allowedProperties
    const filteredMarkers = openaiService.filterMarkerProperties(markers);

    // Convert markers to JSON string
    const markersData = JSON.stringify(filteredMarkers, null, 2);

    // Call OpenAI service
    const result = await openaiService.analyzeMarkers(
      promptConfig.systemPrompt,
      promptConfig.userPrompt,
      markersData
    );

    // Return result
    if (result.success) {
      res.json({
        success: true,
        response: result.response,
        usage: result.usage,
        markersAnalyzed: filteredMarkers.length
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: result.message
      });
    }
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An error occurred during AI analysis'
    });
  }
};

/**
 * Get available AI prompts
 * @route GET /api/ai/prompts
 */
export const getPrompts = (req, res) => {
  try {
    // Check if AI is enabled
    if (!config.ai.enabled) {
      return res.status(503).json({
        error: 'AI_NOT_ENABLED',
        message: 'AI analysis is not enabled on this server'
      });
    }

    // Return only the prompt metadata (id and label), not the actual prompts
    const prompts = config.ai.prompts.map(p => ({
      id: p.id,
      label: p.label
    }));

    res.json({ prompts });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An error occurred while fetching prompts'
    });
  }
};
