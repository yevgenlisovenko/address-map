import { useUIState } from '../../contexts/UIStateContext';

/**
 * SidebarToggleButton - Toggle button for showing/hiding sidebar
 *
 * Uses UIStateContext to access sidebar visibility state
 */
export default function SidebarToggleButton() {
  const { isSidebarVisible, toggleSidebar } = useUIState();

  return (
    <button
      className={`sidebar-toggle-button ${isSidebarVisible ? 'sidebar-open' : ''}`}
      onClick={toggleSidebar}
      aria-label={isSidebarVisible ? 'Close sidebar' : 'Open sidebar'}
    >
      {isSidebarVisible ? '✕' : '☰'}
    </button>
  );
}
