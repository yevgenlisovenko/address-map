/**
 * Address controller
 * Handles address geocoding requests
 */

import { asyncHandler } from '../middleware/asyncHandler.js';
import { geocodeAddress } from '../geocode.js';
import { ERROR_MESSAGES, PIN_TYPES, SOCKET_EVENTS } from '../utils/constants.js';
import { pinStorageManager } from '../pinStorageManager.js';
import { validatePinId } from '../validation.js';

/**
 * Submit a new address for geocoding
 * POST /api/address
 */
export const submitAddress = asyncHandler(async (req, res) => {
  const { id, address, properties } = req.body;

  // Validate id (required)
  const idValidation = validatePinId(id);
  if (!idValidation.valid) {
    return res.status(400).json({ error: idValidation.error });
  }

  if (!address) {
    return res.status(400).json({ error: ERROR_MESSAGES.ADDRESS_REQUIRED });
  }

  // Validate properties if provided
  if (properties !== undefined && (typeof properties !== 'object' || Array.isArray(properties))) {
    return res.status(400).json({ error: ERROR_MESSAGES.PROPERTIES_INVALID });
  }

  const coordinates = await geocodeAddress(address);

  // Create pin object
  const pin = {
    id: idValidation.id,
    type: PIN_TYPES.ADDRESS,
    address,
    ...coordinates,
    properties: properties || {},
    timestamp: new Date().toISOString()
  };

  // Get io instance from app and broadcast to all connected clients
  const io = req.app.get('io');
  io.emit(SOCKET_EVENTS.ADD_PIN, pin);

  // Store pin for historical data
  pinStorageManager.addPin(pin);

  res.json({
    success: true,
    data: coordinates
  });
});
