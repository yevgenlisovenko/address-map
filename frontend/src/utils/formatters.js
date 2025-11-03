/**
 * Number formatting utilities for aggregations
 */

/**
 * Format a number as currency (USD)
 * @param {number} value - The numeric value
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, decimals = 2) {
  if (value == null || isNaN(value)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format a number with thousand separators
 * @param {number} value - The numeric value
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted number string
 */
export function formatNumber(value, decimals = 0) {
  if (value == null || isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Format a number as percentage
 * @param {number} value - The numeric value (0-100 or 0-1)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @param {boolean} isDecimal - Whether input is 0-1 (default: false, expects 0-100)
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 1, isDecimal = false) {
  if (value == null || isNaN(value)) {
    return '0%';
  }

  const percentValue = isDecimal ? value * 100 : value;

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(percentValue) + '%';
}

/**
 * Format a value based on the specified format type
 * @param {number} value - The numeric value
 * @param {string} format - Format type: 'currency', 'number', or 'percentage'
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted string
 */
export function formatValue(value, format = 'number', decimals = 0) {
  switch (format) {
    case 'currency':
      return formatCurrency(value, decimals);
    case 'percentage':
      return formatPercentage(value, decimals);
    case 'number':
    default:
      return formatNumber(value, decimals);
  }
}
