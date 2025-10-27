import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom hook to manage Socket.IO connection and real-time data
 * @param {string} backendUrl - Backend URL for socket connection
 * @returns {Object} { socket, isConnected, markers, setMarkers, status, setStatus, stateHighlightData }
 */
export const useSocket = (backendUrl) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [status, setStatus] = useState('');
  const [stateHighlightData, setStateHighlightData] = useState({
    colors: {},
    groups: []
  });

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInstance = io(backendUrl);

    socketInstance.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setStatus('Connected to server');

      // Request initial state highlights from server
      socketInstance.emit('request-initial-state');
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setStatus('Disconnected from server');
    });

    // Listen for initial historical pins
    socketInstance.on('initial-pins', (data) => {
      console.log(`Received ${data.count} historical pins (newest first)`);
      setMarkers(data.pins);
      setStatus(`Loaded ${data.count} pins from last ${data.timeWindow || 'time window'}`);
    });

    // Listen for new pins (newest first, so prepend)
    socketInstance.on('add-pin', (data) => {
      console.log('New pin received:', data);
      setMarkers((prev) => [data, ...prev]);
      setStatus(`Pin added: ${data.displayName}`);
    });

    // Listen for state highlight updates
    socketInstance.on('state-highlights-update', (data) => {
      console.log('State highlights updated:', data);
      setStateHighlightData(data);
      const count = Object.keys(data.colors || {}).length;
      setStatus(count > 0 ? `${count} states highlighted` : 'State highlights cleared');
    });

    // Listen for errors
    socketInstance.on('error', (error) => {
      console.error('Error:', error);
      setStatus(`Error: ${error.message}`);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [backendUrl]);

  return {
    socket,
    isConnected,
    markers,
    setMarkers,
    status,
    setStatus,
    stateHighlightData
  };
};
