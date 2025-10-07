import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Map from './components/Map';
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

        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '● Connected' : '○ Disconnected'}
        </div>

        <div className={`address-section ${showAddressForm ? 'expanded' : 'collapsed'}`}>
          <div className="input-mode-toggle">
            <button
              className={`mode-button ${inputMode === 'address' ? 'active' : ''}`}
              onClick={() => setInputMode('address')}
            >
              Address
            </button>
            <button
              className={`mode-button ${inputMode === 'coordinates' ? 'active' : ''}`}
              onClick={() => setInputMode('coordinates')}
            >
              Coordinates
            </button>
          </div>

          {inputMode === 'address' ? (
            <form onSubmit={handleSubmit} className="address-form">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter USA address..."
                className="address-input"
              />
              <button type="submit" disabled={!isConnected} className="submit-button">
                Add Pin
              </button>
            </form>
          ) : (
            <form onSubmit={handleCoordinatesSubmit} className="coordinates-form">
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Latitude (-90 to 90)..."
                className="coordinate-input"
              />
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Longitude (-180 to 180)..."
                className="coordinate-input"
              />
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Label (optional)..."
                className="label-input"
              />
              <button type="submit" disabled={!isConnected} className="submit-button">
                Add Pin
              </button>
            </form>
          )}

          <div className="status">
            {status && <p>{status}</p>}
          </div>
        </div>

        <div className="markers-list">
          <div className="markers-header">
            <h3>Pins ({markers.length})</h3>
            <button
              className="toggle-form-button"
              onClick={() => setShowAddressForm(!showAddressForm)}
            >
              {showAddressForm ? '▼' : '▶'} Add Address
            </button>
          </div>
          <ul>
            {(showAllPins
              ? [...markers].reverse()
              : [...markers].reverse().slice(0, pinsToShow)
            ).map((marker, index) => (
              <li key={index}>
                {marker.type === 'address' ? marker.address : marker.displayName}
                <br />
                <small>{new Date(marker.timestamp).toLocaleTimeString()}</small>
              </li>
            ))}
          </ul>
          {markers.length > pinsToShow && (
            <button
              className="show-more-button"
              onClick={() => setShowAllPins(!showAllPins)}
            >
              {showAllPins ? 'Show Less' : `Show All (${markers.length})`}
            </button>
          )}
        </div>

        <div className="info">
          <h3>How to use:</h3>
          <ul>
            <li>Toggle between Address or Coordinates mode</li>
            <li>Address mode: Enter a USA address and geocode it</li>
            <li>Coordinates mode: Enter lat/lon directly with optional label</li>
            <li>Click "Add Pin" to add it to the map</li>
            <li>Pins are shared in real-time with all connected clients</li>
          </ul>
        </div>
      </div>

      <div className="map-container">
        <Map markers={markers} />
      </div>
    </div>
  );
}

export default App;
