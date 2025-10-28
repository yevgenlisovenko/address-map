import PropTypes from 'prop-types';
import './ConnectionStatus.css';

export default function ConnectionStatus({ isConnected, sidebarVisible }) {
  return (
    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'} ${sidebarVisible ? 'sidebar-open' : ''}`}>
      {isConnected ? '● Connected' : '○ Disconnected'}
    </div>
  );
}

ConnectionStatus.propTypes = {
  isConnected: PropTypes.bool.isRequired,
  sidebarVisible: PropTypes.bool.isRequired,
};
