import { useState, useEffect } from 'react';
import { logger } from '../../utils/logger';
import { useError } from '../../contexts/ErrorContext';

/**
 * Custom hook to manage markers state from socket events
 * @param {Object} socket - Socket.IO instance
 * @returns {Object} { markers, setMarkers, status, setStatus }
 */
export const useMarkers = (socket) => {
  const [markers, setMarkers] = useState([]);
  const [status, setStatus] = useState('');
  const { showError } = useError();

  useEffect(() => {
    if (!socket) return;

    const handleInitialPins = (data) => {
      logger.log(`Received ${data.count} historical pins (newest first)`);
      setMarkers(data.pins);
      setStatus(`Loaded ${data.count} pins from last ${data.timeWindow || 'time window'}`);
    };

    const handleAddPin = (data) => {
      logger.log('New pin received:', data);
      // Add temporary flag to indicate this marker is new
      setMarkers((prev) => [{ ...data, __isNew: true }, ...prev]);
      setStatus(`Pin added: ${data.displayName}`);
    };

    const handleUpdatePin = (data) => {
      logger.log('Pin updated:', data);

      setMarkers((prev) => {
        const existingIndex = prev.findIndex(m => m.id === data.id);

        if (existingIndex === -1) {
          // Defensive: pin not found, add it (handles reconnection edge cases)
          logger.warn('Update for non-existent pin, adding instead:', data.id);
          return [{ ...data, __isNew: true }, ...prev];
        }

        // Remove old marker and prepend updated one (move to newest position)
        const updated = [...prev];
        updated.splice(existingIndex, 1);
        // Add __isNew flag to trigger animation
        return [{ ...data, __isNew: true }, ...updated];
      });

      setStatus(`Pin updated: ${data.displayName}`);
    };

    const handleError = (error) => {
      logger.error('Socket error:', error);
      setStatus(`Error: ${error.message}`);
      showError(`Socket error: ${error.message}`);
    };

    // Register event listeners
    socket.on('initial-pins', handleInitialPins);
    socket.on('add-pin', handleAddPin);
    socket.on('update-pin', handleUpdatePin);
    socket.on('error', handleError);

    // Cleanup event listeners on unmount or socket change
    return () => {
      socket.off('initial-pins', handleInitialPins);
      socket.off('add-pin', handleAddPin);
      socket.off('update-pin', handleUpdatePin);
      socket.off('error', handleError);
    };
  }, [socket]);

  return {
    markers,
    setMarkers,
    status,
    setStatus,
  };
};
