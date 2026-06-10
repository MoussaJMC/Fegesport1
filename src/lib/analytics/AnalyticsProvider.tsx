/**
 * AnalyticsProvider
 *
 * Wraps the app and:
 *   1. Loads GA4 and Clarity ONLY after the user has accepted tracking.
 *   2. Tracks SPA route changes (page_view) on every navigation.
 *   3. Re-acts if user changes consent later (resets state, etc.).
 *
 * Mount near the root, INSIDE <BrowserRouter> so useLocation works.
 */

import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { hasTrackingConsent, onConsentChange } from './consent';
import { loadGA4, trackPageView, isGA4Configured } from './ga4';
import { loadClarity, isClarityConfigured } from './clarity';

interface AnalyticsContextValue {
  ga4Configured: boolean;
  clarityConfigured: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextValue>({
  ga4Configured: false,
  clarityConfigured: false,
});

export const useAnalytics = () => useContext(AnalyticsContext);

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const location = useLocation();

  // ============================================================
  // Initial load: if user already consented in a previous session,
  // load tracking scripts immediately on mount.
  // ============================================================
  useEffect(() => {
    if (hasTrackingConsent()) {
      void loadGA4();
      void loadClarity();
    }

    // Listen for future consent changes (Accept after initial decline, etc.)
    const unsubscribe = onConsentChange((status) => {
      if (status === 'accepted') {
        void loadGA4();
        void loadClarity();
      }
      // If user revokes consent mid-session, we don't unload scripts
      // (they're already in the page). But future events are gated by
      // the load state inside ga4.ts / clarity.ts. We rely on browser
      // refresh to fully reset.
    });

    return unsubscribe;
  }, []);

  // ============================================================
  // Track page views on every route change (SPA navigation)
  // ============================================================
  useEffect(() => {
    if (hasTrackingConsent()) {
      // Defer slightly so the page title gets updated by SEO component
      const t = setTimeout(() => {
        trackPageView(location.pathname + location.search, document.title);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [location.pathname, location.search]);

  const value: AnalyticsContextValue = {
    ga4Configured: isGA4Configured(),
    clarityConfigured: isClarityConfigured(),
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
};
