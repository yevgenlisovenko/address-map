/**
 * Statistics configuration
 * Defines which properties to track and display in the Stats leaderboard
 */

export const STATS_CONFIG = {
  // Which properties to track and aggregate (for leaderboard)
  trackedProperties: [
    {
      propertyName: "state",
      displayName: "State",
      enabled: true,
    },
    {
      propertyName: "formCode",
      displayName: "Form",
      enabled: true,
    },
  ],

  // Display settings for leaderboard
  maxItemsPerProperty: 5, // Top N items to show on leaderboard
  sortOrder: "desc", // 'desc' for most to least, 'asc' for least to most

  // Numeric property aggregations (sum, avg, min, max, count)
  aggregations: [
    // Add more aggregations here as needed:
    // Example:
    // {
    //   id: 'premiumInfoPanel',
    //   propertyName: 'premium',
    //   displayName: 'Premium',
    //   operations: ['sum'],
    //   format: 'currency',
    //   decimals: 0,
    //   showInStats: false,
    //   showInInfoPanel: true,
    //   enabled: true
    // },
    // {
    //   id: 'premiumStats',
    //   propertyName: 'premium',
    //   displayName: 'Premium',
    //   operations: ['sum', 'max', 'min', 'avg'],
    //   format: 'currency',
    //   decimals: 0,
    //   showInStats: true,
    //   showInInfoPanel: false,
    //   enabled: true
    // },
    // {
    //   id: 'policyCount',
    //   propertyName: null,                // null = count markers
    //   displayName: 'Policies',
    //   operations: ['count'],
    //   format: 'number',
    //   decimals: 0,
    //   showInStats: true,
    //   showInInfoPanel: true,
    //   enabled: true
    // },
    // {
    //   id: 'premium',
    //   propertyName: 'premium',
    //   displayName: 'Premium',
    //   operations: ['sum', 'avg'],
    //   format: 'currency',            // 'currency', 'number', 'percentage'
    //   decimals: 2,
    //   showInStats: true,
    //   showInInfoPanel: true,
    //   enabled: true
    // },
    // {
    //   id: 'coverageAmount',
    //   propertyName: 'coverageAmount',
    //   displayName: 'Coverage Amount',
    //   operations: ['sum', 'max', 'min', 'avg'],
    //   format: 'currency',
    //   decimals: 0,
    //   showInStats: true,
    //   showInInfoPanel: false,
    //   enabled: true
    // }
  ],
};
