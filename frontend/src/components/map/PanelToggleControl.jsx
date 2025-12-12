import { useUIState } from '../../contexts/UIStateContext';
import { MAP_CONFIG } from '../../config/mapConfig';
import './PanelToggleControl.css';

/**
 * Control buttons for toggling visibility of MapLegend, InfoPanel, and Clustering
 * Positioned below CustomZoomControl on the map
 */
function PanelToggleControl() {
  const {
    showMapLegend,
    setShowMapLegend,
    showInfoPanel,
    setShowInfoPanel,
    clusteringEnabled,
    toggleClustering
  } = useUIState();

  // Check if panels are enabled via environment variables
  const legendEnabled = import.meta.env.VITE_SHOW_LEGEND !== 'false';
  const infoPanelEnabled = import.meta.env.VITE_SHOW_INFO_PANEL !== 'false';

  // Check if clustering is supported in deployment config
  const clusteringSupported = MAP_CONFIG?.clustering !== undefined;

  // Don't render anything if all controls are disabled
  if (!legendEnabled && !infoPanelEnabled && !clusteringSupported) {
    return null;
  }

  return (
    <div className="panel-toggle-control">
      {legendEnabled && (
        <button
          onClick={() => setShowMapLegend(!showMapLegend)}
          title={showMapLegend ? 'Hide legend' : 'Show legend'}
          aria-label={showMapLegend ? 'Hide legend' : 'Show legend'}
          aria-pressed={showMapLegend}
          className={!showMapLegend ? 'inactive' : ''}
        >
          L
        </button>
      )}
      {infoPanelEnabled && (
        <button
          onClick={() => setShowInfoPanel(!showInfoPanel)}
          title={showInfoPanel ? 'Hide info panel' : 'Show info panel'}
          aria-label={showInfoPanel ? 'Hide info panel' : 'Show info panel'}
          aria-pressed={showInfoPanel}
          className={!showInfoPanel ? 'inactive' : ''}
        >
          I
        </button>
      )}
      {clusteringSupported && (
        <button
          onClick={toggleClustering}
          title={clusteringEnabled ? 'Disable clustering' : 'Enable clustering'}
          aria-label={clusteringEnabled ? 'Disable clustering' : 'Enable clustering'}
          aria-pressed={clusteringEnabled}
          className={!clusteringEnabled ? 'inactive' : ''}
        >
          C
        </button>
      )}
    </div>
  );
}

export default PanelToggleControl;
