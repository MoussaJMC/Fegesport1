#!/usr/bin/env node
/**
 * FEGESPORT — SEO sanity check
 *
 * Verifies that the project ships with the minimum required SEO assets
 * and that environment variables expected by the analytics layer are
 * either set or empty (never undefined).
 *
 * Exit code:
 *   - 0 : all checks pass (or warnings only)
 *   - 1 : at least one critical check fails
 *
 * Usage:
 *   npm run seo:check
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

const C = COLORS;

const results = {
  passed: 0,
  warned: 0,
  failed: 0,
};

function header(label) {
  console.log(`\n${C.bold}${C.blue}━━━ ${label} ━━━${C.reset}`);
}

function pass(msg) {
  console.log(`  ${C.green}✓${C.reset} ${msg}`);
  results.passed++;
}

function warn(msg) {
  console.log(`  ${C.yellow}⚠${C.reset} ${msg}`);
  results.warned++;
}

function fail(msg) {
  console.log(`  ${C.red}✗${C.reset} ${msg}`);
  results.failed++;
}

function info(msg) {
  console.log(`    ${C.gray}${msg}${C.reset}`);
}

/**
 * Check that a file exists (relative to project root).
 */
function checkFile(relPath, { critical = true, minSize = 0 } = {}) {
  const fullPath = path.join(ROOT, relPath);
  if (!existsSync(fullPath)) {
    const msg = `Missing: ${relPath}`;
    if (critical) fail(msg);
    else warn(msg);
    return false;
  }
  const stat = statSync(fullPath);
  if (minSize > 0 && stat.size < minSize) {
    warn(`Too small: ${relPath} (${stat.size}B < ${minSize}B expected)`);
    return false;
  }
  pass(`${relPath} (${(stat.size / 1024).toFixed(1)} KB)`);
  return true;
}

function checkContent(relPath, pattern, label) {
  const fullPath = path.join(ROOT, relPath);
  if (!existsSync(fullPath)) {
    fail(`${label}: file missing (${relPath})`);
    return false;
  }
  const content = readFileSync(fullPath, 'utf-8');
  if (pattern.test(content)) {
    pass(`${label}`);
    return true;
  }
  fail(`${label}: pattern not found in ${relPath}`);
  return false;
}

function checkEnv(envFile, varName, { mustBeSet = false } = {}) {
  const fullPath = path.join(ROOT, envFile);
  if (!existsSync(fullPath)) {
    fail(`${envFile} missing`);
    return false;
  }
  const content = readFileSync(fullPath, 'utf-8');
  const regex = new RegExp(`^\\s*${varName}\\s*=`, 'm');
  if (!regex.test(content)) {
    fail(`${varName} not declared in ${envFile}`);
    return false;
  }
  if (mustBeSet) {
    const valRegex = new RegExp(`^\\s*${varName}\\s*=\\s*(.+)`, 'm');
    const match = content.match(valRegex);
    if (!match || !match[1].trim()) {
      warn(`${varName} declared in ${envFile} but empty`);
      return false;
    }
  }
  pass(`${varName} present in ${envFile}`);
  return true;
}

// ============================================================
// MAIN
// ============================================================
console.log(`${C.bold}FEGESPORT — SEO Sanity Check${C.reset}`);
console.log(`${C.gray}Project root: ${ROOT}${C.reset}`);

header('1. SEO files (sitemap, robots)');
checkFile('public/sitemap.xml', { minSize: 500 });
checkFile('public/robots.txt', { minSize: 100 });
checkContent('public/sitemap.xml', /<loc>https:\/\/fegesport224\.org/, 'Sitemap contains canonical domain');
checkContent('public/robots.txt', /Sitemap:\s*https:\/\/fegesport224\.org/, 'Robots.txt declares sitemap');
checkContent('public/robots.txt', /User-agent:\s*Googlebot/i, 'Robots.txt has Googlebot rule');

header('2. IndexNow files');
checkFile('public/f723d769fee290fc00b10a1f1a987fd2.txt');
checkFile('public/indexnow-key.txt', { critical: false });

