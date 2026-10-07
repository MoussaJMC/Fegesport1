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

  const checks = [
    { label: '<title>', test: /<title>[^<]{3,}<\/title>/ },
    { label: 'meta description', test: /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}["']/ },
    { label: 'canonical', test: /<link[^>]+rel=["']canonical["'][^>]+href=["'][^"']+["']/ },
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

if (errors.length) {
  console.error(`\n❌ prerender-check FAILED (${errors.length}):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

console.log(`✅ prerender-check OK (${ROUTES.length} routes).`);
