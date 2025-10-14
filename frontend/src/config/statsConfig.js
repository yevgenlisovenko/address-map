/**
 * Statistics configuration
 * Defines which properties to track and display in the Stats leaderboard
 */

export const STATS_CONFIG = {
  // Which properties to track and aggregate
  trackedProperties: [
    {
      propertyName: 'state',
      displayName: 'State',
      enabled: true
    },
    {
      propertyName: 'formCode',
      displayName: 'Form Code',
      enabled: true
    }
  ],

  // Display settings
  maxItemsPerProperty: 5,  // Top N items to show on leaderboard
  sortOrder: 'desc'        // 'desc' for most to least, 'asc' for least to most
};
