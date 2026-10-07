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

const mount = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Failed to find the root element');

  const root = createRoot(rootElement);

  const Tree = (
    <React.StrictMode>
      <BrowserRouter>
        {IS_PRERENDER ? (
          // Minimal tree at prerender time: no analytics, no cookie
          // banner, no auth-driven redirects. Everything required for
          // crawler-visible SEO (title, meta, canonical, H1, body copy)
          // still comes from <App />.
          <App />
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
