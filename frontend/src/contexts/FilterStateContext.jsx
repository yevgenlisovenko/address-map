import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSocketContext } from './SocketContext';
import { useAppConfig } from './AppConfigContext';
import { STATE_FOCUS_CONFIG } from '../config/stateFocusConfig';

const FilterStateContext = createContext(null);

/**
 * Get initial time selection state from multiple sources with priority:
 * 1. localStorage user preference (highest priority) - with validation
 * 2. Environment variable override
 * 3. Backend config default (fallback)
 *
 * @param {Object} config - Backend config object with pinStorage settings
 * @returns {Object} { mode, selectedTimeWindow, customStartTime }
 */
function getInitialTimeState(config) {
  const PIN_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Try localStorage first
  try {
    const saved = localStorage.getItem('time-selection');
    if (saved) {
      const parsed = JSON.parse(saved);

      // Validate preset mode
      if (parsed.mode === 'preset' && parsed.selectedTimeWindow) {
        // Check if time window exists in config (if config loaded)
        if (!config || !config.pinStorage?.timeWindowOptions ||
            config.pinStorage.timeWindowOptions[parsed.selectedTimeWindow]) {
          return {
            mode: 'preset',
            selectedTimeWindow: parsed.selectedTimeWindow,
            customStartTime: null
          };
        }
      }

      // Validate custom mode
      if (parsed.mode === 'custom' && parsed.customStartTime) {
        const age = Date.now() - parsed.customStartTime;
        // Only restore if custom time is still within max age
        if (age <= PIN_MAX_AGE && age >= 0) {
          return {
            mode: 'custom',
            // Keep selectedTimeWindow at default for dropdown display
            selectedTimeWindow: import.meta.env.VITE_DEFAULT_TIME_WINDOW ||
                                config?.pinStorage?.defaultTimeWindow ||
                                '1 hour',
            customStartTime: parsed.customStartTime
          };
        }
      }
    }
  } catch (e) {
    console.warn('Could not load time selection from localStorage:', e);
  }

  // Try environment variable override
  if (import.meta.env.VITE_DEFAULT_TIME_WINDOW !== undefined) {
    return {
      mode: 'preset',
      selectedTimeWindow: import.meta.env.VITE_DEFAULT_TIME_WINDOW,
      customStartTime: null
    };
  }

  // Fall back to backend config or hardcoded default
  return {
    mode: 'preset',
    selectedTimeWindow: config?.pinStorage?.defaultTimeWindow || '1 hour',
    customStartTime: null
  };
}

/**
 * FilterStateProvider - Manages all filtering state (time, properties, state focus)
 *
 * Consolidates filter state and handlers to eliminate prop drilling
 */
export function FilterStateProvider({ children }) {
  const { socket, isConnected, setStatus } = useSocketContext();
  const { config } = useAppConfig();

  // Get initial time state from localStorage/env/config
  const initialTimeState = useMemo(() => getInitialTimeState(config), [config]);

  // Time filter state (initialized from localStorage → env var → config)
  const [selectedTimeWindow, setSelectedTimeWindow] = useState(initialTimeState.selectedTimeWindow);
  const [timeSelectionMode, setTimeSelectionMode] = useState(initialTimeState.mode);
  const [customStartTime, setCustomStartTime] = useState(initialTimeState.customStartTime);

  // Property filter state
  const [propertyFilters, setPropertyFilters] = useState({});

  // State focus
  const [focusedState, setFocusedState] = useState(null);

  // Update time state when config loads (respects localStorage if present)
  useEffect(() => {
    if (config) {
      const timeState = getInitialTimeState(config);
      setSelectedTimeWindow(timeState.selectedTimeWindow);
      setTimeSelectionMode(timeState.mode);
      setCustomStartTime(timeState.customStartTime);

      // If custom time was restored, request pins from backend
      if (timeState.mode === 'custom' && timeState.customStartTime && socket && isConnected) {
        const customDate = new Date(timeState.customStartTime);
        const formattedTime = customDate.toLocaleString();
        socket.emit('request-pins', { startingTime: timeState.customStartTime });
        setStatus(`Loading pins from ${formattedTime}...`);
      }
      // If preset time was restored, request pins for that window
      else if (timeState.mode === 'preset' && timeState.selectedTimeWindow && socket && isConnected) {
        const timeWindowMs = config.pinStorage.timeWindowOptions[timeState.selectedTimeWindow];
        if (timeWindowMs) {
          const effectiveWindow = Math.min(timeWindowMs, config.pinStorage.maxAge);
          const time = Date.now() - effectiveWindow;
          socket.emit('request-pins', { timeWindow: timeState.selectedTimeWindow, startingTime: time });
          setStatus(`Loading pins from last ${timeState.selectedTimeWindow}...`);
        }
      }
    }
  }, [config, socket, isConnected, setStatus]);

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

    // Persist to localStorage
    try {
      localStorage.setItem('time-selection', JSON.stringify({
        mode: 'preset',
        selectedTimeWindow: newTimeWindow,
        customStartTime: null
      }));
    } catch (e) {
      console.warn('Could not persist time selection:', e);
    }

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

    // Persist to localStorage
    try {
      localStorage.setItem('time-selection', JSON.stringify({
        mode: 'custom',
        selectedTimeWindow: null,
        customStartTime: customTimestamp
      }));
    } catch (e) {
      console.warn('Could not persist time selection:', e);
    }

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
