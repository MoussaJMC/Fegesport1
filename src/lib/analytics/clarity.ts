/**
 * Microsoft Clarity — async, consent-gated loader.
 *
 * Loads clarity.js only when:
 *   1. VITE_CLARITY_PROJECT_ID is set (non-empty)
 *   2. User has given tracking consent
 */

declare global {
  interface Window {
    clarity?: (...args: any[]) => void;
  }
}

const PROJECT_ID = (import.meta.env.VITE_CLARITY_PROJECT_ID || '').trim();

let isLoaded = false;
let isLoading = false;

/**
 * Whether Clarity is configured (env var present).
 */
export function isClarityConfigured(): boolean {
  return PROJECT_ID.length > 0;
}

/**
 * Load Clarity script asynchronously.
 */
export async function loadClarity(): Promise<void> {
  if (!isClarityConfigured()) return;
  if (typeof window === 'undefined') return;
  if (isLoaded || isLoading) return;

  isLoading = true;

  try {
    // Microsoft Clarity standard async loader
    // From: https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-setup
    (function (c: any, l: any, a: string, r: string, i: string) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      const t = l.createElement(r) as HTMLScriptElement;
      t.async = true;
      t.src = 'https://www.clarity.ms/tag/' + i;
      t.dataset.purpose = 'fegesport-clarity';
      const y = l.getElementsByTagName(r)[0];
      y.parentNode!.insertBefore(t, y);
    })(window, document, 'clarity', 'script', PROJECT_ID);

    isLoaded = true;
  } catch (err) {
    console.warn('[Clarity] load error:', err);
  } finally {
    isLoading = false;
  }
}

/**
 * Optionally tag a session with custom metadata.
 */
export function tagSession(key: string, value: string): void {
  if (!isLoaded || !window.clarity) return;
  try {
    window.clarity('set', key, value);
  } catch (err) {
    console.warn('[Clarity] tag error:', err);
  }
}

/**
 * Optionally identify a user (e.g. after login).
 */
export function identifyUser(userId: string, sessionId?: string): void {
  if (!isLoaded || !window.clarity) return;
  try {
    window.clarity('identify', userId, sessionId);
  } catch (err) {
    console.warn('[Clarity] identify error:', err);
  }
}
