import { useEffect, useRef, memo } from "react";
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { defaultMarkerIcon, PROPERTY_MARKERS_MAP } from "../../config/markerColorMapping";
import { DEFAULT_MAP_VIEW } from "../../utils/constants";
import MapLegend from "./MapLegend";
import StatesLayer from "./StatesLayer";
import MarkerPopup from "./MarkerPopup";

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;

/* // Component to handle map bounds when new markers are added
function MapBoundsUpdater({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lon]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);

  return null;
} */

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

function Map({ markers, sidebarVisible, stateHighlightData, selectedMarkerCoords, onMapReady }) {
  // Default center and zoom from constants
  const { center: defaultCenter, zoom: defaultZoom } = DEFAULT_MAP_VIEW;

  // USA boundary coordinates (includes Alaska & Hawaii region)
  const usaBounds = [
    [24.396308, -125.0], // Southwest corner
    [49.384358, -66.93457], // Northeast corner
  ];

  // Track last panned coordinates to prevent repeated panning
  const lastPannedRef = useRef(null);

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

  // Component to expose map instance to parent
  function MapInstanceProvider() {
    const map = useMap();

    useEffect(() => {
      if (onMapReady && map) {
        onMapReady(map);
      }
    }, [map]);

    return null;
  }

  // Component to handle map panning when marker is clicked from list
  function MapPanHandler() {
    const map = useMap();

    useEffect(() => {
      if (selectedMarkerCoords) {
        // Check if these are actually new coordinates
        const isSameLocation = lastPannedRef.current &&
          lastPannedRef.current.lat === selectedMarkerCoords.lat &&
          lastPannedRef.current.lon === selectedMarkerCoords.lon;

        // Only pan if coordinates changed
        if (!isSameLocation) {
          map.flyTo([selectedMarkerCoords.lat, selectedMarkerCoords.lon], 12, {
            duration: 1.5 // smooth animation duration in seconds
          });
          // Update ref to track this pan
          lastPannedRef.current = selectedMarkerCoords;
        }
      }
    }, [selectedMarkerCoords, map]);

    return null;
  }

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        zoomSnap={0.25}
        zoomDelta={0.25}
        style={{ height: "100%", width: "100%" }}
        // maxBounds={usaBounds}
        // maxBoundsViscosity={1.0}
        minZoom={4}
        maxZoom={18}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* State highlighting layer - renders BEFORE markers so markers appear on top */}
        <StatesLayer stateColors={stateHighlightData?.colors || {}} />

        {[...markers]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .map((marker, index) => (
            <Marker
              key={index}
              position={[marker.lat, marker.lon]}
              icon={getMarkerIcon(marker)}
            >
              <Popup>
                <MarkerPopup marker={marker} />
              </Popup>
          </Marker>
        ))}

        {/* <MapBoundsUpdater markers={markers} /> */}
        <MapInstanceProvider />
        <MapResizeHandler />
        <MapPanHandler />
      </MapContainer>

      {/* Map Legend Overlay */}
      <MapLegend stateHighlightData={stateHighlightData} />
    </div>
  );
}

Map.propTypes = {
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
      timestamp: PropTypes.string.isRequired,
      displayName: PropTypes.string,
      type: PropTypes.string,
      address: PropTypes.string,
      properties: PropTypes.object,
    })
  ).isRequired,
  sidebarVisible: PropTypes.bool.isRequired,
  stateHighlightData: PropTypes.shape({
    colors: PropTypes.object,
    groups: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        color: PropTypes.string,
        states: PropTypes.arrayOf(PropTypes.string),
      })
    ),
  }),
  selectedMarkerCoords: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }),
  onMapReady: PropTypes.func,
};

// Memoize Map component to prevent unnecessary re-renders
export default memo(Map, (prevProps, nextProps) => {
  return (
    prevProps.markers === nextProps.markers &&
    prevProps.sidebarVisible === nextProps.sidebarVisible &&
    prevProps.stateHighlightData === nextProps.stateHighlightData &&
    prevProps.selectedMarkerCoords === nextProps.selectedMarkerCoords &&
    prevProps.onMapReady === nextProps.onMapReady
  );
});
