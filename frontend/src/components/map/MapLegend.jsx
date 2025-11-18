import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { PROPERTY_MARKERS_MAP, defaultMarkerIcon, DEPLOYMENT_CONFIG } from '../../config/markerColorMapping';
import './MapLegend.css';

export default function MapLegend({ stateHighlightData = { colors: {}, groups: [] } }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Get legend configuration from deployment config (loaded at build time)
  const legendConfig = DEPLOYMENT_CONFIG?.legend || {
    autoGroupDuplicates: false,
    groupLabels: {},
    defaultExpanded: false,
  };

  // Get all marker icon URLs for display
  const getIconUrl = (icon) => {
    if (icon && icon.options && icon.options.iconUrl) {
      return icon.options.iconUrl;
    }
    return null;
  };

  // Format property name for display (camelCase to Title Case)
  const formatPropertyName = (propertyName) => {
    return propertyName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Group legend items by icon URL (for duplicate icons)
  const groupedLegendItems = useMemo(() => {
    if (!legendConfig.autoGroupDuplicates) {
      // Return ungrouped format
      return { grouped: [], ungrouped: Object.entries(PROPERTY_MARKERS_MAP).flatMap(([propertyName, valueMap]) =>
        Object.entries(valueMap).map(([value, iconData]) => ({
          value,
          iconData,
          icon: iconData?.icon || iconData,
          label: iconData?.label || value,
          iconUrl: getIconUrl(iconData?.icon || iconData),
        }))
      )};
    }

    // Group items by icon URL
    const iconGroups = {};
    const allItems = [];

    Object.entries(PROPERTY_MARKERS_MAP).forEach(([propertyName, valueMap]) => {
      Object.entries(valueMap).forEach(([value, iconData]) => {
        const icon = iconData?.icon || iconData;
        const label = iconData?.label || value;
        const iconUrl = getIconUrl(icon);

        const item = { value, iconData, icon, label, iconUrl };
        allItems.push(item);

        if (iconUrl) {
          if (!iconGroups[iconUrl]) {
            iconGroups[iconUrl] = [];
          }
          iconGroups[iconUrl].push(item);
        }
      });
    });

    // Separate grouped and ungrouped items
    const grouped = [];
    const ungrouped = [];

    Object.entries(iconGroups).forEach(([iconUrl, items]) => {
      if (items.length >= 1) {
        // Group all items (even single items) for consistent appearance
        const firstItem = items[0];
        // Extract iconId by searching PROPERTY_MARKERS_MAP for matching icon URL
        const iconId = Object.entries(PROPERTY_MARKERS_MAP).reduce((acc, [propName, propMap]) => {
          const found = Object.entries(propMap).find(([val, data]) => {
            return data?.url === iconUrl;
          });
          return found?.[1]?.iconId || acc;
        }, null);

        const groupLabel = iconId && legendConfig.groupLabels[iconId]
          ? legendConfig.groupLabels[iconId]
          : `Multiple items (${items.length})`;

        grouped.push({
          iconUrl,
          icon: firstItem.icon,
          groupLabel,
          count: items.length,
          items,
        });
      }
      // Note: All items are now grouped (even single items) for consistent appearance
    });

    return { grouped, ungrouped };
  }, [legendConfig]);

  // Toggle group expansion
  const toggleGroup = (iconUrl) => {
    setExpandedGroups(prev => ({
      ...prev,
      [iconUrl]: !prev[iconUrl]
    }));
  };

  // Check if legend should be shown based on environment variable
  const showLegend = import.meta.env.VITE_SHOW_LEGEND !== 'false';

  if (!showLegend) {
    return null;
  }

  // Check if there are any mappings to display
  const hasMappings = Object.keys(PROPERTY_MARKERS_MAP).length > 0;

  // Check if we have state highlight groups with labels
  const hasStateHighlights = stateHighlightData?.groups?.length > 0;

  // Show legend if we have either marker mappings or state highlights
  const hasAnyLegendItems = hasMappings || hasStateHighlights;

  if (!hasAnyLegendItems) {
    return null;
  }

  return (
    <div className={`map-legend ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {!isExpanded ? (
        <div
          className="legend-collapsed-button"
          onClick={() => setIsExpanded(true)}
          title="Click to expand"
        >
          <span>Legend</span>
          <span className="legend-toggle">▶</span>
        </div>
      ) : (
        <div className="legend-content">
          <button
            className="legend-collapse-toggle"
            onClick={() => setIsExpanded(false)}
            title="Click to collapse"
          >
            ▼
          </button>
          {/* Marker property legends */}
          {hasMappings && (
            <div className="legend-section">
              {/* <div className="legend-section-title">Markers</div> */}
              <div className="legend-items">
                {/* Render grouped items */}
                {groupedLegendItems.grouped.map((group) => {
                  const isGroupExpanded = expandedGroups[group.iconUrl] ?? legendConfig.defaultExpanded;
                  return (
                    <div key={group.iconUrl} className="legend-group">
                      <div
                        className="legend-group-header"
                        onClick={() => toggleGroup(group.iconUrl)}
                        title={isGroupExpanded ? 'Click to collapse' : 'Click to expand'}
                      >
                        {group.iconUrl && (
                          <img
                            src={group.iconUrl}
                            alt={group.groupLabel}
                            className="legend-marker-icon"
                          />
                        )}
                        <span className="legend-group-toggle">
                          {isGroupExpanded ? '▼' : '▶'}
                        </span>
                        <span className="legend-marker-label">{group.groupLabel}</span>
                        {/* <span className="legend-group-count">({group.count})</span> */}
                      </div>
                      {isGroupExpanded && (
                        <div className="legend-group-items">
                          {group.items.map((item) => (
                            <div key={item.value} className="legend-item legend-group-item">
                              <span className="legend-marker-label">• {item.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Render ungrouped items */}
                {groupedLegendItems.ungrouped.map((item) => (
                  <div key={item.value} className="legend-item">
                    {item.iconUrl && (
                      <img
                        src={item.iconUrl}
                        alt={item.label}
                        className="legend-marker-icon"
                      />
                    )}
                    <span className="legend-marker-label">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* State highlights legend */}
          {hasStateHighlights && (
            <div className="legend-section">
              <div className="legend-section-title">State Highlights</div>
              <div className="legend-items">
                {stateHighlightData.groups.map((group, index) => (
                  <div key={index} className="legend-item">
                    <div
                      className="legend-color-box"
                      style={{ backgroundColor: group.color }}
                      title={`${group.states.length} states`}
                    />
                    <span className="legend-state-label">{group.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

MapLegend.propTypes = {
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
};
