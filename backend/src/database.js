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
    // Build database config
    const dbConfig = {
      server: config.database.server,
      port: config.database.port,
      database: config.database.database,
      options: config.database.options,
      pool: config.database.pool
    };

    // Debug logging - show exact config values
    logger.info('=== Database Connection Attempt ===');
    logger.info('trustedConnection option:', config.database.options.trustedConnection);
    logger.info('DB_USER from config:', config.database.user ? '(set)' : '(not set)');
    logger.info('DB_PASSWORD from config:', config.database.password ? '(set)' : '(not set)');

    // Configure authentication method
    if (config.database.options.trustedConnection) {
      // Windows Authentication - use msnodesqlv8 driver
      logger.info('Using Windows Authentication (msnodesqlv8 driver)');
      dbConfig.driver = 'msnodesqlv8';
      // No user/password needed - uses Windows credentials

      // Verify msnodesqlv8 is available
      try {
        await import('msnodesqlv8');
        logger.info('msnodesqlv8 driver package is available');
      } catch (err) {
        logger.warn('msnodesqlv8 package not found - connection may fail', {
          error: err.message
        });
      }
    } else {
      // SQL Server Authentication - use default Tedious driver
      logger.info('Using SQL Server Authentication (Tedious driver)');
      dbConfig.user = config.database.user;
      dbConfig.password = config.database.password;
    }

    // Log final config (without sensitive data)
    logger.info('Final connection config:', {
      server: dbConfig.server,
      port: dbConfig.port,
      database: dbConfig.database,
      driver: dbConfig.driver || '(default/tedious)',
      hasUser: !!dbConfig.user,
      hasPassword: !!dbConfig.password,
      trustedConnection: dbConfig.options.trustedConnection
    });

    pool = await sql.connect(dbConfig);
    logger.info('Database connection established', {
      server: config.database.server,
      database: config.database.database,
      port: config.database.port
    });
    return pool;
  } catch (error) {
    // Special handling for missing msnodesqlv8 driver
    if (
      config.database.options.trustedConnection &&
      (error.message?.includes('msnodesqlv8') || error.message?.includes('Unable to load driver'))
    ) {
      logger.error('Windows Authentication requires msnodesqlv8 package:', {
        message: error.message,
        solution: 'Run: npm install msnodesqlv8 (Windows only)'
      });
      throw new DatabaseError(
        'Windows Authentication (DB_TRUSTED_CONNECTION=true) requires the msnodesqlv8 package. ' +
          'Please run: npm install msnodesqlv8',
        error
      );
    }

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
 * Process field injection - enrich properties with derived fields from lookup maps
 * @param {Object} properties - Properties object to enrich (mutated in-place)
 * @param {Object} fieldInjectionConfig - Field injection configuration from config
 */
function processFieldInjection(properties, fieldInjectionConfig) {
  // Skip if no configuration
  if (!fieldInjectionConfig || !fieldInjectionConfig.lookups) {
    return;
  }

  try {
    const lookups = fieldInjectionConfig.lookups;

    // Process each lookup definition
    for (const [sourceField, lookupDef] of Object.entries(lookups)) {
      // Validate lookup definition
      if (!lookupDef.targetField || !lookupDef.map) {
        logger.warn(`Field injection: Invalid lookup definition for "${sourceField}", skipping`);
        continue;
      }

      // Get source value from properties
      const sourceValue = properties[sourceField];

      // Skip if source field is missing or null
      if (sourceValue === undefined || sourceValue === null) {
        continue;
      }

      // Convert source value to string for map lookup (handles numbers, etc.)
      const lookupKey = String(sourceValue);

      // Look up in map, use default value if not found
      const injectedValue = lookupDef.map[lookupKey] ?? lookupDef.defaultValue;

      // Inject the field (even if undefined - allows explicit null injection)
      if (injectedValue !== undefined) {
        properties[lookupDef.targetField] = injectedValue;
      }
    }
  } catch (error) {
    logger.error('Field injection error:', {
      message: error.message,
      stack: error.stack
    });
    // Continue without injection on error
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
      key !== mapping.id &&
      key !== mapping.latitude &&
      key !== mapping.longitude &&
      key !== mapping.label &&
      key !== mapping.properties
    ) {
      properties[key] = value;
    }
  }

  // Apply field injection if configured
  processFieldInjection(properties, config.polling.fieldInjection);

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
    id: row[mapping.id],
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
