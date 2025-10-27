import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MarkerPopup from '../map/MarkerPopup';
import './MarkersList.css';

export default function MarkersList({ markers, showAllPins, pinsToShow, onToggleShowAll, onMarkerClick }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const sortedMarkers = [...markers].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Reset expanded state when toggling "Show All"
  useEffect(() => {
    setExpandedIndex(null);
  }, [showAllPins]);

  const handleMarkerClick = (marker, index) => {
    // Toggle expansion: if same item clicked, collapse; otherwise expand new item
    setExpandedIndex(expandedIndex === index ? null : index);
    // Notify parent to pan map to this marker
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  };

  return (
    <div className="markers-list">
      <div className="markers-header">
        <h3>Pins ({markers.length})</h3>
      </div>
      <ul>
        {(showAllPins
          ? [...sortedMarkers].reverse()
          : [...sortedMarkers].reverse().slice(0, pinsToShow)
        ).map((marker, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <li key={index} className={isExpanded ? 'expanded' : ''}>
              <div
                className="marker-summary"
                onClick={() => handleMarkerClick(marker, index)}
              >
                <div className="marker-summary-text">
                  <div className="marker-name">
                    {marker.type === 'address' ? marker.address : marker.displayName}
                  </div>
                  <small>{new Date(marker.timestamp).toLocaleTimeString()}</small>
                </div>
                <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
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
        <button
          className="show-more-button"
          onClick={onToggleShowAll}
        >
          {showAllPins ? 'Show Less' : `Show All (${markers.length})`}
        </button>
      )}
    </div>
  );
}

MarkersList.propTypes = {
  markers: PropTypes.arrayOf(
    PropTypes.shape({
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
