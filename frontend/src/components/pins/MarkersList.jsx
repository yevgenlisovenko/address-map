import { useState, useEffect, memo, useMemo } from "react";
import PropTypes from "prop-types";
import MarkerPopup from "../map/MarkerPopup";
import { getMarkerIconUrl } from "../../config/markerColorMapping";
import "./MarkersList.css";

// Memoized individual list item to prevent unnecessary re-renders
// Only re-renders when marker data or isExpanded state actually changes
const MarkerListItem = memo(({
  marker,
  isExpanded,
  onToggleExpand,
  onLocationClick
}) => {
  // Memoize expensive icon URL lookup (now cached, but still worth memoizing)
  const iconUrl = useMemo(() =>
    getMarkerIconUrl(marker),
    [marker.id, marker.properties]
  );

  // Memoize expensive date formatting
  const formattedTime = useMemo(() =>
    new Date(marker.timestamp).toLocaleTimeString(),
    [marker.timestamp]
  );

  // Memoize marker name computation
  const markerName = useMemo(() =>
    marker.type === "address" ? marker.address : marker.displayName,
    [marker.type, marker.address, marker.displayName]
  );

  return (
    <li className={isExpanded ? "expanded" : ""}>
      <div
        className="marker-summary"
        onClick={onToggleExpand}
      >
        <img
          src={iconUrl}
          alt="marker icon"
          className="marker-icon"
        />
        <div className="marker-summary-text">
          <div className="marker-name">{markerName}</div>
          <small>{formattedTime}</small>
        </div>
        <button
          className="location-button"
          onClick={onLocationClick}
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
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if these specific props changed
  return (
    prevProps.marker.id === nextProps.marker.id &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.marker.timestamp === nextProps.marker.timestamp &&
    prevProps.marker.properties === nextProps.marker.properties
  );
});

MarkerListItem.displayName = 'MarkerListItem';

MarkerListItem.propTypes = {
  marker: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    timestamp: PropTypes.string.isRequired,
    type: PropTypes.string,
    address: PropTypes.string,
    displayName: PropTypes.string,
    properties: PropTypes.object,
  }).isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onToggleExpand: PropTypes.func.isRequired,
  onLocationClick: PropTypes.func.isRequired,
};

export default function MarkersList({
  markers,
  showAllPins,
  pinsToShow,
  onToggleShowAll,
  onMarkerClick,
}) {
  const [expandedPinId, setExpandedPinId] = useState(null);

  // Reset expanded state when toggling "Show All"
  useEffect(() => {
    setExpandedPinId(null);
  }, [showAllPins]);

  const handleToggleExpand = (marker) => {
    // Toggle expansion: if same item clicked, collapse; otherwise expand new item
    setExpandedPinId(expandedPinId === marker.id ? null : marker.id);
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
      </div>
      <ul>
        {(showAllPins
          ? markers
          : markers.slice(0, pinsToShow)
        ).map((marker) => (
          <MarkerListItem
            key={marker.id}
            marker={marker}
            isExpanded={expandedPinId === marker.id}
            onToggleExpand={() => handleToggleExpand(marker)}
            onLocationClick={(e) => handleLocationClick(marker, e)}
          />
        ))}
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
};
