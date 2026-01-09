/**
 * State color management
 * Handles in-memory storage and processing of state highlight colors
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './utils/logger.js';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File path for persisting state highlights (configurable via STATE_HIGHLIGHTS_PATH)
const STATE_FILE_PATH = config.stateHighlight.persistPath;

// In-memory storage: Map of state abbreviation -> color
const stateHighlights = new Map();

// Store original colorConfig for persistence
let currentColorConfig = [];

// In-memory storage: Array of group metadata { color, label, states }
const highlightGroups = [];

// Default color when none specified in group
let DEFAULT_HIGHLIGHT_COLOR = '#FF0000'; // Red

/**
 * Process color configuration groups
 * Handles overlapping states (later groups override earlier groups)
 * States not in any group are removed from highlighting
 *
 * @param {Array} colorConfig - Array of group objects: [{ states: [...], color: "...", label: "..." }, ...]
 */
export function processColorConfig(colorConfig) {
  // Clear all previous highlights and groups
  stateHighlights.clear();
  highlightGroups.length = 0;

  if (!colorConfig || !Array.isArray(colorConfig) || colorConfig.length === 0) {
    // Store empty config
    currentColorConfig = [];
    saveStateToFile();
    return;
  }

  // Store original config for persistence
  currentColorConfig = colorConfig;

  // Process groups in order
  // Later groups override earlier groups for overlapping states
  for (const group of colorConfig) {
    const { states, color, label } = group;

    if (!states || !Array.isArray(states)) {
      continue;
    }

    // Use provided color or default
    const finalColor = color || DEFAULT_HIGHLIGHT_COLOR;

    // Apply color to all states in this group
    for (const stateAbbr of states) {
      stateHighlights.set(stateAbbr, finalColor);
    }

    // Store group metadata (only if it has a label)
    if (label && typeof label === 'string') {
      highlightGroups.push({
        color: finalColor,
        label: label.trim(),
        states: [...states]
      });
    }
  }

  // Persist to file
  saveStateToFile();
}

/**
 * Get all current state colors as plain object
 * @returns {Object} - Object mapping state abbreviations to colors
 */
export function getAllStateColors() {
  return Object.fromEntries(stateHighlights);
}

/**
 * Get winning groups (groups that have at least one state with their color visible)
 * When states overlap between groups, only the last group's color is visible
 * @returns {Array} - Array of winning groups: [{ color, label, states }, ...]
 */
export function getWinningGroups() {
  if (highlightGroups.length === 0) {
    return [];
  }

  const winningGroups = [];
  const processedGroups = new Set();

  // For each group, check if any of its states have the group's color
  for (const group of highlightGroups) {
    let hasWinningState = false;

    for (const stateAbbr of group.states) {
      const actualColor = stateHighlights.get(stateAbbr);
      // If this state has the group's color, this group is "winning" for at least one state
      if (actualColor === group.color) {
        hasWinningState = true;
        break;
      }
    }

    // Add group to winning list if it has at least one winning state
    // and we haven't already added this exact group
    if (hasWinningState) {
      const groupKey = `${group.color}:${group.label}`;
      if (!processedGroups.has(groupKey)) {
        winningGroups.push({
          color: group.color,
          label: group.label,
          states: group.states
        });
        processedGroups.add(groupKey);
      }
    }
  }

  return winningGroups;
}

/**
 * Get all state data (colors and winning groups)
 * @returns {Object} - { colors: {...}, groups: [...] }
 */
export function getAllStateData() {
  return {
    colors: Object.fromEntries(stateHighlights),
    groups: getWinningGroups()
  };
}

/**
 * Get the current default color
 * @returns {string} - Hex color code
 */
export function getDefaultColor() {
  return DEFAULT_HIGHLIGHT_COLOR;
}

/**
 * Set a new default color
 * @param {string} color - Hex color code
 */
export function setDefaultColor(color) {
  DEFAULT_HIGHLIGHT_COLOR = color;
}

/**
 * Clear all state highlights
 */
export function clearAllColors() {
  stateHighlights.clear();
}

/**
 * Get the number of currently highlighted states
 * @returns {number}
 */
export function getHighlightedStateCount() {
  return stateHighlights.size;
}

/**
 * Save current state configuration to file
 * Persists state highlights across server restarts
 * Uses atomic write pattern to prevent data corruption
 */
async function saveStateToFile() {
  try {
    const data = {
      colorConfig: currentColorConfig,
      savedAt: new Date().toISOString()
    };

    // Atomic write pattern: write to temp file, then rename
    const tempPath = `${STATE_FILE_PATH}.tmp`;

    // Ensure directory exists
    const dir = path.dirname(STATE_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });

    // Write to temp file
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');

    // Atomic rename (overwrites target if exists)
    await fs.rename(tempPath, STATE_FILE_PATH);

    logger.debug('State highlights saved to file', {
      filePath: STATE_FILE_PATH,
      groupCount: currentColorConfig.length,
      stateCount: stateHighlights.size
    });
  } catch (error) {
    logger.error('Failed to save state highlights to file', {
      filePath: STATE_FILE_PATH,
      error: error.message,
      stack: error.stack
    });
  }
}

/**
 * Load state configuration from file
 * Restores state highlights from previous session
 */
export function loadStateFromFile() {
  try {
    // Check if file exists
    if (!fsSync.existsSync(STATE_FILE_PATH)) {
      logger.debug('No state highlights file found, starting with empty state', {
        filePath: STATE_FILE_PATH
      });
      return;
    }

    // Read and parse file
    const fileContent = fsSync.readFileSync(STATE_FILE_PATH, 'utf8');
    const data = JSON.parse(fileContent);

    // Validate data structure
    if (!data || !data.colorConfig || !Array.isArray(data.colorConfig)) {
      logger.warn('Invalid state highlights file format, ignoring', {
        filePath: STATE_FILE_PATH
      });
      return;
    }

    // Restore state
    processColorConfig(data.colorConfig);

    logger.info('State highlights loaded from file', {
      filePath: STATE_FILE_PATH,
      groupCount: data.colorConfig.length,
      stateCount: stateHighlights.size,
      savedAt: data.savedAt
    });
  } catch (error) {
    logger.error('Failed to load state highlights from file', {
      filePath: STATE_FILE_PATH,
      error: error.message,
      stack: error.stack
    });
  }
}
