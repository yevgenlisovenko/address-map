import PropTypes from 'prop-types';
import ConnectionStatus from './ConnectionStatus';
import { useSocketContext } from '../../contexts';
import './FloatingControls.css';

export default function FloatingControls({ isSidebarVisible, onToggleSidebar }) {
  // Get connection status from context
  const { isConnected } = useSocketContext();

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

FloatingControls.propTypes = {
  isSidebarVisible: PropTypes.bool.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
};
