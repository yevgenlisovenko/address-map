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
        propertyName: 'state',
        displayName: 'State',
        enabled: true,
        // Static values: predefined dropdown options
        // Note: Hidden when State Focus is active (use State Focus for single state + zoom)
        values: [
          'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
          'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
          'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
          'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
          'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
        ]
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

  // State Focus configuration
  stateFocus: {
    // Enable/disable state focus feature
    enabled: true,
    // Default focused state (null = "All States", or 'CA', 'TX', etc.)
    defaultState: null,
    // Available states for dropdown ('all' or array of abbreviations)
    availableStates: 'all',
    // Auto-zoom map to state bounds when state is selected
    autoZoom: true,
    // Color for focused state boundary highlight (very light/almost transparent orange)
    highlightColor: 'rgba(255, 107, 53, 0.1)',
  },

  // Map configuration
  map: {
    // Initial view settings
    defaultView: {
      center: [38.5283, -90.7795], // USA center
      zoom: 5.25
    },

    // Zoom control settings
    zoom: {
      snap: 0.25,      // Snap increment for zoom levels
      delta: 0.25,     // Zoom change per button click
      min: 4,          // Minimum zoom level
      max: 18          // Maximum zoom level
    },

    // Map bounds settings
    bounds: {
      enabled: false,  // Enable to restrict map panning to USA
      coordinates: [[24.396308, -125.0], [49.384358, -66.93457]], // USA bounds
      viscosity: 1.0   // Boundary strictness (1.0 = hard boundary)
    },

    // Marker pan settings (when clicking marker in sidebar)
    markerPan: {
      enabled: true,
      zoomLevel: 12,   // Zoom level when panning to marker
      duration: 1.5    // Animation duration in seconds
    },

    // New marker highlight settings (visual distinction for newly added markers)
    newMarkerHighlight: {
      enabled: false,
      duration: 4000,  // How long (ms) the highlight remains (4 seconds)
      style: 'glow'    // Visual style: 'glow', 'bright', 'shadow', or 'blink'
    }
  },
};
