import { config } from "./config.js";
import { executeQuery, transformRowToPin } from "./database.js";
import logger from './utils/logger.js';
import { pinStorageManager } from './pinStorageManager.js';
import { SOCKET_EVENTS } from './utils/constants.js';

let pollingInterval = null;
let lastPollId = null;
let ioInstance = null;

/**
 * Initialize the polling service
 * @param {Server} io - Socket.IO server instance
 */
export async function initializePollingService(io) {
  if (!config.polling.enabled) {
    logger.info("Polling service is disabled");
    return;
  }

  if (!config.database.enabled) {
    logger.warn("Cannot start polling: database is not enabled");
    return;
  }

  lastPollId = await initLastPollId();

  // Validate initialization succeeded
  if (lastPollId === undefined || lastPollId === null || typeof lastPollId !== 'number') {
    logger.error('Failed to initialize polling: Could not determine last poll ID');
    logger.error('Polling service will not start. Please check database configuration and connectivity.');
    logger.error('Verify that:');
    logger.error('  1. Database connection is working');
    logger.error('  2. The table specified in INIT_QUERY exists');
    logger.error('  3. The query returns a valid max_id column');
    return; // Exit early, don't start polling
  }

  logger.info(`lastPollId initialized successfully`, { lastPollId });

  ioInstance = io;
  logger.info('Starting polling service', {
    interval: config.polling.interval,
    intervalSeconds: config.polling.interval / 1000
  });

  // Start polling immediately
  pollDatabase();

  // Set up interval for subsequent polls
  pollingInterval = setInterval(pollDatabase, config.polling.interval);
}

async function initLastPollId() {
  try {
    logger.info('Getting latest ID from database');

    // Execute the configured query to get max id
    const query = config.polling.initQuery;
    const rows = await executeQuery(query);

    if (rows && rows.length > 0) {
      const maxId = rows[0]["max_id"];
      if (maxId !== null && maxId !== undefined) {
        logger.info('Initialized lastPollId successfully', { maxId });
        return maxId;
      } else {
        // Query succeeded but table is empty - start from 0
        logger.info("Database table is empty (no records yet)");
        logger.info("Starting polling with lastPollId = 0");
        return 0;
      }
    } else {
      logger.error("No rows returned from init query");
      logger.error("Check your INIT_QUERY configuration and database connectivity");
      return undefined;
    }
  } catch (error) {
    logger.error("Failed to initialize lastPollId", {
      message: error.message,
      stack: error.stack
    });
    return undefined;
  }
}

/**
 * Poll the database for new coordinates
 */
async function pollDatabase() {
  if (!ioInstance) {
    logger.error("Socket.IO instance not available");
    return;
  }

  try {
    logger.debug('Polling database', { lastPollId });

    // Execute the configured query with lastPollPrimeKey as a parameter
    const query = config.polling.query;
    const params = {
      lastPoll: lastPollId,
    };

    const rows = await executeQuery(query, params);

    if (rows && rows.length > 0) {
      logger.info(`Found new records from polling`, { count: rows.length });

      // Update last poll id
      lastPollId = rows[0]["id"];
      logger.debug('Updated lastPollId', { lastPollId });

      // Transform each row to a pin and emit to all clients
      for (const row of rows) {
        try {
          const pin = transformRowToPin(row);

          // Store pin and get action (added or replaced)
          const result = pinStorageManager.addOrReplacePin(pin);

          // Broadcast to all connected clients
          if (result.action === 'replaced') {
            ioInstance.emit(SOCKET_EVENTS.UPDATE_PIN, result.pin);
            logger.debug(`Pin ${pin.id} replaced (database poll)`);
          } else {
            ioInstance.emit(SOCKET_EVENTS.ADD_PIN, result.pin);
            logger.debug(`Pin ${pin.id} added (database poll)`);
          }

          logger.info('Pin emitted from polling', {
            id: row["id"],
            action: result.action,
            displayName: pin.displayName,
            lat: pin.lat,
            lon: pin.lon
          });
        } catch (error) {
          logger.error("Error transforming row to pin", {
            message: error.message,
            rowId: row["id"]
          });
        }
      }
    } else {
      logger.debug("No new records found in polling");
    }
  } catch (error) {
    logger.error("Polling error", {
      message: error.message,
      stack: error.stack
    });
  }
}

/**
 * Manually trigger a poll (useful for testing or manual refresh)
 */
export async function triggerPoll() {
  if (!config.polling.enabled) {
    throw new Error("Polling service is disabled");
  }

  await pollDatabase();
  return { success: true, message: "Poll triggered successfully" };
}

/**
 * Stop the polling service
 */
export function stopPollingService() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    logger.info("Polling service stopped");
  }
}

/**
 * Get polling status
 */
export function getPollingStatus() {
  return {
    enabled: config.polling.enabled,
    interval: config.polling.interval,
    lastPollId: lastPollId,
    isRunning: pollingInterval !== null,
  };
}
