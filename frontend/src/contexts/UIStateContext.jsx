import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

const UIStateContext = createContext(null);

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

  // Map legend visibility (from env var, default: true)
  const [showMapLegend, setShowMapLegend] = useState(
    import.meta.env.VITE_LEGEND_INITIAL_VISIBLE !== 'false'
  );

  // Info panel visibility (from env var, default: true)
  const [showInfoPanel, setShowInfoPanel] = useState(
    import.meta.env.VITE_INFO_PANEL_INITIAL_VISIBLE !== 'false'
  );

  // Toggle sidebar helper
  const toggleSidebar = useCallback(() => {
    setIsSidebarVisible(prev => !prev);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // State
    isSidebarVisible,
    showMapLegend,
    showInfoPanel,

    // Setters
    setIsSidebarVisible,
    setShowMapLegend,
    setShowInfoPanel,

    // Helpers
    toggleSidebar,
  }), [isSidebarVisible, showMapLegend, showInfoPanel, toggleSidebar]);

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
