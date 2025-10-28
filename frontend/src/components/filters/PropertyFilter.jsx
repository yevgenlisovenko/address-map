import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FILTER_CONFIG } from '../../config/filterConfig';
import './PropertyFilter.css';

export default function PropertyFilter({ propertyFilters, onFilterChange }) {
  const [filters, setFilters] = useState(propertyFilters || {});
  const [expandedDropdowns, setExpandedDropdowns] = useState({});

  // Initialize dropdowns collapsed with no items selected (only on mount)
  useEffect(() => {
    // Start with empty filters (no items selected)
    const initialFilters = {};
    setFilters(initialFilters);
    onFilterChange(initialFilters);

    // All dropdowns collapsed by default
    const initialExpanded = {};
    FILTER_CONFIG.filterableProperties
      .filter(p => p.enabled && p.values)
      .forEach(property => {
        initialExpanded[property.propertyName] = false;
      });
    setExpandedDropdowns(initialExpanded);
  }, []); // Empty deps = run only on mount

  // Get enabled filterable properties from config
  const enabledProperties = FILTER_CONFIG.filterableProperties.filter(p => p.enabled);

  // Toggle dropdown expanded state
  const handleToggleDropdown = (propertyName) => {
    setExpandedDropdowns(prev => ({
      ...prev,
      [propertyName]: !prev[propertyName]
    }));
  };

  // Handle dropdown selection change
  const handleDropdownChange = (propertyName, value) => {
    setFilters(prev => {
      const currentValues = prev[propertyName]?.values || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value) // Remove if already selected
        : [...currentValues, value]; // Add if not selected

      const newFilters = {
        ...prev,
        [propertyName]: {
          type: 'dropdown',
          values: newValues
        }
      };

      // Remove property if no values selected
      if (newValues.length === 0) {
        delete newFilters[propertyName];
      }

      onFilterChange(newFilters);
      return newFilters;
    });
  };

  // Handle text input change
  const handleTextChange = (propertyName, value) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [propertyName]: {
          type: 'text',
          value: value.trim()
        }
      };

      // Remove property if text is empty
      if (!value.trim()) {
        delete newFilters[propertyName];
      }

      onFilterChange(newFilters);
      return newFilters;
    });
  };

  // Clear all filters
  const handleClearAll = () => {
    setFilters({});
    onFilterChange({});
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).reduce((count, filter) => {
    if (filter.type === 'dropdown') {
      return count + filter.values.length;
    } else if (filter.type === 'text' && filter.value) {
      return count + 1;
    }
    return count;
  }, 0);

  if (enabledProperties.length === 0) {
    return null;
  }

  return (
    <div className="property-filter">
      <h3>Filters</h3>

      {enabledProperties.map(property => {
        const hasValues = property.values && property.values.length > 0;
        const currentFilter = filters[property.propertyName];
        const isExpanded = expandedDropdowns[property.propertyName] || false;

        return (
          <div key={property.propertyName} className="filter-group">
            {hasValues ? (
              // Dropdown multi-select mode with collapsible UI
              <>
                <div
                  className="dropdown-header"
                  onClick={() => handleToggleDropdown(property.propertyName)}
                >
                  <span className="dropdown-title">
                    {property.displayName} ({currentFilter?.values?.length || 0} selected)
                  </span>
                  <span className={`dropdown-arrow ${isExpanded ? 'expanded' : ''}`}>
                    ▼
                  </span>
                </div>

                {isExpanded && (
                  <div className="dropdown-content">
                    {property.values.map(value => {
                      const isSelected = currentFilter?.values?.includes(value) || false;
                      return (
                        <label key={value} className="filter-checkbox">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleDropdownChange(property.propertyName, value)}
                          />
                          <span>{value}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              // Text input mode (contains logic)
              <>
                <label className="filter-label">{property.displayName}</label>
                <input
                  type="text"
                  className="filter-text-input"
                  placeholder={`Filter by ${property.displayName}...`}
                  value={currentFilter?.value || ''}
                  onChange={(e) => handleTextChange(property.propertyName, e.target.value)}
                />
              </>
            )}
          </div>
        );
      })}

      {activeFilterCount > 0 && (
        <div className="filter-footer">
          <div className="active-filters-count">
            Active filters: {activeFilterCount}
          </div>
          <button className="clear-filters-button" onClick={handleClearAll}>
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}

PropertyFilter.propTypes = {
  propertyFilters: PropTypes.object,
  onFilterChange: PropTypes.func.isRequired,
};
