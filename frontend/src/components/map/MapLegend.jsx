import { useState } from 'react';
import PropTypes from 'prop-types';
import { PROPERTY_MARKERS_MAP, defaultMarkerIcon } from '../../config/markerColorMapping';
import './MapLegend.css';

export default function MapLegend({ stateHighlightData = { colors: {}, groups: [] } }) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get all marker icon URLs for display
  const getIconUrl = (icon) => {
    if (icon && icon.options && icon.options.iconUrl) {
      return icon.options.iconUrl;
    }
    return null;
  };

  // Format property name for display (camelCase to Title Case)
  const formatPropertyName = (propertyName) => {
    return propertyName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Check if legend should be shown based on environment variable
  const showLegend = import.meta.env.VITE_SHOW_LEGEND !== 'false';

  if (!showLegend) {
    return null;
  }

  // Check if there are any mappings to display
  const hasMappings = Object.keys(PROPERTY_MARKERS_MAP).length > 0;

  // Check if we have state highlight groups with labels
  const hasStateHighlights = stateHighlightData?.groups?.length > 0;

  // Show legend if we have either marker mappings or state highlights
  const hasAnyLegendItems = hasMappings || hasStateHighlights;

  if (!hasAnyLegendItems) {
    return null;
  }

  return (
    <div className={`map-legend ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div
        className="legend-header"
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? 'Click to collapse' : 'Click to expand'}
      >
        <span className="legend-title">🗺️ Legend</span>
        <span className="legend-toggle">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className="legend-content">
          {/* Marker property legends */}
          {hasMappings && (
            <div className="legend-section">
              {/* <div className="legend-section-title">Markers</div> */}
              <div className="legend-items">
                {Object.entries(PROPERTY_MARKERS_MAP).map(([propertyName, valueMap]) => (
                  <div key={propertyName}>
                    {Object.entries(valueMap).map(([value, icon]) => {
                      const iconUrl = getIconUrl(icon);
                      return (
                        <div key={value} className="legend-item">
                          {iconUrl && (
                            <img
                              src={iconUrl}
                              alt={value}
                              className="legend-marker-icon"
                            />
                          )}
                          <span className="legend-marker-label">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* State highlights legend */}
          {hasStateHighlights && (
            <div className="legend-section">
              <div className="legend-section-title">State Highlights</div>
              <div className="legend-items">
                {stateHighlightData.groups.map((group, index) => (
                  <div key={index} className="legend-item">
                    <div
                      className="legend-color-box"
                      style={{ backgroundColor: group.color }}
                      title={`${group.states.length} states`}
                    />
                    <span className="legend-state-label">{group.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

MapLegend.propTypes = {
  stateHighlightData: PropTypes.shape({
    colors: PropTypes.object,
    groups: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        color: PropTypes.string,
        states: PropTypes.arrayOf(PropTypes.string),
      })
    ),
  }),
};
