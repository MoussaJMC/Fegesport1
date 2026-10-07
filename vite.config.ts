import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { writeFileSync } from 'node:fs';
// Prerender toolkit (devDependencies). Loaded at build-time only;
// the dev server (`vite dev`) does not run it.
// eslint-disable-next-line @typescript-eslint/no-var-requires
import prerender from '@prerenderer/rollup-plugin';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import PuppeteerRenderer from '@prerenderer/renderer-puppeteer';

// Copies the untouched Vite index.html to dist/_spa.html BEFORE the
// prerender plugin overwrites it with the "/" snapshot. The Netlify
// SPA catch-all points at this clean shell, so unknown URLs and
// uncaptured dynamic routes (/news/<id>, /events/<id>, 404s) no longer
// receive the homepage HTML — they receive a route-agnostic shell with
// no canonical, no robots and no page-specific H1.
function spaShellCopy() {
  // Capture the final transformed index.html at the LAST transformIndexHtml
  // step (`order: 'post'`). At that moment Vite has injected its script
  // tags but no prerender has run, and the HTML is still the pristine
  // route-agnostic shell with an empty <div id="root"></div>. We stash the
  // string in memory and only touch the disk in `closeBundle` — Netlify
  // then serves this file to any URL that is not a prerendered route.
  let shellHtml = '';
  return {
    name: 'spa-shell-copy',
    apply: 'build' as const,
    transformIndexHtml: {
      order: 'post' as const,
      handler(html: string) {
        shellHtml = html;
      },
    },
    closeBundle: {
      sequential: true,
      handler() {
        if (!shellHtml) {
          // eslint-disable-next-line no-console
          console.warn('[spa-shell] transformIndexHtml never fired — no _spa.html written');
          return;
        }
        // The shell inherits index.html's default `<meta name="robots"
        // content="index, follow …">`. For the SPA fallback that is wrong:
        // the shell is served to unknown URLs (soft-404, uncaptured
        // dynamic routes) that must not be indexed. Rewrite the robots
        // meta to `noindex, follow` so these URLs never enter Google's
        // index while still letting link juice through.
        let out = shellHtml;
        const robotsRe = /<meta[^>]+name="robots"[^>]*>/i;
        const noindexMeta = '<meta name="robots" content="noindex, follow" />';
        out = robotsRe.test(out)
          ? out.replace(robotsRe, noindexMeta)
          : out.replace('</head>', `    ${noindexMeta}\n  </head>`);
        const dst = resolve(__dirname, 'dist/_spa.html');
        writeFileSync(dst, out);
        // eslint-disable-next-line no-console
        console.log(`[spa-shell] wrote dist/_spa.html (${out.length} bytes, robots→noindex)`);
      },
    },
  };
}

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
    // IMPORTANT: spaShellCopy() must come BEFORE prerender() so its
    // writeBundle runs first (both are sequential/post) and snapshots
    // the pristine dist/index.html before the prerender plugin rewrites
    // it with the "/" HTML.
    spaShellCopy(),
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
        // eslint-disable-next-line no-console
        console.log(`[prerender] ✓ ${route}  (html ${html.length} bytes)`);
        const expect = (needle: string, label: string) => {
          if (!html.includes(needle)) {
            // eslint-disable-next-line no-console
            console.warn(`[prerender] ⚠ ${route} missing ${label} (${needle})`);
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
