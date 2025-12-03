import PropTypes from 'prop-types';
import './MapFallback.css';

/**
 * MapFallback Component
 *
 * Fallback UI displayed when the map component encounters an error.
 * Shows a helpful message and lists markers as a table so users can still access the data.
 */
function MapFallback({ markers = [], onReset }) {
  const handleViewSidebar = () => {
    // Trigger sidebar to open if there's a way to do so
    // For now, just inform user
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.click();
    }
  };

  return (
    <div className="map-fallback">
      <div className="map-fallback-content">
        <div className="map-fallback-icon">🗺️</div>
        <h2>Map Unavailable</h2>
        <p className="map-fallback-message">
          The map visualization encountered an error and cannot be displayed.
        </p>

        <div className="map-fallback-actions">
          <button
            onClick={onReset}
            className="map-fallback-button primary"
          >
            Reload Map
          </button>
          <button
            onClick={handleViewSidebar}
            className="map-fallback-button secondary"
          >
            View Pins in Sidebar
          </button>
        </div>

        {markers.length > 0 && (
          <div className="map-fallback-markers">
            <h3>Available Pins ({markers.length})</h3>
            <div className="map-fallback-markers-list">
              <table>
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Coordinates</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {markers.slice(0, 10).map((marker, index) => (
                    <tr key={marker.id || index}>
                      <td>
                        {marker.type === 'address'
                          ? marker.address
                          : marker.displayName || 'Unknown'}
                      </td>
                      <td>
                        {marker.lat.toFixed(4)}, {marker.lon.toFixed(4)}
                      </td>
                      <td>
                        {new Date(marker.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {markers.length > 10 && (
                <p className="map-fallback-more">
                  ... and {markers.length - 10} more pins
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

MapFallback.propTypes = {
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
      timestamp: PropTypes.string.isRequired,
      type: PropTypes.string,
      address: PropTypes.string,
      displayName: PropTypes.string,
    })
  ),
  onReset: PropTypes.func,
};

export default MapFallback;
