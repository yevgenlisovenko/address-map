/**
 * State Focus Handler
 * Handles auto-zoom to state bounds when a state is focused
 */

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import PropTypes from 'prop-types';
import { getStateBounds, getStateZoomLevel } from '../../utils/stateBounds';
import { DEFAULT_MAP_VIEW } from '../../utils/constants';

function StateFocusHandler({ focusedState, autoZoom = true }) {
  const map = useMap();

  useEffect(() => {
    if (!autoZoom) return;

    if (focusedState) {
      // Get bounds and zoom level for the focused state
      const bounds = getStateBounds(focusedState);
      const zoomLevel = getStateZoomLevel(focusedState);

      if (bounds) {
        const [[minLat, minLon], [maxLat, maxLon]] = bounds;

        // Fly to state bounds with state-specific zoom level
        map.flyToBounds(
          [[minLat, minLon], [maxLat, maxLon]],
          {
            padding: [50, 50],
            duration: 1.5,
            maxZoom: zoomLevel, // State-specific zoom level based on geographic size
          }
        );
      }
    } else {
      // Return to default USA view
      map.flyTo(DEFAULT_MAP_VIEW.center, DEFAULT_MAP_VIEW.zoom, {
        duration: 1.5,
      });
    }
  }, [focusedState, autoZoom, map]);

  return null;
}

StateFocusHandler.propTypes = {
  focusedState: PropTypes.string, // Two-letter state abbreviation or null
  autoZoom: PropTypes.bool,
};

export default StateFocusHandler;
