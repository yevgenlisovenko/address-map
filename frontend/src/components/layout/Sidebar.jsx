import { useState } from 'react';
import PropTypes from 'prop-types';
import PinTimeSelector from '../pins/PinTimeSelector';
import MarkersList from '../pins/MarkersList';
import Stats from '../stats/Stats';
import PropertyFilter from '../filters/PropertyFilter';
import { useAppConfig, useSocketContext } from '../../contexts';
import './Sidebar.css';

export default function Sidebar({
  selectedTimeWindow,
  onTimeWindowChange,
  onCustomTimeSubmit,
  visibleMarkers,
  showAllPins,
  pinsToShow,
  onToggleShowAll,
  onMarkerClick,
  propertyFilters,
  onPropertyFilterChange
}) {
  // Get config and connection status from contexts
  const { config } = useAppConfig();
  const { isConnected } = useSocketContext();
  const [activeTab, setActiveTab] = useState('stats');

  return (
    <div className="sidebar">
      {/* Tab Navigation */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === 'filter' ? 'active' : ''}`}
          onClick={() => setActiveTab('filter')}
        >
          Filter
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>
      </div>

      {/* Filter Tab Content */}
      {activeTab === 'filter' && (
        <>
          <div className="sidebar-fixed-top">
            {config && (
              <PinTimeSelector
                config={config}
                selectedTimeWindow={selectedTimeWindow}
                onPresetChange={onTimeWindowChange}
                onCustomTimeSubmit={onCustomTimeSubmit}
                isConnected={isConnected}
              />
            )}
            <PropertyFilter
              propertyFilters={propertyFilters}
              onFilterChange={onPropertyFilterChange}
            />
          </div>
          <div className="sidebar-scrollable-middle"></div>
          <div className="sidebar-fixed-bottom"></div>
        </>
      )}

      {/* Stats Tab Content */}
      {activeTab === 'stats' && (
        <div className="stats-tab-layout">
          <div className="pins-scrollable-section">
            <MarkersList
              markers={visibleMarkers}
              showAllPins={showAllPins}
              pinsToShow={pinsToShow}
              onToggleShowAll={onToggleShowAll}
              onMarkerClick={onMarkerClick}
            />
          </div>
          <div className="stats-fixed-section">
            <Stats markers={visibleMarkers} />
          </div>
        </div>
      )}
    </div>
  );
}

Sidebar.propTypes = {
  selectedTimeWindow: PropTypes.string.isRequired,
  onTimeWindowChange: PropTypes.func.isRequired,
  onCustomTimeSubmit: PropTypes.func.isRequired,
  visibleMarkers: PropTypes.array.isRequired,
  showAllPins: PropTypes.bool.isRequired,
  pinsToShow: PropTypes.number.isRequired,
  onToggleShowAll: PropTypes.func.isRequired,
  onMarkerClick: PropTypes.func,
  propertyFilters: PropTypes.object,
  onPropertyFilterChange: PropTypes.func.isRequired,
};
