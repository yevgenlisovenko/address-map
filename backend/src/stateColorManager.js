/**
 * State color management
 * Handles in-memory storage and processing of state highlight colors
 */

// In-memory storage: Map of state abbreviation -> color
const stateHighlights = new Map();

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
    return;
  }

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
