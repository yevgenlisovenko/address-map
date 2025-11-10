/**
 * Color mapping configuration for markers
 * Supports deployment-specific configurations via VITE_DEPLOYMENT_CONFIG environment variable
 */

import L from 'leaflet';
import blueMarkerIconImage from "../assets/markerIcons/marker-icon-2x-blue.png";
import goldMarkerIconImage from "../assets/markerIcons/marker-icon-2x-gold.png";
import redMarkerIconImage from "../assets/markerIcons/marker-icon-2x-red.png";
import greenMarkerIconImage from "../assets/markerIcons/marker-icon-2x-green.png";
import orangeMarkerIconImage from "../assets/markerIcons/marker-icon-2x-orange.png";
import yellowMarkerIconImage from "../assets/markerIcons/marker-icon-2x-yellow.png";
import violetMarkerIconImage from "../assets/markerIcons/marker-icon-2x-violet.png";
import greyMarkerIconImage from "../assets/markerIcons/marker-icon-2x-grey.png";
import blackMarkerIconImage from "../assets/markerIcons/marker-icon-2x-black.png";
import ho3MarkerIconImage from "../assets/markerIcons/marker-icon-HO3.png";
import ho4MarkerIconImage from "../assets/markerIcons/marker-icon-HO4.png";
import ho6MarkerIconImage from "../assets/markerIcons/marker-icon-HO6.png";
import hf9MarkerIconImage from "../assets/markerIcons/marker-icon-HF9.png";
import markerShadowImage from "../assets/markerIcons/marker-shadow.png";

// Import deployment configs
import defaultConfig from './deployments/default.config.js';
import clientAConfig from './deployments/client-a.config.js';

/**
 * Factory function to create a Leaflet marker icon
 * @param {string} iconUrl - URL to the marker icon image
 * @returns {L.Icon} Configured Leaflet icon
 */
