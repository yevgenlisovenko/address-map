import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { defaultMarkerIcon, PROPERTY_MARKERS_MAP } from "../config/markerColorMapping";

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;

// Component to handle map bounds when new markers are added
function MapBoundsUpdater({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lon]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);

  return null;
}

// Function to determine marker icon based on properties
function getMarkerIcon(marker) {
  // Check if marker has properties
  if (!marker.properties || Object.keys(marker.properties).length === 0) {
    return defaultMarkerIcon;
  }

  // Loop through PROPERTY_MARKERS_MAP keys to find matching property
  for (const [propertyName, valueToIconMap] of Object.entries(PROPERTY_MARKERS_MAP)) {
    // Check if marker has this property
    if (marker.properties[propertyName] !== undefined) {
      const propertyValue = marker.properties[propertyName];
      const icon = valueToIconMap[propertyValue];

      // Return icon if mapping found
      if (icon) {
        return icon;
      }
    }
  }

  // No mapping found, return default
  return defaultMarkerIcon;
}

export default function Map({ markers, sidebarVisible }) {
  // Default center: Continental USA (excludes Alaska and Hawaii)
  const defaultCenter = [39.8283, -98.5795];
  const defaultZoom = 5;

  // USA boundary coordinates (includes Alaska & Hawaii region)
  const usaBounds = [
    [24.396308, -125.0], // Southwest corner
    [49.384358, -66.93457], // Northeast corner
  ];

  // Component to handle map resize when sidebar visibility changes
  function MapResizeHandler() {
    const map = useMap();

    useEffect(() => {
      // Small delay to allow CSS transition to complete
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 300);

      return () => clearTimeout(timer);
    }, [sidebarVisible, map]);

    return null;
  }

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
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
          <Marker
            key={index}
            position={[marker.lat, marker.lon]}
            icon={getMarkerIcon(marker)}
          >
            <Popup>
              <div>
                {marker.type === "address" ? (
                  <>
                    <strong>{marker.address}</strong>
                    <br />
                    <small>{marker.displayName}</small>
                  </>
                ) : (
                  <>
                    <strong>{marker.displayName}</strong>
                    <br />
                    <small>
                      Lat: {marker.lat}, Lon: {marker.lon}
                    </small>
                  </>
                )}
                <br />
                <small>
                  Added: {new Date(marker.timestamp).toLocaleString()}
                </small>
                {marker.properties &&
                  Object.keys(marker.properties).length > 0 && (
                    <>
                      <br />
                      <br />
                      <strong>Properties:</strong>
                      <br />
                      {Object.entries(marker.properties).map(([key, value]) => (
                        <div key={key}>
                          <small>
                            <strong>{key}:</strong> {String(value)}
                          </small>
                        </div>
                      ))}
                    </>
                  )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* <MapBoundsUpdater markers={markers} /> */}
        <MapResizeHandler />
      </MapContainer>
    </div>
  );
}
