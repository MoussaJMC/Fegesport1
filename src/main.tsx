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

const mount = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Failed to find the root element');

  const root = createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AnalyticsProvider>
          <AuthProvider>
            <App />
            {/* Cookie banner — renders only if analytics are configured
                AND user hasn't made a choice yet. Non-blocking. */}
            <CookieBanner />
          </AuthProvider>
        </AnalyticsProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

mount();
