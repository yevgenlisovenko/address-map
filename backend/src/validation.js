/**
 * Validate latitude and longitude coordinates
 * @param {string|number} lat - Latitude value
 * @param {string|number} lon - Longitude value
 * @returns {Object} Validation result with valid flag and parsed values or error
 */
export function validateCoordinates(lat, lon) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  // Check if values are valid numbers
  if (isNaN(latitude) || isNaN(longitude)) {
    return {
      valid: false,
      error: 'Invalid number format. Please provide valid numeric coordinates.'
    };
  }

  // Validate latitude range
  if (latitude < -90 || latitude > 90) {
    return {
      valid: false,
      error: 'Latitude must be between -90 and 90 degrees.'
    };
  }

  // Validate longitude range
  if (longitude < -180 || longitude > 180) {
    return {
      valid: false,
      error: 'Longitude must be between -180 and 180 degrees.'
    };
  }

  // Return validated and parsed coordinates
  return {
    valid: true,
    lat: latitude,
    lon: longitude
  };
}
