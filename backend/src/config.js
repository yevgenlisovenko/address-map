export const config = {
  port: process.env.PORT || 3001,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  geocoding: {
    // Using Nominatim (OpenStreetMap) - free, no API key required
    provider: 'nominatim',
    nominatimUrl: 'https://nominatim.openstreetmap.org/search',
    // Rate limiting: Max 1 request per second for Nominatim
    requestDelay: 1000,
    userAgent: 'Address-Map-App/1.0'
  }
};
