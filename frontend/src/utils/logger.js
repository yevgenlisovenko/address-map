/**
 * Environment-aware logging utility
 * Logs only in development mode, silenced in production
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Log informational messages (only in development)
   * @param {...any} args - Arguments to log
   */
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log error messages (only in development)
   * In production, you could send to error tracking service (Sentry, LogRocket, etc.)
   * @param {...any} args - Arguments to log
   */
  error: (...args) => {
    if (isDevelopment) {
      console.error(...args);
    }
    // TODO: In production, send to error tracking service
    // if (!isDevelopment) {
    //   sendToErrorTracking(args);
    // }
  },

  /**
   * Log warning messages (only in development)
   * @param {...any} args - Arguments to log
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log debug messages (only in development)
   * @param {...any} args - Arguments to log
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};
