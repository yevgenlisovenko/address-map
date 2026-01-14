export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
export const PIN_FILTER_UPDATE_INTERVAL = 60000; // 60 seconds

// Default map view (Continental USA)
export const DEFAULT_MAP_VIEW = {
  center: [39.8283 - 1.3, -98.5795 + 7.8],
  zoom: 5.25
};
