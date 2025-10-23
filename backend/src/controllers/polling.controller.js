/**
 * Polling controller
 * Handles polling service endpoints (temporary - marked for removal)
 */

import { asyncHandler } from '../middleware/asyncHandler.js';
import { getPollingStatus, triggerPoll } from '../pollingService.js';

/**
 * Get polling status
 * GET /api/polling/status
 * TODO: remove later
 */
export const getStatus = asyncHandler(async (req, res) => {
  const status = getPollingStatus();
  res.json(status);
});

/**
 * Manually trigger a poll
 * POST /api/polling/trigger
 * TODO: remove later
 */
export const trigger = asyncHandler(async (req, res) => {
  const result = await triggerPoll();
  res.json(result);
});
