/**
 * OpenAI Service
 * Handles AI analysis of markers using OpenAI API
 */

import OpenAI from 'openai';
import { config } from '../config.js';

class OpenAIService {
  constructor() {
    this.client = null;
  }

  /**
   * Lazy initialization of OpenAI client
   * Only creates the client when first needed
   * @returns {OpenAI} OpenAI client instance
   * @throws {Error} If API key is not configured
   */
  getClient() {
    if (!this.client) {
      if (!config.ai.openaiApiKey) {
        throw new Error('OPENAI_API_KEY not configured');
      }
      this.client = new OpenAI({
        apiKey: config.ai.openaiApiKey
      });
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
      const response = await client.chat.completions.create({
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
        response: response.choices[0].message.content,
        usage: response.usage
      };
    } catch (error) {
      // Handle token limit errors
      if (error.code === 'context_length_exceeded') {
        return {
          success: false,
          error: 'TOO_MANY_MARKERS',
          message: 'Too many markers to analyze. Please filter the map to show fewer markers.'
        };
      }
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
