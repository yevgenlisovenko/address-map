import { useMemo } from 'react';
import { STATS_CONFIG } from '../config/statsConfig';
import { formatValue } from '../utils/formatters';
import logger from '../utils/logger';

/**
 * Hook to calculate aggregations for visible markers
 * @param {Array} visibleMarkers - Array of marker objects after filters applied
 * @returns {Object} Aggregation results keyed by aggregation id
 *
 * Example return structure:
 * {
 *   policyCount: {
 *     count: { value: 507, formatted: '507' }
 *   },
 *   premium: {
 *     sum: { value: 1245678, formatted: '$1,245,678.00' },
 *     avg: { value: 2456.78, formatted: '$2,456.78' }
 *   }
 * }
 */
export function useAggregations(visibleMarkers) {
  return useMemo(() => {
    const results = {};

    // Get enabled aggregations from config
    const enabledAggregations = STATS_CONFIG.aggregations.filter(agg => agg.enabled);

    if (!visibleMarkers || visibleMarkers.length === 0) {
      // Return zero values for all aggregations when no markers
      for (const aggregation of enabledAggregations) {
        const { id, operations, format, decimals } = aggregation;
        results[id] = {};

        for (const operation of operations) {
          results[id][operation] = {
            value: 0,
            formatted: formatValue(0, format, decimals)
          };
        }
      }
      return results;
    }

    // Calculate aggregations for each enabled config
    for (const aggregation of enabledAggregations) {
      const { id, propertyName, operations, format, decimals } = aggregation;

      // Extract values based on propertyName
      let values;
      if (propertyName === null) {
        // null means count markers
        values = visibleMarkers;
      } else {
        // Extract numeric values from property
        values = visibleMarkers
          .map(marker => marker.properties?.[propertyName])
          .filter(val => val != null && !isNaN(val) && typeof val === 'number');
      }

      results[id] = {};

      // Calculate each requested operation
      for (const operation of operations) {
        let value;

        switch (operation) {
          case 'count':
            value = values.length;
            break;

          case 'sum':
            value = values.length > 0
              ? values.reduce((acc, val) => acc + val, 0)
              : 0;
            break;

          case 'avg':
            value = values.length > 0
              ? values.reduce((acc, val) => acc + val, 0) / values.length
              : 0;
            break;

          case 'min':
            value = values.length > 0
              ? Math.min(...values)
              : 0;
            break;

          case 'max':
            value = values.length > 0
              ? Math.max(...values)
              : 0;
            break;

          default:
            logger.warn(`Unknown aggregation operation: ${operation}`);
            value = 0;
        }

        // Store both raw value and formatted string
        results[id][operation] = {
          value,
          formatted: formatValue(value, format, decimals)
        };
      }
    }

    return results;
  }, [visibleMarkers]);
}
