/**
 * Google Analytics 4 (GA4) integration utility for aiadvokat.uz
 * Measurement ID: G-13FZSVTEYE
 */

export const GA_MEASUREMENT_ID = 'G-13FZSVTEYE';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Safe invocation of window.gtag
 */
export function gtag(...args: any[]) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  }
}

/**
 * Sanitizes page paths before sending to Google Analytics.
 * Strictly prevents sending PII, tokens, passwords, search queries,
 * legal questions, or AI chat messages to analytics.
 */
export function sanitizePagePath(pathname: string, search: string = ''): string {
  if (!search) return pathname;
  try {
    const params = new URLSearchParams(search);
    const safeParams = new URLSearchParams();

    // Only allow safe, non-PII marketing/routing parameters
    const ALLOWED_QUERY_KEYS = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'ref',
      'lang',
      'category',
      'page',
      'tab',
    ];

    for (const [key, value] of params.entries()) {
      if (ALLOWED_QUERY_KEYS.includes(key.toLowerCase())) {
        safeParams.set(key, value);
      }
    }

    const cleanSearch = safeParams.toString();
    return cleanSearch ? `${pathname}?${cleanSearch}` : pathname;
  } catch {
    return pathname;
  }
}

/**
 * Records a page view during React Router client-side navigation.
 */
export function trackPageView(pathname: string, search: string = '') {
  if (typeof window === 'undefined') return;

  const cleanPath = sanitizePagePath(pathname, search);
  const cleanLocation = `${window.location.origin}${cleanPath}`;
  const pageTitle = document.title || 'AI Advokat';

  gtag('event', 'page_view', {
    page_title: pageTitle,
    page_location: cleanLocation,
    page_path: cleanPath,
    send_to: GA_MEASUREMENT_ID,
  });
}

/**
 * Updates analytics consent in Google Tag and persists the decision.
 */
export function updateAnalyticsConsent(granted: boolean) {
  if (typeof window === 'undefined') return;

  const status = granted ? 'granted' : 'denied';
  try {
    localStorage.setItem('aiadvokat_cookie_consent', status);
  } catch (e) {
    console.warn('[Analytics] Could not persist cookie consent', e);
  }

  gtag('consent', 'update', {
    analytics_storage: status,
  });

  // Notify active components of consent change
  window.dispatchEvent(new CustomEvent('aiadvokat_cookie_consent_changed', { detail: status }));
}

/**
 * Returns the stored analytics consent status ('granted' | 'denied' | null)
 */
export function getAnalyticsConsent(): 'granted' | 'denied' | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem('aiadvokat_cookie_consent');
    if (val === 'granted' || val === 'denied') return val;
  } catch (e) {}
  return null;
}

/**
 * Helper to programmatically open the Cookie Settings modal
 */
export function openCookieSettings() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('open-cookie-settings'));
}
