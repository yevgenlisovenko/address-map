import { useState } from 'react';
import PropTypes from 'prop-types';
import PinTimeSelector from '../pins/PinTimeSelector';
import MarkersList from '../pins/MarkersList';
import Stats from '../stats/Stats';
import PropertyFilter from '../filters/PropertyFilter';
import AI from '../ai/AI';
import { useAppConfig, useSocketContext } from '../../contexts';
import './Sidebar.css';

export default function Sidebar({
  isVisible,
  selectedTimeWindow,
  onTimeWindowChange,
  onCustomTimeSubmit,
  markers,
  visibleMarkers,
  onMarkerClick,
  propertyFilters,
  onPropertyFilterChange,
  focusedState
}) {
  // Get config and connection status from contexts
  const { config } = useAppConfig();
  const { isConnected } = useSocketContext();
  const [activeTab, setActiveTab] = useState('pins');

  return (
    <div className={`sidebar ${isVisible ? 'visible' : 'hidden'}`}>
      {/* Tab Navigation */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeTab === 'pins' ? 'active' : ''}`}
          onClick={() => setActiveTab('pins')}
        >
          Pins
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>
        <button
          className={`sidebar-tab ${activeTab === 'filter' ? 'active' : ''}`}
          onClick={() => setActiveTab('filter')}
        >
          Filter
        </button>
        {config?.ai?.enabled && (
          <button
            className={`sidebar-tab ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            AI
          </button>
        )}
      </div>

      {/* Pins Tab Content */}
      <div className={`pins-tab-content ${activeTab === 'pins' ? 'active-tab' : ''}`}>
        <div className="pins-tab-scrollable">
          <MarkersList
            markers={visibleMarkers}
            onMarkerClick={onMarkerClick}
          />
        </div>
      </div>

      {/* Stats Tab Content */}
      <div className={`stats-tab-content ${activeTab === 'stats' ? 'active-tab' : ''}`}>
        <div className="stats-tab-scrollable">
          <Stats markers={visibleMarkers} />
        </div>
      </div>

      {/* Filter Tab Content */}
      <div className={`filter-tab-content ${activeTab === 'filter' ? 'active-tab' : ''}`}>
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
            markers={markers}
            propertyFilters={propertyFilters}
            onFilterChange={onPropertyFilterChange}
            focusedState={focusedState}
          />
        </div>
        <div className="sidebar-scrollable-middle"></div>
        <div className="sidebar-fixed-bottom"></div>
      </div>

      {/* AI Tab Content */}
      {config?.ai?.enabled && (
        <div className={`ai-tab-content ${activeTab === 'ai' ? 'active-tab' : ''}`}>
          <div className="ai-tab-scrollable">
            <AI visibleMarkers={visibleMarkers} />
          </div>
        </div>
      )}
    </div>
  );
}

Sidebar.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  selectedTimeWindow: PropTypes.string.isRequired,
  onTimeWindowChange: PropTypes.func.isRequired,
  onCustomTimeSubmit: PropTypes.func.isRequired,
  markers: PropTypes.array.isRequired,
  visibleMarkers: PropTypes.array.isRequired,
  onMarkerClick: PropTypes.func,
  propertyFilters: PropTypes.object,
  onPropertyFilterChange: PropTypes.func.isRequired,
  focusedState: PropTypes.string,
};
