/**
 * Highlight controller
 * Handles state highlighting requests
 */

import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateStateAbbr, validateColor } from '../stateValidation.js';
import { processColorConfig, getAllStateData } from '../stateColorManager.js';
import { ERROR_MESSAGES, SOCKET_EVENTS } from '../utils/constants.js';

/**
 * Set state highlights
 * POST /api/highlight
 */
export const setHighlights = asyncHandler(async (req, res) => {
  const { colorConfig } = req.body;

  // Validate request structure
  if (!colorConfig || !Array.isArray(colorConfig)) {
    return res.status(400).json({
      error: ERROR_MESSAGES.INVALID_REQUEST_FORMAT
    });
  }

  const errors = [];
  const validatedConfig = [];

  // Validate each group
  for (let i = 0; i < colorConfig.length; i++) {
    const group = colorConfig[i];

    if (!group.states || !Array.isArray(group.states)) {
      errors.push(`Group ${i}: 'states' must be an array`);
      continue;
    }

    if (group.states.length === 0) {
      errors.push(`Group ${i}: 'states' array is empty`);
      continue;
    }

    // Validate color if provided
    if (group.color !== undefined && !validateColor(group.color)) {
      errors.push(`Group ${i}: Invalid color format '${group.color}'`);
      continue;
    }

    // Validate label if provided
    if (group.label !== undefined && typeof group.label !== 'string') {
      errors.push(`Group ${i}: 'label' must be a string`);
      continue;
    }

    // Validate all state abbreviations
    const validatedStates = [];
    for (const state of group.states) {
      const validState = validateStateAbbr(state);
      if (!validState) {
        errors.push(`Group ${i}: Invalid state abbreviation '${state}'`);
      } else {
        validatedStates.push(validState);
      }
    }

    if (validatedStates.length === 0) {
      errors.push(`Group ${i}: No valid states found`);
      continue;
    }

    validatedConfig.push({
      states: validatedStates,
      color: group.color || undefined, // undefined = use default
      label: group.label || undefined
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  // Process the configuration
  // This handles overlapping states (later groups win)
  processColorConfig(validatedConfig);

  // Get final state data (colors + winning groups)
  const stateData = getAllStateData();

  // Get io instance from app and broadcast to all connected clients
  const io = req.app.get('io');
  io.emit(SOCKET_EVENTS.STATE_HIGHLIGHTS_UPDATE, stateData);

  res.json({
    success: true,
    data: stateData,
    groupCount: validatedConfig.length
  });
});

/**
 * Get current state highlights
 * GET /api/highlight
 */
export const getHighlights = asyncHandler(async (req, res) => {
  const stateData = getAllStateData();
  res.json({
    success: true,
    data: stateData
  });
});
