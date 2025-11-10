/**
 * Statistics Configuration
 *
 * Loads stats configuration from deployment configs based on VITE_DEPLOYMENT_CONFIG.
 * Falls back to default configuration if no deployment-specific config is found.
 *
 * Configuration includes:
 * - trackedProperties: Properties to track in leaderboard
 * - maxItemsPerProperty: Number of top items to show
 * - sortOrder: Sort direction ('desc' or 'asc')
 * - aggregations: Numeric aggregations (sum, avg, min, max, count)
 */

import defaultConfig from './deployments/default.config.js';
import clientAConfig from './deployments/client-a.config.js';

// Map of deployment configs
const DEPLOYMENT_CONFIGS = {
  default: defaultConfig,
  'client-a': clientAConfig,
};

// Default stats configuration (fallback)
const DEFAULT_STATS_CONFIG = {
  trackedProperties: [
    {
      propertyName: 'state',
      displayName: 'State',
      enabled: true,
    },
    {
      propertyName: 'formCode',
      displayName: 'Form',
      enabled: true,
    },
  ],
  maxItemsPerProperty: 5,
  sortOrder: 'desc',
  aggregations: [],
};

/**
 * Load stats configuration from deployment config
 */
function loadStatsConfig() {
  // Get deployment name from environment variable
  const deploymentName = import.meta.env.VITE_DEPLOYMENT_CONFIG || 'default';

  // Get deployment config
  const deploymentConfig = DEPLOYMENT_CONFIGS[deploymentName] || DEPLOYMENT_CONFIGS.default;

  // Extract stats config from deployment config, fallback to default
  const statsConfig = deploymentConfig?.stats || DEFAULT_STATS_CONFIG;

  return statsConfig;
}

// Export loaded configuration
export const STATS_CONFIG = loadStatsConfig();

/**
 * Example aggregation configurations:
 *
 * {
 *   id: 'premiumInfoPanel',
 *   propertyName: 'premium',
 *   displayName: 'Premium',
 *   operations: ['sum'],
 *   format: 'currency',
 *   decimals: 0,
 *   showInStats: false,
 *   showInInfoPanel: true,
 *   enabled: true
 * },
 * {
 *   id: 'premiumStats',
 *   propertyName: 'premium',
 *   displayName: 'Premium',
 *   operations: ['sum', 'max', 'min', 'avg'],
 *   format: 'currency',
 *   decimals: 0,
 *   showInStats: true,
 *   showInInfoPanel: false,
 *   enabled: true
 * },
 * {
 *   id: 'policyCount',
 *   propertyName: null,                // null = count markers
 *   displayName: 'Policies',
 *   operations: ['count'],
 *   format: 'number',
 *   decimals: 0,
 *   showInStats: true,
 *   showInInfoPanel: true,
 *   enabled: true
 * },
 * {
 *   id: 'premium',
 *   propertyName: 'premium',
 *   displayName: 'Premium',
 *   operations: ['sum', 'avg'],
 *   format: 'currency',            // 'currency', 'number', 'percentage'
 *   decimals: 2,
 *   showInStats: true,
 *   showInInfoPanel: true,
 *   enabled: true
 * },
 * {
 *   id: 'coverageAmount',
 *   propertyName: 'coverageAmount',
 *   displayName: 'Coverage Amount',
 *   operations: ['sum', 'max', 'min', 'avg'],
 *   format: 'currency',
 *   decimals: 0,
 *   showInStats: true,
 *   showInInfoPanel: false,
 *   enabled: true
 * }
 */
