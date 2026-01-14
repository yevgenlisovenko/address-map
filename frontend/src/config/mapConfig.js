/**
 * Map Configuration
 *
 * Loads map configuration from deployment configs based on VITE_DEPLOYMENT_CONFIG.
 * Falls back to default configuration if no deployment-specific config is found.
 *
 * Configuration includes:
 * - defaultView: Initial map center and zoom level
 * - zoom: Zoom control settings (snap, delta, min, max)
 * - bounds: Map boundary restrictions
 * - markerPan: Settings for panning to markers from sidebar
 */

import defaultConfig from './deployments/default.config.js';
import clientAConfig from './deployments/client-a.config.js';

// Map of deployment configs
const DEPLOYMENT_CONFIGS = {
  default: defaultConfig,
  'client-a': clientAConfig,
};

// Default map configuration (fallback)
const DEFAULT_MAP_CONFIG = {
  defaultView: {
    center: [38.5283, -90.7795],
    zoom: 5.25
  },
  zoom: {
    snap: 0.25,
    delta: 0.25,
    min: 4,
    max: 18
  },
  bounds: {
    enabled: false,
    coordinates: [[24.396308, -125.0], [49.384358, -66.93457]],
    viscosity: 1.0
  },
  markerPan: {
    enabled: true,
    zoomLevel: 12,
    duration: 1.5
  }
};

/**
 * Load map configuration from deployment config
 */
function loadMapConfig() {
  // Get deployment name from environment variable
  const deploymentName = import.meta.env.VITE_DEPLOYMENT_CONFIG || 'default';

  // Get deployment config
  const deploymentConfig = DEPLOYMENT_CONFIGS[deploymentName] || DEPLOYMENT_CONFIGS.default;

  // Extract map config from deployment config, fallback to default
  const mapConfig = deploymentConfig?.map || DEFAULT_MAP_CONFIG;

  return mapConfig;
}

// Export loaded configuration
export const MAP_CONFIG = loadMapConfig();
