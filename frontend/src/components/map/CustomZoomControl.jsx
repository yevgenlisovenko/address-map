import { useMap } from 'react-leaflet';
import { DEFAULT_MAP_VIEW } from '../../utils/constants';
import './CustomZoomControl.css';

function CustomZoomControl() {
  const map = useMap();

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleReset = () => {
    map.flyTo(DEFAULT_MAP_VIEW.center, DEFAULT_MAP_VIEW.zoom, {
      duration: 1.5
    });
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
    </div>
  );
}

export default CustomZoomControl;
