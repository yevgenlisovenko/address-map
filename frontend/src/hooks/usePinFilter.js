import { useState, useEffect, useMemo } from 'react';

const PIN_FILTER_UPDATE_INTERVAL = 60000; // 60 seconds

/**
 * Custom hook to filter pins based on time window or custom start time
 * @param {Array} markers - All markers
 * @param {Object} config - Pin storage configuration
 * @param {string} selectedTimeWindow - Selected time window key
 * @param {string} timeSelectionMode - 'preset' or 'custom'
 * @param {number} customStartTime - Custom start timestamp (if mode is 'custom')
 * @returns {Array} visibleMarkers - Filtered markers
 */
export const usePinFilter = (
  markers,
  config,
  selectedTimeWindow,
  timeSelectionMode,
  customStartTime
) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Periodic timer to update current time and re-evaluate visible pins
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, PIN_FILTER_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Filter markers based on selected time window or custom start time
  const visibleMarkers = useMemo(() => {
    if (!config) return markers;

    let cutoffTime;

    if (timeSelectionMode === 'custom' && customStartTime) {
      // Custom mode: use custom start time as cutoff
      cutoffTime = customStartTime;
    } else {
      // Preset mode: use time window calculation
      const timeWindowMs = config.timeWindowOptions[selectedTimeWindow];
      if (!timeWindowMs) return markers;
      cutoffTime = currentTime - timeWindowMs;
    }

    return markers.filter(pin => {
      const pinTime = new Date(pin.timestamp).getTime();
      return pinTime >= cutoffTime;
    });
  }, [markers, selectedTimeWindow, config, currentTime, timeSelectionMode, customStartTime]);

  return visibleMarkers;
};
