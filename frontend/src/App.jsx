import { useState, useEffect, useCallback } from 'react';
import Map from './components/map/Map';
import Sidebar from './components/layout/Sidebar';
import FloatingControls from './components/layout/FloatingControls';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';
import { useSocket } from './hooks/useSocket';
import { useConfig } from './hooks/useConfig';
import { usePinFilter } from './hooks/usePinFilter';
import { useDocumentMeta } from './hooks/useDocumentMeta';
import { BACKEND_URL, DEFAULT_PINS_TO_SHOW } from './utils/constants';
import './App.css';

function App() {
  // Custom hooks
  useDocumentMeta();
  const { socket, isConnected, markers, status, setStatus, stateHighlightData } = useSocket(BACKEND_URL);
  const { config, loading, error } = useConfig(BACKEND_URL);

  // UI state
  const [showAllPins, setShowAllPins] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [selectedTimeWindow, setSelectedTimeWindow] = useState('1hr');
  const [timeSelectionMode, setTimeSelectionMode] = useState('preset');
  const [customStartTime, setCustomStartTime] = useState(null);

  // Initialize selectedTimeWindow from config when loaded
  useEffect(() => {
    if (config && config.defaultTimeWindow) {
      setSelectedTimeWindow(config.defaultTimeWindow);
    }
  }, [config]);

  // Filter markers based on time window
  const visibleMarkers = usePinFilter(
    markers,
    config,
    selectedTimeWindow,
    timeSelectionMode,
    customStartTime
  );

  // Event handlers (memoized)
  const handleTimeWindowChange = useCallback((newTimeWindow) => {
    setSelectedTimeWindow(newTimeWindow);
    setTimeSelectionMode('preset');

    if (socket && isConnected && config) {
      const timeWindowMs = config.timeWindowOptions[newTimeWindow];

      // Ensure time window doesn't exceed max age
      const effectiveWindow = Math.min(timeWindowMs, config.maxAge);
      const time = Date.now() - effectiveWindow;

      // Request pins for new time window
      socket.emit('request-pins', { timeWindow: newTimeWindow, startingTime: time });
      setStatus(`Loading pins from last ${newTimeWindow}...`);
    }
  }, [socket, isConnected, config, setStatus]);

  const handleCustomTimeSubmit = useCallback((customTimestamp) => {
    if (!socket || !isConnected) {
      setStatus('Not connected to server');
      return;
    }

    // Store custom time and set mode
    setCustomStartTime(customTimestamp);
    setTimeSelectionMode('custom');

    // Format the custom time for display
    const customDate = new Date(customTimestamp);
    const formattedTime = customDate.toLocaleString();

    // Request pins from custom start time
    socket.emit('request-pins', { startingTime: customTimestamp });
    setStatus(`Loading pins from ${formattedTime}...`);
  }, [socket, isConnected, setStatus]);

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarVisible(prev => !prev);
  }, []);

  const handleToggleShowAll = useCallback(() => {
    setShowAllPins(prev => !prev);
  }, []);

  // Loading and error states
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="app">
      <FloatingControls
        isConnected={isConnected}
        isSidebarVisible={isSidebarVisible}
        onToggleSidebar={handleToggleSidebar}
      />

      {isSidebarVisible && (
        <Sidebar
          config={config}
          selectedTimeWindow={selectedTimeWindow}
          onTimeWindowChange={handleTimeWindowChange}
          onCustomTimeSubmit={handleCustomTimeSubmit}
          isConnected={isConnected}
          visibleMarkers={visibleMarkers}
          showAllPins={showAllPins}
          pinsToShow={DEFAULT_PINS_TO_SHOW}
          onToggleShowAll={handleToggleShowAll}
        />
      )}

      <div className="map-container">
        <Map
          markers={visibleMarkers}
          sidebarVisible={isSidebarVisible}
          stateHighlightData={stateHighlightData}
        />
      </div>
    </div>
  );
}

export default App;
