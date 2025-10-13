import { config } from "./config.js";
import { executeQuery, transformRowToPin } from "./database.js";

let pollingInterval = null;
let lastPollId = null;
let ioInstance = null;

/**
 * Initialize the polling service
 * @param {Server} io - Socket.IO server instance
 */
export async function initializePollingService(io) {
  if (!config.polling.enabled) {
    console.log("Polling service is disabled");
    return;
  }

  if (!config.database.enabled) {
    console.log("Cannot start polling: database is not enabled");
    return;
  }

  lastPollId = await initLastPollId();

  // Validate initialization succeeded
  if (lastPollId === undefined || lastPollId === null || typeof lastPollId !== 'number') {
    console.error('Failed to initialize polling: Could not determine last poll ID');
    console.error('Polling service will not start. Please check database configuration and connectivity.');
    console.error('Verify that:');
    console.error('  1. Database connection is working');
    console.error('  2. The table specified in INIT_QUERY exists');
    console.error('  3. The query returns a valid max_id column');
    return; // Exit early, don't start polling
  }

  console.log(`lastPollId initialized successfully: ${lastPollId}`);

  ioInstance = io;
  console.log(
    `Starting polling service (interval: ${config.polling.interval}ms)`
  );

  // Start polling immediately
  pollDatabase();

  // Set up interval for subsequent polls
  pollingInterval = setInterval(pollDatabase, config.polling.interval);
}

async function initLastPollId() {
  try {
    console.log(`Getting latest id from database`);

    // Execute the configured query to get max id
    const query = config.polling.initQuery;
    const rows = await executeQuery(query);

    if (rows && rows.length > 0) {
      const maxId = rows[0]["max_id"];
      if (maxId !== null && maxId !== undefined) {
        console.log(`Initialized lastPollId with value: ${maxId}`);
        return maxId;
      } else {
        // Query succeeded but table is empty - start from 0
        console.log("Database table is empty (no records yet)");
        console.log("Starting polling with lastPollId = 0");
        return 0;
      }
    } else {
      console.error("No rows returned from init query");
      console.error("Check your INIT_QUERY configuration and database connectivity");
      return undefined;
    }
  } catch (error) {
    console.error("Failed to initialize lastPollId:", error.message);
    console.error("Database query failed:", error);
    return undefined;
  }
}

/**
 * Poll the database for new coordinates
 */
async function pollDatabase() {
  if (!ioInstance) {
    console.error("Socket.IO instance not available");
    return;
  }

  try {
    console.log(`Polling database at ${new Date().toISOString()}`);

    // Execute the configured query with lastPollPrimeKey as a parameter
    const query = config.polling.query;
    const params = {
      lastPoll: lastPollId,
    };

    const rows = await executeQuery(query, params);

    if (rows && rows.length > 0) {
      console.log(`Found ${rows.length} new record(s)`);

      // Update last poll id
      lastPollId = rows[0]["id"];
      console.log(`lastPollId updated: ${lastPollId}`);

      // Transform each row to a pin and emit to all clients
      for (const row of rows) {
        try {
          const pin = transformRowToPin(row);

          // Broadcast to all connected clients
          ioInstance.emit("add-pin", pin);

          console.log(
            `Pin emitted for ${row["id"]}: ${pin.displayName} (${pin.lat}, ${pin.lon})`
          );
        } catch (error) {
          console.error("Error transforming row to pin:", error.message);
        }
      }
    } else {
      console.log("No new records found");
    }
  } catch (error) {
    console.error("Polling error:", error.message);
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
    console.log("Polling service stopped");
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
