import { useState, useEffect, useMemo, useRef } from 'react';

const PIN_FILTER_UPDATE_INTERVAL = 60000; // 60 seconds

/**
 * Combined hook to filter pins based on time window AND property filters
 * Optimized for incremental filtering - only filters new markers when possible
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

  // Track previous state for incremental filtering
  const prevMarkersRef = useRef([]);
  const prevFilteredRef = useRef([]);
  const prevFiltersRef = useRef({
    selectedTimeWindow,
    timeSelectionMode,
    customStartTime,
    propertyFilters: JSON.stringify(propertyFilters),
  });

  // Periodic timer to update current time and re-evaluate visible pins
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, PIN_FILTER_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Update current time immediately when time window or mode changes
  useEffect(() => {
    setCurrentTime(Date.now());
  }, [selectedTimeWindow, timeSelectionMode]);

  // Helper function to check if a single marker passes all filters
  const passesFilters = (marker, cutoffTime, propFilters) => {
    // Time filter
    const pinTime = new Date(marker.timestamp).getTime();
    if (pinTime < cutoffTime) return false;

    // Property filters
    if (propFilters && Object.keys(propFilters).length > 0) {
      for (const [propertyName, filter] of Object.entries(propFilters)) {
        const markerValue = marker.properties?.[propertyName];

        if (filter.type === 'dropdown') {
          if (!filter.values || filter.values.length === 0) continue;
          if (!filter.values.includes(markerValue)) return false;
        } else if (filter.type === 'text') {
          if (!filter.value || filter.value.trim() === '') continue;
          const markerValueStr = String(markerValue || '').toLowerCase();
          const filterValueStr = filter.value.toLowerCase();
          if (!markerValueStr.includes(filterValueStr)) return false;
        }
      }
    }

    return true;
  };

  // Filter markers based on time AND properties (with incremental optimization)
  const filteredMarkers = useMemo(() => {
    if (!config) return markers;

    // Calculate cutoff time
    let cutoffTime;
    if (timeSelectionMode === 'custom' && customStartTime) {
      cutoffTime = customStartTime;
    } else {
      const timeWindowMs = config.pinStorage.timeWindowOptions[selectedTimeWindow];
      if (!timeWindowMs) return markers;
      cutoffTime = currentTime - timeWindowMs;
    }

    // Check if filters changed
    const currentFiltersKey = JSON.stringify(propertyFilters);
    const filtersChanged =
      prevFiltersRef.current.selectedTimeWindow !== selectedTimeWindow ||
      prevFiltersRef.current.timeSelectionMode !== timeSelectionMode ||
      prevFiltersRef.current.customStartTime !== customStartTime ||
      prevFiltersRef.current.propertyFilters !== currentFiltersKey;

    const prevMarkers = prevMarkersRef.current;
    const prevFiltered = prevFilteredRef.current;

    let result;

    // INCREMENTAL PATH: New markers prepended to beginning
    if (!filtersChanged &&
        markers.length > prevMarkers.length &&
        markers.length > 0 &&
        prevMarkers.length > 0 &&
        markers[markers.length - 1] === prevMarkers[prevMarkers.length - 1]) {

      // Extract new markers (prepended at beginning)
      const newMarkersCount = markers.length - prevMarkers.length;
      const newMarkers = markers.slice(0, newMarkersCount);

      // Filter only new markers
      const newFiltered = newMarkers.filter(marker =>
        passesFilters(marker, cutoffTime, propertyFilters)
      );

      // Prepend to previous filtered result
      result = [...newFiltered, ...prevFiltered];
    }
    // TIME EXPIRATION PATH: Only currentTime changed (60s tick)
    else if (!filtersChanged &&
             markers === prevMarkers &&
             prevFiltered.length > 0) {

      // Remove markers that fell out of time window
      result = prevFiltered.filter(marker => {
        const pinTime = new Date(marker.timestamp).getTime();
        return pinTime >= cutoffTime;
      });
    }
    // FULL REFILTER PATH: Filters changed or can't do incremental
    else {
      // Filter all markers
      result = markers.filter(marker =>
        passesFilters(marker, cutoffTime, propertyFilters)
      );
    }

    // Update refs for next iteration
    prevMarkersRef.current = markers;
    prevFilteredRef.current = result;
    prevFiltersRef.current = {
      selectedTimeWindow,
      timeSelectionMode,
      customStartTime,
      propertyFilters: currentFiltersKey,
    };

    return result;
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
