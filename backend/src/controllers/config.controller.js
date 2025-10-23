/**
 * Configuration controller
 * Provides configuration data to frontend clients
 */

import { config } from '../config.js';

/**
 * Get client configuration
 * @route GET /api/config
 */
export const getConfig = (req, res) => {
  try {
    // Send pin-related config to frontend
    const clientConfig = {
      pinStorage: {
        timeWindowOptions: config.pinStorage.timeWindowOptions,
        defaultTimeWindow: config.pinStorage.defaultTimeWindow,
        maxAge: config.pinStorage.maxAge
      }
    };

    res.json(clientConfig);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
