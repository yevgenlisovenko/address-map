import { memo } from 'react';
import PropTypes from 'prop-types';
import './MarkerPopup.css';

/**
 * Helper function to convert camelCase to Title Case
 * Example: formCode -> Form Code
 * @param {string} name - Property name in camelCase
 * @returns {string} Property name in Title Case
 */
function formatPropertyName(name) {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Helper function to format property values
 * @param {*} value - Property value (any type)
 * @returns {string} Formatted value string
 */
function formatPropertyValue(value) {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

/**
 * MarkerPopup component - Displays marker information in Leaflet popup
 * Shows header info (location, timestamp) and properties table
 * Memoized to prevent unnecessary re-renders when marker hasn't changed
 */
function MarkerPopup({ marker }) {
  const hasProperties = marker.properties && Object.keys(marker.properties).length > 0;

  return (
    <div className="marker-popup">
      {/* Header: Location/Address */}
      <div className="popup-header">
        {marker.type === "address" ? (
          <>
            <strong className="popup-title">{marker.address}</strong>
            <div className="popup-subtitle">{marker.displayName}</div>
          </>
        ) : (
          <>
            <strong className="popup-title">{marker.displayName}</strong>
            <div className="popup-coordinates">
              Lat: {marker.lat}, Lon: {marker.lon}
            </div>
          </>
        )}

        {/* ID */}
        <div className="popup-id">
          ID: {marker.id}
        </div>

        {/* Timestamp */}
        <div className="popup-timestamp">
          Added: {new Date(marker.timestamp).toLocaleString()}
        </div>
      </div>

      {/* Properties List (only if properties exist) */}
      {hasProperties && (
        <div className="popup-properties">
          <div className="popup-section-title">Properties</div>
          <div className="properties-list">
            {Object.entries(marker.properties).map(([key, value]) => (
              <div key={key} className="property-item">
                <span className="property-name">{formatPropertyName(key)}:</span>{' '}
                <span className="property-value">{formatPropertyValue(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

MarkerPopup.propTypes = {
  marker: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    timestamp: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    type: PropTypes.string,
    address: PropTypes.string,
    properties: PropTypes.object,
  }).isRequired,
};

// Export memoized version - only re-renders if marker reference changes
export default memo(MarkerPopup, (prevProps, nextProps) => {
  // Only re-render if marker reference changed
  return prevProps.marker === nextProps.marker;
});
