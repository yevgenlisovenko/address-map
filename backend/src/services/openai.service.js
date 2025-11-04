/**
 * OpenAI Service
 * Handles AI analysis of markers using OpenAI API
 */

import https from 'https';
import axios from 'axios';
import { config } from '../config.js';

class OpenAIService {
  constructor() {
    this.client = null;
  }

  /**
   * Lazy initialization of axios client
   * Only creates the client when first needed
   * @returns {axios.AxiosInstance} Axios client instance
   * @throws {Error} If API key is not configured
   */
  getClient() {
    if (!this.client) {
      if (!config.ai.openaiApiKey) {
        throw new Error('OPENAI_API_KEY not configured');
      }

      // Create axios configuration
      const axiosConfig = {
        baseURL: config.ai.baseURL,
        headers: {
          'Authorization': `Bearer ${config.ai.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000 // 2 minutes timeout
      };

      // Add custom HTTPS agent if SSL verification is disabled
      // This is useful for corporate proxies with self-signed certificates
      if (!config.ai.rejectUnauthorized) {
        axiosConfig.httpsAgent = new https.Agent({
          rejectUnauthorized: false
        });
      }

      this.client = axios.create(axiosConfig);
    }
    return this.client;
  }

  /**
   * Analyze markers using OpenAI
   * @param {string} systemPrompt - System prompt for AI
   * @param {string} userPrompt - User prompt for AI
   * @param {string} markersData - JSON string of markers data
   * @returns {Promise<{success: boolean, response?: string, usage?: object, error?: string, message?: string}>}
   */
  async analyzeMarkers(systemPrompt, userPrompt, markersData) {
    try {
      const client = this.getClient();

      // Make direct API call to OpenAI Chat Completions endpoint
      const response = await client.post('/chat/completions', {
        model: config.ai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${userPrompt}\n\n${markersData}` }
        ],
        max_tokens: config.ai.maxTokens,
        temperature: config.ai.temperature
      });

      return {
        success: true,
        response: response.data.choices[0].message.content,
        usage: response.data.usage
      };
    } catch (error) {
      // Handle OpenAI API errors
      if (error.response?.data?.error) {
        const openaiError = error.response.data.error;

        // Handle token limit errors
        if (openaiError.code === 'context_length_exceeded') {
          return {
            success: false,
            error: 'TOO_MANY_MARKERS',
            message: 'Too many markers to analyze. Please filter the map to show fewer markers.'
          };
        }

        // Return other OpenAI API errors
        return {
          success: false,
          error: openaiError.code || 'OPENAI_ERROR',
          message: openaiError.message || 'An error occurred with the OpenAI API'
        };
      }

      // Re-throw unexpected errors
      throw error;
    }
  }

  /**
   * Filter marker properties based on allowedProperties configuration
   * @param {Array} markers - Array of marker objects
   * @returns {Array} - Filtered markers array
   */
  filterMarkerProperties(markers) {
    const allowedProps = config.ai.allowedProperties;

    // If empty array, allow all properties
    if (allowedProps.length === 0) {
      return markers;
    }

    // Filter to only allowed properties
    return markers.map(marker => {
      const filtered = {
        timestamp: marker.timestamp,
        lat: marker.lat,
        lon: marker.lon
      };

      if (marker.properties) {
        filtered.properties = {};
        allowedProps.forEach(prop => {
          if (marker.properties[prop] !== undefined) {
            filtered.properties[prop] = marker.properties[prop];
          }
        });
      }

      return filtered;
    });
  }
}

export default new OpenAIService();
