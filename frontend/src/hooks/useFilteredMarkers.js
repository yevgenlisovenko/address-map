import { useMemo } from 'react';
import { useSocketContext, useAppConfig } from '../contexts';
import { useFilterState } from '../contexts/FilterStateContext';
import { usePropertyFilter } from './usePropertyFilter';

/**
 * useFilteredMarkers - Consolidates two-stage marker filtering
 *
 * Stage 1: Filter by focused state (if any)
 * Stage 2: Filter by time window and properties
 *
 * Returns the final filtered markers ready for display
 */
export function useFilteredMarkers() {
  const { markers } = useSocketContext();
  const { config } = useAppConfig();
  const {
    selectedTimeWindow,
    timeSelectionMode,
    customStartTime,
    propertyFilters,
    focusedState
  } = useFilterState();

  // Stage 1: Filter markers by focused state (if any)
  const stateFocusedMarkers = useMemo(() => {
    if (focusedState) {
      return markers.filter(marker => marker.properties?.state === focusedState);
    }
    return markers;
  }, [markers, focusedState]);

  // Stage 2: Filter markers based on time window AND properties
  const visibleMarkers = usePropertyFilter(
    stateFocusedMarkers,
    config,
    selectedTimeWindow,
    timeSelectionMode,
    customStartTime,
    propertyFilters
  );

  return visibleMarkers;
}
