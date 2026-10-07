const { join } = require('node:path');

/**
 * Puppeteer v23 downloads its Chromium binary at `npm install` time via
 * a postinstall script. By default it goes to `~/.cache/puppeteer`, a
 * path Netlify does NOT restore between builds — only `node_modules` is
 * cached. The result: a fresh install writes Chrome fine, a cached-
 * node_modules build skips the postinstall and leaves `~/.cache` empty,
 * and the prerender plugin fails with "Could not find Chrome".
 *
 * Redirecting the cache under `node_modules/.cache/puppeteer` ties
 * Chrome's lifecycle to node_modules — if Netlify restores one, it
 * restores the other. Combined with the `prebuild: puppeteer browsers
 * install chrome` script in package.json (idempotent), every build is
 * deterministic regardless of cache state.
 */
module.exports = {
  cacheDirectory: join(__dirname, 'node_modules', '.cache', 'puppeteer'),
};
