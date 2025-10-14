import { useState } from 'react';
import { PROPERTY_MARKERS_MAP, defaultMarkerIcon } from '../config/markerColorMapping';

export default function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(false);

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

  if (!hasMappings) {
    return null;
  }

  return (
    <div className={`map-legend ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div
        className="legend-header"
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? 'Click to collapse' : 'Click to expand'}
      >
        <span className="legend-title">Legend</span>
        <span className="legend-toggle">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className="legend-content">
          {Object.entries(PROPERTY_MARKERS_MAP).map(([propertyName, valueMap]) => (
            <div key={propertyName} className="legend-section">
              {/* <div className="legend-section-title">{formatPropertyName(propertyName)}</div> */}
              <div className="legend-items">
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
            </div>
          ))}

          {/* Show default marker */}
          {/* <div className="legend-section">
            <div className="legend-section-title">Default</div>
            <div className="legend-items">
              <div className="legend-item">
                {getIconUrl(defaultMarkerIcon) && (
                  <img
                    src={getIconUrl(defaultMarkerIcon)}
                    alt="Default"
                    className="legend-marker-icon"
                  />
                )}
                <span className="legend-marker-label">No match</span>
              </div>
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
}
