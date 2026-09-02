// frontend/src/hooks/usePageTracking.ts
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent, detectSource } from '@/utils/tracker';

/**
 * Custom hook to automatically track all page views, title changes, and URL parameters
 */
export const usePageTracking = () => {
  const location = useLocation();
  const lastTrackedPath = useRef<string>('');

  useEffect(() => {
    const fullPath = location.pathname + location.search;

    // Prevent duplicate triggers for exact same path
    if (lastTrackedPath.current === fullPath) return;
    lastTrackedPath.current = fullPath;

    // Small timeout to allow document.title and React render to stabilize
    const timer = setTimeout(() => {
      const source = detectSource(location.pathname);

      trackEvent({
        eventType: 'page',
        eventName: 'page_viewed',
        source,
        pageUrl: fullPath,
        payload: {
          pathname: location.pathname,
          search: location.search,
          page_title: document.title || 'Resale Expert',
        },
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);
};

export default usePageTracking;
