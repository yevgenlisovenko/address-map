import { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSocketConnection } from '../hooks/socket/useSocketConnection';
import { useMarkers } from '../hooks/socket/useMarkers';
import { useStateHighlights } from '../hooks/socket/useStateHighlights';
import { BACKEND_URL } from '../utils/constants';

/**
 * Context for Socket.IO connection and real-time data
 * Provides socket, connection status, markers, and state highlights
 */
const SocketContext = createContext(null);

/**
 * Provider component for Socket.IO functionality
 * Manages socket connection and all real-time data subscriptions
 */
export function SocketProvider({ children }) {
  // Socket connection
  const { socket, isConnected, connectionError } = useSocketConnection(BACKEND_URL);

  // Markers state
  const { markers, setMarkers, status: markersStatus, setStatus: setMarkersStatus } = useMarkers(socket);

  // State highlights
  const { stateHighlightData, status: highlightsStatus, setStatus: setHighlightsStatus } = useStateHighlights(socket);

  // Combine status from markers and highlights (prefer markers status if both exist)
  const status = markersStatus || highlightsStatus || '';

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // Socket connection
    socket,
    isConnected,
    connectionError,

    // Markers
    markers,
    setMarkers,

    // Status
    status,
    setStatus: setMarkersStatus, // Expose markers setStatus as the primary setStatus

    // State highlights
    stateHighlightData,
  }), [
    socket,
    isConnected,
    connectionError,
    markers,
    setMarkers,
    status,
    setMarkersStatus,
    stateHighlightData,
  ]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access Socket.IO context
 * @returns {Object} { socket, isConnected, markers, status, stateHighlightData, ... }
 * @throws {Error} If used outside SocketProvider
 */
export function useSocketContext() {
  const context = useContext(SocketContext);

  if (context === null) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }

  return context;
}
