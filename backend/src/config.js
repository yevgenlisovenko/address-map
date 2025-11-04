import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  pinStorage: {
    maxAge: parseInt(process.env.PIN_MAX_AGE) || 24 * 60 * 60 * 1000, // 24 hours (ms)
    cleanupInterval: parseInt(process.env.PIN_CLEANUP_INTERVAL) || 5 * 60 * 1000, // 5 minutes (ms)
    compactionThreshold: parseInt(process.env.PIN_COMPACTION_THRESHOLD) || 1000, // Compact after 1000 expired
    persistPath: process.env.PIN_PERSIST_PATH || path.join(__dirname, '../data/pins.json'),

    // Time window options for UI (in milliseconds)
    timeWindowOptions: process.env.PIN_TIME_WINDOWS
      ? JSON.parse(process.env.PIN_TIME_WINDOWS)
      : {
          '5 min': 5 * 60 * 1000,
          '15 min': 15 * 60 * 1000,
          '30 min': 30 * 60 * 1000,
          '1 hour': 1 * 60 * 60 * 1000,
          '2 hours': 2 * 60 * 60 * 1000,
          '4 hours': 4 * 60 * 60 * 1000,
          '8 hours': 8 * 60 * 60 * 1000,
          '16 hours': 16 * 60 * 60 * 1000,
          '24 hours': 24 * 60 * 60 * 1000
        },

    defaultTimeWindow: process.env.PIN_DEFAULT_TIME_WINDOW || '1 hour'
  },
  ai: {
    enabled: process.env.AI_ENABLED === 'true' || false,
    openaiApiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || '',
    model: process.env.OPENAI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 4000,
    temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,

    // SSL/TLS verification for OpenAI API requests
    // Set to false if behind corporate proxy with self-signed certificates
    rejectUnauthorized: process.env.AI_REJECT_UNAUTHORIZED !== 'false', // Defaults to true

    // Properties allowed to be sent to AI (whitelist)
    // Empty array = all properties allowed
    allowedProperties: process.env.AI_ALLOWED_PROPERTIES
      ? process.env.AI_ALLOWED_PROPERTIES.split(',').map(p => p.trim())
      : [], // Empty = allow all

    // Prompt templates for UI
    prompts: [
      {
        id: 'analyze',
        label: 'Analyze Patterns',
        systemPrompt: 'You are a data analyst specializing in geographic and location-based data.',
        userPrompt: 'Analyze the following markers/pins and identify any patterns, trends, or insights:'
      },
      {
        id: 'find-patterns',
        label: 'Find Patterns',
        systemPrompt: 'You are a pattern recognition expert.',
        userPrompt: 'Find patterns in the following markers/pins. Look for clusters, temporal patterns, and anomalies:'
      },
      {
        id: 'summarize',
        label: 'Summarize',
        systemPrompt: 'You are a concise data summarizer.',
        userPrompt: 'Provide a concise summary of the following markers/pins:'
      }
    ]
  },
  logging: {
    // Log level priority: error (0) > warn (1) > info (2) > http (3) > debug (4)
    // Default: 'debug' in development, 'info' in production
    // Can be overridden with LOG_LEVEL environment variable
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
  }
};
