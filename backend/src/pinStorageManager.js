import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import logger from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class PinStorageManager {
  constructor(config) {
    this.pins = []; // Chronological: oldest → newest
    this.startIndex = 0; // Points to first valid pin
    this.maxAge = config.maxAge; // Maximum age: 24 hours
    this.compactionThreshold = config.compactionThreshold;
    this.persistPath = config.persistPath;
    this.lastPersistTime = 0;
    this.persistDebounceMs = 1000; // Debounce file writes
    this.isPersisting = false; // Mutex lock for persist operations
    this.pendingPersist = false; // Flag for queued persist

    // Load pins from disk on startup
    this.loadFromFile();
  }

  /**
   * Add new pin - O(1)
   * Always adds to end (newest position)
   */
  addPin(pin) {
    const pinWithTimestamp = {
      ...pin,
      timestamp: pin.timestamp || new Date().toISOString(),
    };

    this.pins.push(pinWithTimestamp);

    // Auto-compact if waste is excessive
    if (this.startIndex > this.compactionThreshold) {
      this.compact();
    }

    // Debounced persist
    this.debouncedPersist();
  }

  /**
   * Remove expired pins - O(1) amortized
   * Moves startIndex forward without array modification
   */
  cleanupOldPins() {
    const cutoffTime = Date.now() - this.maxAge;

    // Scan from startIndex forward until we find valid pin
    while (this.startIndex < this.pins.length) {
      const pinTime = new Date(this.pins[this.startIndex].timestamp).getTime();
      if (pinTime >= cutoffTime) break;
      this.startIndex++;
    }

    // Compact if threshold exceeded
    if (this.startIndex > this.compactionThreshold) {
      this.compact();
    }

    return this.pins.length - this.startIndex;
  }

  /**
   * Get pins for specific time window (newest first)
   * @param {number} timeWindowMs - Time window in milliseconds
   * @returns {Array} Pins within the time window, newest first
   */
  getPinsForTimeWindow(timeWindowMs) {
    // Ensure time window doesn't exceed max age
    const effectiveWindow = Math.min(timeWindowMs, this.maxAge);
    const cutoffTime = Date.now() - effectiveWindow;

    // Return pins starting from the particular time
    return this.getPinsStartingFrom(cutoffTime);
  }

  /**
   * Get pins starting from the given time (newest first)
   * @param {number} time - Starting time (milliseconds)
   * @returns {Array} Pins starting from the given time, newest first
   */
  getPinsStartingFrom(time) {
    // Get valid pins (from startIndex)
    const validPins = this.pins.slice(this.startIndex);

    // Filter by time
    const filteredPins = validPins.filter((pin) => {
      const pinTime = new Date(pin.timestamp).getTime();
      return pinTime >= time;
    });

    // Return newest first
    return filteredPins.reverse();
  }

  /**
   * Get all valid pins (newest first) - max 24 hours
   */
  getAllPins() {
    return this.getPinsForTimeWindow(this.maxAge);
  }

  /**
   * Get all valid pins in chronological order (for internal use)
   * Returns: [oldest, ..., newest]
   */
  getAllPinsChronological() {
    return this.pins.slice(this.startIndex);
  }

  /**
   * Compact array - O(n)
   * Removes expired prefix when waste exceeds threshold
   */
  compact() {
    if (this.startIndex > 0) {
      this.pins = this.pins.slice(this.startIndex);
      this.startIndex = 0;
      this.persistToFile(); // Persist after compaction
    }
  }

  /**
   * Get statistics for monitoring
   */
  getStats() {
    const validPins = this.pins.length - this.startIndex;
    return {
      totalStoredPins: this.pins.length,
      validPins: validPins,
      expiredPins: this.startIndex,
      oldestPin: validPins > 0 ? this.pins[this.startIndex]?.timestamp : null,
      newestPin:
        validPins > 0 ? this.pins[this.pins.length - 1]?.timestamp : null,
      memoryWaste: this.startIndex,
    };
  }

  /**
   * Persist pins to disk (mutex-protected to prevent race conditions)
   */
  async persistToFile() {
    // If already persisting, mark as pending and return
    if (this.isPersisting) {
      this.pendingPersist = true;
      return;
    }

    this.isPersisting = true;

    try {
      // Only persist valid pins
      const validPins = this.pins.slice(this.startIndex);

      const data = {
        pins: validPins,
        metadata: {
          lastUpdated: new Date().toISOString(),
          count: validPins.length,
        },
      };

      // Ensure directory exists
      const dir = path.dirname(this.persistPath);
      await fs.mkdir(dir, { recursive: true });

      // Write to temp file
      const tempPath = `${this.persistPath}.tmp`;
      await fs.writeFile(tempPath, JSON.stringify(data, null, 2));

      // On Windows, use copyFile + unlink pattern (more reliable than rename)
      await fs.copyFile(tempPath, this.persistPath);
      await fs.unlink(tempPath);

      this.lastPersistTime = Date.now();

      return true;
    } catch (error) {
      logger.error('Failed to persist pins to disk', {
        error: error.message,
        stack: error.stack,
        path: this.persistPath,
        code: error.code
      });
      return false;
    } finally {
      this.isPersisting = false;

      // If persist was requested while we were running, do it now
      if (this.pendingPersist) {
        this.pendingPersist = false;
        // Use setImmediate to avoid deep recursion
        setImmediate(() => this.persistToFile());
      }
    }
  }

  /**
   * Debounced persist - prevents excessive file writes
   * Checks if persist is already running or queued to prevent race conditions
   */
  debouncedPersist() {
    const now = Date.now();
    // Only persist if enough time has passed AND no persist is currently running or pending
    if (now - this.lastPersistTime > this.persistDebounceMs && !this.isPersisting && !this.pendingPersist) {
      this.persistToFile();
    } else if (!this.pendingPersist && !this.isPersisting) {
      // If conditions not met but no persist is pending, mark one as needed
      this.pendingPersist = true;
    }
  }

  /**
   * Load pins from disk on startup
   */
  async loadFromFile() {
    try {
      const data = await fs.readFile(this.persistPath, "utf-8");
      const parsed = JSON.parse(data);

      if (parsed.pins && Array.isArray(parsed.pins)) {
        this.pins = parsed.pins;
        this.startIndex = 0;

        // Cleanup old pins immediately after loading
        const validCount = this.cleanupOldPins();

        logger.info('Loaded pins from disk', {
          totalPins: parsed.pins.length,
          validPins: validCount,
          expiredPins: parsed.pins.length - validCount,
          path: this.persistPath
        });
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        logger.info('No existing pins file found, starting with empty storage', {
          path: this.persistPath
        });
      } else {
        logger.error('Failed to load pins from disk', {
          error: error.message,
          stack: error.stack,
          path: this.persistPath,
          code: error.code
        });
      }
    }
  }

  /**
   * Force immediate persist (for shutdown)
   */
  async forceFlush() {
    await this.persistToFile();
  }
}

// Create and export singleton instance
const config = {
  maxAge: parseInt(process.env.PIN_MAX_AGE) || 24 * 60 * 60 * 1000, // 24 hours
  compactionThreshold: parseInt(process.env.PIN_COMPACTION_THRESHOLD) || 1000,
  persistPath:
    process.env.PIN_PERSIST_PATH || path.join(__dirname, "../data/pins.json"),
};

export const pinStorageManager = new PinStorageManager(config);

// Export class for testing
export { PinStorageManager };
