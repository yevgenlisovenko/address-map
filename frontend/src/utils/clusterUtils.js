/**
 * Cluster Utilities
 *
 * Functions for creating type-aware cluster icons
 * Uses marker type detection from markerColorMapping.js
 */

import L from 'leaflet';
import { getMarkerType, MARKER_TYPE_CONFIG, PROPERTY_ICON_CONFIG, DEPLOYMENT_CONFIG } from '../config/markerColorMapping';

/**
 * Count markers by type within a cluster
 * @param {Array} markers - Array of marker objects
 * @returns {Object} Type counts {typeId: count, ...}
 */
export function getMarkerTypeCounts(markers) {
  const typeCounts = {};

  markers.forEach(marker => {
    // Extract the marker data from the Leaflet marker object
    const markerData = marker.options?.markerData || marker;
    const type = getMarkerType(markerData);

    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  return typeCounts;
}

/**
 * Get the dominant (most common) type in a cluster
 * @param {Object} typeCounts - Type counts object from getMarkerTypeCounts
 * @returns {Array} [typeId, count] of dominant type
 */
export function getDominantType(typeCounts) {
  return Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])[0];
}

/**
 * Create type-aware cluster icon
 * Shows dominant type's color with optional mixed-type badge
 * @param {Object} cluster - Leaflet MarkerCluster object
 * @param {Object} config - Clustering configuration
 * @returns {L.DivIcon} Leaflet div icon
 */
export function createTypeAwareClusterIcon(cluster, config = {}) {
  const markers = cluster.getAllChildMarkers();
  const count = markers.length;

  // Count markers by type
  const typeCounts = getMarkerTypeCounts(markers);

  // Get dominant type
  const [dominantType] = getDominantType(typeCounts);

  // Get type config for dominant type
  const typeConfig = MARKER_TYPE_CONFIG[dominantType] || MARKER_TYPE_CONFIG.default;

  // Determine if cluster has mixed types
  const typeCount = Object.keys(typeCounts).length;
  const isMixed = typeCount > 1;

  // Determine cluster size class
  let sizeClass = 'small';
  let iconSize = 40;
  if (count > 100) {
    sizeClass = 'large';
    iconSize = 55;
  } else if (count > 10) {
    sizeClass = 'medium';
    iconSize = 47;
  }

  // Build mixed badge if applicable
  const mixedBadge = (isMixed && config?.typeAware?.showMixedBadge)
    ? `<span class="cluster-mixed-badge">+${typeCount - 1}</span>`
    : '';

  // Create icon HTML
  const iconHTML = `
    <div class="cluster-inner" style="background-color: ${typeConfig.color};">
      <span class="cluster-count">${count}</span>
      ${mixedBadge}
    </div>
  `;

  return L.divIcon({
    html: iconHTML,
    className: `marker-cluster-smart marker-cluster-${sizeClass}`,
    iconSize: L.point(iconSize, iconSize, true)
  });
}

/**
 * Get descriptive label for a marker type
 * Uses groupLabels when autoGroupDuplicates is enabled, matching MapLegend behavior
 * Falls back to individual labels from PROPERTY_ICON_CONFIG, then generic label
 * @param {string} type - Marker type ID (iconId)
 * @param {Object} typeConfig - Type config from MARKER_TYPE_CONFIG
 * @returns {string} Descriptive label (e.g., "GEICO" or "Homeowners (HO3)")
 */
function getDescriptiveLabel(type, typeConfig) {
  // Get legend config from deployment config
  const legendConfig = DEPLOYMENT_CONFIG?.legend || {
    autoGroupDuplicates: false,
    groupLabels: {},
  };

  // If auto-grouping is enabled and a group label exists, use it
  if (legendConfig.autoGroupDuplicates && legendConfig.groupLabels[type]) {
    return legendConfig.groupLabels[type];
  }

  // Otherwise, search PROPERTY_ICON_CONFIG for matching iconId to get individual label
  for (const [property, values] of Object.entries(PROPERTY_ICON_CONFIG)) {
    for (const [value, iconData] of Object.entries(values)) {
      if (iconData.iconId === type) {
        return iconData.label;
      }
    }
  }

  // Fallback to generic label if not found
  return typeConfig.label;
}

/**
 * Create tooltip content showing type breakdown
 * @param {Object} cluster - Leaflet MarkerCluster object
 * @returns {string} HTML string for tooltip
 */
export function createClusterTooltipContent(cluster) {
  const markers = cluster.getAllChildMarkers();
  const typeCounts = getMarkerTypeCounts(markers);

  // Sort by count descending
  const sortedTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1]);

  // Build HTML
  const rows = sortedTypes.map(([type, count]) => {
    const typeConfig = MARKER_TYPE_CONFIG[type] || MARKER_TYPE_CONFIG.default;
    const descriptiveLabel = getDescriptiveLabel(type, typeConfig);
    return `
      <div class="cluster-tooltip-row">
        <span class="cluster-tooltip-dot" style="background-color: ${typeConfig.color};"></span>
        <span class="cluster-tooltip-label">${descriptiveLabel}:</span>
        <span class="cluster-tooltip-count">${count}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="cluster-tooltip-content">
      <div class="cluster-tooltip-header">Cluster Breakdown</div>
      ${rows}
    </div>
  `;
}
