/**
 * FEGESPORT — Consent service (RGPD)
 *
 * Tiny dependency-free consent management for GA4 and Microsoft Clarity.
 *
 * Stored in localStorage under "fegesport.consent.v1" with values:
 *   - "accepted" → analytics enabled
 *   - "declined" → analytics disabled, user explicitly refused
 *   - "skipped"  → user dismissed the banner without choosing → no tracking
 *   - null       → no choice yet → banner shown, no tracking
 *
 * The version suffix ".v1" lets us invalidate old consents if the
 * privacy policy changes (just bump the key to ".v2").
 */

export type ConsentChoice = 'accepted' | 'declined' | 'skipped';
export type ConsentStatus = ConsentChoice | 'pending';

const STORAGE_KEY = 'fegesport.consent.v1';
const STATUS_EVENT = 'fegesport:consent-change';

type Listener = (status: ConsentStatus) => void;
const listeners = new Set<Listener>();

/**
 * Safely read from localStorage (SSR-safe, private browsing-safe).
 */
function safeGet(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Safely write to localStorage.
 */
function safeSet(value: string): boolean {
  try {
    if (typeof window === 'undefined') return false;
    window.localStorage.setItem(STORAGE_KEY, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely remove from localStorage.
 */
function safeRemove(): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

/**
 * Get current consent status. Returns "pending" if no choice made yet.
 */
export function getConsent(): ConsentStatus {
  const v = safeGet();
  if (v === 'accepted' || v === 'declined' || v === 'skipped') return v;
  return 'pending';
}

/**
 * Tracking is allowed only when user explicitly accepted.
 */
export function hasTrackingConsent(): boolean {
  return getConsent() === 'accepted';
}

/**
 * Whether the banner should be displayed (i.e. user hasn't decided yet).
 */
export function shouldShowBanner(): boolean {
  return getConsent() === 'pending';
}

/**
 * Set consent choice and notify all listeners.
 */
export function setConsent(choice: ConsentChoice): void {
  safeSet(choice);
  notifyListeners(choice);
}

/**
 * Reset consent (used when user wants to change their choice).
 */
export function resetConsent(): void {
  safeRemove();
  notifyListeners('pending');
}

/**
 * Subscribe to consent status changes.
 * Returns an unsubscribe function.
 */
export function onConsentChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(status: ConsentStatus): void {
  listeners.forEach((l) => {
    try {
      l(status);
    } catch (err) {
      console.error('[consent] listener error:', err);
    }
  });

  // Also dispatch a DOM event (lets non-React code listen too)
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(STATUS_EVENT, { detail: status }));
    }
  } catch {
    /* noop */
  }
}
