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
      service: {
        name: config.service.name,
        environment: config.service.environment
      },
      pinStorage: {
        timeWindowOptions: config.pinStorage.timeWindowOptions,
        defaultTimeWindow: config.pinStorage.defaultTimeWindow,
        maxAge: config.pinStorage.maxAge
      },
      ai: {
        enabled: config.ai.enabled,
        maxMarkers: config.ai.maxMarkers,
        allowedProperties: config.ai.allowedProperties,
        // Send only prompt metadata (id and label), not the actual prompts
        prompts: config.ai.prompts.map(p => ({
          id: p.id,
          label: p.label
        }))
      }
    };

    res.json(clientConfig);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
