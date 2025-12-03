import { useEffect, memo, useMemo } from "react";
import PropTypes from 'prop-types';
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

MapMarker.propTypes = {
  marker: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    properties: PropTypes.object,
  }).isRequired,
};

function Map({ markers, sidebarVisible, stateHighlightData, markerToPan, panTrigger, focusedState, setFocusedState, stateFocusConfig, mapConfig, isViewingPinDetail, setIsViewingPinDetail, showMapLegend, setShowMapLegend, showInfoPanel, setShowInfoPanel }) {
  // Get map settings from config (with fallbacks to constants for backward compatibility)
  const defaultCenter = mapConfig?.defaultView?.center || DEFAULT_MAP_VIEW.center;
  const defaultZoom = mapConfig?.defaultView?.zoom || DEFAULT_MAP_VIEW.zoom;

  // Get clustering config from mapConfig or DEPLOYMENT_CONFIG
  const clusterConfig = useMemo(() => {
    return mapConfig?.clustering || DEPLOYMENT_CONFIG.map?.clustering || { enabled: false };
  }, [mapConfig]);

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
    }, [sidebarVisible, map]);

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
        <PanelToggleControl
          showMapLegend={showMapLegend}
          setShowMapLegend={setShowMapLegend}
          showInfoPanel={showInfoPanel}
          setShowInfoPanel={setShowInfoPanel}
        />

        {/* Custom zoom controls with Reset button and State selector */}
        <CustomZoomControl
          focusedState={focusedState}
          setFocusedState={setFocusedState}
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
          onClose={() => setShowMapLegend(false)}
        />
      )}
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
  focusedState: PropTypes.string,
  setFocusedState: PropTypes.func,
  stateFocusConfig: PropTypes.shape({
    enabled: PropTypes.bool,
    defaultState: PropTypes.string,
    availableStates: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    autoZoom: PropTypes.bool,
    highlightColor: PropTypes.string,
  }),
  mapConfig: PropTypes.shape({
    defaultView: PropTypes.shape({
      center: PropTypes.arrayOf(PropTypes.number),
      zoom: PropTypes.number,
    }),
    zoom: PropTypes.shape({
      snap: PropTypes.number,
      delta: PropTypes.number,
      min: PropTypes.number,
      max: PropTypes.number,
    }),
    bounds: PropTypes.shape({
      enabled: PropTypes.bool,
      coordinates: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
      viscosity: PropTypes.number,
    }),
    markerPan: PropTypes.shape({
      enabled: PropTypes.bool,
      zoomLevel: PropTypes.number,
      duration: PropTypes.number,
    }),
  }),
  isViewingPinDetail: PropTypes.bool,
  setIsViewingPinDetail: PropTypes.func,
  showMapLegend: PropTypes.bool,
  setShowMapLegend: PropTypes.func,
  showInfoPanel: PropTypes.bool,
  setShowInfoPanel: PropTypes.func,
};

// Memoize Map component to prevent unnecessary re-renders
export default memo(Map, (prevProps, nextProps) => {
  return (
    prevProps.markers === nextProps.markers &&
    prevProps.sidebarVisible === nextProps.sidebarVisible &&
    prevProps.stateHighlightData === nextProps.stateHighlightData &&
    prevProps.markerToPan === nextProps.markerToPan &&
    prevProps.panTrigger === nextProps.panTrigger &&
    prevProps.focusedState === nextProps.focusedState &&
    prevProps.stateFocusConfig === nextProps.stateFocusConfig &&
    prevProps.mapConfig === nextProps.mapConfig &&
    prevProps.isViewingPinDetail === nextProps.isViewingPinDetail &&
    prevProps.showMapLegend === nextProps.showMapLegend &&
    prevProps.showInfoPanel === nextProps.showInfoPanel
  );
});
