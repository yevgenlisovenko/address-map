import { useState, useEffect } from 'react';
import { logger } from '../../utils/logger';

/**
 * Custom hook to manage state highlight data from socket events
 * @param {Object} socket - Socket.IO instance
 * @returns {Object} { stateHighlightData, setStatus }
 */
export const useStateHighlights = (socket) => {
  const [stateHighlightData, setStateHighlightData] = useState({
    colors: {},
    groups: []
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!socket) return;

    const handleStateHighlightsUpdate = (data) => {
      logger.log('State highlights updated:', data);
      setStateHighlightData(data);

      const count = Object.keys(data.colors || {}).length;
      setStatus(count > 0 ? `${count} states highlighted` : 'State highlights cleared');
    };

    // Register event listener
    socket.on('state-highlights-update', handleStateHighlightsUpdate);

    // Cleanup event listener on unmount or socket change
    return () => {
      socket.off('state-highlights-update', handleStateHighlightsUpdate);
    };
  }, [socket]);

  return {
    stateHighlightData,
    status,
    setStatus,
  };
};
