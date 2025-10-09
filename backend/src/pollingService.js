import { config } from './config.js';
import { executeQuery, transformRowToPin } from './database.js';

let pollingInterval = null;
let lastPollTime = new Date(0); // Start from epoch to get all records initially
let ioInstance = null;

/**
 * Initialize the polling service
 * @param {Server} io - Socket.IO server instance
 */
export function initializePollingService(io) {
  if (!config.polling.enabled) {
    console.log('Polling service is disabled');
    return;
  }

  if (!config.database.enabled) {
    console.log('Cannot start polling: database is not enabled');
    return;
  }

  ioInstance = io;
  console.log(`Starting polling service (interval: ${config.polling.interval}ms)`);

  // Start polling immediately
  pollDatabase();

  // Set up interval for subsequent polls
  pollingInterval = setInterval(pollDatabase, config.polling.interval);
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

    // Execute the configured query with lastPollTime as a parameter
    const query = config.polling.query;
    const params = {
      lastPoll: lastPollTime
    };

    const rows = await executeQuery(query, params);

    if (rows && rows.length > 0) {
      console.log(`Found ${rows.length} new record(s)`);

      // Transform each row to a pin and emit to all clients
      for (const row of rows) {
        try {
          const pin = transformRowToPin(row);

          // Broadcast to all connected clients
          ioInstance.emit('add-pin', pin);

          console.log(`Pin emitted: ${pin.displayName} (${pin.lat}, ${pin.lon})`);
        } catch (error) {
          console.error('Error transforming row to pin:', error.message);
        }
      }

      // Update last poll time to current time
      lastPollTime = new Date();
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
    lastPollTime: lastPollTime.toISOString(),
    isRunning: pollingInterval !== null
  };
}
