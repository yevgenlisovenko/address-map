/**
 * Application-wide constants
 */

// Socket.IO event names
export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  NEW_ADDRESS: 'new-address',
  NEW_COORDINATES: 'new-coordinates',
  ADD_PIN: 'add-pin',
  STATE_HIGHLIGHTS_UPDATE: 'state-highlights-update',
  ERROR: 'error'
};

// Pin types
export const PIN_TYPES = {
  ADDRESS: 'address',
  COORDINATES: 'coordinates'
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// Error messages
export const ERROR_MESSAGES = {
  ADDRESS_REQUIRED: 'Address is required',
  COORDINATES_REQUIRED: 'Latitude and longitude are required',
  PROPERTIES_INVALID: 'Properties must be an object',
  NOT_CONNECTED: 'Not connected to server',
  INVALID_REQUEST_FORMAT: 'Invalid request format. Expected: { "colorConfig": [ { "states": [...], "color": "..." }, ... ] }'
};
