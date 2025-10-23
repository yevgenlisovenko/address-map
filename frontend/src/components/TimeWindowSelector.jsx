import React from 'react';
import './TimeWindowSelector.css';

const TimeWindowSelector = ({ value, options, onChange }) => {
  // Format label for display
  /*const formatLabel = (key) => {
    if (key.endsWith('min')) {
      return key.replace('min', ' min');
    } else if (key.endsWith('hr')) {
      return key.replace('hr', ' hour' + (key === '1hr' ? '' : 's'));
    }
    return key;
  };*/

  return (
    <div className="time-window-selector">
      <label htmlFor="time-window">Show pins from last:</label>
      <select 
        id="time-window"
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="time-window-select"
      >
        {Object.keys(options).map((key) => (
          <option key={key} value={key}>
            {/* {formatLabel(key)} */}
            {key}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeWindowSelector;
