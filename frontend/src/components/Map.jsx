import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map bounds when new markers are added
function MapBoundsUpdater({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lon]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);

  return null;
}

export default function Map({ markers }) {
  // Default center: Continental USA (excludes Alaska and Hawaii)
  const defaultCenter = [39.8283, -98.5795];
  const defaultZoom = 5;

  // USA boundary coordinates (includes Alaska & Hawaii region)
  const usaBounds = [
    [24.396308, -125.0],   // Southwest corner
    [49.384358, -66.93457] // Northeast corner
  ];

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        maxBounds={usaBounds}
        maxBoundsViscosity={1.0}
        minZoom={4}
        maxZoom={18}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lon]}>
            <Popup>
              <div>
                {marker.type === 'address' ? (
                  <>
                    <strong>{marker.address}</strong>
                    <br />
                    <small>{marker.displayName}</small>
                  </>
                ) : (
                  <>
                    <strong>{marker.displayName}</strong>
                    <br />
                    <small>Lat: {marker.lat}, Lon: {marker.lon}</small>
                  </>
                )}
                <br />
                <small>Added: {new Date(marker.timestamp).toLocaleString()}</small>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* <MapBoundsUpdater markers={markers} /> */}
      </MapContainer>
    </div>
  );
}
