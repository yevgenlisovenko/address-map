import './ErrorMessage.css';

export default function ErrorMessage({ error }) {
  return (
    <div className="error-container">
      <h2>Failed to Load Configuration</h2>
      <p className="error-details">{error}</p>
      <button
        className="retry-button"
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  );
}
