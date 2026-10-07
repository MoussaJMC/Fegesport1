#!/usr/bin/env node
/**
 * prerender-check.mjs
 *
 * Post-build QA pass. The @prerenderer plugin has already written one
 * `dist/<route>/index.html` per route (or kept `dist/index.html` for /).
 * This script walks every expected route and asserts the HTML carries:
 *   - a <title>
 *   - a <meta name="description">
 *   - a <link rel="canonical">
 *   - an <h1>
 * and that the canonical is self-referential — not pointing back at the
 * homepage, which was the Search Console "autre page avec balise
 * canonique correcte" bug of 2026-10.
 *
 * Exits non-zero on the first failure so Netlify's build fails loudly.
 */
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const SITE = 'https://fegesport224.org';

const STATIC_ROUTES = [
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

// Enumerate dynamic prerendered routes written by @prerenderer under
// dist/news/<id>/index.html and dist/events/<id>/index.html.
async function listDynamicRoutes() {
  const out = [];
  for (const subdir of ['news', 'events']) {
    try {
      const children = await readdir(path.join(DIST, subdir), { withFileTypes: true });
      for (const entry of children) {
        if (!entry.isDirectory()) continue;
        try {
          await readFile(path.join(DIST, subdir, entry.name, 'index.html'), 'utf8');
          out.push(`/${subdir}/${entry.name}`);
        } catch { /* no index.html — skip */ }
      }
    } catch { /* subdir missing — nothing dynamic */ }
  }
  return out;
}

const dynamicRoutes = await listDynamicRoutes();
const ROUTES = [...STATIC_ROUTES, ...dynamicRoutes];

const routeToFile = (route) =>
  route === '/' ? path.join(DIST, 'index.html') : path.join(DIST, route.slice(1), 'index.html');

const errors = [];

for (const route of ROUTES) {
  const file = routeToFile(route);
  let html;
  try {
    html = await readFile(file, 'utf8');
  } catch (err) {
    errors.push(`${route}: file missing (${path.relative(DIST, file)})`);
    continue;
  }

  // Note: content attributes rendered by browsers always use double
  // quotes, so matching `[^"]` is safe and lets apostrophes through
  // (otherwise "L'IESF" or "d'utilisation" trips the check).
  const checks = [
    { label: '<title>', test: /<title>[^<]{3,}<\/title>/ },
    { label: 'meta description', test: /<meta[^>]+name="description"[^>]*content="[^"]{20,}"/ },
    { label: 'canonical', test: /<link[^>]+rel="canonical"[^>]*href="[^"]+"/ },
    { label: '<h1>', test: /<h1[^>]*>[^<]{1,}/ },
  ];
  for (const { label, test } of checks) {
    if (!test.test(html)) {
      errors.push(`${route}: missing ${label}`);
    }
  }

  // Canonical must point to the route itself, not to the site root
  // (unless the route IS the site root).
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/);
  if (canonicalMatch) {
    const expected = route === '/' ? `${SITE}/` : `${SITE}${route}`;
    if (canonicalMatch[1] !== expected) {
      errors.push(`${route}: canonical ${canonicalMatch[1]} does not match ${expected}`);
    }
  }

  // Accessibility: every <img> must carry an alt attribute. Empty alt
  // ("") is intentional for decorative images and is allowed.
  const imgs = html.match(/<img[^>]*>/g) || [];
  const altMissing = imgs.filter((tag) => !/\balt\s*=/.test(tag));
  if (altMissing.length) {
    errors.push(`${route}: ${altMissing.length} <img> without alt= (first: ${altMissing[0].slice(0, 120)})`);
  }
}

// --- Shell check (_spa.html) --------------------------------------
// The SPA catch-all serves /_spa.html for every URL that is not a
// prerendered file. It MUST stay neutral: no canonical AND no meta
// robots (not even noindex — a pre-JS noindex can take real article
// pages served through the SPA shell out of Google's index without
// the JS that would lift it ever running). The SEO component posts
// the correct robots per route at hydration — index for live content,
// noindex for 404 and `!article` / `!event` branches.
try {
  const shell = await readFile(path.join(DIST, '_spa.html'), 'utf8');
  if (/<link[^>]+rel=["']canonical["']/.test(shell)) {
    errors.push('_spa.html: must NOT contain a <link rel="canonical">');
  }
  if (/<meta[^>]+name=["']robots["']/.test(shell)) {
    errors.push('_spa.html: must NOT contain a <meta name="robots"> — SEO component posts it at hydration');
  }
  // The React root should be empty in the shell. If React has already
  // mounted content, the shell is no longer route-agnostic.
  if (/<div id="root"><[a-zA-Z]/.test(shell)) {
    errors.push('_spa.html: #root is not empty — the shell was captured after React hydrated');
  }
} catch (err) {
  errors.push(`_spa.html: file missing — the vite plugin spaShellCopy did not run (${err.code || err.message})`);
}

if (errors.length) {
  console.error(`\n❌ prerender-check FAILED (${errors.length}):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

console.log(`✅ prerender-check OK (${ROUTES.length} routes + _spa.html shell).`);
