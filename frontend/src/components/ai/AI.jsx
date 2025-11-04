import { useState } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import { useAppConfig } from '../../contexts';
import { useAIAnalysis } from '../../hooks/useAIAnalysis';
import './AI.css';

export default function AI({ visibleMarkers }) {
  const { config } = useAppConfig();
  const { loading, error, response, analyzeMarkers, clearResponse } = useAIAnalysis();
  const [copied, setCopied] = useState(false);

  const handleAnalyze = (promptId) => {
    if (!visibleMarkers || visibleMarkers.length === 0) {
      return;
    }
    analyzeMarkers(promptId, visibleMarkers);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Check if AI is enabled
  if (!config?.ai?.enabled) {
    return (
      <div className="ai-container">
        <h3>AI Assistant</h3>
        <div className="ai-disabled">
          <p>AI analysis is not enabled on this server.</p>
          <p className="ai-info">Contact your administrator to enable AI features.</p>
        </div>
      </div>
    );
  }

  const prompts = config.ai.prompts || [];
  const hasMarkers = visibleMarkers && visibleMarkers.length > 0;

  return (
    <div className="ai-container">
      <h3>AI Assistant</h3>

      {/* Prompt Buttons */}
      <div className="ai-prompts">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            className="ai-prompt-button"
            onClick={() => handleAnalyze(prompt.id)}
            disabled={loading || !hasMarkers}
          >
            {prompt.label}
          </button>
        ))}
      </div>

      {/* Markers Count Info */}
      <div className="ai-info">
        {hasMarkers ? (
          <p>{visibleMarkers.length} marker{visibleMarkers.length !== 1 ? 's' : ''} visible</p>
        ) : (
          <p>No markers visible. Adjust filters to see markers.</p>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="ai-loading">
          <p>Analyzing markers...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="ai-error">
          <p className="ai-error-message">{error}</p>
          <button className="ai-clear-button" onClick={clearResponse}>
            Clear
          </button>
        </div>
      )}

      {/* Response Display */}
      {response && !loading && (
        <div className="ai-response">
          <div className="ai-response-header">
            <h4>Analysis Result</h4>
            <div className="ai-response-buttons">
              <button className="ai-clear-button" onClick={handleCopy}>
                {copied ? "✓ Copied!" : "Copy"}
              </button>
              <button className="ai-clear-button" onClick={clearResponse}>
                Clear
              </button>
            </div>
          </div>
          <div className="ai-response-content">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

AI.propTypes = {
  visibleMarkers: PropTypes.array.isRequired,
};
