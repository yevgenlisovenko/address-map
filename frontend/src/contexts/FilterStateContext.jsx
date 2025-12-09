import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSocketContext } from './SocketContext';
import { useAppConfig } from './AppConfigContext';
import { STATE_FOCUS_CONFIG } from '../config/stateFocusConfig';

const FilterStateContext = createContext(null);

/**
 * FilterStateProvider - Manages all filtering state (time, properties, state focus)
 *
 * Consolidates filter state and handlers to eliminate prop drilling
 */
export function FilterStateProvider({ children }) {
  const { socket, isConnected, setStatus } = useSocketContext();
  const { config } = useAppConfig();

  // Time filter state
  const [selectedTimeWindow, setSelectedTimeWindow] = useState('1hr');
  const [timeSelectionMode, setTimeSelectionMode] = useState('preset');
  const [customStartTime, setCustomStartTime] = useState(null);

  // Property filter state
  const [propertyFilters, setPropertyFilters] = useState({});

  // State focus
  const [focusedState, setFocusedState] = useState(null);

  // Initialize selectedTimeWindow from backend config when loaded
  useEffect(() => {
    if (config && config.pinStorage && config.pinStorage.defaultTimeWindow) {
      setSelectedTimeWindow(config.pinStorage.defaultTimeWindow);
    }
  }, [config]);

  // Initialize focusedState from frontend deployment config (one-time on mount)
  useEffect(() => {
    if (STATE_FOCUS_CONFIG && STATE_FOCUS_CONFIG.defaultState) {
      setFocusedState(STATE_FOCUS_CONFIG.defaultState);
    }
  }, []); // Empty deps = run once on mount

  // Time window change handler
  const handleTimeWindowChange = useCallback((newTimeWindow) => {
    setSelectedTimeWindow(newTimeWindow);
    setTimeSelectionMode('preset');
    setCustomStartTime(null); // Clear custom time when switching to preset mode

    if (socket && isConnected && config) {
      const timeWindowMs = config.pinStorage.timeWindowOptions[newTimeWindow];

      // Ensure time window doesn't exceed max age
      const effectiveWindow = Math.min(timeWindowMs, config.pinStorage.maxAge);
      const time = Date.now() - effectiveWindow;

      // Request pins for new time window
      socket.emit('request-pins', { timeWindow: newTimeWindow, startingTime: time });
      setStatus(`Loading pins from last ${newTimeWindow}...`);
    }
  }, [socket, isConnected, config, setStatus]);

  // Custom time submit handler
  const handleCustomTimeSubmit = useCallback((customTimestamp) => {
    if (!socket || !isConnected) {
      setStatus('Not connected to server');
      return;
    }

    // Store custom time and set mode
    setCustomStartTime(customTimestamp);
    setTimeSelectionMode('custom');

    // Format the custom time for display
    const customDate = new Date(customTimestamp);
    const formattedTime = customDate.toLocaleString();

    // Request pins from custom start time
    socket.emit('request-pins', { startingTime: customTimestamp });
    setStatus(`Loading pins from ${formattedTime}...`);
  }, [socket, isConnected, setStatus]);

  // Property filter change handler
  const handlePropertyFilterChange = useCallback((filters) => {
    setPropertyFilters(filters);
  }, []);

  // Focused state change handler
  const handleFocusedStateChange = useCallback((state) => {
    setFocusedState(state);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // Time filter state
    selectedTimeWindow,
    timeSelectionMode,
    customStartTime,

    // Property filter state
    propertyFilters,

    // State focus
    focusedState,

    // Setters
    setSelectedTimeWindow,
    setPropertyFilters,
    setFocusedState,

    // Handlers
    onTimeWindowChange: handleTimeWindowChange,
    onCustomTimeSubmit: handleCustomTimeSubmit,
    onPropertyFilterChange: handlePropertyFilterChange,
    onFocusedStateChange: handleFocusedStateChange,
  }), [
    selectedTimeWindow,
    timeSelectionMode,
    customStartTime,
    propertyFilters,
    focusedState,
    handleTimeWindowChange,
    handleCustomTimeSubmit,
    handlePropertyFilterChange,
    handleFocusedStateChange
  ]);

  return (
    <FilterStateContext.Provider value={value}>
      {children}
    </FilterStateContext.Provider>
  );
}

FilterStateProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * useFilterState - Hook to access filter state
 *
 * @returns {Object} Filter state and handlers
 * @throws {Error} If used outside FilterStateProvider
 */
export function useFilterState() {
  const context = useContext(FilterStateContext);

  if (!context) {
    throw new Error('useFilterState must be used within FilterStateProvider');
  }

  return context;
}
