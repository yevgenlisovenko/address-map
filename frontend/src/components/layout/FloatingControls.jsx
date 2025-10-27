import ConnectionStatus from './ConnectionStatus';
import './FloatingControls.css';

export default function FloatingControls({ isConnected, isSidebarVisible, onToggleSidebar }) {
  return (
    <div className={`floating-controls ${isSidebarVisible ? 'sidebar-open' : ''}`}>
      <ConnectionStatus isConnected={isConnected} />
      <button
        className="sidebar-toggle-button"
        onClick={onToggleSidebar}
      >
        {isSidebarVisible ? '▶' : '◀'}
      </button>
    </div>
  );
}
