import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import MarkerPopup from "../map/MarkerPopup";
import { getMarkerIconUrl } from "../../config/markerColorMapping";
import "./MarkersList.css";

// Helper function to get marker ID (case insensitive)
function getMarkerId(marker) {
  // Check for id or ID property
  if (marker.id !== undefined) return marker.id;
  if (marker.Id !== undefined) return marker.Id;
  if (marker.ID !== undefined) return marker.ID;

  // Fallback: generate unique ID from marker properties
  return `${marker.timestamp}_${marker.lat}_${marker.lon}`;
}

export default function MarkersList({
  markers,
  showAllPins,
  pinsToShow,
  onToggleShowAll,
  onMarkerClick,
  showReturnButton,
  onReturnToView,
}) {
  const [expandedMarkerId, setExpandedMarkerId] = useState(null);
  const sortedMarkers = [...markers].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Reset expanded state when toggling "Show All"
  useEffect(() => {
    setExpandedMarkerId(null);
  }, [showAllPins]);

  const handleToggleExpand = (marker) => {
    // Toggle expansion: if same item clicked, collapse; otherwise expand new item
    const markerId = getMarkerId(marker);
    setExpandedMarkerId(expandedMarkerId === markerId ? null : markerId);
  };

  const handleLocationClick = (marker, event) => {
    // Stop propagation to prevent triggering expand/collapse
    event.stopPropagation();
    // Notify parent to pan map to this marker
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  };

  // Show empty state when no markers
  if (markers.length === 0) {
    return (
      <div className="markers-list">
        <div className="markers-header">
          <h3>Pins (0)</h3>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📍</div>
          <div className="empty-state-message">No pins to display</div>
          <div className="empty-state-submessage">
            Select a time window in the Filter tab to view pins
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="markers-list">
      <div className="markers-header">
        <h3>Pins ({markers.length})</h3>
        {showReturnButton && (
          <button
            className="return-to-view-button"
            onClick={onReturnToView}
            title="Reset to default view"
          >
            🏠 Reset View
          </button>
        )}
      </div>
      <ul>
        {(showAllPins
          ? [...sortedMarkers].reverse()
          : [...sortedMarkers].reverse().slice(0, pinsToShow)
        ).map((marker, index) => {
          const markerId = getMarkerId(marker);
          const isExpanded = expandedMarkerId === markerId;
          return (
            <li key={markerId} className={isExpanded ? "expanded" : ""}>
              <div
                className="marker-summary"
                onClick={() => handleToggleExpand(marker)}
              >
                <img
                  src={getMarkerIconUrl(marker)}
                  alt="marker icon"
                  className="marker-icon"
                />
                <div className="marker-summary-text">
                  <div className="marker-name">
                    {marker.type === "address"
                      ? marker.address
                      : marker.displayName}
                  </div>
                  <small>
                    {new Date(marker.timestamp).toLocaleTimeString()}
                  </small>
                </div>
                <button
                  className="location-button"
                  onClick={(e) => handleLocationClick(marker, e)}
                  title="Show on map"
                  aria-label="Show on map"
                >
                  📍
                </button>
                <span className={`expand-icon ${isExpanded ? "expanded" : ""}`}>
                  ▼
                </span>
              </div>
              {isExpanded && (
                <div className="marker-details">
                  <MarkerPopup marker={marker} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {markers.length > pinsToShow && (
        <button className="show-more-button" onClick={onToggleShowAll}>
          {showAllPins ? "Show Less" : `Show All (${markers.length})`}
        </button>
      )}
    </div>
  );
}

MarkersList.propTypes = {
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
      timestamp: PropTypes.string.isRequired,
      type: PropTypes.string,
      address: PropTypes.string,
      displayName: PropTypes.string,
      properties: PropTypes.object,
    })
  ).isRequired,
  showAllPins: PropTypes.bool.isRequired,
  pinsToShow: PropTypes.number.isRequired,
  onToggleShowAll: PropTypes.func.isRequired,
  onMarkerClick: PropTypes.func,
  showReturnButton: PropTypes.bool,
  onReturnToView: PropTypes.func,
};