header('3. PWA / Favicons');
checkFile('public/site.webmanifest');
checkFile('public/favicon.ico', { critical: false });
checkFile('public/favicon-32x32.png', { critical: false });
checkFile('public/apple-touch-icon.png', { critical: false });
checkFile('public/android-chrome-192x192.png', { critical: false });
checkFile('public/android-chrome-512x512.png', { critical: false });
checkFile('public/og-image.jpg', { critical: false });

header('4. index.html meta tags');
checkContent('index.html', /<meta\s+name="description"/i, 'meta description');
checkContent('index.html', /<meta\s+name="keywords"/i, 'meta keywords');
checkContent('index.html', /<meta\s+name="google-site-verification"\s+content="[^"]+"/i, 'Google Search Console verified');
checkContent('index.html', /<meta\s+name="msvalidate\.01"\s+content="[^"]+"/i, 'Bing Webmaster verified');
checkContent('index.html', /<meta\s+property="og:title"/i, 'OG title');
checkContent('index.html', /<meta\s+property="og:image"/i, 'OG image');
checkContent('index.html', /<meta\s+property="og:type"/i, 'OG type');
checkContent('index.html', /<meta\s+property="og:url"/i, 'OG url');
checkContent('index.html', /<meta\s+property="twitter:card"/i, 'Twitter card');
checkContent('index.html', /<link\s+rel="canonical"/i, 'Canonical link');
checkContent('index.html', /<link\s+rel="alternate"\s+hreflang="fr"/i, 'hreflang fr');
checkContent('index.html', /<link\s+rel="alternate"\s+hreflang="en"/i, 'hreflang en');
checkContent('index.html', /application\/ld\+json/i, 'Schema.org JSON-LD present');

header('5. Environment variables (.env.example)');
checkFile('.env.example');
checkEnv('.env.example', 'VITE_SUPABASE_URL');
checkEnv('.env.example', 'VITE_SUPABASE_ANON_KEY');
checkEnv('.env.example', 'VITE_GA_MEASUREMENT_ID');
checkEnv('.env.example', 'VITE_CLARITY_PROJECT_ID');

header('6. Analytics layer files');
checkFile('src/lib/analytics/consent.ts');
checkFile('src/lib/analytics/ga4.ts');
checkFile('src/lib/analytics/clarity.ts');
checkFile('src/lib/analytics/AnalyticsProvider.tsx');
checkFile('src/lib/analytics/index.ts');
checkFile('src/components/cookie/CookieBanner.tsx');

header('7. Build artefacts (run after `npm run build`)');
const distExists = existsSync(path.join(ROOT, 'dist'));
if (distExists) {
  checkFile('dist/index.html', { minSize: 1000 });
  checkFile('dist/sitemap.xml', { minSize: 500 });
  checkFile('dist/robots.txt', { minSize: 100 });
  checkFile('dist/site.webmanifest', { critical: false });
} else {
  info('dist/ not found — run `npm run build` first to verify build artefacts');
}

// ============================================================
// SUMMARY
// ============================================================
console.log(`\n${C.bold}━━━ Summary ━━━${C.reset}`);
console.log(`  ${C.green}✓ Passed:  ${results.passed}${C.reset}`);
console.log(`  ${C.yellow}⚠ Warned:  ${results.warned}${C.reset}`);
console.log(`  ${C.red}✗ Failed:  ${results.failed}${C.reset}`);

if (results.failed > 0) {
  console.log(`\n${C.red}${C.bold}❌ SEO check FAILED${C.reset}`);
  console.log(`${C.gray}   Fix the ✗ items above before deploying.${C.reset}`);
  process.exit(1);
}

if (results.warned > 0) {
  console.log(`\n${C.yellow}${C.bold}⚠ SEO check passed with warnings${C.reset}`);
  console.log(`${C.gray}   Consider addressing warnings for optimal SEO.${C.reset}`);
  process.exit(0);
}

console.log(`\n${C.green}${C.bold}✅ All SEO checks passed${C.reset}`);
process.exit(0);
