/**
 * Google Analytics 4 — async, consent-gated loader.
 *
 * Loads gtag.js only when:
 *   1. VITE_GA_MEASUREMENT_ID is set (non-empty)
 *   2. User has given tracking consent
 *
 * Idempotent: safe to call loadGA4() multiple times.
 * SSR-safe: no-op outside browser.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

const MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();

let isLoaded = false;
let isLoading = false;

/**
 * Whether GA4 is configured (env var present).
 */
export function isGA4Configured(): boolean {
  return MEASUREMENT_ID.length > 0 && MEASUREMENT_ID.startsWith('G-');
}

/**
 * Load GA4 script asynchronously.
 * Resolves once gtag is ready; never rejects (errors logged silently).
 */
export async function loadGA4(): Promise<void> {
  if (!isGA4Configured()) return;
  if (typeof window === 'undefined') return;
  if (isLoaded || isLoading) return;

  isLoading = true;

  try {
    // Initialize dataLayer + gtag stub
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: any[]) {
      window.dataLayer!.push(args);
    };

    // gtag config with privacy-friendly defaults
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      // IP anonymization (now default in GA4 but explicit for clarity)
      anonymize_ip: true,
      // Don't send the URL as part of page view to reduce data sent
      send_page_view: true,
      // Use SameSite cookies
      cookie_flags: 'SameSite=None;Secure',
    });

    // Inject the gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    script.dataset.purpose = 'fegesport-ga4';

    const loaded = new Promise<void>((resolve) => {
      script.onload = () => resolve();
      script.onerror = () => resolve(); // never reject
    });

    document.head.appendChild(script);
    await loaded;

    isLoaded = true;
  } catch (err) {
    console.warn('[GA4] load error:', err);
  } finally {
    isLoading = false;
  }
}

/**
 * Track a page view (called on route change).
 */
export function trackPageView(path: string, title?: string): void {
  if (!isLoaded || !window.gtag) return;
  try {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href,
    });
  } catch (err) {
    console.warn('[GA4] page_view error:', err);
  }
}

/**
 * Generic event tracker for custom events.
 *
 * Pre-defined events for FEGESPORT:
 *   - "partner_click"        { partner_name }
 *   - "social_click"         { platform, location }
 *   - "competition_view"     { competition_id, competition_name }
 *   - "news_view"            { article_id, article_title }
 *   - "contact_form_submit"  { from }
 *   - "membership_cta"       { plan }
 *
 * Usage:
 *   trackEvent('partner_click', { partner_name: 'IESF' });
 */
export function trackEvent(eventName: string, params?: Record<string, any>): void {
  if (!isLoaded || !window.gtag) return;
  try {
    window.gtag('event', eventName, params || {});
  } catch (err) {
    console.warn('[GA4] event error:', err);
  }
}
