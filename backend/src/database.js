import sql from 'mssql';
import { config } from './config.js';

let pool = null;

/**
 * Initialize database connection pool
 */
export async function initializeDatabase() {
  if (!config.database.enabled) {
    console.log('Database integration is disabled');
    return null;
  }

  try {
    const dbConfig = {
      server: config.database.server,
      port: config.database.port,
      database: config.database.database,
      user: config.database.user,
      password: config.database.password,
      options: config.database.options,
      pool: config.database.pool
    };

    pool = await sql.connect(dbConfig);
    console.log('Database connection established');
    return pool;
  } catch (error) {
    console.error('Database connection error:', error.message);
    throw error;
  }
}

/**
 * Execute a query and return results
 */
export async function executeQuery(query, params = {}) {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }

  try {
    const request = pool.request();

    // Add parameters to the request
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }

    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error('Query execution error:', error.message);
    throw error;
  }
}

/**
 * Transform database row to pin format
 */
export function transformRowToPin(row) {
  const mapping = config.polling.columnMapping;

  const lat = parseFloat(row[mapping.latitude]);
  const lon = parseFloat(row[mapping.longitude]);

  // Include all other columns as properties
  let properties = {};
  for (const [key, value] of Object.entries(row)) {
    if (
      key !== mapping.latitude &&
      key !== mapping.longitude &&
      key !== mapping.label &&
      key !== mapping.properties
    ) {
      properties[key] = value;
    }
  }

  // Safe label construction with fallbacks
  let label;
  if (row[mapping.label]) {
    label = row[mapping.label];
  } else {
    // Attempt to build label from city/state if available
    const city = row['city'] || row['City'] || '';
    const state = row['state'] || row['State'] || '';

    if (city && state) {
      label = `${city}, ${state}`;
    } else if (city) {
      label = city;
    } else if (state) {
      label = state;
    } else {
      // Fallback to coordinates
      label = `${lat}, ${lon}`;
    }
  }

  return {
    type: 'coordinates',
    lat,
    lon,
    displayName: label,
    properties,
    timestamp: new Date().toISOString()
  };
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  if (pool) {
    await pool.close();
    console.log('Database connection closed');
  }
}

/**
 * Get the current pool instance
 */
export function getPool() {
  return pool;
}
