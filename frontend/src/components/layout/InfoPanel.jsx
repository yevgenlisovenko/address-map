import { useState } from 'react';
import PropTypes from 'prop-types';
import { useAggregations } from '../../hooks/useAggregations';
import { STATS_CONFIG } from '../../config/statsConfig';
import { BACKEND_URL } from '../../utils/constants';
import './InfoPanel.css';

export default function InfoPanel({
  selectedTimeWindow,
  timeSelectionMode,
  customStartTime,
  propertyFilters,
  pinCount,
  isConnected,
  sidebarVisible,
  config,
  visibleMarkers
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showConnectionTooltip, setShowConnectionTooltip] = useState(false);

  // Calculate aggregations for visible markers
  const aggregations = useAggregations(visibleMarkers || []);
  // Format time window for display
  const getTimeWindowDisplay = () => {
    if (timeSelectionMode === 'custom' && customStartTime) {
      const customDate = new Date(customStartTime);
      const formatted = customDate.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
      return `Since ${formatted}`;
    }

    // Map time window keys to readable format
    const timeWindowMap = {
      '1hr': 'Last 1 hour',
      '6hr': 'Last 6 hours',
      '12hr': 'Last 12 hours',
      '24hr': 'Last 24 hours',
      '7d': 'Last 7 days',
      '30d': 'Last 30 days'
    };

    return timeWindowMap[selectedTimeWindow] || `Last ${selectedTimeWindow}`;
  };

  // Format property filters for display
  const getFilterDisplay = () => {
    const filterEntries = Object.entries(propertyFilters);

    if (filterEntries.length === 0) {
      return null;
    }

    return filterEntries.map(([propertyName, filter]) => {
      if (filter.type === 'dropdown' && filter.values && filter.values.length > 0) {
        // Find the display name from config
        const propertyConfig = config?.filterableProperties?.find(
          p => p.propertyName === propertyName
        );
        const displayName = propertyConfig?.displayName || propertyName;

        // Show first 5 values, then "...X more" if there are more
        const valuesToShow = filter.values.slice(0, 5);
        const remaining = filter.values.length - 5;
        const valueText = remaining > 0
          ? `${valuesToShow.join(', ')}... +${remaining} more`
          : valuesToShow.join(', ');

        return { displayName, valueText };
      } else if (filter.type === 'text' && filter.value) {
        const propertyConfig = config?.filterableProperties?.find(
          p => p.propertyName === propertyName
        );
        const displayName = propertyConfig?.displayName || propertyName;
        return { displayName, valueText: `contains "${filter.value}"` };
      }
      return null;
    }).filter(Boolean);
  };

  const filterDisplay = getFilterDisplay();
  const hasFilters = filterDisplay && filterDisplay.length > 0;

  return (
    <div className={`info-panel ${sidebarVisible ? 'sidebar-open' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {!isExpanded ? (
        <div
          className="info-collapsed-button"
          onClick={() => setIsExpanded(true)}
          title="Click to expand"
        >
          <span>Info</span>
          <span className="info-panel-toggle">▶</span>
        </div>
      ) : (
        <div className="info-panel-content">
          <button
            className="info-collapse-toggle"
            onClick={() => setIsExpanded(false)}
            title="Click to collapse"
          >
            ▼
          </button>
        {/* Time Window */}
        <div className="info-section">
          <div className="info-section-icon">⏱️</div>
          <div className="info-section-content">
            <div className="info-section-label">Time Window</div>
            <div className="info-section-value">{getTimeWindowDisplay()}</div>
          </div>
        </div>

        {/* Pin Count */}
        <div className="info-section">
          <div className="info-section-icon">📍</div>
          <div className="info-section-content">
            <div className="info-section-label">Pins on Map</div>
            <div className="info-section-value">{pinCount} pins displayed</div>
          </div>
        </div>

        {/* Statistics - Only show aggregations configured for InfoPanel */}
        {Object.entries(aggregations).map(([aggId, operations]) => {
          const aggConfig = STATS_CONFIG.aggregations.find(a => a.id === aggId);

          // Only show if configured to show in InfoPanel
          if (!aggConfig || !aggConfig.showInInfoPanel) {
            return null;
          }

          return (
            <div key={aggId} className="info-section">
              <div className="info-section-icon">📊</div>
              <div className="info-section-content">
                <div className="info-section-label">{aggConfig.displayName}</div>
                <div className="info-stats-list">
                  {Object.entries(operations).map(([operation, result]) => (
                    <div key={operation} className="info-stat-item">
                      <span className="stat-label">
                        {operation.charAt(0).toUpperCase() + operation.slice(1)}:
                      </span>{' '}
                      <span className="stat-value">{result.formatted}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Active Filters - Only show if filters exist */}
        {hasFilters && (
          <div className="info-section">
            <div className="info-section-icon">🔍</div>
            <div className="info-section-content">
              <div className="info-section-label">Active Filters</div>
              <div className="info-filters-list">
                {filterDisplay.map((filter, index) => (
                  <div key={index} className="info-filter-item">
                    <span className="filter-property">{filter.displayName}:</span>{' '}
                    <span className="filter-values">{filter.valueText}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Connection Status - At the bottom */}
        <div className="info-section info-section-connection">
          <div className="info-section-icon">🔗</div>
          <div
            className="info-section-content info-connection-wrapper"
            onMouseEnter={() => setShowConnectionTooltip(true)}
            onMouseLeave={() => setShowConnectionTooltip(false)}
          >
            <div className={`info-connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              <span className="connection-indicator">●</span>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            {showConnectionTooltip && (
              <div className="connection-tooltip">
                <div><strong>Server:</strong> {config?.service?.name || 'Unknown'}</div>
                <div><strong>Environment:</strong> {config?.service?.environment || 'Unknown'}</div>
                <div><strong>URL:</strong> {BACKEND_URL}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

InfoPanel.propTypes = {
  selectedTimeWindow: PropTypes.string.isRequired,
  timeSelectionMode: PropTypes.string.isRequired,
  customStartTime: PropTypes.number,
  propertyFilters: PropTypes.object,
  pinCount: PropTypes.number.isRequired,
  isConnected: PropTypes.bool.isRequired,
  sidebarVisible: PropTypes.bool.isRequired,
  config: PropTypes.object,
  visibleMarkers: PropTypes.array
};
