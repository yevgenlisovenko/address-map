import { useState, useEffect, useCallback } from 'react';
import Map from './components/map/Map';
import Sidebar from './components/layout/Sidebar';
import InfoPanel from './components/layout/InfoPanel';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';
import { AppConfigProvider, SocketProvider, useAppConfig, useSocketContext } from './contexts';
import { usePropertyFilter } from './hooks/usePropertyFilter';
import { useDocumentMeta } from './hooks/useDocumentMeta';
import { DEFAULT_PINS_TO_SHOW } from './utils/constants';
import './App.css';

function App() {
  return (
    <AppConfigProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AppConfigProvider>
  );
}

function AppContent() {
  // Document meta (title, favicon)
  useDocumentMeta();

  // Access shared state via contexts
  const { config, loading, error } = useAppConfig();
  const { socket, isConnected, markers, setStatus, stateHighlightData } = useSocketContext();

  // UI state
  const [showAllPins, setShowAllPins] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [selectedTimeWindow, setSelectedTimeWindow] = useState('1hr');
  const [timeSelectionMode, setTimeSelectionMode] = useState('preset');
  const [customStartTime, setCustomStartTime] = useState(null);
  const [selectedMarkerCoords, setSelectedMarkerCoords] = useState(null);
  const [propertyFilters, setPropertyFilters] = useState({});

  // Initialize selectedTimeWindow from config when loaded
  useEffect(() => {
    if (config && config.defaultTimeWindow) {
      setSelectedTimeWindow(config.defaultTimeWindow);
    }
  }, [config]);

  // Filter markers based on time window AND properties
  const visibleMarkers = usePropertyFilter(
    markers,
    config,
    selectedTimeWindow,
    timeSelectionMode,
    customStartTime,
    propertyFilters
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

  const handleMarkerClick = useCallback((marker) => {
    setSelectedMarkerCoords({ lat: marker.lat, lon: marker.lon });
  }, []);

  const handlePropertyFilterChange = useCallback((filters) => {
    setPropertyFilters(filters);
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
      {/* Sidebar toggle button */}
      <button
        className={`sidebar-toggle-button ${isSidebarVisible ? 'sidebar-open' : ''}`}
        onClick={handleToggleSidebar}
      >
        {isSidebarVisible ? '✕' : '☰'}
      </button>

      {/* Info Panel */}
      <InfoPanel
        selectedTimeWindow={selectedTimeWindow}
        timeSelectionMode={timeSelectionMode}
        customStartTime={customStartTime}
        propertyFilters={propertyFilters}
        pinCount={visibleMarkers.length}
        isConnected={isConnected}
        sidebarVisible={isSidebarVisible}
        config={config}
        visibleMarkers={visibleMarkers}
      />

      {/* Sidebar - always rendered, controlled by CSS transform */}
      <Sidebar
        isVisible={isSidebarVisible}
        selectedTimeWindow={selectedTimeWindow}
        onTimeWindowChange={handleTimeWindowChange}
        onCustomTimeSubmit={handleCustomTimeSubmit}
        visibleMarkers={visibleMarkers}
        showAllPins={showAllPins}
        pinsToShow={DEFAULT_PINS_TO_SHOW}
        onToggleShowAll={handleToggleShowAll}
        onMarkerClick={handleMarkerClick}
        propertyFilters={propertyFilters}
        onPropertyFilterChange={handlePropertyFilterChange}
      />

      <div className="map-container">
        <Map
          markers={visibleMarkers}
          sidebarVisible={isSidebarVisible}
          stateHighlightData={stateHighlightData}
          selectedMarkerCoords={selectedMarkerCoords}
        />
      </div>
    </div>
  );
}

export default App;
