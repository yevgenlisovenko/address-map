import PropTypes from 'prop-types';
import './SidebarSectionFallback.css';

/**
 * SidebarSectionFallback Component
 *
 * Generic fallback UI for sidebar tab sections (Stats, AI, MarkersList, etc.)
 * Displays when a sidebar component encounters an error.
 */
function SidebarSectionFallback({ sectionName, icon, onReset }) {
  return (
    <div className="sidebar-section-fallback">
      <div className="sidebar-section-fallback-content">
        <div className="sidebar-section-fallback-icon">
          {icon || '⚠️'}
        </div>
        <h3>Error Loading {sectionName}</h3>
        <p>
          Unable to display the {sectionName} section.
          An unexpected error occurred.
        </p>
        {onReset && (
          <button
            onClick={onReset}
            className="sidebar-section-fallback-button"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

SidebarSectionFallback.propTypes = {
  sectionName: PropTypes.string,
  icon: PropTypes.string,
  onReset: PropTypes.func,
};

SidebarSectionFallback.defaultProps = {
  sectionName: 'Content',
  icon: '⚠️',
};

export default SidebarSectionFallback;
