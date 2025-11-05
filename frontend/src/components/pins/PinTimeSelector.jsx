import React, { useState } from 'react';
import PropTypes from 'prop-types';
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

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError('');
    setCustomTime('');

    // When switching back to preset mode, trigger a refresh of the current time window
    if (newMode === 'preset') {
      onPresetChange(selectedTimeWindow);
    }
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
    const minAllowedTime = now - config.pinStorage.maxAge; // Calculate fresh minimum time

    // Validate not in future
    if (selectedTimestamp > now) {
      setError('Start time cannot be in the future');
      return;
    }

    // Validate not older than maxAge (24 hours)
    if (selectedTimestamp < minAllowedTime) {
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
            {Object.keys(config.pinStorage.timeWindowOptions).map((key) => (
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
              className="custom-time-input"
              disabled={!isConnected}
            />

            <p className="helper-text">
              Valid range: last 24 hours
            </p>

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

PinTimeSelector.propTypes = {
  config: PropTypes.shape({
    pinStorage: PropTypes.shape({
      timeWindowOptions: PropTypes.object.isRequired,
      maxAge: PropTypes.number.isRequired,
    }).isRequired,
  }),
  selectedTimeWindow: PropTypes.string.isRequired,
  onPresetChange: PropTypes.func.isRequired,
  onCustomTimeSubmit: PropTypes.func.isRequired,
  isConnected: PropTypes.bool.isRequired,
};

export default PinTimeSelector;
