import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';

/**
 * Custom hook to fetch and manage application configuration from backend
 * @param {string} backendUrl - Backend API URL
 * @returns {Object} { config, loading, error }
 */
export const useConfig = (backendUrl) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${backendUrl}/api/config`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setConfig(data.pinStorage);
        setError(null);
      } catch (err) {
        logger.error('Failed to load config:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [backendUrl]);

  return { config, loading, error };
};
