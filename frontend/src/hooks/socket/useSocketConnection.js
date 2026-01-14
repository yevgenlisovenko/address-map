import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { logger } from '../../utils/logger';
import { useError } from '../../contexts/ErrorContext';

/**
 * Custom hook to manage Socket.IO connection lifecycle
 * @param {string} url - Backend URL for socket connection
 * @returns {Object} { socket, isConnected, connectionError }
 */
export const useSocketConnection = (url) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const { showError, showWarning, clearError } = useError();

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInstance = io(url);

    socketInstance.on('connect', () => {
      logger.log('Connected to server');
      setIsConnected(true);
      setConnectionError(null);
      clearError(); // Clear any previous connection errors

      // Request initial state highlights from server
      socketInstance.emit('request-initial-state');
    });

    socketInstance.on('disconnect', () => {
      logger.log('Disconnected from server');
      setIsConnected(false);
      showWarning('Disconnected from server. Attempting to reconnect...');
    });

    socketInstance.on('connect_error', (error) => {
      logger.error('Connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
      showError(`Connection failed: ${error.message}`);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [url]);

  return {
    socket,
    isConnected,
    connectionError,
  };
};
