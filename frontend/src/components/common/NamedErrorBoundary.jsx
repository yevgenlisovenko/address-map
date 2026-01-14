import { Component } from 'react';
import PropTypes from 'prop-types';
import './ErrorBoundary.css';

/**
 * Named Error Boundary Component
 *
 * A configurable error boundary that provides:
 * - Feature identification for better debugging
 * - Custom fallback UI components
 * - Silent failure mode for optional features
 * - Error reporting callbacks
 *
 * Usage:
 * <NamedErrorBoundary
 *   name="Map"
 *   fallback={<MapFallback />}
 *   onError={(error, name) => logError(error, name)}
 * >
 *   <MapComponent />
 * </NamedErrorBoundary>
 */
class NamedErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error, errorInfo) {
    const { name, onError } = this.props;

    // Log error with feature name
    console.error(
      `Error Boundary [${name || 'Unnamed'}] caught an error:`,
      error,
      errorInfo
    );

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo, name);
    }

    // Future: could send to error logging service here
    // Example: logErrorToService(error, errorInfo, name);
  }

  handleReset = () => {
    // Reset error state to try rendering again
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { children, name, fallback, silent } = this.props;

    if (this.state.hasError) {
      // Silent mode: render nothing and log to console only
      if (silent) {
        return null;
      }

      // Custom fallback provided
      if (fallback) {
        // Pass reset handler to custom fallback if it needs it
        return typeof fallback === 'function'
          ? fallback({ error: this.state.error, onReset: this.handleReset })
          : fallback;
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h2 className="error-boundary-title">
              {name ? `${name} Error` : 'Something went wrong'}
            </h2>
            <p className="error-boundary-message">
              {name
                ? `The ${name} component encountered an error and cannot be displayed.`
                : 'A component encountered an error and cannot be displayed.'}
            </p>

            {/* Show error details in development mode */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary-details">
                <summary>Error Details (Development Only)</summary>
                <div className="error-boundary-stack">
                  <strong>Error:</strong> {this.state.error.toString()}
                  <br />
                  <br />
                  <strong>Stack Trace:</strong>
                  <pre>{this.state.errorInfo?.componentStack}</pre>
                </div>
              </details>
            )}

            <div className="error-boundary-actions">
              <button
                onClick={this.handleReset}
                className="error-boundary-button primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

NamedErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  name: PropTypes.string,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  silent: PropTypes.bool,
  onError: PropTypes.func,
};

NamedErrorBoundary.defaultProps = {
  name: 'Component',
  fallback: null,
  silent: false,
  onError: null,
};

export default NamedErrorBoundary;
