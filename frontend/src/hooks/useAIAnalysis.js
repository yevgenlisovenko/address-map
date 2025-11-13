/**
 * Custom hook for AI analysis of markers
 */

import { useState } from 'react';
import { useAppConfig } from '../contexts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Prepare markers for AI analysis by removing unnecessary fields
 * and filtering properties based on backend configuration
 * This reduces payload size significantly (~60-80% reduction depending on properties)
 * @param {Array} markers - Array of marker objects
 * @param {Array} allowedProperties - Array of allowed property names (empty = allow all)
 * @returns {Array} - Optimized marker array with only essential fields
 */
const prepareMarkersForAI = (markers, allowedProperties = []) => {
  return markers.map(marker => {
    const prepared = {
      lat: marker.lat,
      lon: marker.lon,
      timestamp: marker.timestamp,
    };

    // Filter properties based on allowedProperties config
    if (marker.properties) {
      if (allowedProperties.length === 0) {
        // Empty array = allow all properties (backend convention)
        prepared.properties = marker.properties;
      } else {
        // Filter to only allowed properties
        prepared.properties = {};
        allowedProperties.forEach(prop => {
          if (marker.properties[prop] !== undefined) {
            prepared.properties[prop] = marker.properties[prop];
          }
        });
      }
    } else {
      prepared.properties = {};
    }

    return prepared;
    // Removed: id, displayName, type, address (not needed for AI analysis)
  });
};

export function useAIAnalysis() {
  const { config } = useAppConfig();
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
      // Get allowed properties from config (empty array = allow all)
      const allowedProperties = config?.ai?.allowedProperties || [];

      const res = await fetch(`${API_BASE_URL}/api/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId,
          markers: prepareMarkersForAI(markers, allowedProperties),
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
