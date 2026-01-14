import { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useConfig } from '../hooks/useConfig';
import { BACKEND_URL } from '../utils/constants';

/**
 * Context for application configuration
 * Provides config, loading, and error states to all child components
 */
const AppConfigContext = createContext(null);

/**
 * Provider component for application configuration
 * Fetches config from backend and makes it available via context
 */
export function AppConfigProvider({ children }) {
  const { config, loading, error } = useConfig(BACKEND_URL);

  const value = {
    config,
    loading,
    error,
  };

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
}

AppConfigProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access application configuration
 * @returns {Object} { config, loading, error }
 * @throws {Error} If used outside AppConfigProvider
 */
export function useAppConfig() {
  const context = useContext(AppConfigContext);

  if (context === null) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }

  return context;
}
