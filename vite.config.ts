import { defineConfig, type UserConfig } from 'vite';
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
        // The shell is written as-is: NO meta robots, NO canonical, NO
        // page-specific title. The <SEO> React component posts the
        // correct values at hydration (index for live content, noindex
        // for real 404 branches, see NewsArticlePage/EventPage/NotFound).
        // Writing a pre-JS `noindex` here would risk Googlebot
        // de-indexing real article URLs served through the SPA shell.
        const dst = resolve(__dirname, 'dist/_spa.html');
        writeFileSync(dst, shellHtml);
        // eslint-disable-next-line no-console
        console.log(`[spa-shell] wrote dist/_spa.html (${shellHtml.length} bytes, neutral)`);
      },
    },
  };
}

// Stable, hand-authored routes always prerendered.
const STATIC_PRERENDER_ROUTES = [
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

// Dynamic routes come from Supabase: every published article and every
// event not completed/cancelled. On Supabase failure we fall back to
// the static set — a stale shell is better than a build that hangs.
async function resolveDynamicRoutes(): Promise<string[]> {
  // @ts-expect-error — .mjs module without .d.ts
  const mod = await import('./scripts/supabase-fetch.mjs');
  const { news, events, error } = await mod.fetchPublishedContent();
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[prerender-ph2] Supabase fetch failed — static routes only:', error);
    return [];
  }
  const extras = [
    ...news.map((n: { id: string }) => `/news/${n.id}`),
    ...events.map((e: { id: string }) => `/events/${e.id}`),
  ];
  // eslint-disable-next-line no-console
  console.log(`[prerender-ph2] ${news.length} news + ${events.length} events will be prerendered`);
  return extras;
}

export default defineConfig(
  (async (): Promise<UserConfig> => {
  const dynamicRoutes = await resolveDynamicRoutes();
  const PRERENDER_ROUTES = [...STATIC_PRERENDER_ROUTES, ...dynamicRoutes];
  return {
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
  };
  })(),
);
