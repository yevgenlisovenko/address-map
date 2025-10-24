import React, { useState, useMemo } from 'react';
import './PinTimeSelector.css';

const PinTimeSelector = ({
  config,
  selectedTimeWindow,
  onPresetChange,
  onCustomTimeSubmit,
  isConnected
}) => {
  const [mode, setMode] = useState('preset');
  const [customTime, setCustomTime] = useState('');
  const [error, setError] = useState('');

  // Calculate min and max allowed times for custom input
  const timeConstraints = useMemo(() => {
    if (!config) return null;

    const now = Date.now();
    const minTime = now - config.maxAge; // 24 hours ago
    const maxTime = now;

    // Format to datetime-local format (YYYY-MM-DDTHH:MM)
    const formatForInput = (timestamp) => {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    return {
      minTime,
      maxTime,
      minFormatted: formatForInput(minTime),
      maxFormatted: formatForInput(maxTime)
    };
  }, [config]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError('');
    setCustomTime('');
  };

  const handleCustomTimeChange = (e) => {
    setCustomTime(e.target.value);
    setError('');
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();

    if (!customTime) {
      setError('Please select a time');
      return;
    }

    const selectedTimestamp = new Date(customTime).getTime();
    const now = Date.now();

    // Validate not in future
    if (selectedTimestamp > now) {
      setError('Start time cannot be in the future');
      return;
    }

    // Validate not older than 24 hours
    if (selectedTimestamp < timeConstraints.minTime) {
      setError('Start time cannot be older than 24 hours');
      return;
    }

    // Valid - submit
    setError('');
    onCustomTimeSubmit(selectedTimestamp);
  };

  if (!config) return null;

  return (
    <div className="pin-time-selector">
      <div className="pin-time-selector-header">
        <label>Pin Time Selection</label>
      </div>

      <div className="mode-selection">
        <label className="mode-option">
          <input
            type="radio"
            name="time-mode"
            value="preset"
            checked={mode === 'preset'}
            onChange={() => handleModeChange('preset')}
          />
          <span>Time Window</span>
        </label>

        <label className="mode-option">
          <input
            type="radio"
            name="time-mode"
            value="custom"
            checked={mode === 'custom'}
            onChange={() => handleModeChange('custom')}
          />
          <span>Start Time</span>
        </label>
      </div>

      {mode === 'preset' && (
        <div className="preset-mode">
          <label htmlFor="time-window">Show pins from last:</label>
          <select
            id="time-window"
            value={selectedTimeWindow}
            onChange={(e) => onPresetChange(e.target.value)}
            className="time-window-select"
            disabled={!isConnected}
          >
            {Object.keys(config.timeWindowOptions).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
      )}

      {mode === 'custom' && (
        <div className="custom-mode">
          <form onSubmit={handleCustomSubmit}>
            <label htmlFor="custom-time">Select start time:</label>
            <input
              type="datetime-local"
              id="custom-time"
              value={customTime}
              onChange={handleCustomTimeChange}
              min={timeConstraints?.minFormatted}
              max={timeConstraints?.maxFormatted}
              className="custom-time-input"
              disabled={!isConnected}
            />

            {timeConstraints && (
              <p className="helper-text">
                Valid range: last 24 hours
              </p>
            )}

            {error && <p className="error-text">{error}</p>}

            <button
              type="submit"
              className="load-pins-button"
              disabled={!isConnected || !customTime}
            >
              Load Pins
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PinTimeSelector;
