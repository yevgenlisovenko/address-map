import MapComponent from '../map/Map';
import Sidebar from './Sidebar';
import InfoPanel from './InfoPanel';
import ErrorDisplay from '../common/ErrorDisplay';
import NamedErrorBoundary from '../common/NamedErrorBoundary';
import MapFallback from '../common/fallbacks/MapFallback';
import SidebarSectionFallback from '../common/fallbacks/SidebarSectionFallback';
import SidebarToggleButton from './SidebarToggleButton';
import { useUIState } from '../../contexts/UIStateContext';
import { useFilteredMarkers } from '../../hooks/useFilteredMarkers';

/**
 * AppLayout - Main application layout component
 *
 * Pure presentational component that composes:
 * - Error display
 * - Sidebar toggle button
 * - Info panel (conditional)
 * - Sidebar
 * - Map
 *
 * All state access via contexts - no prop drilling
 */
export default function AppLayout() {
  const { isSidebarVisible, showInfoPanel, setShowInfoPanel } = useUIState();
  const visibleMarkers = useFilteredMarkers();

  return (
    <div className="app">
      {/* Global error/warning/info display */}
      <ErrorDisplay />

      {/* Sidebar toggle button */}
      <SidebarToggleButton />

      {/* Info Panel */}
      {showInfoPanel && (
        <NamedErrorBoundary
          name="InfoPanel"
          fallback={<SidebarSectionFallback sectionName="Info Panel" icon="ℹ️" />}
        >
          <InfoPanel onClose={() => setShowInfoPanel(false)} />
        </NamedErrorBoundary>
      )}

      {/* Sidebar - always rendered, controlled by CSS transform */}
      <NamedErrorBoundary
        name="Sidebar"
        fallback={
          <div className={`sidebar ${isSidebarVisible ? 'visible' : 'hidden'}`}>
            <SidebarSectionFallback sectionName="Sidebar" icon="📋" />
          </div>
        }
      >
        <Sidebar />
      </NamedErrorBoundary>

      <div className="map-container">
        <NamedErrorBoundary
          name="Map"
          fallback={({ onReset }) => (
            <MapFallback markers={visibleMarkers} onReset={onReset} />
          )}
        >
          <MapComponent />
        </NamedErrorBoundary>
      </div>
    </div>
  );
}
