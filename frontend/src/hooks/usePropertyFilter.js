import { useState, useEffect, useMemo } from 'react';

const PIN_FILTER_UPDATE_INTERVAL = 60000; // 60 seconds

/**
 * Combined hook to filter pins based on time window AND property filters
 * @param {Array} markers - All markers
 * @param {Object} config - Pin storage configuration
 * @param {string} selectedTimeWindow - Selected time window key
 * @param {string} timeSelectionMode - 'preset' or 'custom'
 * @param {number} customStartTime - Custom start timestamp (if mode is 'custom')
 * @param {Object} propertyFilters - Property filter state {propertyName: {type, values/value}}
 * @returns {Array} filteredMarkers - Markers filtered by both time and properties
 */
export const usePropertyFilter = (
  markers,
  config,
  selectedTimeWindow,
  timeSelectionMode,
  customStartTime,
  propertyFilters
) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Periodic timer to update current time and re-evaluate visible pins
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, PIN_FILTER_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Filter markers based on time AND properties
  const filteredMarkers = useMemo(() => {
    if (!config) return markers;

    // Step 1: Filter by time (existing logic from usePinFilter)
    let cutoffTime;

    if (timeSelectionMode === 'custom' && customStartTime) {
      cutoffTime = customStartTime;
    } else {
      const timeWindowMs = config.timeWindowOptions[selectedTimeWindow];
      if (!timeWindowMs) return markers;
      cutoffTime = currentTime - timeWindowMs;
    }

    let filtered = markers.filter(pin => {
      const pinTime = new Date(pin.timestamp).getTime();
      return pinTime >= cutoffTime;
    });

    // Step 2: Filter by properties (new logic)
    if (propertyFilters && Object.keys(propertyFilters).length > 0) {
      filtered = filtered.filter(marker => {
        // Must match ALL property filters (AND logic between properties)
        for (const [propertyName, filter] of Object.entries(propertyFilters)) {
          const markerValue = marker.properties?.[propertyName];

          if (filter.type === 'dropdown') {
            // Dropdown mode: OR logic within property
            // Marker must have one of the selected values
            if (!filter.values || filter.values.length === 0) {
              continue; // No values selected, skip this filter
            }
            if (!filter.values.includes(markerValue)) {
              return false; // Marker doesn't match this property filter
            }
          } else if (filter.type === 'text') {
            // Text mode: Contains logic (case-insensitive)
            if (!filter.value || filter.value.trim() === '') {
              continue; // Empty text, skip this filter
            }
            const markerValueStr = String(markerValue || '').toLowerCase();
            const filterValueStr = filter.value.toLowerCase();
            if (!markerValueStr.includes(filterValueStr)) {
              return false; // Marker doesn't contain the search text
            }
          }
        }

        return true; // Marker passed all property filters
      });
    }

    return filtered;
  }, [
    markers,
    selectedTimeWindow,
    config,
    currentTime,
    timeSelectionMode,
    customStartTime,
    propertyFilters
  ]);

  return filteredMarkers;
};
