/**
 * State Selector Control
 * Button that opens a dropdown to select a state to focus on
 */

import { useState, useRef, useEffect } from 'react';
import { getAllStateAbbreviations, getStateName, STATE_ABBR_TO_NAME } from '../../utils/stateBounds';
import './StateSelectorControl.css';

function StateSelectorControl({ value, onChange, availableStates = 'all' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Get list of available states
  const stateList = availableStates === 'all'
    ? getAllStateAbbreviations()
    : availableStates;

  // Filter states based on search term
  const filteredStates = stateList.filter(abbr => {
    const name = getStateName(abbr);
    const searchLower = searchTerm.toLowerCase();
    return (
      abbr.toLowerCase().includes(searchLower) ||
      name.toLowerCase().includes(searchLower)
    );
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setSearchTerm('');
    }
  };

  const handleStateSelect = (stateAbbr) => {
    onChange(stateAbbr);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleAllStates = () => {
    onChange(null);
    setIsOpen(false);
    setSearchTerm('');
  };

  const buttonLabel = value || 'USA';
  const buttonTitle = value ? `Viewing: ${getStateName(value)}` : 'View all states';

  return (
    <div className="state-selector-control" ref={dropdownRef}>
      <button
        className={`state-selector-button ${isOpen ? 'active' : ''} ${value ? 'focused' : ''}`}
        onClick={handleButtonClick}
        title={buttonTitle}
        aria-label={buttonTitle}
        aria-expanded={isOpen}
      >
        {buttonLabel}
      </button>

      {isOpen && (
        <div className="state-selector-dropdown">
          <div className="state-selector-search">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search states..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="state-selector-search-input"
            />
          </div>

          <div className="state-selector-list">
            <button
              className={`state-selector-item ${!value ? 'selected' : ''}`}
              onClick={handleAllStates}
            >
              <span className="state-abbr">USA</span>
              <span className="state-name">All States</span>
            </button>

            <div className="state-selector-divider" />

            {filteredStates.map(abbr => (
              <button
                key={abbr}
                className={`state-selector-item ${value === abbr ? 'selected' : ''}`}
                onClick={() => handleStateSelect(abbr)}
              >
                <span className="state-abbr">{abbr}</span>
                <span className="state-name">{getStateName(abbr)}</span>
              </button>
            ))}

            {filteredStates.length === 0 && (
              <div className="state-selector-no-results">
                No states found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StateSelectorControl;
