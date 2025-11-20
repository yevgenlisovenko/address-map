/**
 * Popup Content Formatter
 *
 * Utility for formatting marker popup content as HTML string for Leaflet.
 * Matches MarkerPopup.jsx component structure and CSS classes.
 */

/**
 * Format property name from camelCase to Title Case
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
 * Format property value for display
 * @param {*} value - Property value (any type)
 * @returns {string} Formatted value string
 */
function formatPropertyValue(value) {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

/**
 * Formats marker data as HTML string for Leaflet popup
 * Matches MarkerPopup.jsx component structure and CSS classes
 * @param {Object} marker - Marker object with properties
 * @returns {string} HTML string for popup content
 */
export function formatPopupContent(marker) {
  let html = '<div class="marker-popup">';

  // Header section
  html += '<div class="popup-header">';

  // Different rendering based on marker type
  if (marker.type === "address") {
    html += `<strong class="popup-title">${marker.address}</strong>`;
    html += `<div class="popup-subtitle">${marker.displayName}</div>`;
  } else {
    html += `<strong class="popup-title">${marker.displayName}</strong>`;
    html += `<div class="popup-coordinates">Lat: ${marker.lat}, Lon: ${marker.lon}</div>`;
  }

  // ID
  html += `<div class="popup-id">ID: ${marker.id}</div>`;

  // Timestamp
  html += `<div class="popup-timestamp">Added: ${new Date(marker.timestamp).toLocaleString()}</div>`;

  html += '</div>'; // end popup-header

  // Properties section (only if properties exist)
  if (marker.properties && Object.keys(marker.properties).length > 0) {
    html += '<div class="popup-properties">';
    html += '<div class="popup-section-title">Properties</div>';
    html += '<div class="properties-list">';

    Object.entries(marker.properties).forEach(([key, value]) => {
      html += '<div class="property-item">';
      html += `<span class="property-name">${formatPropertyName(key)}:</span> `;
      html += `<span class="property-value">${formatPropertyValue(value)}</span>`;
      html += '</div>';
    });

    html += '</div>'; // end properties-list
    html += '</div>'; // end popup-properties
  }

  html += '</div>'; // end marker-popup
  return html;
}
