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
  // Marker icon mappings
  markerIconMapping: {
    // Marker icon mappings by partnerNameShort
    partnerNameShort: {
      'Homesite': {
        icon: 'blueH'
      },
      'HOMESITE MOBILE': {
        icon: 'blueH',
      },
      'HOMESITE INSURANCE': {
        icon: 'blueH',
      },
      'Homesite Homeowners Insurance Program': {
        icon: 'blueH',
      },
      'Homesite Insurance Program': {
        icon: 'blueH',
      },
      'GEICO Agency': {
        icon: 'yellowG',
      },
      'GEICO Direct': {
        icon: 'yellowG',
      },
      'GEICO CC': {
        icon: 'yellowG',
      },
      'GEICO Insurance Agency, LLC': {
        icon: 'yellowG',
      },
      'GEICO Insurance Agency, Inc.': {
        icon: 'yellowG',
      },
      'American Family Insurance': {
        icon: 'redA',
      },
      'Progressive Home, by Homesite': {
        icon: 'greenP',
      },
      'CoverMyStuff Insurance Program': {
        icon: 'violetO',
      },
      'Lemonade': {
        icon: 'violetO',
      },
      'Midvale Insurance Program': {
        icon: 'violetO',
      },
      'Elephant Homeowners Insurance Program': {
        icon: 'violetO',
      },
    },
  },

  // Statistics configuration for Client A
  stats: {
    trackedProperties: [
      // {
      //   propertyName: "state",
      //   displayName: "State",
      //   enabled: true,
      //   // Optional: add aggregations per property value
      //   // aggregations: [
      //   //   {
      //   //     propertyName: 'premium',
      //   //     displayName: 'Premium',
      //   //     operations: ['sum', 'avg'],
      //   //     format: 'currency',
      //   //     decimals: 0,
      //   //     enabled: true,
      //   //   },
      //   // ],
      // },
      {
        propertyName: "partnerNameShort",
        displayName: "By Partner",
        enabled: true,
        aggregations: [
          {
            propertyName: "premium",
            displayName: "Premium",
            operations: ["sum"],
            format: "currency",
            decimals: 0,
            enabled: true,
          },
        ],
      },
    ],
    maxItemsPerProperty: 100, // Show top 100 for client A
    sortOrder: "desc",
    aggregations: [
      {
        id: 'premiumStats',
        propertyName: 'premium',
        displayName: 'By Premium',
        operations: ['sum'],
        format: 'currency',
        decimals: 0,
        showInStats: true,
        showInInfoPanel: false,
        enabled: true
      },
    ],
  },

  // Filters configuration for Client A
  filters: {
    filterableProperties: [
      {
        propertyName: "state",
        displayName: "State",
        enabled: true,
        // Static values: predefined dropdown options
        values: [
          "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
          "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
          "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
          "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
          "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
        ],
      },
      {
        propertyName: "partnerNameShort",
        displayName: "Partner",
        enabled: true,
        // Dynamic values: auto-generate from marker data
        values: "dynamic",
      },
    ],
  },

  // Legend configuration
  legend: {
    // Auto-group legend items with duplicate icons
    autoGroupDuplicates: true,
    // Custom labels for grouped items (by icon ID)
    groupLabels: {
      yellowG: 'GEICO',
      blueH: 'Homesite',
      redA: 'AmFam',
      greenP: 'Progressive',
      violetO: 'Others',
    },
    // Default state for groups (true = expanded, false = collapsed)
    defaultExpanded: false,
  },

  // Tooltip configuration
  tooltip: {
    enabled: true,
    additionalFields: [
      {
        propertyName: 'partnerNameShort',
        displayName: 'Partner',
        order: 2
      },
      {
        propertyName: 'premium',
        displayName: 'Premium',
        order: 3
      }
    ]
  },
};
