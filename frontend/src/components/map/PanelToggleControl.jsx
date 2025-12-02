import PropTypes from 'prop-types';
import './PanelToggleControl.css';

/**
 * Control buttons for toggling visibility of MapLegend and InfoPanel
 * Positioned below CustomZoomControl on the map
 */
function PanelToggleControl({
  showMapLegend,
  setShowMapLegend,
  showInfoPanel,
  setShowInfoPanel
}) {
  // Check if panels are enabled via environment variables
  const legendEnabled = import.meta.env.VITE_SHOW_LEGEND !== 'false';
  const infoPanelEnabled = import.meta.env.VITE_SHOW_INFO_PANEL !== 'false';

  // Don't render anything if both panels are disabled
  if (!legendEnabled && !infoPanelEnabled) {
    return null;
  }

  return (
    <div className="panel-toggle-control">
      {legendEnabled && (
        <button
          onClick={() => setShowMapLegend(!showMapLegend)}
          title={showMapLegend ? 'Hide legend' : 'Show legend'}
          aria-label={showMapLegend ? 'Hide legend' : 'Show legend'}
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
          className={!showInfoPanel ? 'inactive' : ''}
        >
          I
        </button>
      )}
    </div>
  );
}

PanelToggleControl.propTypes = {
  showMapLegend: PropTypes.bool.isRequired,
  setShowMapLegend: PropTypes.func.isRequired,
  showInfoPanel: PropTypes.bool.isRequired,
  setShowInfoPanel: PropTypes.func.isRequired
};

export default PanelToggleControl;
