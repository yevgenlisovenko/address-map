import { useError } from '../../contexts/ErrorContext';
import './ErrorDisplay.css';

/**
 * ErrorDisplay Component
 *
 * Displays global error, warning, and info notifications from ErrorContext.
 * Shows as a toast/banner at the top of the screen.
 * Auto-dismisses warnings and info messages after 5 seconds.
 * Errors persist until manually dismissed.
 */
function ErrorDisplay() {
  const { error, clearError } = useError();

  if (!error) {
    return null;
  }

  const getIconAndClass = () => {
    switch (error.type) {
      case 'error':
        return { icon: '⚠️', className: 'error-display-error' };
      case 'warning':
        return { icon: '⚠️', className: 'error-display-warning' };
      case 'info':
        return { icon: 'ℹ️', className: 'error-display-info' };
      default:
        return { icon: '⚠️', className: 'error-display-error' };
    }
  };

  const { icon, className } = getIconAndClass();

  return (
    <div className={`error-display ${className}`}>
      <div className="error-display-content">
        <span className="error-display-icon">{icon}</span>
        <span className="error-display-message">{error.message}</span>
        <button
          className="error-display-close"
          onClick={clearError}
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default ErrorDisplay;
