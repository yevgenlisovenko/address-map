import React from 'react';
import './TimeWindowSelector.css';

const TimeWindowSelector = ({ value, options, onChange }) => {
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
            {key}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeWindowSelector;
