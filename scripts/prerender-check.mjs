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
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const SITE = 'https://fegesport224.org';

const ROUTES = [
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
}

// --- Shell check (_spa.html) --------------------------------------
// The SPA catch-all serves /_spa.html for every URL that is not a
// prerendered file. It MUST stay route-agnostic: no canonical, no
// page-specific H1, no page-specific meta description. Otherwise it
// would re-advertise the homepage identity on every unknown URL.
try {
  const shell = await readFile(path.join(DIST, '_spa.html'), 'utf8');
  if (/<link[^>]+rel=["']canonical["']/.test(shell)) {
    errors.push('_spa.html: must NOT contain a <link rel="canonical">');
  }
  if (/<meta[^>]+name=["']robots["'][^>]+content=["']index/.test(shell)) {
    errors.push('_spa.html: must NOT advertise `index` in meta robots');
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
