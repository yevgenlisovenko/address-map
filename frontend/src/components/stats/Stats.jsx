import { memo } from 'react';
import PropTypes from 'prop-types';
import { STATS_CONFIG } from '../../config/statsConfig';
import { useAggregations } from '../../hooks/useAggregations';
import './Stats.css';

function Stats({ markers }) {
  // Calculate aggregations for visible markers
  const aggregations = useAggregations(markers);

  // Aggregate statistics for a specific property
  const aggregateStats = (markers, propertyName) => {
    const counts = {};

    // Count occurrences of each value
    markers.forEach(marker => {
      if (marker.properties && marker.properties[propertyName] !== undefined) {
        const value = marker.properties[propertyName];
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    // Convert to array of [value, count] pairs
    const entries = Object.entries(counts);

    // Sort based on config
    entries.sort((a, b) => {
      if (STATS_CONFIG.sortOrder === 'desc') {
        return b[1] - a[1]; // Descending: most to least
      } else {
        return a[1] - b[1]; // Ascending: least to most
      }
    });

    // Limit to max items
    return entries.slice(0, STATS_CONFIG.maxItemsPerProperty);
  };

  // Get enabled properties
  const enabledProperties = STATS_CONFIG.trackedProperties.filter(p => p.enabled);

  // Don't render if no properties are enabled
  if (enabledProperties.length === 0) {
    return null;
  }

  // Show empty state when no markers
  const hasNoMarkers = markers.length === 0;

  return (
    <div className="sidebar-group">

      <h3>Statistics</h3>

      {hasNoMarkers && (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-message">No statistics available</div>
          <div className="empty-state-submessage">
            Statistics will appear once pins are loaded
          </div>
        </div>
      )}

      <div className="stats">

        {/* Aggregations Section */}
        {Object.entries(aggregations).map(([aggId, operations]) => {
          const aggConfig = STATS_CONFIG.aggregations.find(a => a.id === aggId);

          // Only show if configured to show in Stats
          if (!aggConfig || !aggConfig.showInStats) {
            return null;
          }

          return (
            <div key={aggId} className="stat-section">
              <h4>{aggConfig.displayName}</h4>
              <div className="aggregations-list">
                {Object.entries(operations).map(([operation, result]) => (
                  <div key={operation} className="aggregation-item">
                    <span className="aggregation-label">
                      {operation.charAt(0).toUpperCase() + operation.slice(1)}:
                    </span>
                    <span className="aggregation-value">{result.formatted}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Leaderboard Sections */}
        {enabledProperties.map(property => {
          const stats = aggregateStats(markers, property.propertyName);

          // Don't show section if no data
          if (stats.length === 0) {
            return null;
          }

          return (
            <div key={property.propertyName} className="stat-section">
              <h4>{property.displayName}</h4>
              <ul className="leaderboard">
                {stats.map(([value, count], index) => (
                  <li key={value} className="leaderboard-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="value">{String(value)}</span>
                    <span className="count">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Stats.propTypes = {
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      properties: PropTypes.object,
    })
  ).isRequired,
};

// Memoize Stats to prevent recalculation when markers haven't changed
export default memo(Stats, (prevProps, nextProps) => {
  return prevProps.markers === nextProps.markers;
});
