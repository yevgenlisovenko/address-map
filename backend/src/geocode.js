import axios from 'axios';
import { config } from './config.js';
import logger from './utils/logger.js';
import { GeocodingError } from './utils/errors.js';

let lastRequestTime = 0;

// In-memory cache for geocoded addresses
const geocodeCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Geocode an address to latitude/longitude coordinates
 * @param {string} address - The address to geocode
 * @returns {Promise<{lat: number, lon: number, displayName: string}>}
 */
export async function geocodeAddress(address) {
  // Check cache first
  const cacheKey = address.toLowerCase().trim();
  const cached = geocodeCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger.debug('Geocoding cache hit', { address });
    return cached.data;
  }
  // Respect rate limiting for Nominatim
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < config.geocoding.requestDelay) {
    await new Promise(resolve =>
      setTimeout(resolve, config.geocoding.requestDelay - timeSinceLastRequest)
    );
  }

  lastRequestTime = Date.now();

  try {
    const response = await axios.get(config.geocoding.nominatimUrl, {
      params: {
        q: address,
        format: 'json',
        countrycodes: 'us', // Limit to USA
        limit: 1
      },
      headers: {
        'User-Agent': config.geocoding.userAgent
      }
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      const data = {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        displayName: result.display_name
      };

      // Store in cache
      geocodeCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      logger.info('Geocoding API call successful', {
        address,
        lat: data.lat,
        lon: data.lon
      });
      return data;
    } else {
      logger.warn('Address not found', { address });
      throw new GeocodingError('Address not found', address);
    }
  } catch (error) {
    if (error instanceof GeocodingError) {
      throw error;
    }

    logger.error('Geocoding error:', {
      message: error.message,
      address,
      status: error.response?.status,
      statusText: error.response?.statusText
    });

    throw new GeocodingError(`Failed to geocode address: ${error.message}`, address);
  }
}
