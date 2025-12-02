import { useState, memo, useMemo, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { List, useDynamicRowHeight } from 'react-window';
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
  onMarkerClick,
}) {
  const [expandedPinId, setExpandedPinId] = useState(null);
  const listRef = useRef();

  // Use dynamic row height hook for automatic height calculation
  const dynamicRowHeight = useDynamicRowHeight({
    defaultRowHeight: 60  // Base collapsed height
  });

  const handleToggleExpand = useCallback((marker) => {
    const newExpandedId = expandedPinId === marker.id ? null : marker.id;
    setExpandedPinId(newExpandedId);
    // No need to manually reset size cache - useDynamicRowHeight's ResizeObserver handles it
  }, [expandedPinId]);

  const handleLocationClick = useCallback((marker, event) => {
    // Stop propagation to prevent triggering expand/collapse
    event.stopPropagation();
    // Notify parent to pan map to this marker
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  }, [onMarkerClick]);

  // Render function for each row in virtual list
  const Row = useCallback(({ index, style, markers, expandedPinId, handleToggleExpand, handleLocationClick }) => {
    const marker = markers[index];

    return (
      <div
        style={style}
        data-react-window-dynamic-list-item-index={index}
      >
        <MarkerListItem
          marker={marker}
          isExpanded={expandedPinId === marker.id}
          onToggleExpand={() => handleToggleExpand(marker)}
          onLocationClick={(e) => handleLocationClick(marker, e)}
        />
      </div>
    );
  }, []);

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

      <List
        listRef={listRef}
        rowComponent={Row}
        rowCount={markers.length}
        rowHeight={dynamicRowHeight}
        rowProps={{
          markers,
          expandedPinId,
          handleToggleExpand,
          handleLocationClick
        }}
        style={{ height: 600, width: "100%" }}
        className="markers-virtual-list"
        overscanCount={5}
      />
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
  onMarkerClick: PropTypes.func,
};
