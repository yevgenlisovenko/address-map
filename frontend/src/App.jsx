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

  return (
    <div className="app">
      <div className="sidebar">
        <div className={`address-section ${showAddressForm ? 'expanded' : 'collapsed'}`}>
          <h1>USA Address Map</h1>

          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● Connected' : '○ Disconnected'}
          </div>

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
                {marker.address}
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
            <li>Enter a USA address in the form above</li>
            <li>Click "Add Pin" to add it to the map</li>
            <li>Pins are shared in real-time with all connected clients</li>
            <li>You can also send addresses via API (see README)</li>
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
