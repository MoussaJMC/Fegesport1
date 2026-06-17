// CENTRE MÉDIA FEGESPORT — Veille mondiale esport
// Agent 2 (Veille) : scanne les sources officielles (flux RSS/Atom)
// Agent 3 (Analyseur) : score importance / impact / pertinence Guinée via Claude
//
// POST { action?: 'fetch' | 'analyze' | 'full', source_id?: string }
// Appel admin (JWT) ou cron (header X-Cron-Key).
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import {
  corsHeaders,
  jsonResponse,
  getServiceClient,
  requireAdmin,
  isCronCall,
  callClaude,
  parseModelJson,
  logAiUsage,
  checkAiQuota,
  CLAUDE_MODEL,
} from '../_shared/mediaCenter.ts';

interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string | null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return match ? stripHtml(match[1]) : '';
}

/** Parseur RSS/Atom minimaliste sans dépendance externe. */
function parseFeed(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  for (const block of blocks.slice(0, 20)) {
    const title = extractTag(block, 'title');
    let link = extractTag(block, 'link');
    if (!link) {
      const hrefMatch = block.match(/<link[^>]*href="([^"]+)"/i);
      link = hrefMatch ? hrefMatch[1] : '';
    }
    const description = extractTag(block, 'description') || extractTag(block, 'summary') || extractTag(block, 'content');
    const pubDate = extractTag(block, 'pubDate') || extractTag(block, 'published') || extractTag(block, 'updated') || null;
    if (title && link) {
      items.push({ title, link, description: description.slice(0, 1500), pubDate });
    }
  }
  return items;
}

