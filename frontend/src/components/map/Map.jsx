import { useEffect, memo, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from "leaflet";
import { getMarkerIcon, createMarkerIcon, DEPLOYMENT_CONFIG } from "../../config/markerColorMapping";
import { DEFAULT_MAP_VIEW } from "../../utils/constants";
import { TOOLTIP_CONFIG } from "../../config/tooltipConfig";
import { NEW_MARKER_HIGHLIGHT_CONFIG } from "../../config/newMarkerHighlightConfig";
import { formatTooltipHTML } from "../../utils/tooltipFormatter";
import { formatPopupContent } from "../../utils/popupFormatter";
import { createTypeAwareClusterIcon, createClusterTooltipContent } from "../../utils/clusterUtils";
import { STATE_FOCUS_CONFIG } from "../../config/stateFocusConfig";
import { MAP_CONFIG } from "../../config/mapConfig";
import { useSocketContext } from "../../contexts";
import { useUIState } from "../../contexts/UIStateContext";
import { useFilterState } from "../../contexts/FilterStateContext";
import { useMapInteraction } from "../../contexts/MapInteractionContext";
import { useFilteredMarkers } from "../../hooks/useFilteredMarkers";
import MapLegend from "./MapLegend";
import StatesLayer from "./StatesLayer";
import CustomZoomControl from "./CustomZoomControl";
import PanelToggleControl from "./PanelToggleControl";
import StateFocusHandler from "./StateFocusHandler";
import NamedErrorBoundary from "../common/NamedErrorBoundary";
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import '../../styles/ClusterStyles.css';

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
  // Create marker icon with optional highlight for new markers
  const icon = useMemo(() => {
    // Early return if feature disabled OR marker is not new - ZERO overhead
    if (!NEW_MARKER_HIGHLIGHT_CONFIG?.enabled || !marker.__isNew) {
      return getMarkerIcon(marker);
    }

    // Feature enabled and marker is new - apply highlight style
    const baseIcon = getMarkerIcon(marker);
    const style = NEW_MARKER_HIGHLIGHT_CONFIG.style || 'glow';
    const className = `marker-new-${style}`;

    return createMarkerIcon(
      baseIcon.options.iconUrl,
      className
    );
  }, [marker.id, marker.properties, marker.__isNew]);

  return (
    <Marker
      position={[marker.lat, marker.lon]}
      icon={icon}
      zIndexOffset={marker.__isNew ? 1000 : 0}
      markerData={marker}  // Store marker data for cluster utilities
      eventHandlers={{
        click: (e) => {
          const popupContent = formatPopupContent(marker);
          e.target.bindPopup(popupContent).openPopup();
        },
        mouseover: (e) => {
          const tooltipHTML = formatTooltipHTML(marker, TOOLTIP_CONFIG);
          if (tooltipHTML) {
            e.target.bindTooltip(tooltipHTML, {
              direction: "top",
              offset: [0, -20],
              opacity: 0.9
            }).openTooltip();
          }
        },
        mouseout: (e) => {
          e.target.closeTooltip();
        }
      }}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if marker data actually changed
  // This prevents re-renders when other markers in the array change
  return (
    prevProps.marker.id === nextProps.marker.id &&
    prevProps.marker.lat === nextProps.marker.lat &&
    prevProps.marker.lon === nextProps.marker.lon &&
    prevProps.marker.timestamp === nextProps.marker.timestamp &&
    prevProps.marker.properties === nextProps.marker.properties &&
    prevProps.marker.__isNew === nextProps.marker.__isNew
  );
});

MapMarker.displayName = 'MapMarker';

