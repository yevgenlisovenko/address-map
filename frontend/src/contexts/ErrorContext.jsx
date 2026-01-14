import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Context for global error state management
 * Provides a centralized way to handle and display errors across the application
 */
const ErrorContext = createContext(null);

/**
 * Error Provider Component
 * Manages global error state and provides error handling functions
 */
export function ErrorProvider({ children }) {
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'warning', 'error', 'info'

  /**
   * Set an error with optional type
   * @param {string|Error} errorMessage - Error message or Error object
   * @param {string} type - Error type ('error', 'warning', 'info')
   */
  const showError = useCallback((errorMessage, type = 'error') => {
    const message = typeof errorMessage === 'string'
      ? errorMessage
      : errorMessage?.message || 'An unknown error occurred';

    setError(message);
    setErrorType(type);

    // Auto-dismiss non-error types after 5 seconds
    if (type !== 'error') {
      setTimeout(() => {
        clearError();
      }, 5000);
    }
  }, []);

  /**
   * Set a warning message
   * @param {string} message - Warning message
   */
  const showWarning = useCallback((message) => {
    showError(message, 'warning');
  }, [showError]);

  /**
   * Set an info message
   * @param {string} message - Info message
   */
  const showInfo = useCallback((message) => {
    showError(message, 'info');
  }, [showError]);

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setError(null);
    setErrorType(null);
  }, []);

  /**
   * Handle async operations with automatic error catching
   * @param {Function} asyncFn - Async function to execute
   * @param {string} errorPrefix - Optional prefix for error message
   * @returns {Promise} Result of the async function
   */
  const withErrorHandling = useCallback(async (asyncFn, errorPrefix = '') => {
    try {
      return await asyncFn();
    } catch (err) {
      const message = errorPrefix
        ? `${errorPrefix}: ${err.message}`
        : err.message;
      showError(message, 'error');
      throw err; // Re-throw so caller can handle if needed
    }
  }, [showError]);

  const value = {
    error,
    errorType,
    showError,
    showWarning,
    showInfo,
    clearError,
    withErrorHandling,
    hasError: error !== null,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
}

ErrorProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access error context
 * @returns {Object} Error context with state and handlers
 * @throws {Error} If used outside ErrorProvider
 */
export function useError() {
  const context = useContext(ErrorContext);

  if (context === null) {
    throw new Error('useError must be used within ErrorProvider');
  }

  return context;
}
