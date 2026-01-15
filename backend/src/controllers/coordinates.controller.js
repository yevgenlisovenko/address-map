/**
 * Coordinates controller
 * Handles direct coordinate submission requests
 */

import { asyncHandler } from '../middleware/asyncHandler.js';
import { validateCoordinates, validatePinId } from '../validation.js';
import { ERROR_MESSAGES, PIN_TYPES, SOCKET_EVENTS } from '../utils/constants.js';
import { pinStorageManager } from '../pinStorageManager.js';
import logger from '../utils/logger.js';

/**
 * Submit coordinates directly
 * POST /api/coordinates
 */
export const submitCoordinates = asyncHandler(async (req, res) => {
  const { id, lat, lon, label, properties } = req.body;

  // Validate id (required)
  const idValidation = validatePinId(id);
  if (!idValidation.valid) {
    return res.status(400).json({ error: idValidation.error });
  }

  if (lat === undefined || lon === undefined) {
    return res.status(400).json({ error: ERROR_MESSAGES.COORDINATES_REQUIRED });
  }

  // Validate properties if provided
  if (properties !== undefined && (typeof properties !== 'object' || Array.isArray(properties))) {
    return res.status(400).json({ error: ERROR_MESSAGES.PROPERTIES_INVALID });
  }

  // Validate coordinates
  const validation = validateCoordinates(lat, lon);

  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  // Create pin object
  const pin = {
    id: idValidation.id,
    type: PIN_TYPES.COORDINATES,
    lat: validation.lat,
    lon: validation.lon,
    displayName: label || `Coordinates: ${validation.lat}, ${validation.lon}`,
    properties: properties || {},
    timestamp: new Date().toISOString()
  };

  // Store pin and get action (added or replaced)
  const result = pinStorageManager.addOrReplacePin(pin);

  // Get io instance from app and broadcast to all connected clients
  const io = req.app.get('io');

  if (result.action === 'replaced') {
    io.emit(SOCKET_EVENTS.UPDATE_PIN, result.pin);
    logger.info(`Pin ${pin.id} replaced (coordinates)`);
  } else {
    io.emit(SOCKET_EVENTS.ADD_PIN, result.pin);
    logger.info(`Pin ${pin.id} added (coordinates)`);
  }

  res.json({
    success: true,
    data: {
      lat: validation.lat,
      lon: validation.lon
    }
  });
});
