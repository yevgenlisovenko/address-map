import { useMemo } from 'react';
import { formatValue } from '../utils/formatters';
import logger from '../utils/logger';

/**
 * Hook to calculate aggregations grouped by property values
 * Used for enhanced leaderboards showing aggregations per property value
 *
 * @param {Array} visibleMarkers - Array of marker objects after filters applied
 * @param {Array} trackedProperties - Array of TrackedProperty configs with aggregations
 * @returns {Object} Aggregation results keyed by propertyName, then by property value
 *
 * Example return structure for multiple properties:
 * {
 *   state: {
 *     "Texas": {
 *       premium: {
 *         sum: { value: 450000, formatted: '$450,000' },
 *         avg: { value: 10000, formatted: '$10,000' }
 *       }
 *     },
 *     "California": {
 *       premium: {
 *         sum: { value: 380000, formatted: '$380,000' },
 *         avg: { value: 10000, formatted: '$10,000' }
 *       }
 *     }
 *   }
 * }
 */
export function useGroupedAggregations(visibleMarkers, trackedProperties) {
  return useMemo(() => {
    const allResults = {};

    // If no markers, return empty
    if (!visibleMarkers || visibleMarkers.length === 0) {
      return allResults;
    }

    // Process each tracked property that has aggregations
    for (const trackedProperty of trackedProperties) {
      // Skip if no aggregations defined
      if (!trackedProperty?.aggregations || trackedProperty.aggregations.length === 0) {
        continue;
      }

      const { propertyName: groupByProperty, aggregations } = trackedProperty;
      const results = {};

      // Filter to enabled aggregations only
      const enabledAggregations = aggregations.filter(agg => agg.enabled);

      if (enabledAggregations.length === 0) {
        continue;
      }

      // Group markers by the tracked property value (e.g., by state)
      const groupedMarkers = {};
      for (const marker of visibleMarkers) {
        const groupValue = marker.properties?.[groupByProperty];

        // Skip markers without this property
        if (groupValue === undefined || groupValue === null) {
          continue;
        }

        if (!groupedMarkers[groupValue]) {
          groupedMarkers[groupValue] = [];
        }
        groupedMarkers[groupValue].push(marker);
      }

      // Calculate aggregations for each group
      for (const [groupValue, markers] of Object.entries(groupedMarkers)) {
        results[groupValue] = {};

        // Calculate each aggregation
        for (const aggregation of enabledAggregations) {
          const { propertyName, displayName, operations, format, decimals } = aggregation;

          // Extract numeric values from the aggregation property
          const values = markers
            .map(marker => marker.properties?.[propertyName])
            .filter(val => val != null && !isNaN(val) && typeof val === 'number');

          // Use propertyName as key, or displayName if no propertyName
          const aggKey = propertyName || displayName;
          results[groupValue][aggKey] = {};

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
            results[groupValue][aggKey][operation] = {
              value,
              formatted: formatValue(value, format, decimals)
            };
          }
        }
      }

      // Store results for this property
      allResults[groupByProperty] = results;
    }

    return allResults;
  }, [visibleMarkers, trackedProperties]);
}
