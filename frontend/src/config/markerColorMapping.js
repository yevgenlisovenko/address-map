/**
 * Color mapping configuration for markers
 * Maps property values to marker colors
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

/**
 * Factory function to create a Leaflet marker icon
 * @param {string} iconUrl - URL to the marker icon image
 * @returns {L.Icon} Configured Leaflet icon
 */
const createMarkerIcon = (iconUrl) => {
  return new L.Icon({
    iconUrl,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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

// Export grey as the default marker
export const defaultMarkerIcon = greyMarkerIcon;

export const PROPERTY_MARKERS_MAP = {
  formCode: {
    HO3: blueMarkerIcon,
    HO4: yellowMarkerIcon,
    HO6: greenMarkerIcon,
    HF9: redMarkerIcon,
  },
};
