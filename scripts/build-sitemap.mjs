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
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fetchPublishedContent } from './supabase-fetch.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Resolve the <lastmod> of a static route to the ISO date of the last
// commit that touched the file. Googlebot ignores lastmod values that
// change on every build; tying them to the real editorial history keeps
// the signal meaningful. Falls back to today only when git is not
// available (e.g. shallow clone that stripped the file's history).
function gitLastModified(relPath) {
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', relPath], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return iso ? iso.slice(0, 10) : null;
  } catch {
    return null;
  }
}

const SITE = 'https://fegesport224.org';
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'sitemap.xml');

// Mirrors STATIC_PRERENDER_ROUTES in vite.config.ts, minus /leg.
// `src` points at the file whose last-commit date drives <lastmod>.
// Priority / changefreq hand-authored.
const STATIC = [
  { loc: '/',                            cf: 'daily',   p: '1.0', src: 'src/pages/HomePage.tsx' },
  { loc: '/about',                       cf: 'weekly',  p: '0.9', src: 'src/pages/AboutPage.tsx' },
  { loc: '/esport-guinee',               cf: 'monthly', p: '1.0', src: 'src/pages/EsportGuineePage.tsx' },
  { loc: '/federation-guineenne-esport', cf: 'monthly', p: '1.0', src: 'src/pages/FederationGuineenneEsportPage.tsx' },
  { loc: '/histoire-esport-guinee',      cf: 'monthly', p: '0.9', src: 'src/pages/HistoireEsportGuineePage.tsx' },
  { loc: '/press-kit',                   cf: 'monthly', p: '0.8', src: 'src/pages/PressKitPage.tsx' },
  { loc: '/membership',                  cf: 'monthly', p: '0.8', src: 'src/pages/MembershipPage.tsx' },
  { loc: '/membership/community',        cf: 'weekly',  p: '0.7', src: 'src/pages/CommunityPage.tsx' },
  { loc: '/partners',                    cf: 'monthly', p: '0.7', src: 'src/pages/PartnersPage.tsx' },
  { loc: '/contact',                     cf: 'monthly', p: '0.6', src: 'src/pages/ContactPage.tsx' },
  { loc: '/news',                        cf: 'daily',   p: '0.9', src: 'src/pages/NewsPage.tsx' },
  { loc: '/events',                      cf: 'daily',   p: '0.9', src: 'src/pages/EventsListPage.tsx' },
  { loc: '/direct',                      cf: 'daily',   p: '0.7', src: 'src/pages/DirectPage.tsx' },
  // /leg intentionally left out — noindex while LEG data is empty.
  { loc: '/privacy',                     cf: 'yearly',  p: '0.3', src: 'src/pages/PrivacyPage.tsx' },
  { loc: '/terms',                       cf: 'yearly',  p: '0.3', src: 'src/pages/TermsPage.tsx' },
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

// Index pages (/news, /events) do not change when their source
// component is edited — they change when the list they render changes.
// For these two, take the max of the component's git date and the most
// recent `updated_at` in the backing table.
function latestUpdatedAt(rows) {
  const dates = rows
    .map((r) => Date.parse(r.updated_at || ''))
    .filter((n) => !Number.isNaN(n));
  if (!dates.length) return null;
  return new Date(Math.max(...dates)).toISOString().slice(0, 10);
}
function pickMaxDate(...isoDates) {
  const valid = isoDates.filter(Boolean).map((d) => d.slice(0, 10));
  if (!valid.length) return today;
  return valid.sort().at(-1);
}

const newsLatest = latestUpdatedAt(news);
const eventsLatest = latestUpdatedAt(events);

const staticBlocks = STATIC.map((r) => {
  // Prefer the real editorial date (last commit on the page source).
  // Falls back to today only when git can't resolve the file history
  // (e.g. shallow clone that stripped it). Avoids the "lastmod rolls
  // every build" anti-pattern that Googlebot learns to ignore.
  let lastmod = gitLastModified(r.src) || today;
  if (r.loc === '/news') lastmod = pickMaxDate(lastmod, newsLatest);
  if (r.loc === '/events') lastmod = pickMaxDate(lastmod, eventsLatest);
  return urlBlock({ loc: r.loc, lastmod, changefreq: r.cf, priority: r.p });
});

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
