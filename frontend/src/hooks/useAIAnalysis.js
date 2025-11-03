/**
 * Custom hook for AI analysis of markers
 */

import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useAIAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  /**
   * Analyze markers using AI
   * @param {string} promptId - The ID of the prompt to use
   * @param {Array} markers - Array of marker objects to analyze
   */
  const analyzeMarkers = async (promptId, markers) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId,
          markers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to analyze markers');
      }

      if (data.success) {
        setResponse(data.response);
      } else {
        throw new Error(data.message || 'Analysis failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear the current response and error
   */
  const clearResponse = () => {
    setResponse(null);
    setError(null);
  };

  return {
    loading,
    error,
    response,
    analyzeMarkers,
    clearResponse,
  };
}
