#!/usr/bin/env node
// Generates dist/sitemap.xml at build time.
//
// Content:
//   - all static public routes except /leg (left out while the LEG page
//     carries noindex),
//   - every published article (/news/<id>),
//   - every active event (/events/<id>),
//   with `lastmod` from Supabase `updated_at` when available.
//
// On Supabase failure the script falls back to the 15 static routes
// (no /leg) with today's date — a stale shell is better than no sitemap.
// Any warnings go to stderr but the script never fails the build.
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { fetchPublishedContent } from './supabase-fetch.mjs';

const SITE = 'https://fegesport224.org';
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'sitemap.xml');

// Mirrors STATIC_PRERENDER_ROUTES in vite.config.ts, minus /leg.
// Priority / changefreq hand-authored.
const STATIC = [
  { loc: '/',                            cf: 'daily',   p: '1.0' },
  { loc: '/about',                       cf: 'weekly',  p: '0.9' },
  { loc: '/esport-guinee',               cf: 'monthly', p: '1.0' },
  { loc: '/federation-guineenne-esport', cf: 'monthly', p: '1.0' },
  { loc: '/histoire-esport-guinee',      cf: 'monthly', p: '0.9' },
  { loc: '/press-kit',                   cf: 'monthly', p: '0.8' },
  { loc: '/membership',                  cf: 'monthly', p: '0.8' },
  { loc: '/membership/community',        cf: 'weekly',  p: '0.7' },
  { loc: '/partners',                    cf: 'monthly', p: '0.7' },
  { loc: '/contact',                     cf: 'monthly', p: '0.6' },
  { loc: '/news',                        cf: 'daily',   p: '0.9' },
  { loc: '/events',                      cf: 'daily',   p: '0.9' },
  { loc: '/direct',                      cf: 'daily',   p: '0.7' },
  // /leg intentionally left out — noindex while LEG data is empty.
  { loc: '/privacy',                     cf: 'yearly',  p: '0.3' },
  { loc: '/terms',                       cf: 'yearly',  p: '0.3' },
];

const today = new Date().toISOString().slice(0, 10);

function toIsoDate(value) {
  if (!value) return today;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return today;
  return d.toISOString().slice(0, 10);
}

function urlBlock({ loc, lastmod, changefreq, priority }) {
  const lines = [
    '  <url>',
    `    <loc>${SITE}${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
  ];
  if (changefreq) lines.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority)   lines.push(`    <priority>${priority}</priority>`);
  lines.push('  </url>');
  return lines.join('\n');
}

const { news, events, error } = await fetchPublishedContent();

if (error) {
  console.warn(`[build-sitemap] Supabase failed — static-only sitemap: ${error}`);
}

const dynamicBlocks = [
  ...news.map((n) => urlBlock({
    loc: `/news/${n.id}`,
    lastmod: toIsoDate(n.updated_at),
    changefreq: 'weekly',
    priority: '0.6',
  })),
  ...events.map((e) => urlBlock({
    loc: `/events/${e.id}`,
    lastmod: toIsoDate(e.updated_at),
    changefreq: 'weekly',
    priority: '0.6',
  })),
];

const staticBlocks = STATIC.map((r) => urlBlock({
  loc: r.loc,
  lastmod: today,
  changefreq: r.cf,
  priority: r.p,
}));

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  '',
  `  <!-- Generated at build time (${today}). ${news.length} news + ${events.length} events + ${STATIC.length} static routes. /leg excluded (noindex). -->`,
  '',
  ...staticBlocks,
  '',
  ...(dynamicBlocks.length ? ['  <!-- Dynamic — from Supabase -->', ...dynamicBlocks] : []),
  '',
  '</urlset>',
  '',
].join('\n');

await writeFile(OUT, xml, 'utf8');

const totalUrls = STATIC.length + news.length + events.length;
console.log(`[build-sitemap] wrote dist/sitemap.xml — ${totalUrls} URLs (${STATIC.length} static, ${news.length} news, ${events.length} events)`);

if (!error && news.length < 10) {
  console.warn(`[build-sitemap] WARNING: only ${news.length} published articles — sanity check that this is expected.`);
}
