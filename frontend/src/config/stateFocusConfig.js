/**
 * State Focus Configuration
 *
 * Loads state focus configuration from deployment configs based on VITE_DEPLOYMENT_CONFIG.
 * Falls back to default configuration if no deployment-specific config is found.
 *
 * Configuration includes:
 * - enabled: Enable/disable state focus feature
 * - defaultState: Default focused state on load (null = all states)
 * - availableStates: Available states in dropdown ('all' or array of abbreviations)
 * - autoZoom: Auto-zoom map to state bounds when state is selected
 * - highlightColor: Color for focused state boundary highlight
 */

import defaultConfig from './deployments/default.config.js';
import clientAConfig from './deployments/client-a.config.js';

// Map of deployment configs
const DEPLOYMENT_CONFIGS = {
  default: defaultConfig,
  'client-a': clientAConfig,
};

// Default state focus configuration (fallback)
const DEFAULT_STATE_FOCUS_CONFIG = {
  enabled: true,
  defaultState: null,
  availableStates: 'all',
  autoZoom: true,
  highlightColor: '#3388ff',
};

/**
 * Load state focus configuration from deployment config
 */
function loadStateFocusConfig() {
  // Get deployment name from environment variable
  const deploymentName = import.meta.env.VITE_DEPLOYMENT_CONFIG || 'default';

  // Get deployment config
  const deploymentConfig = DEPLOYMENT_CONFIGS[deploymentName] || DEPLOYMENT_CONFIGS.default;

  // Extract state focus config from deployment config, fallback to default
  const stateFocusConfig = deploymentConfig?.stateFocus || DEFAULT_STATE_FOCUS_CONFIG;

  return stateFocusConfig;
}

// Export loaded configuration
export const STATE_FOCUS_CONFIG = loadStateFocusConfig();