function Map() {
  // Get state from contexts
  const { stateHighlightData } = useSocketContext();
  const { isSidebarVisible, clusteringEnabled, showMapLegend, toggleMapLegend } = useUIState();
  const { focusedState, onFocusedStateChange } = useFilterState();
  const { markerToPan, panTrigger, isViewingPinDetail, setIsViewingPinDetail } = useMapInteraction();
  const markers = useFilteredMarkers();

  // Use imported config constants
  const stateFocusConfig = STATE_FOCUS_CONFIG;
  const mapConfig = MAP_CONFIG;

  // Get map settings from config (with fallbacks to constants for backward compatibility)
  const defaultCenter = mapConfig?.defaultView?.center || DEFAULT_MAP_VIEW.center;
  const defaultZoom = mapConfig?.defaultView?.zoom || DEFAULT_MAP_VIEW.zoom;

  // Get clustering config from mapConfig or DEPLOYMENT_CONFIG
  // Override enabled property with runtime state from UIContext
  const clusterConfig = useMemo(() => {
    const config = mapConfig?.clustering || DEPLOYMENT_CONFIG.map?.clustering || {};
    return {
      ...config,
      enabled: clusteringEnabled  // Runtime override from toggle button
    };
  }, [mapConfig, clusteringEnabled]);

  // Merge focused state highlight with regular state highlights
  const mergedStateHighlightData = useMemo(() => {
    if (!focusedState || !stateFocusConfig?.enabled) {
      return stateHighlightData;
    }

    const apiColors = stateHighlightData?.colors || {};
    const mergedColors = { ...apiColors };

    // Only add focus color if the state is NOT already highlighted by API
    if (!apiColors[focusedState]) {
      mergedColors[focusedState] = stateFocusConfig.highlightColor || '#3388ff';
    }

    return {
      colors: mergedColors,
      groups: stateHighlightData?.groups || [],
    };
  }, [focusedState, stateHighlightData, stateFocusConfig]);

  // Component to handle map resize when sidebar visibility changes
  function MapResizeHandler() {
    const map = useMap();

    useEffect(() => {
      // Small delay to allow CSS transition to complete
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 300);

      return () => clearTimeout(timer);
    }, [isSidebarVisible, map]);

    return null;
  }

  // Component to handle map panning when marker is clicked from list
  function MapPanHandler() {
    const map = useMap();

    useEffect(() => {
      if (markerToPan && panTrigger > 0 && mapConfig?.markerPan?.enabled !== false) {
        // Pan to the selected marker with configurable zoom and duration
        map.flyTo(
          [markerToPan.lat, markerToPan.lon],
          mapConfig?.markerPan?.zoomLevel || 12,
          {
            duration: mapConfig?.markerPan?.duration || 1.5
          }
        );
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
        zoomSnap={mapConfig?.zoom?.snap ?? 0.25}
        zoomDelta={mapConfig?.zoom?.delta ?? 0.25}
        style={{ height: "100%", width: "100%" }}
        maxBounds={mapConfig?.bounds?.enabled ? mapConfig.bounds.coordinates : undefined}
        maxBoundsViscosity={mapConfig?.bounds?.enabled ? (mapConfig.bounds.viscosity ?? 1.0) : undefined}
        minZoom={mapConfig?.zoom?.min ?? 4}
        maxZoom={mapConfig?.zoom?.max ?? 18}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* State highlighting layer - renders BEFORE markers so markers appear on top */}
        <NamedErrorBoundary name="StatesLayer" silent>
          <StatesLayer stateColors={mergedStateHighlightData?.colors || {}} />
        </NamedErrorBoundary>

        {/* Panel toggle controls - positioned above zoom controls */}
        <PanelToggleControl />

        {/* Custom zoom controls with Reset button and State selector */}
        <CustomZoomControl
          focusedState={focusedState}
          setFocusedState={onFocusedStateChange}
          stateFocusConfig={stateFocusConfig}
          isViewingPinDetail={isViewingPinDetail}
          setIsViewingPinDetail={setIsViewingPinDetail}
        />

        {/* State focus handler for auto-zoom */}
        {stateFocusConfig?.enabled && (
          <StateFocusHandler
            focusedState={focusedState}
            autoZoom={stateFocusConfig.autoZoom}
          />
        )}

        {/* Markers with optional clustering */}
        {clusterConfig?.enabled ? (
          <MarkerClusterGroup
            maxClusterRadius={clusterConfig.maxClusterRadius || 80}
            disableClusteringAtZoom={clusterConfig.disableClusteringAtZoom || 15}
            showCoverageOnHover={clusterConfig.showCoverageOnHover ?? false}
            spiderfyOnMaxZoom={clusterConfig.spiderfyOnMaxZoom ?? true}
            animate={clusterConfig.animate ?? true}
            chunkedLoading={clusterConfig.chunkedLoading ?? true}
            iconCreateFunction={(cluster) => createTypeAwareClusterIcon(cluster, clusterConfig)}
            eventHandlers={{
              clustermouseover: (e) => {
                if (clusterConfig.typeAware?.showTooltipBreakdown) {
                  const tooltipContent = createClusterTooltipContent(e.layer);
                  e.layer.bindTooltip(tooltipContent, {
                    direction: "top",
                    offset: [0, -10],
                    opacity: 0.9,
                    className: 'cluster-tooltip'
                  }).openTooltip();
                }
              },
              clustermouseout: (e) => {
                if (clusterConfig.typeAware?.showTooltipBreakdown) {
                  e.layer.closeTooltip();
                }
              }
            }}
          >
            {markers.map((marker) => (
              <MapMarker key={marker.id} marker={marker} />
            ))}
          </MarkerClusterGroup>
        ) : (
          markers.map((marker) => (
            <MapMarker key={marker.id} marker={marker} />
          ))
        )}

        {/* <MapBoundsUpdater markers={markers} /> */}
        <MapResizeHandler />
        <MapPanHandler />
      </MapContainer>

      {/* Map Legend Overlay */}
      {showMapLegend && (
        <MapLegend
          stateHighlightData={mergedStateHighlightData}
          onClose={toggleMapLegend}
        />
      )}
    </div>
  );
}

// Export without memoization since we're using contexts
// Context changes will trigger re-renders appropriately
export default Map;
