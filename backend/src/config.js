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
  },
  database: {
    enabled: process.env.DB_ENABLED === 'true' || false,
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true' || true,
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' || false,
      enableArithAbort: true
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  },
  polling: {
    enabled: process.env.POLLING_ENABLED === 'true' || false,
    interval: parseInt(process.env.POLLING_INTERVAL) || 15000, // 15 seconds
    query: process.env.POLLING_QUERY || 'SELECT * FROM coordinates WHERE created_at > @lastPoll',
    columnMapping: {
      latitude: process.env.POLLING_COL_LAT || 'latitude',
      longitude: process.env.POLLING_COL_LON || 'longitude',
      label: process.env.POLLING_COL_LABEL || 'label',
      properties: process.env.POLLING_COL_PROPERTIES || null // Optional: JSON column name
    }
  }
};
