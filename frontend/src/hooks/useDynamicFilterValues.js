import { useMemo } from 'react';

/**
 * Hook to generate dynamic filter values from marker data
 * Supports hybrid filter configuration: static, dynamic, and text input filters
 *
 * @param {Array} markers - Array of marker objects
 * @param {Array} filterableProperties - Filter configuration from FILTER_CONFIG
 * @returns {Array} Enhanced filter configuration with dynamic values populated
 *
 * Filter value modes:
 * - Array (e.g., ['HO3', 'HO4']): Use as-is (static dropdown)
 * - 'dynamic': Generate unique values from marker data (dynamic dropdown)
 * - undefined/omitted: No change (text input filter)
 */
export function useDynamicFilterValues(markers, filterableProperties) {
  return useMemo(() => {
    if (!filterableProperties || filterableProperties.length === 0) {
      return filterableProperties;
    }

    // Process each filter property
    return filterableProperties.map(property => {
      // If values is not 'dynamic', return as-is (static or text input)
      if (property.values !== 'dynamic') {
        return property;
      }

      // Generate dynamic values from markers
      const { propertyName } = property;
      const uniqueValues = new Set();

      // Extract unique values from markers
      for (const marker of markers) {
        const value = marker.properties?.[propertyName];
        if (value !== undefined && value !== null && value !== '') {
          uniqueValues.add(String(value));
        }
      }

      // Convert to sorted array
      const sortedValues = Array.from(uniqueValues).sort();

      // Return enhanced property with generated values
      return {
        ...property,
        values: sortedValues,
      };
    });
  }, [markers, filterableProperties]);
}
