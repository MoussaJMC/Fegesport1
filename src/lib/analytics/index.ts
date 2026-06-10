/**
 * FEGESPORT Analytics — public API
 *
 * Usage in components:
 *   import { trackEvent } from '@/lib/analytics';
 *
 *   <button onClick={() => trackEvent('partner_click', { partner_name: 'IESF' })}>
 *     Partner
 *   </button>
 *
 * Setup in main.tsx:
 *   import { AnalyticsProvider } from '@/lib/analytics';
 *
 *   <AnalyticsProvider>
 *     <App />
 *   </AnalyticsProvider>
 */

export { AnalyticsProvider, useAnalytics } from './AnalyticsProvider';
export {
  getConsent,
  hasTrackingConsent,
  shouldShowBanner,
  setConsent,
  resetConsent,
  onConsentChange,
} from './consent';
export type { ConsentChoice, ConsentStatus } from './consent';
export { trackEvent, trackPageView, isGA4Configured } from './ga4';
export { tagSession, identifyUser, isClarityConfigured } from './clarity';
