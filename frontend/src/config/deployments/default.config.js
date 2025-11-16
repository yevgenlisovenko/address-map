/**
 * Default Deployment Configuration
 *
 * This is the fallback configuration used when no deployment-specific
 * config is specified via VITE_DEPLOYMENT_CONFIG environment variable.
 *
 * Marker Icon Configuration Structure:
 * {
 *   [propertyName]: {
 *     [propertyValue]: {
 *       icon: string,  // Icon ID from ICON_REGISTRY (e.g., 'ho3', 'blue', 'gold')
 *       label: string, // Display label for this icon
 *     }
 *   }
 * }
 *
 * Stats Configuration Structure:
 * {
 *   trackedProperties: Array<{
 *     propertyName: string,
 *     displayName: string,
 *     enabled: boolean,
 *     aggregations?: Array<{  // Optional: show aggregations per property value
 *       propertyName: string,
 *       displayName?: string,
 *       operations: Array<'sum' | 'avg' | 'min' | 'max' | 'count'>,
 *       format: 'currency' | 'number' | 'percentage',
 *       decimals: number,
 *       enabled: boolean
 *     }>
 *   }>,
 *   maxItemsPerProperty: number,
 *   sortOrder: 'desc' | 'asc',
 *   aggregations: Array<{
 *     id: string,
 *     propertyName: string | null,
 *     displayName: string,
 *     operations: Array<'sum' | 'avg' | 'min' | 'max' | 'count'>,
 *     format: 'currency' | 'number' | 'percentage',
 *     decimals: number,
 *     showInStats: boolean,
 *     showInInfoPanel: boolean,
 *     enabled: boolean
 *   }>
 * }
 *
 * Filters Configuration Structure:
 * {
 *   filterableProperties: Array<{
 *     propertyName: string,
 *     displayName: string,
 *     enabled: boolean,
 *     values?: Array<string> | 'dynamic' | undefined
 *     // values modes:
 *     // - Array: static dropdown with predefined options
 *     // - 'dynamic': generate dropdown from marker data
 *     // - undefined/omitted: text input filter (contains search)
 *   }>
 * }
 *
 * Tooltip Configuration Structure:
 * {
 *   enabled: boolean,
 *   additionalFields: Array<{
 *     propertyName: string,
 *     displayName: string,
 *     order: number
 *   }>
 * }
 * Note: Name and Time are always shown in tooltips
 */

export default {
  // Marker icon mappings
  markerIconMapping: {
    formCode: {
      HO3: {
        icon: 'ho3',
        label: 'Homeowners (HO3)',
      },
      HO4: {
        icon: 'ho4',
        label: 'Renters (HO4)',
      },
      HO6: {
        icon: 'ho6',
        label: 'Condo (HO6)',
      },
      HF9: {
        icon: 'hf9',
        label: 'Second Home (HF9)',
      },
    },
  },

  // Statistics configuration
  stats: {
    trackedProperties: [
      {
        propertyName: 'state',
        displayName: 'State',
        enabled: true,
        // aggregations: [
        //   {
        //     propertyName: 'premium',
        //     displayName: 'Premium',
        //     operations: ['sum', 'avg'],
        //     format: 'currency',
        //     decimals: 0,
        //     enabled: true,
        //   },
        // ],
      },
      {
        propertyName: 'formCode',
        displayName: 'Form',
        enabled: true,
        // No aggregations - just shows counts
      },
    ],
    maxItemsPerProperty: 5,
    sortOrder: 'desc',
    aggregations: [
      {
        id: 'premiumInfoPanel',
        propertyName: 'premium',
        displayName: 'Premium',
        operations: ['sum'],
        format: 'currency',
        decimals: 0,
        showInStats: false,
        showInInfoPanel: true,
        enabled: true
      },
      {
        id: 'premiumStats',
        propertyName: 'premium',
        displayName: 'Premium',
        operations: ['sum', 'max', 'min', 'avg'],
        format: 'currency',
        decimals: 0,
        showInStats: true,
        showInInfoPanel: false,
        enabled: true
      },
    ],
  },

  // Filters configuration
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
        propertyName: 'formCode',
        displayName: 'Form Code',
        enabled: true,
        values: ['HO3', 'HO4', 'HO6', 'HF9']
      },
      // Example: Dynamic dropdown (generate from marker data)
      // {
      //   propertyName: 'county',
      //   displayName: 'County',
      //   enabled: true,
      //   values: 'dynamic'  // Auto-generate from markers
      // },
      // Example: Text input filter (contains search)
      // {
      //   propertyName: 'notes',
      //   displayName: 'Notes',
      //   enabled: true
      //   // No values = text input
      // }
    ]
  },

  // Legend configuration
  legend: {
    // Auto-group legend items with duplicate icons (disabled for default - no duplicates)
    autoGroupDuplicates: false,
    // Custom labels for grouped items (by icon ID)
    groupLabels: {},
    // Default state for groups (true = expanded, false = collapsed)
    defaultExpanded: false,
  },

  // Tooltip configuration
  tooltip: {
    enabled: true,
    additionalFields: [
      {
        propertyName: 'formCode',
        displayName: 'Form',
        order: 1
      },
      {
        propertyName: 'premium',
        displayName: 'Premium',
        order: 2
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
    // Color for focused state boundary highlight (very light/almost transparent)
    highlightColor: 'rgba(51, 136, 255, 0.1)',
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
      enabled: true,
      duration: 5000,  // How long (ms) the highlight remains
      style: 'blink'    // Visual style: 'glow', 'bright', 'shadow', 'blink', 'glow-pulse', or 'fade-pulse'
    }
  },
};
