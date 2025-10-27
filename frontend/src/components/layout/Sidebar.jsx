import { useState } from 'react';
import PinTimeSelector from '../pins/PinTimeSelector';
import MarkersList from '../pins/MarkersList';
import Stats from '../stats/Stats';
import './Sidebar.css';

export default function Sidebar({
  config,
  selectedTimeWindow,
  onTimeWindowChange,
  onCustomTimeSubmit,
  isConnected,
  visibleMarkers,
  showAllPins,
  pinsToShow,
  onToggleShowAll
}) {
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
          </div>
          <div className="sidebar-scrollable-middle"></div>
          <div className="sidebar-fixed-bottom"></div>
        </>
      )}

      {/* Stats Tab Content */}
      {activeTab === 'stats' && (
        <>
          <div className="sidebar-fixed-top">
            <MarkersList
              markers={visibleMarkers}
              showAllPins={showAllPins}
              pinsToShow={pinsToShow}
              onToggleShowAll={onToggleShowAll}
            />
          </div>
          <div className={`sidebar-scrollable-middle ${activeTab === 'stats' ? 'scrollable-content' : ''}`}>
            <Stats markers={visibleMarkers} />
          </div>
          <div className="sidebar-fixed-bottom"></div>
        </>
      )}
    </div>
  );
}
