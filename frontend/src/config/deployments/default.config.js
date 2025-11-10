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
 */

export default {
  // Marker icon mappings
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
};