const createMarkerIcon = (iconUrl) => {
  return new L.Icon({
    iconUrl,
    shadowUrl: markerShadowImage,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

// Create marker icons using the factory
const blueMarkerIcon = createMarkerIcon(blueMarkerIconImage);
const goldMarkerIcon = createMarkerIcon(goldMarkerIconImage);
const redMarkerIcon = createMarkerIcon(redMarkerIconImage);
const greenMarkerIcon = createMarkerIcon(greenMarkerIconImage);
const orangeMarkerIcon = createMarkerIcon(orangeMarkerIconImage);
const yellowMarkerIcon = createMarkerIcon(yellowMarkerIconImage);
const violetMarkerIcon = createMarkerIcon(violetMarkerIconImage);
const greyMarkerIcon = createMarkerIcon(greyMarkerIconImage);
const blackMarkerIcon = createMarkerIcon(blackMarkerIconImage);

const ho3MarkerIcon = createMarkerIcon(ho3MarkerIconImage);
const ho4MarkerIcon = createMarkerIcon(ho4MarkerIconImage);
const ho6MarkerIcon = createMarkerIcon(ho6MarkerIconImage);
const hf9MarkerIcon = createMarkerIcon(hf9MarkerIconImage);

// Export grey as the default marker
export const defaultMarkerIcon = greyMarkerIcon;

// Export default icon URL for list display
export const defaultMarkerIconUrl = greyMarkerIconImage;

/**
 * Icon Registry - Maps string IDs to actual icon objects
 * Used to transform deployment configs into runtime icon objects
 */
const ICON_REGISTRY = {
  // Form-specific icons
  ho3: { icon: ho3MarkerIcon, url: ho3MarkerIconImage },
  ho4: { icon: ho4MarkerIcon, url: ho4MarkerIconImage },
  ho6: { icon: ho6MarkerIcon, url: ho6MarkerIconImage },
  hf9: { icon: hf9MarkerIcon, url: hf9MarkerIconImage },

  // Generic color icons
  blue: { icon: blueMarkerIcon, url: blueMarkerIconImage },
  gold: { icon: goldMarkerIcon, url: goldMarkerIconImage },
  red: { icon: redMarkerIcon, url: redMarkerIconImage },
  green: { icon: greenMarkerIcon, url: greenMarkerIconImage },
  orange: { icon: orangeMarkerIcon, url: orangeMarkerIconImage },
  yellow: { icon: yellowMarkerIcon, url: yellowMarkerIconImage },
  violet: { icon: violetMarkerIcon, url: violetMarkerIconImage },
  grey: { icon: greyMarkerIcon, url: greyMarkerIconImage },
  black: { icon: blackMarkerIcon, url: blackMarkerIconImage },
};

/**
 * Available deployment configurations
 */
const DEPLOYMENT_CONFIGS = {
  default: defaultConfig,
  'client-a': clientAConfig,
};

/**
 * Load deployment configuration based on environment variable
 */
const deploymentName = import.meta.env.VITE_DEPLOYMENT_CONFIG || 'default';
const deploymentConfig = DEPLOYMENT_CONFIGS[deploymentName] || DEPLOYMENT_CONFIGS.default;

if (!DEPLOYMENT_CONFIGS[deploymentName] && deploymentName !== 'default') {
  console.warn(`Deployment config "${deploymentName}" not found, using default`);
}

// Export full deployment config for use by other components (e.g., MapLegend)
export const DEPLOYMENT_CONFIG = deploymentConfig;

// Extract marker icon mapping from deployment config
// Support both new structure (markerIconMapping property) and old structure (root level)
const rawConfig = deploymentConfig.markerIconMapping || deploymentConfig;

/**
 * Transform raw config by mapping icon IDs to actual icon objects
 */
function transformConfig(rawConfig) {
  const transformed = {};

  for (const [propertyName, valueMap] of Object.entries(rawConfig)) {
    transformed[propertyName] = {};

    for (const [propertyValue, config] of Object.entries(valueMap)) {
      const iconData = ICON_REGISTRY[config.icon];

      if (!iconData) {
        console.error(`Unknown icon ID: "${config.icon}" in deployment config for ${propertyName}.${propertyValue}`);
        continue;
      }

      transformed[propertyName][propertyValue] = {
        icon: iconData.icon,
        url: iconData.url,
        label: config.label,
        iconId: config.icon,  // Preserve original icon ID for legend grouping
      };
    }
  }

  return transformed;
}

// Export icon URLs for list display
export const MARKER_ICON_URLS = {
  blue: blueMarkerIconImage,
  gold: goldMarkerIconImage,
  red: redMarkerIconImage,
  green: greenMarkerIconImage,
  orange: orangeMarkerIconImage,
  yellow: yellowMarkerIconImage,
  violet: violetMarkerIconImage,
  grey: greyMarkerIconImage,
  black: blackMarkerIconImage,
  ho3: ho3MarkerIconImage,
  ho4: ho4MarkerIconImage,
  ho6: ho6MarkerIconImage,
  hf9: hf9MarkerIconImage,
};

/**
 * Unified icon configuration mapping
 * Loaded from deployment-specific config and transformed with actual icon objects
 *
 * To customize for different deployments:
 * 1. Create a new config file in ./deployments/[name].config.js
 * 2. Add it to DEPLOYMENT_CONFIGS above
 * 3. Set VITE_DEPLOYMENT_CONFIG=[name] in your .env file
 */
export const PROPERTY_ICON_CONFIG = transformConfig(rawConfig);

// Backward compatibility aliases (deprecated - use PROPERTY_ICON_CONFIG instead)
export const PROPERTY_MARKERS_MAP = PROPERTY_ICON_CONFIG;
export const PROPERTY_ICON_URLS = PROPERTY_ICON_CONFIG;

/**
 * Get the appropriate Leaflet marker icon based on marker properties
 * Used for rendering markers on the map
 * @param {Object} marker - Marker object with properties
 * @returns {L.Icon} Leaflet icon object
 */
export function getMarkerIcon(marker) {
  // Check if marker has properties
  if (!marker.properties || Object.keys(marker.properties).length === 0) {
    return defaultMarkerIcon;
  }

  // Loop through PROPERTY_ICON_CONFIG keys to find matching property
  for (const [propertyName, valueToIconMap] of Object.entries(PROPERTY_ICON_CONFIG)) {
    // Check if marker has this property
    if (marker.properties[propertyName] !== undefined) {
      const propertyValue = marker.properties[propertyName];
      const iconData = valueToIconMap[propertyValue];

      // Get icon from unified config
      const icon = iconData?.icon;

      // Return icon if mapping found
      if (icon) {
        return icon;
      }
    }
  }

  // No mapping found, return default
  return defaultMarkerIcon;
}

/**
 * Get the marker icon URL based on marker properties
 * Used for displaying marker icons in lists and other UI elements
 * @param {Object} marker - Marker object with properties
 * @returns {string} Icon image URL
 */
export function getMarkerIconUrl(marker) {
  // Check if marker has properties
  if (!marker.properties || Object.keys(marker.properties).length === 0) {
    return defaultMarkerIconUrl;
  }

  // Loop through PROPERTY_ICON_CONFIG keys to find matching property
  for (const [propertyName, valueToUrlMap] of Object.entries(PROPERTY_ICON_CONFIG)) {
    // Check if marker has this property
    if (marker.properties[propertyName] !== undefined) {
      const propertyValue = marker.properties[propertyName];
      const urlData = valueToUrlMap[propertyValue];

      // Get URL from unified config
      const url = urlData?.url;

      // Return URL if mapping found
      if (url) {
        return url;
      }
    }
  }

  // No mapping found, return default
  return defaultMarkerIconUrl;
}
