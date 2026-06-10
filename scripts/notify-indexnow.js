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
  sitemap: path.resolve(__dirname, '../public/sitemap.xml'),
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
  let urls = [];

  // Handle --url flag
  const urlFlag = args.indexOf('--url');
  if (urlFlag !== -1 && args[urlFlag + 1]) {
    urls = [args[urlFlag + 1]];
    console.log(`🎯 Single URL mode: ${urls[0]}`);
  } else {
    // Default: read sitemap
    console.log(`📖 Reading sitemap: ${CONFIG.sitemap}`);
    urls = parseSitemap(CONFIG.sitemap);
    console.log(`   Found ${urls.length} URLs\n`);
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
  console.log(success ? '✅ DONE — IndexNow notification successful' : '❌ FAILED — see above');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Exit gracefully — never fail the build pipeline on IndexNow errors
  // (indexation is a "nice to have", not critical)
  process.exit(0);
}

main().catch((err) => {
  console.error('💥 Unexpected error:', err);
  process.exit(0); // never fail build
});
