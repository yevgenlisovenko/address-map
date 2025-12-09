import { useEffect, useRef } from 'react';
import { useSocketContext } from '../contexts';
import { NEW_MARKER_HIGHLIGHT_CONFIG } from '../config/newMarkerHighlightConfig';

/**
 * useMarkerHighlight - Auto-clear __isNew flag after configured duration
 *
 * Manages individual timeouts per marker to clear the highlight flag
 * after the specified duration. Handles cleanup for removed markers.
 *
 * Extracts complex timeout management logic from App.jsx
 */
export function useMarkerHighlight() {
  const { markers, setMarkers } = useSocketContext();
  const timeoutMapRef = useRef(new Map()); // Stores marker.id -> timeoutId

  useEffect(() => {
    // Skip if feature is disabled - clear any existing timeouts
    if (!NEW_MARKER_HIGHLIGHT_CONFIG || !NEW_MARKER_HIGHLIGHT_CONFIG.enabled) {
      timeoutMapRef.current.forEach(timerId => clearTimeout(timerId));
      timeoutMapRef.current.clear();
      return;
    }

    // Find NEW markers that don't already have timeouts scheduled
    const newMarkers = markers.filter(
      marker => marker.__isNew && !timeoutMapRef.current.has(marker.id)
    );

    const duration = NEW_MARKER_HIGHLIGHT_CONFIG.duration || 4000;

    // Create individual timeout for each new marker
    newMarkers.forEach(marker => {
      const timerId = setTimeout(() => {
        // Clear __isNew flag for THIS specific marker only
        setMarkers(prevMarkers =>
          prevMarkers.map(m =>
            m.id === marker.id ? { ...m, __isNew: false } : m
          )
        );
        // Remove from timeout map after clearing
        timeoutMapRef.current.delete(marker.id);
      }, duration);

      // Store timeout ID for this marker
      timeoutMapRef.current.set(marker.id, timerId);
    });

    // Cleanup timeouts for markers that were removed from array (filtered out, etc.)
    const currentMarkerIds = new Set(markers.map(m => m.id));
    timeoutMapRef.current.forEach((timerId, markerId) => {
      if (!currentMarkerIds.has(markerId)) {
        clearTimeout(timerId);
        timeoutMapRef.current.delete(markerId);
      }
    });

    // Cleanup: clear all pending timeouts on unmount
    return () => {
      timeoutMapRef.current.forEach(timerId => clearTimeout(timerId));
      timeoutMapRef.current.clear();
    };
  }, [markers, setMarkers]);
}
