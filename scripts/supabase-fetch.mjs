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
 * `updated_at`. Filters MUST match EventsListPage.tsx exactly so every
 * event visible to a human visitor on /events is also prerendered and
 * listed in sitemap.xml.
 *
 * Rule (2026-10-08 regression fix): the only event status that must
 * never be public is `cancelled`. `completed` events are kept in the
 * public archive (EventsListPage renders them under "Événements
 * passés"), so they must also be prerendered and listed. If this
 * filter diverges from EventsListPage again, Googlebot will follow
 * public links to pages that serve the neutral SPA shell.
 */
export async function fetchPublishedContent() {
  try {
    const [news, events] = await Promise.all([
      supabaseGet('news', 'select=id,updated_at,title&published=eq.true'),
      supabaseGet(
        'events',
        'select=id,updated_at,title,status,date&status=not.eq.cancelled',
      ),
    ]);
    return { news, events, error: null };
  } catch (err) {
    return { news: [], events: [], error: err.message || String(err) };
  }
}
