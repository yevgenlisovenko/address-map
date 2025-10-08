import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Map from './components/Map';
import Info from './components/Info';
import ConnectionStatus from './components/ConnectionStatus';
import AddressCoordinatesInput from './components/AddressCoordinatesInput';
import MarkersList from './components/MarkersList';
import './App.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const DEFAULT_PINS_TO_SHOW = 10; // Configurable

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

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInstance = io(BACKEND_URL);

    socketInstance.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setStatus('Connected to server');
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setStatus('Disconnected from server');
    });

    // Listen for new pins
    socketInstance.on('add-pin', (data) => {
      console.log('New pin received:', data);
      setMarkers((prev) => [...prev, data]);
      setStatus(`Pin added: ${data.displayName}`);
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

  return (
    <div className="app">
      <div className="sidebar">

        <h1>Address Map</h1>

        <ConnectionStatus isConnected={isConnected} />

        <AddressCoordinatesInput
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
        />

        <MarkersList
          markers={markers}
          showAllPins={showAllPins}
          pinsToShow={pinsToShow}
          onToggleShowAll={() => setShowAllPins(!showAllPins)}
        />

        <Info />
      </div>

      <div className="map-container">
        <Map markers={markers} />
      </div>
    </div>
  );
}

export default App;
