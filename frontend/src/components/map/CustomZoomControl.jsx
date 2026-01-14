import { useMap } from 'react-leaflet';
import PropTypes from 'prop-types';
import { DEFAULT_MAP_VIEW } from '../../utils/constants';
import { getStateBounds, getStateZoomLevel } from '../../utils/stateBounds';
import StateSelectorControl from './StateSelectorControl';
import './CustomZoomControl.css';

function CustomZoomControl({ focusedState, setFocusedState, stateFocusConfig, isViewingPinDetail, setIsViewingPinDetail }) {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn(1.0);
  };

  const handleZoomOut = () => {
    map.zoomOut(1.0);
  };

  const handleReset = () => {
    if (isViewingPinDetail && focusedState) {
      // First reset: return to state view
      const bounds = getStateBounds(focusedState);
      const zoomLevel = getStateZoomLevel(focusedState);
      if (bounds) {
        map.flyToBounds(bounds, {
          padding: [50, 50],
          duration: 1.5,
          maxZoom: zoomLevel
        });
      }
      if (setIsViewingPinDetail) {
        setIsViewingPinDetail(false);
      }
    } else if (focusedState) {
      // Second reset: return to USA and clear state
      if (setFocusedState) {
        setFocusedState(null);
      }
      map.flyTo(DEFAULT_MAP_VIEW.center, DEFAULT_MAP_VIEW.zoom, {
        duration: 1.5
      });
    } else {
      // No state focused: return to USA
      map.flyTo(DEFAULT_MAP_VIEW.center, DEFAULT_MAP_VIEW.zoom, {
        duration: 1.5
      });
    }
  };

  return (
    <div className="custom-zoom-control">
      <button
        onClick={handleZoomIn}
        title="Zoom in"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        onClick={handleZoomOut}
        title="Zoom out"
        aria-label="Zoom out"
      >
        −
      </button>
      <button
        onClick={handleReset}
        title="Reset view"
        aria-label="Reset view"
        className="reset-button"
      >
        🏠
      </button>

      {/* State selector control (if enabled) */}
      {stateFocusConfig?.enabled && (
        <StateSelectorControl
          value={focusedState}
          onChange={setFocusedState}
          availableStates={stateFocusConfig.availableStates}
        />
      )}
    </div>
  );
}

CustomZoomControl.propTypes = {
  focusedState: PropTypes.string,
  setFocusedState: PropTypes.func,
  stateFocusConfig: PropTypes.shape({
    enabled: PropTypes.bool,
    defaultState: PropTypes.string,
    availableStates: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    autoZoom: PropTypes.bool,
    highlightColor: PropTypes.string,
  }),
  isViewingPinDetail: PropTypes.bool,
  setIsViewingPinDetail: PropTypes.func,
};

export default CustomZoomControl;
