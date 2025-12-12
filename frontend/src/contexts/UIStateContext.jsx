import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { MAP_CONFIG } from '../config/mapConfig';

const UIStateContext = createContext(null);

/**
 * Get initial clustering state from multiple sources with priority:
 * 1. localStorage user preference (highest priority)
 * 2. Environment variable override
 * 3. Deployment config default (fallback)
 */
function getInitialClusteringState() {
  // Check localStorage for user preference
  const saved = localStorage.getItem('clustering-enabled');
  if (saved !== null) {
    return saved === 'true';
  }

  // Check environment variable override
  if (import.meta.env.VITE_CLUSTERING_INITIAL_ENABLED !== undefined) {
    return import.meta.env.VITE_CLUSTERING_INITIAL_ENABLED === 'true';
  }

  // Fall back to deployment config
  return MAP_CONFIG?.clustering?.enabled ?? false;
}

/**
 * Get initial map legend visibility state with priority:
 * 1. localStorage user preference (highest priority)
 * 2. Environment variable override
 * 3. Default: true
 */
function getInitialLegendState() {
  // Check localStorage for user preference
  const saved = localStorage.getItem('map-legend-visible');
  if (saved !== null) {
    return saved === 'true';
  }

  // Check environment variable override
  if (import.meta.env.VITE_LEGEND_INITIAL_VISIBLE !== undefined) {
    return import.meta.env.VITE_LEGEND_INITIAL_VISIBLE !== 'false';
  }

  // Default to visible
  return true;
}

/**
 * Get initial info panel visibility state with priority:
 * 1. localStorage user preference (highest priority)
 * 2. Environment variable override
 * 3. Default: true
 */
function getInitialInfoPanelState() {
  // Check localStorage for user preference
  const saved = localStorage.getItem('info-panel-visible');
  if (saved !== null) {
    return saved === 'true';
  }

  // Check environment variable override
  if (import.meta.env.VITE_INFO_PANEL_INITIAL_VISIBLE !== undefined) {
    return import.meta.env.VITE_INFO_PANEL_INITIAL_VISIBLE !== 'false';
  }

  // Default to visible
  return true;
}

/**
 * UIStateProvider - Manages UI visibility state for panels, sidebar, and legend
 *
 * Centralizes all UI visibility toggles to eliminate prop drilling
 */
export function UIStateProvider({ children }) {
  // Sidebar visibility (from env var, default: false)
  const [isSidebarVisible, setIsSidebarVisible] = useState(
    import.meta.env.VITE_SIDEBAR_INITIAL_VISIBLE === 'true'
  );

  // Map legend visibility (from localStorage → env var → default: true)
  const [showMapLegend, setShowMapLegend] = useState(getInitialLegendState);

  // Info panel visibility (from localStorage → env var → default: true)
  const [showInfoPanel, setShowInfoPanel] = useState(getInitialInfoPanelState);

  // Clustering enabled state (from localStorage → env var → config, default: false)
  const [clusteringEnabled, setClusteringEnabled] = useState(getInitialClusteringState);

  // Toggle sidebar helper
  const toggleSidebar = useCallback(() => {
    setIsSidebarVisible(prev => !prev);
  }, []);

  // Toggle map legend helper with localStorage persistence
  const toggleMapLegend = useCallback(() => {
    setShowMapLegend(prev => {
      const newValue = !prev;
      try {
        localStorage.setItem('map-legend-visible', String(newValue));
      } catch (e) {
        console.warn('Could not persist map legend preference:', e);
      }
      return newValue;
    });
  }, []);

  // Toggle info panel helper with localStorage persistence
  const toggleInfoPanel = useCallback(() => {
    setShowInfoPanel(prev => {
      const newValue = !prev;
      try {
        localStorage.setItem('info-panel-visible', String(newValue));
      } catch (e) {
        console.warn('Could not persist info panel preference:', e);
      }
      return newValue;
    });
  }, []);

  // Toggle clustering helper with localStorage persistence
  const toggleClustering = useCallback(() => {
    setClusteringEnabled(prev => {
      const newValue = !prev;
      try {
        localStorage.setItem('clustering-enabled', String(newValue));
      } catch (e) {
        // Handle quota exceeded or localStorage disabled (e.g., private browsing)
        console.warn('Could not persist clustering preference:', e);
      }
      return newValue;
    });
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // State
    isSidebarVisible,
    showMapLegend,
    showInfoPanel,
    clusteringEnabled,

    // Setters
    setIsSidebarVisible,
    setShowMapLegend,
    setShowInfoPanel,
    setClusteringEnabled,

    // Helpers
    toggleSidebar,
    toggleMapLegend,
    toggleInfoPanel,
    toggleClustering,
  }), [isSidebarVisible, showMapLegend, showInfoPanel, clusteringEnabled, toggleSidebar, toggleMapLegend, toggleInfoPanel, toggleClustering]);

  return (
    <UIStateContext.Provider value={value}>
      {children}
    </UIStateContext.Provider>
  );
}

UIStateProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * useUIState - Hook to access UI state
 *
 * @returns {Object} UI state and setters
 * @throws {Error} If used outside UIStateProvider
 */
export function useUIState() {
  const context = useContext(UIStateContext);

  if (!context) {
    throw new Error('useUIState must be used within UIStateProvider');
  }

  return context;
}
