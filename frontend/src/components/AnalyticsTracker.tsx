import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

/**
 * AnalyticsTracker listens to React Router navigation and triggers
 * clean, deduplicated page_view events across initial loads, client-side
 * navigation, and browser history popstate events.
 */
export default function AnalyticsTracker() {
  const location = useLocation();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    const currentLoc = location.pathname + location.search;

    // Prevent duplicate triggers if the exact same path & search was already tracked
    if (lastTrackedRef.current === currentLoc) return;
    lastTrackedRef.current = currentLoc;

    // Brief timeout allows any React document.title changes to settle
    const timer = setTimeout(() => {
      trackPageView(location.pathname, location.search);
    }, 120);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return null;
}
