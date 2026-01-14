/**
 * Filter Configuration
 *
 * Loads filter configuration from deployment configs based on VITE_DEPLOYMENT_CONFIG.
 * Falls back to default configuration if no deployment-specific config is found.
 *
 * Configuration includes:
 * - filterableProperties: Properties available for filtering in the UI
 *
 * Filter value modes:
 * - Array (e.g., ['HO3', 'HO4']): Static dropdown with predefined options
 * - 'dynamic': Generate dropdown values automatically from marker data
 * - undefined/omitted: Text input filter with "contains" search logic
 */

import defaultConfig from './deployments/default.config.js';
import clientAConfig from './deployments/client-a.config.js';

// Map of deployment configs
const DEPLOYMENT_CONFIGS = {
  default: defaultConfig,
  'client-a': clientAConfig,
};

// Default filter configuration (fallback)
const DEFAULT_FILTER_CONFIG = {
  filterableProperties: [
    {
      propertyName: 'state',
      displayName: 'State',
      enabled: true,
      values: [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
      ]
    },
    {
      propertyName: 'formCode',
      displayName: 'Form Code',
      enabled: true,
      values: ['HO3', 'HO4', 'HO6', 'HF9']
    },
  ]
};

/**
 * Load filter configuration from deployment config
 */
function loadFilterConfig() {
  // Get deployment name from environment variable
  const deploymentName = import.meta.env.VITE_DEPLOYMENT_CONFIG || 'default';

  // Get deployment config
  const deploymentConfig = DEPLOYMENT_CONFIGS[deploymentName] || DEPLOYMENT_CONFIGS.default;

  // Extract filter config from deployment config, fallback to default
  const filterConfig = deploymentConfig?.filters || DEFAULT_FILTER_CONFIG;

  return filterConfig;
}

// Export loaded configuration
export const FILTER_CONFIG = loadFilterConfig();

/**
 * Example configurations:
 *
 * STATIC DROPDOWN (predefined values):
 * {
 *   propertyName: 'state',
 *   displayName: 'State',
 *   enabled: true,
 *   values: ['AL', 'CA', 'TX', ...]  // Array of values
 * }
 *
 * DYNAMIC DROPDOWN (auto-generate from markers):
 * {
 *   propertyName: 'partnerName',
 *   displayName: 'Partner',
 *   enabled: true,
 *   values: 'dynamic'  // Generate unique values from marker data
 * }
 *
 * TEXT INPUT (contains search):
 * {
 *   propertyName: 'county',
 *   displayName: 'County',
 *   enabled: true
 *   // No values property = text input filter
 * }
 */
