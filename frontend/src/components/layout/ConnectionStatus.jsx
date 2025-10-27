import './ConnectionStatus.css';

export default function ConnectionStatus({ isConnected }) {
  return (
    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
      {isConnected ? '● Connected' : '○ Disconnected'}
    </div>
  );
}
