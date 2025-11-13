/**
 * Tooltip Configuration
 *
 * Loads tooltip configuration from deployment configs based on VITE_DEPLOYMENT_CONFIG.
 * Falls back to default configuration if no deployment-specific config is found.
 *
 * Configuration includes:
 * - enabled: Whether tooltips are enabled
 * - additionalFields: Array of property fields to show in tooltips (in addition to Name and Time)
 *   - propertyName: The marker property name
 *   - displayName: Custom label to show in tooltip
 *   - order: Display order (1 = first, 2 = second, etc.)
 *
 * Note: Name and Time are always shown in tooltips as the first two lines.
 * Additional fields are shown below them in the order specified.
 */

import defaultConfig from './deployments/default.config.js';
import clientAConfig from './deployments/client-a.config.js';

// Map of deployment configs
const DEPLOYMENT_CONFIGS = {
  default: defaultConfig,
  'client-a': clientAConfig,
};

// Default tooltip configuration (fallback)
const DEFAULT_TOOLTIP_CONFIG = {
  enabled: true,
  additionalFields: [
    // {
    //   propertyName: 'formCode',
    //   displayName: 'Form',
    //   order: 1
    // }
  ]
};

/**
 * Load tooltip configuration from deployment config
 */
function loadTooltipConfig() {
  // Get deployment name from environment variable
  const deploymentName = import.meta.env.VITE_DEPLOYMENT_CONFIG || 'default';

  // Get deployment config
  const deploymentConfig = DEPLOYMENT_CONFIGS[deploymentName] || DEPLOYMENT_CONFIGS.default;

  // Extract tooltip config from deployment config, fallback to default
  const tooltipConfig = deploymentConfig?.tooltip || DEFAULT_TOOLTIP_CONFIG;

  return tooltipConfig;
}

// Export loaded configuration
export const TOOLTIP_CONFIG = loadTooltipConfig();
