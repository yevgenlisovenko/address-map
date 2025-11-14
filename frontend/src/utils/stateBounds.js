/**
 * State Bounds Utility
 * Calculates bounding boxes for US states from GeoJSON data
 */

import usStatesGeoJSON from '../assets/geoJSON/us-states.json';

/**
 * Calculate bounding box from polygon coordinates
 * @param {Array} coordinates - Polygon or MultiPolygon coordinates
 * @param {string} geometryType - "Polygon" or "MultiPolygon"
 * @returns {Array} - [[minLat, minLon], [maxLat, maxLon]]
 */
function calculateBounds(coordinates, geometryType) {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  /**
   * Process a single coordinate array [lon, lat]
   */
  function processCoordinate(coord) {
    const [lon, lat] = coord;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
  }

  /**
   * Recursively process coordinate arrays
   */
  function processCoordinates(coords) {
    if (Array.isArray(coords)) {
      // Check if this is a coordinate pair [lon, lat]
      if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        processCoordinate(coords);
      } else {
        // Recursively process nested arrays
        coords.forEach(c => processCoordinates(c));
      }
    }
  }

  processCoordinates(coordinates);

  return [
    [minLat, minLon], // South-West corner
    [maxLat, maxLon]  // North-East corner
  ];
}

/**
 * State name to abbreviation mapping
 */
const STATE_NAME_TO_ABBR = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
  'District of Columbia': 'DC', 'Puerto Rico': 'PR'
};

/**
 * Zoom level configuration for each state
 * Based on geographic size - larger states get lower zoom levels
 */
const STATE_ZOOM_LEVELS = {
  // Very large states (zoomLevel 5)
  'AK': 5, 'TX': 5,
  // Large states (zoomLevel 6)
  'CA': 6, 'MT': 6, 'NM': 6, 'AZ': 6, 'NV': 6, 'CO': 6, 'OR': 6, 'WY': 6, 'MI': 6,
  // Medium-large states (zoomLevel 7)
  'MN': 7, 'UT': 7, 'ID': 7, 'KS': 7, 'NE': 7, 'SD': 7, 'ND': 7, 'WA': 7, 'OK': 7,
  'MO': 7, 'FL': 7, 'WI': 7, 'GA': 7, 'IL': 7, 'IA': 7,
  // Medium states (zoomLevel 8)
  'NY': 8, 'NC': 8, 'AR': 8, 'AL': 8, 'LA': 8, 'MS': 8, 'PA': 8, 'OH': 8,
  'VA': 8, 'TN': 8, 'KY': 8, 'IN': 8, 'ME': 8, 'SC': 8, 'WV': 8,
  // Small states (zoomLevel 9)
  'MD': 9, 'HI': 9, 'VT': 9, 'NH': 9, 'MA': 9, 'NJ': 9, 'CT': 9,
  // Very small states (zoomLevel 10)
  'RI': 10, 'DE': 10, 'DC': 10,
};

/**
 * Default zoom level for states not explicitly configured
 */
const DEFAULT_ZOOM_LEVEL = 7;

/**
 * Build state bounds map from GeoJSON
 * Returns object with state abbreviations as keys
 * @returns {Object} - { 'CA': { bounds: [[minLat, minLon], [maxLat, maxLon]], zoomLevel: 6 }, ... }
 */
function buildStateBoundsMap() {
  const boundsMap = {};

  usStatesGeoJSON.features.forEach(feature => {
    const stateName = feature.properties.name;
    const stateAbbr = STATE_NAME_TO_ABBR[stateName];

    if (stateAbbr) {
      const bounds = calculateBounds(
        feature.geometry.coordinates,
        feature.geometry.type
      );
      boundsMap[stateAbbr] = {
        bounds: bounds,
        zoomLevel: STATE_ZOOM_LEVELS[stateAbbr] || DEFAULT_ZOOM_LEVEL
      };
    }
  });

  return boundsMap;
}

/**
 * State bounds cache (built once on module load)
 * Structure: { 'CA': { bounds: [[minLat, minLon], [maxLat, maxLon]], zoomLevel: 6 }, ... }
 */
export const STATE_BOUNDS = buildStateBoundsMap();

/**
 * Get bounds for a specific state
 * @param {string} stateAbbr - Two-letter state abbreviation (e.g., 'CA', 'TX')
 * @returns {Array|null} - [[minLat, minLon], [maxLat, maxLon]] or null if not found
 */
export function getStateBounds(stateAbbr) {
  const stateConfig = STATE_BOUNDS[stateAbbr];
  return stateConfig ? stateConfig.bounds : null;
}

/**
 * Get zoom level for a specific state
 * @param {string} stateAbbr - Two-letter state abbreviation (e.g., 'CA', 'TX')
 * @returns {number} - Zoom level for the state, or default zoom level if not found
 */
export function getStateZoomLevel(stateAbbr) {
  const stateConfig = STATE_BOUNDS[stateAbbr];
  return stateConfig ? stateConfig.zoomLevel : DEFAULT_ZOOM_LEVEL;
}

/**
 * Get list of all state abbreviations with bounds
 * @returns {Array} - ['AL', 'AK', 'AZ', ...]
 */
export function getAllStateAbbreviations() {
  return Object.keys(STATE_BOUNDS).sort();
}

/**
 * State abbreviation to full name mapping (inverse of STATE_NAME_TO_ABBR)
 */
export const STATE_ABBR_TO_NAME = Object.entries(STATE_NAME_TO_ABBR).reduce((acc, [name, abbr]) => {
  acc[abbr] = name;
  return acc;
}, {});

/**
 * Get full state name from abbreviation
 * @param {string} stateAbbr - Two-letter state abbreviation
 * @returns {string|null} - Full state name or null if not found
 */
export function getStateName(stateAbbr) {
  return STATE_ABBR_TO_NAME[stateAbbr] || null;
}
