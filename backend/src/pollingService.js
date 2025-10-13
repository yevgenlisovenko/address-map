import { config } from './config.js';
import { executeQuery, transformRowToPin } from './database.js';

let pollingInterval = null;
let lastPollId = null;
let ioInstance = null;

/**
 * Initialize the polling service
 * @param {Server} io - Socket.IO server instance
 */
export async function initializePollingService(io) {
  if (!config.polling.enabled) {
    console.log('Polling service is disabled');
    return;
  }

  if (!config.database.enabled) {
    console.log('Cannot start polling: database is not enabled');
    return;
  }

  lastPollPId = await initLastPollId();
  console.log(`lastPollPId: ${lastPollPId}`);

  ioInstance = io;
  console.log(`Starting polling service (interval: ${config.polling.interval}ms)`);

  // Start polling immediately
  pollDatabase();

  // Set up interval for subsequent polls
  pollingInterval = setInterval(pollDatabase, config.polling.interval);
}

 async function initLastPollId() {
  try {
    console.log(`Getting latest id`);

    // Execute the configured query with lastPollId as a parameter
    const query = config.polling.initQuery;
    const rows = await executeQuery(query);

    if (rows && rows.length > 0) {
      console.log(`Found ${rows.length} new record(s)`);

      // Initialize last poll id with the latest value in DB
      return rows[0]['max_id'];
    } else {
      console.log('No records found');
    }
  } catch (error) {
    console.error('Error trying to get latest id:', error.message);
  }
}

/**
 * Poll the database for new coordinates
 */
async function pollDatabase() {
  if (!ioInstance) {
    console.error('Socket.IO instance not available');
    return;
  }

  try {
    console.log(`Polling database at ${new Date().toISOString()}`);

    // Execute the configured query with lastPollPrimeKey as a parameter
    const query = config.polling.query;
    const params = {
      lastPoll: lastPollId
    };

    const rows = await executeQuery(query, params);

    if (rows && rows.length > 0) {
      console.log(`Found ${rows.length} new record(s)`);

      // Update last poll id
      lastPollId = rows[0]['id'];
      console.log(`lastPollId updated: ${lastPollId}`);

      // Transform each row to a pin and emit to all clients
      for (const row of rows) {
        try {
          const pin = transformRowToPin(row);

          // Broadcast to all connected clients
          ioInstance.emit('add-pin', pin);

          console.log(`Pin emitted for ${row['id']}: ${pin.displayName} (${pin.lat}, ${pin.lon})`);
        } catch (error) {
          console.error('Error transforming row to pin:', error.message);
        }
      }
    } else {
      console.log('No new records found');
    }
  } catch (error) {
    console.error('Polling error:', error.message);
  }
}

/**
 * Manually trigger a poll (useful for testing or manual refresh)
 */
export async function triggerPoll() {
  if (!config.polling.enabled) {
    throw new Error('Polling service is disabled');
  }

  await pollDatabase();
  return { success: true, message: 'Poll triggered successfully' };
}

/**
 * Stop the polling service
 */
export function stopPollingService() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log('Polling service stopped');
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
    isRunning: pollingInterval !== null
  };
}
