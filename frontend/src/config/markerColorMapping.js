/**
 * Color mapping configuration for markers
 * Maps property values to marker colors
 */

import blueMarkerIconImage from "../assets/markerIcons/marker-icon-2x-blue.png";
import goldMarkerIconImage from "../assets/markerIcons/marker-icon-2x-gold.png";
import redMarkerIconImage from "../assets/markerIcons/marker-icon-2x-red.png";
import greenMarkerIconImage from "../assets/markerIcons/marker-icon-2x-green.png";
import orangeMarkerIconImage from "../assets/markerIcons/marker-icon-2x-orange.png";
import yellowMarkerIconImage from "../assets/markerIcons/marker-icon-2x-yellow.png";
import violetMarkerIconImage from "../assets/markerIcons/marker-icon-2x-violet.png";
import greyMarkerIconImage from "../assets/markerIcons/marker-icon-2x-grey.png";
import blackMarkerIconImage from "../assets/markerIcons/marker-icon-2x-black.png";

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
