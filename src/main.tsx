import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { AnalyticsProvider } from './lib/analytics';
import CookieBanner from './components/cookie/CookieBanner';
import './index.css';
import './styles/admin-theme.css';
import './utils/i18n';

// Build-time prerender flag — set by @prerenderer/renderer-puppeteer
// via `injectProperty: '__PRERENDER__'`. See vite.config.ts.
// When true, we skip side-effectful mounts (analytics, cookie banner)
// so the captured HTML stays clean and no stats are polluted.
declare global {
  interface Window {
    __PRERENDER__?: unknown;
  }
}
const IS_PRERENDER = typeof window !== 'undefined' && !!window.__PRERENDER__;

// --- Prerender safety net -----------------------------------------
// When running inside Puppeteer at build-time, the Rollup prerender
// plugin waits for `document` to emit `prerender-ready`. The <SEO>
// component dispatches it on mount, but if a route forgets to mount
// SEO, or crashes before useEffect runs, Puppeteer waits the full
// renderer timeout and the whole build fails.
// The timer below dispatches the event 8 s after mount if nobody did,
// so the build keeps moving. The accompanying `prerender-check.mjs`
// is the real guard against incomplete HTML.
if (IS_PRERENDER) {
  // eslint-disable-next-line no-console
  console.log('[prerender] route start:', typeof window !== 'undefined' ? window.location.pathname : '?');
  let seoFiredReady = false;
  document.addEventListener('prerender-ready', () => {
    seoFiredReady = true;
    // eslint-disable-next-line no-console
    console.log('[prerender] SEO ready for', window.location.pathname);
  }, { once: true });
  setTimeout(() => {
    if (!seoFiredReady) {
      // eslint-disable-next-line no-console
      console.warn('[prerender] SAFETY NET — SEO never fired for', window.location.pathname, '; dispatching anyway');
      document.dispatchEvent(new Event('prerender-ready'));
    }
  }, 8000);
}

const mount = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Failed to find the root element');

  const root = createRoot(rootElement);

  // AuthProvider is kept at prerender because many public components
  // call `useAuth()` and throw if the context is missing (the
  // ErrorBoundary then masks every page with "Une erreur est survenue",
  // which caused all routes to serialise the same fallback HTML).
  // Only the two real side-effectful mounts are skipped at build time:
  // AnalyticsProvider (GA4 / Clarity injection) and CookieBanner (UI
  // that must never appear in the captured HTML).
  const Tree = (
    <React.StrictMode>
      <BrowserRouter>
        {IS_PRERENDER ? (
          <AuthProvider>
            <App />
          </AuthProvider>
        ) : (
          <AnalyticsProvider>
            <AuthProvider>
              <App />
              {/* Cookie banner — renders only if analytics are configured
                  AND user hasn't made a choice yet. Non-blocking. */}
              <CookieBanner />
            </AuthProvider>
          </AnalyticsProvider>
        )}
      </BrowserRouter>
    </React.StrictMode>
  );

  root.render(Tree);
};

mount();
