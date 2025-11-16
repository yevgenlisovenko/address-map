/**
 * New Marker Highlight Configuration
 *
 * This configuration controls the visual distinction of newly added markers.
 * Loaded from deployment configuration to allow per-deployment customization.
 *
 * Configuration Structure:
 * {
 *   enabled: boolean,     // Enable/disable new marker highlighting
 *   duration: number,     // How long (ms) the highlight remains before auto-clearing
 *   style: string,        // Visual style: 'glow', 'bright', 'shadow'
 * }
 */

import defaultConfig from './deployments/default.config.js';
import clientAConfig from './deployments/client-a.config.js';

// Map of deployment configs
const DEPLOYMENT_CONFIGS = {
  default: defaultConfig,
  'client-a': clientAConfig,
};

/**
 * Default configuration when no deployment config specifies new marker highlight settings
 */
const DEFAULT_NEW_MARKER_HIGHLIGHT_CONFIG = {
  enabled: false,
  duration: 8000,  // 8 seconds
  style: 'glow',
};

/**
 * Load new marker highlight configuration from deployment config
 * Falls back to default if not specified
 */
function loadNewMarkerHighlightConfig() {
  const deploymentName = import.meta.env.VITE_DEPLOYMENT_CONFIG || 'default';
  const deploymentConfig = DEPLOYMENT_CONFIGS[deploymentName] || DEPLOYMENT_CONFIGS.default;

  const newMarkerHighlightConfig = deploymentConfig?.map?.newMarkerHighlight || DEFAULT_NEW_MARKER_HIGHLIGHT_CONFIG;

  return newMarkerHighlightConfig;
}

/**
 * Export the loaded configuration for use throughout the application
 */
export const NEW_MARKER_HIGHLIGHT_CONFIG = loadNewMarkerHighlightConfig();
