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

/**
 * Validate pin ID
 * @param {string|number} id - Pin ID value
 * @returns {Object} Validation result with valid flag and id or error
 */
export function validatePinId(id) {
  // Check if id is null or undefined
  if (id === null || id === undefined) {
    return {
      valid: false,
      error: 'Pin ID is required.'
    };
  }

  // Check if id is a valid type (string or number)
  const idType = typeof id;
  if (idType !== 'string' && idType !== 'number') {
    return {
      valid: false,
      error: 'Pin ID must be a string or number.'
    };
  }

  // Check if string id is not empty
  if (idType === 'string' && id.trim() === '') {
    return {
      valid: false,
      error: 'Pin ID cannot be an empty string.'
    };
  }

  // Return validated id
  return {
    valid: true,
    id
  };
}
