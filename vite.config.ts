import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
// Prerender toolkit (devDependencies). Loaded at build-time only;
// the dev server (`vite dev`) does not run it.
// eslint-disable-next-line @typescript-eslint/no-var-requires
import prerender from '@prerenderer/rollup-plugin';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer';

// Routes that MUST ship as fully-rendered HTML to crawlers that do not
// execute JavaScript (Bingbot, social preview bots, LLM crawlers).
// Only stable, content-rich routes go here. Dynamic routes (/news/:id,
// /events/:id) are handled by the SPA fallback and will be prerendered
// in a dedicated phase that reads IDs from Supabase at build-time.
const PRERENDER_ROUTES = [
  '/',
  '/about',
  '/federation-guineenne-esport',
  '/histoire-esport-guinee',
  '/esport-guinee',
  '/press-kit',
  '/membership',
  '/membership/community',
  '/partners',
  '/contact',
  '/news',
  '/events',
  '/direct',
  '/leg',
  '/privacy',
  '/terms',
];

export default defineConfig({
  plugins: [
    react(),
    prerender({
      routes: PRERENDER_ROUTES,
      renderer: new PuppeteerRenderer({
        // Prerender does not boot a dev server; the Puppeteer page waits
        // for an app-level signal that the <SEO> component has posted
        // title/description/canonical and the main content is on screen.
        renderAfterDocumentEvent: 'prerender-ready',
        // Hard upper bound: if a route never dispatches the event (e.g.
        // Supabase timeout), fall back to the current DOM after 15 s so
        // the build does not hang.
        maxConcurrentRoutes: 1,
        timeout: 20_000,
        // Flag the browser context so main.tsx can skip analytics and
        // the cookie banner at build-time. The actual property on
        // `window` is set by `injectProperty` below.
        inject: { ssg: true },
        injectProperty: '__PRERENDER__',
        // v1.2.4 types this as boolean; puppeteer v23 defaults to the
        // new headless mode when `true` is passed.
        headless: true,
        // Netlify's build image ships Chromium but denies the default
        // Chrome sandbox syscalls. These flags are the standard CI set.
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
          ],
        },
      }),
      postProcess(renderedRoute) {
        // VERIFICATION ONLY — never rewrite the HTML here. All SEO
        // elements must come from the <SEO> React component so there
        // is a single source of truth. Must return void: mutate the
        // route in place (or throw) and don't return a value.
        const route = renderedRoute.route;
        const html = renderedRoute.html;
        const expect = (needle: string, label: string) => {
          if (!html.includes(needle)) {
            throw new Error(
              `[prerender] route ${route} is missing ${label} (${needle})`,
            );
          }
        };
        expect('<title>', '<title>');
        expect('name="description"', 'meta description');
        expect('rel="canonical"', 'canonical');
        expect('<h1', '<h1>');
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
    hmr: {
      clientPort: 443,
    },
  },
  preview: {
    port: 5173,
    host: true,
  },
  base: '/',
  build: {
    sourcemap: false,
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react', 'sonner'],
          i18n: ['i18next', 'react-i18next'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