const ANALYZER_SYSTEM = `Tu es l'Analyste et Rédacteur en Chef du Centre Média de la FEGESPORT (Fédération Guinéenne d'Esport).
Tu évalues des actualités esport internationales puis tu rends une décision éditoriale.
Critères d'évaluation (0-100) :
- importance : poids de la nouvelle dans l'écosystème esport mondial
- impact : conséquences concrètes (compétitions, règlements, classements, partenariats)
- impact_africa : conséquences pour l'esport africain (qualifications continentales, ACES,
  tournois ouverts aux pays africains, investissements en Afrique)
- relevance_guinea : pertinence directe pour la Guinée — qualifications ouvertes aux fédérations
  africaines, jeux populaires en Guinée (FC/FIFA, PUBG Mobile, Free Fire, MLBB, Tekken,
  Street Fighter, Valorant, CS), opportunités IESF/ACES/GEF
Décision éditoriale (critères : importance, crédibilité de la source, impact Guinée/Afrique,
nouveauté, cohérence avec la ligne éditoriale d'une fédération nationale) :
- priority_level : "urgent" | "priority" | "standard" | "archive"
- decision : "publish" (mérite un article FEGESPORT) | "revise" (à creuser/vérifier) | "ignore"
Tu ne dois RIEN inventer : analyse uniquement le titre et le résumé fournis.
Réponds STRICTEMENT en JSON.`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Méthode non autorisée' }, 405);

  const supabase = getServiceClient();

  try {
    // Auth : admin connecté OU appel cron avec secret partagé
    const admin = isCronCall(req) ? { id: null, email: 'cron' } : await requireAdmin(req, supabase);
    if (!admin) return jsonResponse({ error: 'Accès réservé aux administrateurs' }, 401);

    const body = await req.json().catch(() => ({}));
    const action: string = body.action ?? 'full';
    const result = { fetched: 0, inserted: 0, analyzed: 0, sources_ok: 0, sources_failed: 0, errors: [] as string[] };

    // ----- Étape 1 : collecte des flux -----
    if (action === 'fetch' || action === 'full') {
      let query = supabase.from('news_sources').select('*').eq('is_active', true).not('feed_url', 'is', null);
      if (body.source_id) query = query.eq('id', body.source_id);
      const { data: sources } = await query;

      for (const source of sources ?? []) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          const res = await fetch(source.feed_url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'FEGESPORT-MediaCenter/1.0 (+https://fegesport224.org)' },
          });
          clearTimeout(timeout);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const xml = await res.text();
          const items = parseFeed(xml);
          result.fetched += items.length;

          for (const item of items) {
            const { error } = await supabase.from('collected_news').insert({
              source_id: source.id,
              title: item.title.slice(0, 500),
              url: item.link,
              raw_excerpt: item.description,
              published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
            });
            // 23505 = doublon d'URL (déjà collectée) — comportement attendu
            if (!error) result.inserted += 1;
            else if (error.code !== '23505') result.errors.push(`${source.name}: ${error.message}`);
          }

          await supabase.from('news_sources').update({
            last_fetched_at: new Date().toISOString(),
            last_fetch_status: 'ok',
            fetch_error: null,
          }).eq('id', source.id);
          result.sources_ok += 1;
        } catch (e) {
          result.sources_failed += 1;
          await supabase.from('news_sources').update({
            last_fetched_at: new Date().toISOString(),
            last_fetch_status: 'error',
            fetch_error: String(e).slice(0, 300),
          }).eq('id', source.id);
        }
      }
    }

    // ----- Étape 2 : analyse IA des nouvelles collectées -----
    if (action === 'analyze' || action === 'full') {
      if (!(await checkAiQuota(supabase))) {
        result.errors.push('Quota IA journalier atteint — analyse reportée.');
        return jsonResponse({ success: true, ...result });
      }

      const { data: pending } = await supabase
        .from('collected_news')
        .select('id, title, raw_excerpt, source_id, news_sources(name, organization)')
        .eq('status', 'new')
        .order('collected_at', { ascending: false })
        .limit(15);

      if (pending && pending.length) {
        const list = pending.map((n, i) =>
          `${i + 1}. [id:${n.id}] (${(n as any).news_sources?.organization ?? 'source inconnue'}) ${n.title}\n   ${n.raw_excerpt?.slice(0, 300) ?? ''}`
        ).join('\n');

        const prompt = `Analyse ces ${pending.length} actualités esport :

${list}

PRODUIS ce JSON :
{
  "analyses": [
    {
      "id": "uuid de l'actualité",
      "importance": 0-100,
      "impact": 0-100,
      "impact_africa": 0-100,
      "relevance_guinea": 0-100,
      "category": "compétitions" | "règlements" | "annonces" | "classements" | "partenariats" | "autre",
      "summary_fr": "résumé factuel en français, 1-2 phrases",
      "priority_level": "urgent" | "priority" | "standard" | "archive",
      "decision": "publish" | "revise" | "ignore",
      "decision_reason": "justification en 1 phrase"
    }
  ]
}`;

        const { text, usage } = await callClaude(ANALYZER_SYSTEM, prompt, 6000);
        const parsed = parseModelJson<{ analyses: Array<Record<string, any>> }>(text);

        for (const a of parsed.analyses ?? []) {
          const match = pending.find((p) => p.id === a.id);
          if (!match) continue;
          const priority = ['urgent', 'priority', 'standard', 'archive'].includes(a.priority_level)
            ? a.priority_level : 'standard';
          const decision = ['publish', 'revise', 'ignore'].includes(a.decision)
            ? a.decision : null;
          await supabase.from('collected_news').update({
            ai_importance: Math.min(100, Math.max(0, a.importance ?? 0)),
            ai_impact: Math.min(100, Math.max(0, a.impact ?? 0)),
            ai_impact_africa: Math.min(100, Math.max(0, a.impact_africa ?? 0)),
            ai_relevance_guinea: Math.min(100, Math.max(0, a.relevance_guinea ?? 0)),
            ai_category: a.category ?? 'autre',
            summary: a.summary_fr ?? null,
            ai_analysis: a,
            ai_analyzed_at: new Date().toISOString(),
            editorial_priority: priority,
            editorial_decision: decision,
            editorial_reason: a.decision_reason ?? null,
            // "flagged" = mérite l'attention de la rédaction (décision publish ou forte pertinence Guinée)
            status: decision === 'publish' || (a.relevance_guinea ?? 0) >= 60 ? 'flagged' : 'analyzed',
          }).eq('id', a.id);
          result.analyzed += 1;
        }

        await logAiUsage(supabase, {
          function_name: 'media-watch',
          model: CLAUDE_MODEL,
          input_tokens: usage.input_tokens,
          output_tokens: usage.output_tokens,
        });
      }
    }

    return jsonResponse({ success: true, ...result });
  } catch (error) {
    console.error('media-watch error:', error);
    return jsonResponse({ error: `Veille échouée : ${String(error).slice(0, 300)}` }, 500);
  }
});
