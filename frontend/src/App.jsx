import { useState, useEffect, useCallback, useMemo } from 'react';
import Map from './components/map/Map';
import Sidebar from './components/layout/Sidebar';
import InfoPanel from './components/layout/InfoPanel';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';
import { AppConfigProvider, SocketProvider, useAppConfig, useSocketContext } from './contexts';
import { usePropertyFilter } from './hooks/usePropertyFilter';
import { useDocumentMeta } from './hooks/useDocumentMeta';
import { DEFAULT_PINS_TO_SHOW } from './utils/constants';
import { STATE_FOCUS_CONFIG } from './config/stateFocusConfig';
import { MAP_CONFIG } from './config/mapConfig';
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
  const [markerToPan, setMarkerToPan] = useState(null);
  const [panTrigger, setPanTrigger] = useState(0);
  const [propertyFilters, setPropertyFilters] = useState({});
  const [focusedState, setFocusedState] = useState(null);

  // Initialize selectedTimeWindow from backend config when loaded
  useEffect(() => {
    if (config && config.pinStorage.defaultTimeWindow) {
      setSelectedTimeWindow(config.pinStorage.defaultTimeWindow);
    }
  }, [config]);

  // Initialize focusedState from frontend deployment config (one-time on mount)
  useEffect(() => {
    if (STATE_FOCUS_CONFIG?.defaultState) {
      setFocusedState(STATE_FOCUS_CONFIG.defaultState);
    }
  }, []); // Empty deps = run once on mount

  // Filter markers by focused state (if any)
  const stateFocusedMarkers = useMemo(() => {
    if (focusedState) {
      return markers.filter(marker => marker.properties?.state === focusedState);
    }
    return markers;
  }, [markers, focusedState]);

  // Filter markers based on time window AND properties
  const visibleMarkers = usePropertyFilter(
    stateFocusedMarkers,
    config,
    selectedTimeWindow,
    timeSelectionMode,
    customStartTime,
    propertyFilters
  );

  // Create a stable copy of visible markers to prevent React reconciliation issues
  // Don't sort - markers are already in correct order (newest first):
  // - Initial pins come sorted from backend
  // - New pins are prepended at position 0
  const sortedVisibleMarkers = useMemo(() => {
    return [...visibleMarkers];
  }, [visibleMarkers]);

  // Event handlers (memoized)
  const handleTimeWindowChange = useCallback((newTimeWindow) => {
    setSelectedTimeWindow(newTimeWindow);
    setTimeSelectionMode('preset');
    setCustomStartTime(null); // Clear custom time when switching to preset mode

    if (socket && isConnected && config) {
      const timeWindowMs = config.pinStorage.timeWindowOptions[newTimeWindow];

      // Ensure time window doesn't exceed max age
      const effectiveWindow = Math.min(timeWindowMs, config.pinStorage.maxAge);
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
    setMarkerToPan(marker);
    setPanTrigger(prev => prev + 1);
  }, []);

  const handlePropertyFilterChange = useCallback((filters) => {
    setPropertyFilters(filters);
  }, []);

  // Auto-reset markerToPan and panTrigger after panning completes
  // This prevents auto-zoom when new markers arrive
  useEffect(() => {
    if (panTrigger > 0 && markerToPan) {
      const timer = setTimeout(() => {
        setMarkerToPan(null);
        setPanTrigger(0);
      }, 1600); // Slightly longer than animation duration (1.5s)

      return () => clearTimeout(timer);
    }
  }, [panTrigger, markerToPan]);

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
        visibleMarkers={sortedVisibleMarkers}
      />

      {/* Sidebar - always rendered, controlled by CSS transform */}
      <Sidebar
        isVisible={isSidebarVisible}
        selectedTimeWindow={selectedTimeWindow}
        onTimeWindowChange={handleTimeWindowChange}
        onCustomTimeSubmit={handleCustomTimeSubmit}
        markers={markers}
        visibleMarkers={sortedVisibleMarkers}
        showAllPins={showAllPins}
        pinsToShow={DEFAULT_PINS_TO_SHOW}
        onToggleShowAll={handleToggleShowAll}
        onMarkerClick={handleMarkerClick}
        propertyFilters={propertyFilters}
        onPropertyFilterChange={handlePropertyFilterChange}
        focusedState={focusedState}
      />

      <div className="map-container">
        <Map
          markers={sortedVisibleMarkers}
          sidebarVisible={isSidebarVisible}
          stateHighlightData={stateHighlightData}
          markerToPan={markerToPan}
          panTrigger={panTrigger}
          focusedState={focusedState}
          setFocusedState={setFocusedState}
          stateFocusConfig={STATE_FOCUS_CONFIG}
          mapConfig={MAP_CONFIG}
        />
      </div>
    </div>
  );
}

export default App;
