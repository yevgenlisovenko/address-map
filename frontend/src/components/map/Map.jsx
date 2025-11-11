import { useEffect, memo, useMemo } from "react";
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getMarkerIcon } from "../../config/markerColorMapping";
import { DEFAULT_MAP_VIEW } from "../../utils/constants";
import MapLegend from "./MapLegend";
import StatesLayer from "./StatesLayer";
import MarkerPopup from "./MarkerPopup";
import CustomZoomControl from "./CustomZoomControl";

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

// Memoized individual marker component to prevent unnecessary re-renders
// Only re-renders when marker position/properties actually change
const MapMarker = memo(({ marker }) => {
  // getMarkerIcon now uses cache, but we also memoize to prevent recalculation
  // unless marker properties change (marker.id is stable, properties may vary)
  const icon = useMemo(() => getMarkerIcon(marker), [marker.id, marker.properties]);

  // Memoize tooltip content (brief info shown on hover)
  const tooltipContent = useMemo(() => {
    const name = marker.type === "address" ? marker.address : marker.displayName;
    const time = new Date(marker.timestamp).toLocaleTimeString();
    return `${name} | ${time}`;
  }, [marker.type, marker.address, marker.displayName, marker.timestamp]);

  return (
    <Marker
      position={[marker.lat, marker.lon]}
      icon={icon}
    >
      {/* Tooltip: Shows brief info on hover */}
      <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
        {tooltipContent}
      </Tooltip>

      {/* Popup: Shows full details on click */}
      <Popup>
        <MarkerPopup marker={marker} />
      </Popup>
    </Marker>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if marker data actually changed
  // This prevents re-renders when other markers in the array change
  return (
    prevProps.marker.id === nextProps.marker.id &&
    prevProps.marker.lat === nextProps.marker.lat &&
    prevProps.marker.lon === nextProps.marker.lon &&
    prevProps.marker.properties === nextProps.marker.properties
  );
});

MapMarker.displayName = 'MapMarker';

MapMarker.propTypes = {
  marker: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    properties: PropTypes.object,
  }).isRequired,
};

function Map({ markers, sidebarVisible, stateHighlightData, markerToPan, panTrigger }) {
  // Default center and zoom from constants
  const { center: defaultCenter, zoom: defaultZoom } = DEFAULT_MAP_VIEW;

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

  // Component to handle map panning when marker is clicked from list
  function MapPanHandler() {
    const map = useMap();

    useEffect(() => {
      if (markerToPan && panTrigger > 0) {
        // Pan to the selected marker
        map.flyTo([markerToPan.lat, markerToPan.lon], 12, {
          duration: 1.5 // smooth animation duration in seconds
        });
      }
    }, [panTrigger, map, markerToPan]);

    return null;
  }

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        zoomControl={false}
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

        {/* Custom zoom controls with Reset button */}
        <CustomZoomControl />

        {markers.map((marker) => (
          <MapMarker key={marker.id} marker={marker} />
        ))}

        {/* <MapBoundsUpdater markers={markers} /> */}
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
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
  markerToPan: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    timestamp: PropTypes.string,
    type: PropTypes.string,
    address: PropTypes.string,
    displayName: PropTypes.string,
    properties: PropTypes.object,
  }),
  panTrigger: PropTypes.number,
};

// Memoize Map component to prevent unnecessary re-renders
export default memo(Map, (prevProps, nextProps) => {
  return (
    prevProps.markers === nextProps.markers &&
    prevProps.sidebarVisible === nextProps.sidebarVisible &&
    prevProps.stateHighlightData === nextProps.stateHighlightData &&
    prevProps.markerToPan === nextProps.markerToPan &&
    prevProps.panTrigger === nextProps.panTrigger
  );
});
