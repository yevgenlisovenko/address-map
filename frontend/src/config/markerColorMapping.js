/**
 * Color mapping configuration for markers
 * Maps property values to marker colors
 */

/*
  Available Colors:
  1. Blue - marker-icon-2x-blue.png
  2. Gold - marker-icon-2x-gold.png
  3. Red - marker-icon-2x-red.png
  4. Green - marker-icon-2x-green.png
  5. Orange - marker-icon-2x-orange.png
  6. Yellow - marker-icon-2x-yellow.png
  7. Violet - marker-icon-2x-violet.png
  8. Grey - marker-icon-2x-grey.png
  9. Black - marker-icon-2x-black.png
*/

import blueMarkerIconImage from '../assets/markerIcons/marker-icon-2x-blue.png';
import goldMarkerIconImage from '../assets/markerIcons/marker-icon-2x-gold.png';
import redMarkerIconImage from '../assets/markerIcons/marker-icon-2x-red.png';
import greenMarkerIconImage from '../assets/markerIcons/marker-icon-2x-green.png';
import orangeMarkerIconImage from '../assets/markerIcons/marker-icon-2x-orange.png';
import yellowMarkerIconImage from '../assets/markerIcons/marker-icon-2x-yellow.png';
import violetMarkerIconImage from '../assets/markerIcons/marker-icon-2x-violet.png';
import greyMarkerIconImage from '../assets/markerIcons/marker-icon-2x-grey.png';
import blackMarkerIconImage from '../assets/markerIcons/marker-icon-2x-black.png';

const blueMarkerIcon = new L.Icon({
  iconUrl: blueMarkerIconImage,
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const goldMarkerIcon = new L.Icon({
  iconUrl: goldMarkerIconImage,
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const redMarkerIcon = new L.Icon({
  iconUrl: redMarkerIconImage,
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const greenMarkerIcon = new L.Icon({
  iconUrl: greenMarkerIconImage,
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const orangeMarkerIcon = new L.Icon({
  iconUrl: orangeMarkerIconImage,
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const yellowMarkerIcon = new L.Icon({
  iconUrl: yellowMarkerIconImage,
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const violetMarkerIcon = new L.Icon({
  iconUrl: violetMarkerIconImage,
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const greyMarkerIcon = new L.Icon({
  iconUrl: greyMarkerIconImage,
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const blackMarkerIcon = new L.Icon({
  iconUrl: blackMarkerIconImage,
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Export blue as the default marker
export const defaultMarkerIcon = blueMarkerIcon;

export const PROPERTY_MARKERS_MAP = {
  /*category: {
    'landmark': '#FF5733',      // Red-Orange
    'restaurant': '#FFC300',    // Yellow
    'office': '#3498DB',        // Blue
    'park': '#2ECC71',          // Green
    'museum': '#9B59B6',        // Purple
    'hotel': '#E74C3C',         // Red
    'school': '#16A085',        // Teal
    'hospital': '#E91E63',      // Pink
    'shopping': '#FF9800',      // Orange
    'default': '#3388FF'        // Default blue (Leaflet default)
  },*/
  formCode: {
    'HO3': blueMarkerIcon,
    'HO4': redMarkerIcon,
    'HO6': violetMarkerIcon,
    'HF9': greenMarkerIcon,
  },
};

// Default property to use for coloring
//export const DEFAULT_COLOR_PROPERTY = 'category';
