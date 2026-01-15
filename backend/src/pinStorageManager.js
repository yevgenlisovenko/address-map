import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import logger from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class PinStorageManager {
  constructor(config) {
    this.pins = []; // Chronological: oldest → newest
    this.startIndex = 0; // Points to first valid pin
    this.pinIndexMap = new Map(); // ID -> index mapping for O(1) duplicate detection
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
   * Normalize ID to string for consistent Map keys
   * Handles both string and number IDs
   */
  normalizeId(id) {
    return String(id);
  }

  /**
   * Add new pin or replace existing one with same ID - O(1)
   * Uses ID Map for O(1) duplicate detection
   * @param {Object} pin - Pin to add/replace
   * @returns {Object} Result { action: 'added'|'replaced', pin: pinWithTimestamp }
   */
  addOrReplacePin(pin) {
    const pinWithTimestamp = {
      ...pin,
      timestamp: pin.timestamp || new Date().toISOString(),
    };

    const normalizedId = this.normalizeId(pin.id);
    let action = 'added';

    // Check if pin with this ID already exists
    if (this.pinIndexMap.has(normalizedId)) {
      const oldIndex = this.pinIndexMap.get(normalizedId);

      // Mark old pin as deleted (null it out)
      if (this.pins[oldIndex] !== null) {
        this.pins[oldIndex] = null;
        action = 'replaced';
        logger.debug(`Replacing pin with ID: ${pin.id}`);
      }
    }

    // Add new pin to end (newest position)
    this.pins.push(pinWithTimestamp);

    // Update index map
    this.pinIndexMap.set(normalizedId, this.pins.length - 1);

    // Auto-compact if waste is excessive
    if (this.startIndex > this.compactionThreshold) {
      this.compact();
    }

    // Debounced persist
    this.debouncedPersist();

    return { action, pin: pinWithTimestamp };
  }

  /**
   * Add new pin - O(1)
   * DEPRECATED: Alias to addOrReplacePin for backward compatibility
   * Always adds to end (newest position)
   */
  addPin(pin) {
    return this.addOrReplacePin(pin);
  }

  /**
   * Remove expired pins - O(1) amortized
   * Moves startIndex forward without array modification
   * Also counts null entries (replaced pins) for compaction triggering
   */
  cleanupOldPins() {
    const cutoffTime = Date.now() - this.maxAge;
    let expiredCount = 0;
    let nullCount = 0;

    // Scan from startIndex forward to count expired and null pins
    for (let i = this.startIndex; i < this.pins.length; i++) {
      const pin = this.pins[i];

      if (pin === null) {
        nullCount++;
        continue;
      }

      const pinTime = new Date(pin.timestamp).getTime();
      if (pinTime < cutoffTime) {
        expiredCount++;
      } else {
        break; // Pins are chronological, no more expired after this
      }
    }

    // Move startIndex forward past expired pins
    this.startIndex += expiredCount;

    // Trigger compaction if too many deleted (expired + null)
    const totalDeleted = expiredCount + nullCount;
    if (totalDeleted >= this.compactionThreshold) {
      this.compact();
    }

    logger.debug(`Cleanup complete: ${expiredCount} expired, ${nullCount} replaced (${totalDeleted} total deleted)`);

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
   * Removes expired prefix and null entries when waste exceeds threshold
   * Rebuilds ID Map for consistency
   */
  compact() {
    logger.info(`Compacting storage: ${this.pins.length} pins, startIndex: ${this.startIndex}`);

    // Get active span (skip expired prefix)
    const activeSpan = this.pins.slice(this.startIndex);
    const now = Date.now();
    const cutoffTime = now - this.maxAge;

    // Filter out null entries (replaced pins) and expired pins
    const compactedPins = activeSpan.filter((pin) => {
      if (pin === null) return false; // Remove replaced pins
      const pinTime = new Date(pin.timestamp).getTime();
      return pinTime >= cutoffTime; // Keep only non-expired
    });

    // Rebuild ID index map
    this.pinIndexMap.clear();
    compactedPins.forEach((pin, index) => {
      this.pinIndexMap.set(this.normalizeId(pin.id), index);
    });

    // Replace pins array
    this.pins = compactedPins;
    this.startIndex = 0;

    logger.info(`Compaction complete: ${this.pins.length} pins remaining`);

    // Persist after compaction
    this.persistToFile();
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
   * Builds ID Map for loaded pins
   */
  async loadFromFile() {
    try {
      const data = await fs.readFile(this.persistPath, "utf-8");
      const parsed = JSON.parse(data);

      if (parsed.pins && Array.isArray(parsed.pins)) {
        this.pins = parsed.pins;
        this.startIndex = 0;

        // Build ID index map from loaded pins
        this.pinIndexMap.clear();
        this.pins.forEach((pin, index) => {
          this.pinIndexMap.set(this.normalizeId(pin.id), index);
        });

        logger.debug(`Built ID index map with ${this.pinIndexMap.size} entries`);

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
