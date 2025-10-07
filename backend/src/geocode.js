import axios from 'axios';
import { config } from './config.js';

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
    console.log('Geocoding cache hit:', address);
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

      console.log('Geocoding API call:', address);
      return data;
    } else {
      throw new Error('Address not found');
    }
  } catch (error) {
    console.error('Geocoding error:', error.message);
    throw new Error(`Failed to geocode address: ${error.message}`);
  }
}
