import sql from 'mssql';
import { config } from './config.js';
import logger from './utils/logger.js';
import { DatabaseError } from './utils/errors.js';

let pool = null;

/**
 * Initialize database connection pool
 */
export async function initializeDatabase() {
  if (!config.database.enabled) {
    logger.info('Database integration is disabled');
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
    logger.info('Database connection established', {
      server: config.database.server,
      database: config.database.database,
      port: config.database.port
    });
    return pool;
  } catch (error) {
    logger.error('Database connection error:', {
      message: error.message,
      code: error.code,
      server: config.database.server
    });
    throw new DatabaseError('Failed to connect to database', error);
  }
}

/**
 * Execute a query and return results
 */
export async function executeQuery(query, params = {}) {
  if (!pool) {
    const error = new DatabaseError('Database pool not initialized');
    logger.error('Query attempted without active database connection');
    throw error;
  }

  try {
    const request = pool.request();

    // Add parameters to the request
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }

    logger.debug('Executing database query', {
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      paramCount: Object.keys(params).length
    });

    const result = await request.query(query);

    logger.debug('Query executed successfully', {
      rowCount: result.recordset?.length || 0
    });

    return result.recordset;
  } catch (error) {
    logger.error('Query execution error:', {
      message: error.message,
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      params: Object.keys(params)
    });
    throw new DatabaseError('Query execution failed', error);
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
      label = `${city.toUpperCase()}, ${state.toUpperCase()}`;
    } else if (city) {
      label = city.toUpperCase();
    } else if (state) {
      label = state.toUpperCase();
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
    logger.info('Database connection closed');
  }
}

/**
 * Get the current pool instance
 */
export function getPool() {
  return pool;
}
