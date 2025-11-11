/**
 * Tooltip Content Formatter
 *
 * Utility for formatting marker tooltip content based on deployment configuration.
 * Tooltips always show Name and Time, followed by configurable additional fields.
 */

import React from 'react';
import { formatCurrency, formatNumber } from './formatters.js';

/**
 * Format property value for display in tooltip
 * @param {*} value - Property value (any type)
 * @param {string} propertyName - Property name (used to infer formatting)
 * @returns {string} Formatted value string
 */
function formatPropertyValue(value, propertyName) {
  if (value === null || value === undefined) return null; // Will be filtered out
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  // Auto-format currency fields (premium, coverageAmount, etc.)
  if (typeof value === 'number' &&
      (propertyName.toLowerCase().includes('premium') ||
       propertyName.toLowerCase().includes('coverage') ||
       propertyName.toLowerCase().includes('amount'))) {
    return formatCurrency(value, 0);
  }

  // Format other numbers with thousand separators
  if (typeof value === 'number') {
    return formatNumber(value, 0);
  }

  return String(value);
}

/**
 * Format tooltip content for a marker based on configuration
 * Multi-line format with each field on its own line:
 * - Line 1: Name
 * - Line 2: Time
 * - Line 3+: Property1: Value1
 * - Line 4+: Property2: Value2
 * @param {Object} marker - Marker object with properties
 * @param {Object} config - Tooltip configuration from deployment config
 * @returns {JSX.Element|null} Formatted multi-line tooltip JSX content
 */
export function formatTooltipContent(marker, config) {
  // If tooltips are disabled, return null
  if (!config.enabled) {
    return null;
  }

  const lines = [];

  // Line 1: Name
  const name = marker.type === "address" ? marker.address : marker.displayName;
  if (name) {
    lines.push(name);
  }

  // Line 2: Time
  if (marker.timestamp) {
    const time = new Date(marker.timestamp).toLocaleTimeString();
    lines.push(time);
  }

  // Additional properties (sorted by order)
  if (config.additionalFields && config.additionalFields.length > 0) {
    // Sort fields by order
    const sortedFields = [...config.additionalFields].sort((a, b) => a.order - b.order);

    // Add each configured field as its own line
    sortedFields.forEach(field => {
      const value = marker.properties?.[field.propertyName];
      const formattedValue = formatPropertyValue(value, field.propertyName);

      // Only add if value exists
      if (formattedValue !== null) {
        lines.push(`${field.displayName}: ${formattedValue}`);
      }
    });
  }

  // Return JSX with div elements for each line
  return (
    <>
      {lines.map((line, index) => (
        <div key={index}>{line}</div>
      ))}
    </>
  );
}
