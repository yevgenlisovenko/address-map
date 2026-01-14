import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

const MapInteractionContext = createContext(null);

/**
 * MapInteractionProvider - Manages map-specific interaction state
 *
 * Handles marker panning, pan triggers, and pin detail viewing
 */
export function MapInteractionProvider({ children }) {
  const [markerToPan, setMarkerToPan] = useState(null);
  const [panTrigger, setPanTrigger] = useState(0);
  const [isViewingPinDetail, setIsViewingPinDetail] = useState(false);

  // Marker click handler - triggers map pan to marker
  const handleMarkerClick = useCallback((marker) => {
    setMarkerToPan(marker);
    setPanTrigger(prev => prev + 1);
    setIsViewingPinDetail(true);
  }, []);

  // Auto-reset markerToPan and panTrigger after panning completes
  // This prevents auto-zoom when new markers arrive
  useEffect(() => {
    if (panTrigger > 0 && markerToPan) {
      const timer = setTimeout(() => {
        setMarkerToPan(null);
        setPanTrigger(0);
      }, 1600); // Slightly longer than animation duration (1.5s)

      return () => clearTimeout(timer);
    }
  }, [panTrigger, markerToPan]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // State
    markerToPan,
    panTrigger,
    isViewingPinDetail,

    // Setters
    setIsViewingPinDetail,

    // Handlers
    onMarkerClick: handleMarkerClick,
  }), [markerToPan, panTrigger, isViewingPinDetail, handleMarkerClick]);

  return (
    <MapInteractionContext.Provider value={value}>
      {children}
    </MapInteractionContext.Provider>
  );
}

MapInteractionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * useMapInteraction - Hook to access map interaction state
 *
 * @returns {Object} Map interaction state and handlers
 * @throws {Error} If used outside MapInteractionProvider
 */
export function useMapInteraction() {
  const context = useContext(MapInteractionContext);

  if (!context) {
    throw new Error('useMapInteraction must be used within MapInteractionProvider');
  }

  return context;
}
