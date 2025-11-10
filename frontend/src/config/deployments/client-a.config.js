/**
 * Client A Deployment Configuration
 *
 * Example deployment configuration for Client A.
 * This demonstrates how different deployments can have different
 * icon mappings and statistics configurations without changing the code.
 *
 * Client A Specifics:
 * - Uses partnerId instead of formCode for icon mapping
 * - Tracks state and partnerId in statistics
 * - Custom labels for their business terminology
 * - Displays partner-specific aggregations
 *
 * To use this config:
 * 1. Set VITE_DEPLOYMENT_CONFIG=client-a in .env file
 * 2. Run: npm run build:client-a
 *
 * Last updated: 2025-01-09
 */

export default {
  // Marker icon mappings by partnerId
  partnerId: {
    1237: {
      icon: 'red',
      label: 'American Family Insurance',
    },
    1243: {
      icon: 'red',
      label: 'American Family Insurance',
    },
    1245: {
      icon: 'red',
      label: 'American Family Insurance',
    },
    2849: {
      icon: 'red',
      label: 'American Family Insurance',
    },
    7312: {
      icon: 'red',
      label: 'American Family Insurance',
    },
    2329: {
      icon: 'blue',
      label: 'Homesite',
    },
    2711: {
      icon: 'blue',
      label: 'Homesite',
    },
    2845: {
      icon: 'blue',
      label: 'Homesite',
    },
    1271: {
      icon: 'green',
      label: 'Progressive',
    },
    8: {
      icon: 'green',
      label: 'Progressive',
    },
    1041: {
      icon: 'yellow',
      label: 'Geico',
    },
    1042: {
      icon: 'blue',
      label: 'Homesite',
    },
    1821: {
      icon: 'blue',
      label: 'Homesite',
    },
    2709: {
      icon: 'blue',
      label: 'Homesite',
    },
  },

  // Statistics configuration for Client A
  stats: {
    trackedProperties: [
      {
        propertyName: 'state',
        displayName: 'State',
        enabled: true,
      },
      {
        propertyName: 'partnerId',
        displayName: 'Partner',
        enabled: true,
      },
    ],
    maxItemsPerProperty: 10, // Show top 10 for client A
    sortOrder: 'desc',
    aggregations: [
      // {
      //   id: 'total-policies',
      //   propertyName: null, // null = count markers
      //   displayName: 'Total Policies',
      //   operations: ['count'],
      //   format: 'number',
      //   decimals: 0,
      //   showInStats: true,
      //   showInInfoPanel: true,
      //   enabled: true,
      // },
    ],
  },
};
