// Read-only Supabase fetch for build-time code (prerender + sitemap).
// Uses the anon key (frontend-safe) via REST, no @supabase/supabase-js
// dependency to keep the module edge-friendly.

const DEFAULT_URL = process.env.VITE_SUPABASE_URL;
const DEFAULT_KEY = process.env.VITE_SUPABASE_ANON_KEY;

async function supabaseGet(table, query, { url = DEFAULT_URL, key = DEFAULT_KEY } = {}) {
  if (!url || !key) {
    throw new Error('[supabase-fetch] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing from env');
  }
  const res = await fetch(`${url}/rest/v1/${table}?${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    throw new Error(`[supabase-fetch] ${table} HTTP ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Returns { news, events } where each row has at least `id` and
 * `updated_at`. Filters match the live app:
 *   news   → published = true
 *   events → status NOT IN (completed, cancelled)
 * On any error, the caller receives { news: [], events: [], error }.
 */
export async function fetchPublishedContent() {
  try {
    const [news, events] = await Promise.all([
      supabaseGet('news', 'select=id,updated_at,title&published=eq.true'),
      supabaseGet(
        'events',
        'select=id,updated_at,title&status=not.eq.completed&status=not.eq.cancelled',
      ),
    ]);
    return { news, events, error: null };
  } catch (err) {
    return { news: [], events: [], error: err.message || String(err) };
  }
}
