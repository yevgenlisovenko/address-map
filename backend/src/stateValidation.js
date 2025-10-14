/**
 * State validation utilities for US states
 * Handles validation of state abbreviations and colors
 */

// All 50 US states + DC (2-letter postal abbreviations)
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

// Mapping from full state names to abbreviations (for GeoJSON conversion)
export const STATE_NAMES_TO_ABBR = {
  'Alabama': 'AL',
  'Alaska': 'AK',
  'Arizona': 'AZ',
  'Arkansas': 'AR',
  'California': 'CA',
  'Colorado': 'CO',
  'Connecticut': 'CT',
  'Delaware': 'DE',
  'Florida': 'FL',
  'Georgia': 'GA',
  'Hawaii': 'HI',
  'Idaho': 'ID',
  'Illinois': 'IL',
  'Indiana': 'IN',
  'Iowa': 'IA',
  'Kansas': 'KS',
  'Kentucky': 'KY',
  'Louisiana': 'LA',
  'Maine': 'ME',
  'Maryland': 'MD',
  'Massachusetts': 'MA',
  'Michigan': 'MI',
  'Minnesota': 'MN',
  'Mississippi': 'MS',
  'Missouri': 'MO',
  'Montana': 'MT',
  'Nebraska': 'NE',
  'Nevada': 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  'Ohio': 'OH',
  'Oklahoma': 'OK',
  'Oregon': 'OR',
  'Pennsylvania': 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  'Tennessee': 'TN',
  'Texas': 'TX',
  'Utah': 'UT',
  'Vermont': 'VT',
  'Virginia': 'VA',
  'Washington': 'WA',
  'West Virginia': 'WV',
  'Wisconsin': 'WI',
  'Wyoming': 'WY',
  'District of Columbia': 'DC'
};

/**
 * Validate a state abbreviation
 * @param {string} abbr - State abbreviation (case-insensitive)
 * @returns {string|null} - Normalized uppercase abbreviation or null if invalid
 */
export function validateStateAbbr(abbr) {
  if (typeof abbr !== 'string') {
    return null;
  }

  const upper = abbr.toUpperCase().trim();
  return US_STATES.includes(upper) ? upper : null;
}

/**
 * Validate a hex color code
 * @param {string} color - Hex color code (e.g., #FF0000, #F00, #FF0000FF)
 * @returns {boolean} - True if valid hex color format
 */
export function validateColor(color) {
  if (!color || typeof color !== 'string') {
    return false;
  }

  // Match #RGB, #RRGGBB, or #RRGGBBAA format
  const hexRegex = /^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i;
  return hexRegex.test(color);
}

/**
 * Convert full state name to abbreviation
 * @param {string} fullName - Full state name
 * @returns {string|null} - State abbreviation or null if not found
 */
export function stateNameToAbbr(fullName) {
  return STATE_NAMES_TO_ABBR[fullName] || null;
}
