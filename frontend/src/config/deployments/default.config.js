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
};
