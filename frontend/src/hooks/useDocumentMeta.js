import { useEffect } from 'react';

/**
 * Custom hook to manage document title and favicon from environment variables
 */
export const useDocumentMeta = () => {
  useEffect(() => {
    const appTitle = import.meta.env.VITE_APP_TITLE;
    if (appTitle) {
      document.title = appTitle;
    }

    // Set favicon if specified
    const appFavicon = import.meta.env.VITE_APP_FAVICON;
    if (appFavicon) {
      const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = appFavicon;
      if (!document.querySelector("link[rel~='icon']")) {
        document.head.appendChild(link);
      }
    }
  }, []);
};
