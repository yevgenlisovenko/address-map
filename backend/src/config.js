export const config = {
  port: process.env.PORT || 3001,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  geocoding: {
    // Using Nominatim (OpenStreetMap) - free, no API key required
    provider: 'nominatim',
    nominatimUrl: 'https://nominatim.openstreetmap.org/search',
    // Rate limiting: Max 1 request per second for Nominatim
    requestDelay: 1000,
    userAgent: 'Real-time-Map-App/1.0'
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
    initQuery: process.env.INIT_QUERY || `SELECT max(id) max_id FROM coordinates`,
    query: process.env.POLLING_QUERY || `SELECT id, * FROM coordinates WHERE id > @lastPoll ORDER BY id DESC`,
    columnMapping: {
      latitude: process.env.POLLING_COL_LAT || 'latitude',
      longitude: process.env.POLLING_COL_LON || 'longitude',
      label: process.env.POLLING_COL_LABEL || 'label',
      properties: process.env.POLLING_COL_PROPERTIES || null // Optional: JSON column name
    }
  },
  stateHighlight: {
    defaultColor: process.env.DEFAULT_STATE_COLOR || '#FF0000' // Red
  },
  logging: {
    // Log level priority: error (0) > warn (1) > info (2) > http (3) > debug (4)
    // Default: 'debug' in development, 'info' in production
    // Can be overridden with LOG_LEVEL environment variable
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
  }
};
