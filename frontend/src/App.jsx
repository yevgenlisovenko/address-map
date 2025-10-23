import { useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import Map from './components/Map';
import Info from './components/Info';
import ConnectionStatus from './components/ConnectionStatus';
import AddressCoordinatesInput from './components/AddressCoordinatesInput';
import MarkersList from './components/MarkersList';
import Stats from './components/Stats';
import TimeWindowSelector from './components/TimeWindowSelector';
import './App.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const DEFAULT_PINS_TO_SHOW = 10; // Configurable
const PIN_FILTER_UPDATE_INTERVAL = 60000; // 60 seconds - how often to re-evaluate visible pins

function App() {
  const [markers, setMarkers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('');
  const [showAllPins, setShowAllPins] = useState(false);
  const [pinsToShow] = useState(DEFAULT_PINS_TO_SHOW);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [inputMode, setInputMode] = useState('address');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [label, setLabel] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [stateHighlightData, setStateHighlightData] = useState({
    colors: {},
    groups: []
  });
  const [config, setConfig] = useState(null);
  const [selectedTimeWindow, setSelectedTimeWindow] = useState('1hr');
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Set document title from environment variable
  useEffect(() => {
    const appTitle = import.meta.env.VITE_APP_TITLE;
    if (appTitle) {
      document.title = appTitle;
    }

    // Set favicon if specified
    const appFavicon = import.meta.env.VITE_APP_FAVICON;
    if (appFavicon) {
      const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = appFavicon;
      if (!document.querySelector("link[rel~='icon']")) {
        document.head.appendChild(link);
      }
    }
  }, []);

  // Fetch config from backend on mount
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/config`)
      .then(res => res.json())
      .then(data => {
        setConfig(data.pinStorage);
        setSelectedTimeWindow(data.pinStorage.defaultTimeWindow);
      })
      .catch(err => console.error('Failed to load config:', err));
  }, []);

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInstance = io(BACKEND_URL);

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
      setStatus(`Loaded ${data.count} pins from last ${selectedTimeWindow}`);
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
  }, []);

  // Periodic timer to update current time and re-evaluate visible pins
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, PIN_FILTER_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Filter markers based on selected time window
  const visibleMarkers = useMemo(() => {
    if (!config) return markers;

    const timeWindowMs = config.timeWindowOptions[selectedTimeWindow];
    if (!timeWindowMs) return markers;

    const cutoffTime = currentTime - timeWindowMs;

    return markers.filter(pin => {
      const pinTime = new Date(pin.timestamp).getTime();
      return pinTime >= cutoffTime;
    });
  }, [markers, selectedTimeWindow, config, currentTime]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!address.trim()) {
      setStatus('Please enter an address');
      return;
    }

    if (!socket || !isConnected) {
      setStatus('Not connected to server');
      return;
    }

    // Send address to server
    socket.emit('new-address', { address });
    setStatus(`Geocoding: ${address}...`);
    setAddress('');
  };

  const handleCoordinatesSubmit = (e) => {
    e.preventDefault();

    if (!latitude.trim() || !longitude.trim()) {
      setStatus('Please enter latitude and longitude');
      return;
    }

    if (!socket || !isConnected) {
      setStatus('Not connected to server');
      return;
    }

    // Send coordinates to server
    socket.emit('new-coordinates', {
      lat: latitude,
      lon: longitude,
      label: label.trim() || undefined
    });
    setStatus(`Adding pin at: ${latitude}, ${longitude}...`);
    setLatitude('');
    setLongitude('');
    setLabel('');
  };

  const handleTimeWindowChange = (newTimeWindow) => {
    setSelectedTimeWindow(newTimeWindow);

    if (socket && isConnected) {
      // Request pins for new time window
      socket.emit('request-pins', { timeWindow: newTimeWindow });
      setStatus(`Loading pins from last ${newTimeWindow}...`);
    }
  };

  return (
    <div className="app">
      <button
        className="sidebar-toggle-button"
        onClick={() => setIsSidebarVisible(!isSidebarVisible)}
      >
        {isSidebarVisible ? '▶' : '◀'}
      </button>

      {isSidebarVisible && (
        <div className="sidebar">
          {/* <h1>Real-time Map</h1> */}

          <ConnectionStatus isConnected={isConnected} />

          {config && (
            <TimeWindowSelector
              value={selectedTimeWindow}
              options={config.timeWindowOptions}
              onChange={handleTimeWindowChange}
            />
          )}

          {/* <AddressCoordinatesInput
            showAddressForm={showAddressForm}
            inputMode={inputMode}
            address={address}
            latitude={latitude}
            longitude={longitude}
            label={label}
            status={status}
            isConnected={isConnected}
            onToggleForm={() => setShowAddressForm(!showAddressForm)}
            onInputModeChange={setInputMode}
            onAddressChange={setAddress}
            onLatitudeChange={setLatitude}
            onLongitudeChange={setLongitude}
            onLabelChange={setLabel}
            onAddressSubmit={handleSubmit}
            onCoordinatesSubmit={handleCoordinatesSubmit}
          /> */}

          <MarkersList
            markers={visibleMarkers}
            showAllPins={showAllPins}
            pinsToShow={pinsToShow}
            onToggleShowAll={() => setShowAllPins(!showAllPins)}
          />

          <Stats markers={visibleMarkers} />

          {/* <Info /> */}
        </div>
      )}

      <div className="map-container">
        <Map markers={visibleMarkers} sidebarVisible={isSidebarVisible} stateHighlightData={stateHighlightData} />
      </div>
    </div>
  );
}

export default App;
