/**
 * Default Icon Configuration
 *
 * This is the fallback configuration used when no deployment-specific
 * config is specified via VITE_DEPLOYMENT_CONFIG environment variable.
 *
 * Configuration Structure:
 * {
 *   [propertyName]: {
 *     [propertyValue]: {
 *       icon: string,  // Icon ID from ICON_REGISTRY (e.g., 'ho3', 'blue', 'gold')
 *       label: string, // Display label for this icon
 *     }
 *   }
 * }
 *
 * Example:
 * formCode: {
 *   HO3: {
 *     icon: 'ho3',              // Will be mapped to actual ho3MarkerIcon
 *     label: 'Homeowners (HO3)' // Display label in legend/UI
 *   }
 * }
 */

export default {
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
};
