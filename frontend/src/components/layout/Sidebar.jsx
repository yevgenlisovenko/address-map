import { useState } from 'react';
import PinTimeSelector from '../pins/PinTimeSelector';
import MarkersList from '../pins/MarkersList';
import Stats from '../stats/Stats';
import PropertyFilter from '../filters/PropertyFilter';
import AI from '../ai/AI';
import NamedErrorBoundary from '../common/NamedErrorBoundary';
import SidebarSectionFallback from '../common/fallbacks/SidebarSectionFallback';
import { useAppConfig, useSocketContext } from '../../contexts';
import { useUIState } from '../../contexts/UIStateContext';
import { useFilterState } from '../../contexts/FilterStateContext';
import { useMapInteraction } from '../../contexts/MapInteractionContext';
import { useFilteredMarkers } from '../../hooks/useFilteredMarkers';
import './Sidebar.css';

export default function Sidebar() {
  // Get state from contexts
  const { config } = useAppConfig();
  const { isConnected, markers } = useSocketContext();
  const { isSidebarVisible } = useUIState();
  const {
    selectedTimeWindow,
    onTimeWindowChange,
    onCustomTimeSubmit,
    propertyFilters,
    onPropertyFilterChange,
    focusedState
  } = useFilterState();
  const { onMarkerClick } = useMapInteraction();
  const visibleMarkers = useFilteredMarkers();

  const [activeTab, setActiveTab] = useState('pins');

  return (
    <div className={`sidebar ${isSidebarVisible ? 'visible' : 'hidden'}`}>
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
          <NamedErrorBoundary
            name="MarkersList"
            fallback={<SidebarSectionFallback sectionName="Markers List" icon="📍" />}
          >
            <MarkersList
              markers={visibleMarkers}
              onMarkerClick={onMarkerClick}
            />
          </NamedErrorBoundary>
        </div>
      </div>

      {/* Stats Tab Content */}
      <div className={`stats-tab-content ${activeTab === 'stats' ? 'active-tab' : ''}`}>
        <div className="stats-tab-scrollable">
          <NamedErrorBoundary
            name="Stats"
            fallback={<SidebarSectionFallback sectionName="Statistics" icon="📊" />}
          >
            <Stats markers={visibleMarkers} />
          </NamedErrorBoundary>
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
            <NamedErrorBoundary
              name="AI"
              fallback={<SidebarSectionFallback sectionName="AI Analysis" icon="🤖" />}
            >
              <AI visibleMarkers={visibleMarkers} />
            </NamedErrorBoundary>
          </div>
        </div>
      )}
    </div>
  );
}
