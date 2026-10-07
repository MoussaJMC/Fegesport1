#!/usr/bin/env node
/**
 * FEGESPORT — IndexNow notification script
 *
 * Notifies the IndexNow API of all URLs in the sitemap, triggering instant
 * indexation by Bing, Yandex, Naver, Seznam.cz and IndexNow.org subscribers.
 *
 * Specification: https://www.indexnow.org/documentation
 *
 * Usage:
 *   - Manual:    node scripts/notify-indexnow.js
 *   - All URLs:  node scripts/notify-indexnow.js --all
 *   - Specific:  node scripts/notify-indexnow.js --url https://fegesport224.org/news/abc123
 *
 * Integration:
 *   - Add to package.json scripts: "postbuild": "node scripts/notify-indexnow.js"
 *   - Or run from Netlify Build Plugin / GitHub Action
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================
// CONFIGURATION
// ============================================================
const CONFIG = {
  host: 'fegesport224.org',
  key: 'f723d769fee290fc00b10a1f1a987fd2',
  keyLocation: 'https://fegesport224.org/f723d769fee290fc00b10a1f1a987fd2.txt',
  endpoint: 'https://api.indexnow.org/indexnow',
  // Phase 2: sitemap is generated into dist/ at build time (combines
  // static routes + Supabase-sourced news/events). The old static
  // public/sitemap.xml has been removed.
  sitemap: path.resolve(__dirname, '../dist/sitemap.xml'),
  // Max 10 000 URLs per call (IndexNow spec)
  batchSize: 10000,
};

// ============================================================
// PARSE SITEMAP — extract <loc> URLs
// ============================================================
function parseSitemap(sitemapPath) {
  try {
    const xml = readFileSync(sitemapPath, 'utf-8');
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    return urls;
  } catch (err) {
    console.error(`❌ Could not read sitemap at ${sitemapPath}:`, err.message);
    return [];
  }
}

// Returns [{ loc, lastmod }] so we can filter by freshness.
function parseSitemapEntries(sitemapPath) {
  try {
    const xml = readFileSync(sitemapPath, 'utf-8');
    const entries = [];
    const urlBlockRe = /<url>([\s\S]*?)<\/url>/g;
    let m;
    while ((m = urlBlockRe.exec(xml)) !== null) {
      const block = m[1];
      const locMatch = block.match(/<loc>([^<]+)<\/loc>/);
      const lastmodMatch = block.match(/<lastmod>([^<]+)<\/lastmod>/);
      if (locMatch) {
        entries.push({
          loc: locMatch[1].trim(),
          lastmod: lastmodMatch ? lastmodMatch[1].trim() : null,
        });
      }
    }
    return entries;
  } catch (err) {
    console.error(`❌ Could not read sitemap at ${sitemapPath}:`, err.message);
    return [];
  }
}

// ============================================================
// NOTIFY INDEXNOW
// ============================================================
async function notifyIndexNow(urls) {
  if (urls.length === 0) {
    console.warn('⚠️ No URLs to notify. Aborting.');
    return false;
  }

  if (urls.length === 1) {
    // GET method for single URL (simpler, lighter)
    const url = `${CONFIG.endpoint}?url=${encodeURIComponent(urls[0])}&key=${CONFIG.key}`;
    console.log(`📤 Notifying IndexNow (GET) for 1 URL...`);
    try {
      const res = await fetch(url, { method: 'GET' });
      logResponse(res, urls);
      return res.ok;
    } catch (err) {
      console.error('❌ Fetch error:', err.message);
      return false;
    }
  }

  // POST method for multiple URLs (max 10 000 per call)
  const payload = {
    host: CONFIG.host,
    key: CONFIG.key,
    keyLocation: CONFIG.keyLocation,
    urlList: urls.slice(0, CONFIG.batchSize),
  };

  console.log(`📤 Notifying IndexNow (POST) for ${payload.urlList.length} URL(s)...`);
  console.log(`   Endpoint: ${CONFIG.endpoint}`);
  console.log(`   Host: ${CONFIG.host}`);

  try {
    const res = await fetch(CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        'User-Agent': 'FEGESPORT-IndexNow/1.0 (https://fegesport224.org)',
      },
      body: JSON.stringify(payload),
    });

    return logResponse(res, urls);
  } catch (err) {
    console.error('❌ Fetch error:', err.message);
    return false;
  }
}

function logResponse(res, urls) {
  // IndexNow returns:
  //   200 OK              — accepted
  //   202 Accepted        — received, validation pending
  //   400 Bad Request     — invalid format
  //   403 Forbidden       — key not found / invalid
  //   422 Unprocessable   — URL belongs to wrong host
  //   429 Too Many        — rate limited
  const statusMessages = {
    200: '✅ Accepted — URLs queued for indexation',
    202: '✅ Accepted (async) — validation pending',
    400: '❌ Bad Request — check JSON format',
    403: '❌ Forbidden — key not found at keyLocation, verify file is accessible',
    422: '❌ Unprocessable — URL host mismatch',
    429: '⚠️ Rate limited — retry later',
  };

  const msg = statusMessages[res.status] || `Status: ${res.status}`;
  console.log(`\n${msg}`);
  console.log(`   HTTP ${res.status} ${res.statusText}`);
  console.log(`   URLs submitted: ${urls.length}`);

  if (res.ok || res.status === 202) {
    console.log('\n📋 Submitted URLs:');
    urls.forEach((u, i) => console.log(`   ${i + 1}. ${u}`));
  }

  return res.ok || res.status === 202;
}

// ============================================================
// CLI
// ============================================================
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  FEGESPORT — IndexNow Notification');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const args = process.argv.slice(2);
  const force = args.includes('--force'); // allow local manual runs
  // Netlify sets CONTEXT to 'production' | 'deploy-preview' | 'branch-deploy'.
  // Hitting IndexNow from previews and local builds pollutes the quota and
  // can get the key rate-limited by Bing/Yandex. Allow only the production
  // context (or an explicit --force for one-off manual runs).
  const context = process.env.CONTEXT || 'local';
  if (!force && context !== 'production') {
    console.log(`⏭️  IndexNow skipped (context=${context}). Use --force to override locally.`);
    process.exit(0);
  }

  let urls = [];

  // Handle --url flag
  const urlFlag = args.indexOf('--url');
  if (urlFlag !== -1 && args[urlFlag + 1]) {
    urls = [args[urlFlag + 1]];
    console.log(`🎯 Single URL mode: ${urls[0]}`);
  } else {
    // Default: read sitemap, then narrow down to URLs modified in the
    // last 48 h using the sitemap's <lastmod>. This keeps the quota
    // tight — big site-wide pushes only happen when something actually
    // changed recently.
    console.log(`📖 Reading sitemap: ${CONFIG.sitemap}`);
    const entries = parseSitemapEntries(CONFIG.sitemap);
    console.log(`   Found ${entries.length} URLs in sitemap`);
    const cutoffMs = Date.now() - 48 * 60 * 60 * 1000;
    const recent = entries.filter((e) => {
      if (!e.lastmod) return false;
      const t = Date.parse(e.lastmod);
      return !Number.isNaN(t) && t >= cutoffMs;
    });
    urls = recent.map((e) => e.loc);
    console.log(`   ${urls.length} URL(s) with <lastmod> within the past 48 h\n`);
  }

  // Filter: keep only HTTPS URLs from our host
  const validUrls = urls.filter((u) => {
    try {
      const parsed = new URL(u);
      return parsed.protocol === 'https:' && parsed.host === CONFIG.host;
    } catch {
      return false;
    }
  });

  const skipped = urls.length - validUrls.length;
  if (skipped > 0) {
    console.warn(`⚠️ Skipped ${skipped} invalid/external URL(s)`);
  }

  if (validUrls.length === 0) {
    console.warn('⚠️ No valid URLs to submit. Exiting.');
    process.exit(0); // exit 0 — not an error, just nothing to do
  }

  const success = await notifyIndexNow(validUrls);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(
    success
      ? `✅ IndexNow sent ${validUrls.length} URLs (context=${context})`
      : '❌ FAILED — see above',
  );
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Exit gracefully — never fail the build pipeline on IndexNow errors
  // (indexation is a "nice to have", not critical)
  process.exit(0);
}

main().catch((err) => {
  console.error('💥 Unexpected error:', err);
  process.exit(0); // never fail build
});
