// FEGESPORT AI MEDIA ECOSYSTEM V3 — Moteur de croissance
//
// POST { action: 'insights' | 'prospects' | 'detect' | 'sponsorship' | 'opportunities' | 'reputation', ... }
//   insights      → Agent 10 Community Growth Manager
//   prospects     → Agent 11 Partnership Intelligence
//   detect        → Agent 12 Athlete & Club Detector
//   sponsorship   → Agent 13 Sponsorship Content Generator ({ event_id? , period_days? })
//   opportunities → Agent 14 International Relations Monitor
//   reputation    → Agent 15 Reputation Monitor
//
// Appel admin (JWT) ou cron (X-Cron-Key).
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import {
  corsHeaders, jsonResponse, getServiceClient, requireAdmin, isCronCall,
  callClaude, parseModelJson, logAiUsage, checkAiQuota, CLAUDE_MODEL,
} from '../_shared/mediaCenter.ts';

const GROWTH_SYSTEM = `Tu es le stratège croissance du FEGESPORT AI Media Ecosystem
(Fédération Guinéenne d'Esport). Tu transformes les données média en intelligence
de développement institutionnel. Objectifs : recruter joueurs, clubs, partenaires,
sponsors, journalistes, bénévoles et abonnés ; accroître la visibilité internationale
et la crédibilité institutionnelle de la FEGESPORT.
RÈGLE ABSOLUE : tu raisonnes UNIQUEMENT à partir des données fournies. Tu n'inventes
ni chiffres, ni noms, ni contacts. Pour les estimations, tu restes prudent et tu
indiques qu'il s'agit d'estimations. Réponds STRICTEMENT en JSON.`;

// deno-lint-ignore no-explicit-any
type Supa = ReturnType<typeof getServiceClient>;

async function gatherPerformanceData(supabase: Supa, days: number) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const [articles, posts, campaigns, events, kpi] = await Promise.all([
    supabase.from('generated_articles').select('title, content_type, status, keywords, word_count, published_at').gte('created_at', since),
    supabase.from('social_posts').select('platform, status, hashtags, published_at').gte('created_at', since),
    supabase.from('newsletter_campaigns').select('subject, campaign_type, recipients_count, opens_count, clicks_count, sent_at, status').gte('created_at', since),
    supabase.from('media_events').select('title, category, status, growth_objectives, ai_keywords, event_date').gte('created_at', since),
    supabase.from('media_kpi_daily').select('*').limit(days),
  ]);
  return {
    articles: articles.data ?? [],
    posts: posts.data ?? [],
    campaigns: campaigns.data ?? [],
    events: events.data ?? [],
    kpi: kpi.data ?? [],
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Méthode non autorisée' }, 405);

  const supabase = getServiceClient();

  try {
    const admin = isCronCall(req) ? { id: null as string | null, email: 'cron' } : await requireAdmin(req, supabase);
    if (!admin) return jsonResponse({ error: 'Accès réservé aux administrateurs' }, 401);
    if (!(await checkAiQuota(supabase))) {
      return jsonResponse({ error: 'Quota IA journalier atteint.' }, 429);
    }

    const body = await req.json().catch(() => ({}));
    const action: string = body.action;

    // ============================================================
    // AGENT 10 — COMMUNITY GROWTH MANAGER
    // ============================================================
    if (action === 'insights') {
      const days = Number(body.period_days ?? 30);
      const data = await gatherPerformanceData(supabase, days);
      const prompt = `Données de performance des ${days} derniers jours :
ARTICLES (${data.articles.length}) : ${JSON.stringify(data.articles).slice(0, 4000)}
POSTS SOCIAUX (${data.posts.length}) : ${JSON.stringify(data.posts).slice(0, 3000)}
CAMPAGNES NEWSLETTER : ${JSON.stringify(data.campaigns).slice(0, 2000)}
ÉVÉNEMENTS : ${JSON.stringify(data.events).slice(0, 3000)}
KPI JOURNALIERS : ${JSON.stringify(data.kpi).slice(0, 3000)}

Analyse : quels sujets, formats, canaux et créneaux performent le mieux ?
PRODUIS ce JSON :
{
  "top_contents": [{"title": "...", "channel": "...", "why": "..."}],
  "top_topics": ["max 10 sujets"],
  "top_hashtags": ["max 10 hashtags"],
  "top_channels": [{"channel": "...", "verdict": "..."}],
  "best_times": [{"slot": "ex: mardi 18h-20h", "rationale": "..."}],
  "recommendations": [{"recommendation": "...", "rationale": "...", "objective": "recruit_players|recruit_clubs|recruit_partners|recruit_sponsors|recruit_journalists|recruit_volunteers|grow_newsletter|international_visibility|institutional_credibility"}]
}
Si les données sont insuffisantes pour un point, renvoie une liste vide pour ce point — n'invente rien.`;

      const { text, usage } = await callClaude(GROWTH_SYSTEM, prompt, 6000);
      const parsed = parseModelJson<Record<string, unknown>>(text);
      const periodEnd = new Date().toISOString().slice(0, 10);
      const periodStart = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
      const { data: inserted, error } = await supabase.from('growth_insights').insert({
        period_start: periodStart,
        period_end: periodEnd,
        top_contents: parsed.top_contents ?? [],
        top_topics: parsed.top_topics ?? [],
        top_hashtags: parsed.top_hashtags ?? [],
        top_channels: parsed.top_channels ?? [],
        best_times: parsed.best_times ?? [],
        recommendations: parsed.recommendations ?? [],
        ai_analysis: parsed,
        model: CLAUDE_MODEL,
      }).select().single();
      if (error) throw error;
      await logAiUsage(supabase, { function_name: 'media-growth:insights', model: CLAUDE_MODEL, ...usage });
      return jsonResponse({ success: true, insight: inserted });
    }

    // ============================================================
    // AGENT 11 — PARTNERSHIP INTELLIGENCE
    // ============================================================
    if (action === 'prospects') {
      const { data: news } = await supabase
        .from('collected_news')
        .select('title, summary, ai_category, news_sources(organization)')
        .in('status', ['flagged', 'analyzed'])
        .order('collected_at', { ascending: false })
        .limit(40);
      const { data: existing } = await supabase.from('prospects').select('name');
      const existingNames = (existing ?? []).map((p) => p.name);

      const prompt = `Contexte : la FEGESPORT cherche des partenaires et sponsors en Guinée et en Afrique de l'Ouest.
Secteurs cibles : marques gaming, opérateurs télécom, banques, assurances, équipementiers, constructeurs PC, éditeurs de jeux.
Marché guinéen connu : opérateurs télécom (Orange Guinée, MTN Guinée, Cellcom), banques (Ecobank, SGBG, BICIGUI, VistaBank, UBA),
boissons/énergie, équipement sportif, et acteurs panafricains de l'esport.

VEILLE RÉCENTE (signaux de marché) :
${JSON.stringify(news ?? []).slice(0, 5000)}

PROSPECTS DÉJÀ EN BASE (ne pas dupliquer) : ${existingNames.join(', ') || 'aucun'}

Identifie jusqu'à 8 prospects pertinents (entreprises réelles et notoires uniquement — si tu n'es pas certain
qu'une entreprise existe, ne la propose pas). PRODUIS ce JSON :
{
  "prospects": [
    {
      "name": "nom exact de l'entreprise",
      "sector": "gaming|telecom|bank|insurance|equipment|pc_hardware|game_publisher|media|institution|other",
      "country": "...",
      "website": "URL officielle si connue avec certitude, sinon null",
      "contact_reasons": ["raisons concrètes de contact"],
      "opportunities": ["opportunités de partenariat précises avec la FEGESPORT"],
      "compatibility_score": 0-100,
      "rationale": "justification du score"
    }
  ]
}`;

      const { text, usage } = await callClaude(GROWTH_SYSTEM, prompt, 5000);
      const parsed = parseModelJson<{ prospects: Array<Record<string, unknown>> }>(text);
      let created = 0;
      for (const p of parsed.prospects ?? []) {
        const { error } = await supabase.from('prospects').insert({
          name: p.name,
          sector: p.sector ?? 'other',
          country: p.country ?? 'Guinée',
          website: p.website ?? null,
          contact_reasons: p.contact_reasons ?? [],
          opportunities: p.opportunities ?? [],
          compatibility_score: Math.min(100, Math.max(0, Number(p.compatibility_score ?? 50))),
          ai_rationale: p.rationale ?? null,
          origin: 'ai',
        });
        if (!error) created += 1; // 23505 = doublon (name, sector) → ignoré
      }
      await logAiUsage(supabase, { function_name: 'media-growth:prospects', model: CLAUDE_MODEL, ...usage });
      return jsonResponse({ success: true, created });
    }

    // ============================================================
    // AGENT 12 — ATHLETE & CLUB DETECTOR
    // ============================================================
    if (action === 'detect') {
      const { data: events } = await supabase
        .from('media_events')
        .select('id, title, extracted_entities, clubs, results, organizer')
        .not('extracted_entities', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      let upserts = 0;
      for (const event of events ?? []) {
        const entities = (event.extracted_entities ?? {}) as Record<string, string[]>;
        const candidates: Array<{ type: string; name: string }> = [
          ...(entities.players ?? []).map((name) => ({ type: 'player', name })),
          ...((entities.clubs ?? []).concat(Array.isArray(event.clubs) ? event.clubs : [])).map((name) => ({ type: 'club', name })),
          ...(entities.partners ?? []).map((name) => ({ type: 'organizer', name })),
        ];
        for (const c of candidates) {
          const name = String(c.name).trim();
          if (!name || name.length < 2) continue;
          const { data: existing } = await supabase
            .from('ecosystem_profiles').select('id, mentions_count, activity_score, source_refs')
            .eq('profile_type', c.type).eq('name', name).maybeSingle();
          const ref = { type: 'media_event', id: event.id, title: event.title };
          if (existing) {
            const refs = Array.isArray(existing.source_refs) ? existing.source_refs : [];
            if (!refs.some((r: { id: string }) => r.id === event.id)) {
              await supabase.from('ecosystem_profiles').update({
                mentions_count: (existing.mentions_count ?? 1) + 1,
                activity_score: (existing.activity_score ?? 0) + 10,
                last_seen_at: new Date().toISOString(),
                source_refs: [...refs, ref].slice(-20),
              }).eq('id', existing.id);
              upserts += 1;
            }
          } else {
            const { error } = await supabase.from('ecosystem_profiles').insert({
              profile_type: c.type,
              name,
              activity_score: 10,
              source_refs: [ref],
              suggested_action: c.type === 'player'
                ? 'Proposer la licence joueur FEGESPORT'
                : c.type === 'club'
                  ? 'Proposer l\'affiliation club FEGESPORT'
                  : 'Évaluer une collaboration (organisation/partenariat)',
            });
            if (!error) upserts += 1;
          }
        }
      }
      return jsonResponse({ success: true, profiles_updated: upserts });
    }

    // ============================================================
    // AGENT 13 — SPONSORSHIP CONTENT GENERATOR
    // ============================================================
    if (action === 'sponsorship') {
      const days = Number(body.period_days ?? 90);
      const eventId: string | null = body.event_id ?? null;
      const data = await gatherPerformanceData(supabase, days);
      const { count: subscribers } = await supabase
        .from('newsletter_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active');
      const { count: membersCount } = await supabase
        .from('members').select('id', { count: 'exact', head: true });

      let eventBlock = '';
      if (eventId) {
        const { data: event } = await supabase.from('media_events').select('*').eq('id', eventId).single();
        if (event) eventBlock = `ÉVÉNEMENT CIBLE : ${JSON.stringify(event).slice(0, 2000)}`;
      }

      const totals = {
        articles: data.articles.filter((a) => a.status === 'published').length,
        social_posts: data.posts.filter((p) => ['ready', 'published'].includes(p.status as string)).length,
        newsletters: data.campaigns.filter((c) => c.status === 'sent').length,
        recipients: data.campaigns.reduce((s, c) => s + (Number(c.recipients_count) || 0), 0),
        opens: data.campaigns.reduce((s, c) => s + (Number(c.opens_count) || 0), 0),
        clicks: data.campaigns.reduce((s, c) => s + (Number(c.clicks_count) || 0), 0),
        subscribers: subscribers ?? 0,
        members: membersCount ?? 0,
      };

      const prompt = `${eventBlock}
MÉTRIQUES RÉELLES des ${days} derniers jours (seules données autorisées) :
${JSON.stringify(totals)}
ÉVÉNEMENTS COUVERTS : ${JSON.stringify(data.events.map((e) => ({ title: e.title, category: e.category, date: e.event_date }))).slice(0, 2000)}

Rédige un argumentaire sponsor professionnel pour la FEGESPORT.
PRODUIS ce JSON :
{
  "title": "titre du dossier",
  "highlights": ["faits marquants tirés UNIQUEMENT des données"],
  "audience_summary": {"reach_estimate": "estimation prudente et qualifiée d'estimation", "channels": ["..."]},
  "media_value_estimate": "fourchette prudente en précisant que c'est une estimation, ou 'données insuffisantes'",
  "content": "argumentaire complet en markdown : la FEGESPORT, son audience (chiffres réels fournis), ses canaux, les formats de visibilité offerts aux sponsors (logo articles, newsletter, posts sociaux, événements), et un appel au contact. AUCUN chiffre inventé."
}`;

      const { text, usage } = await callClaude(GROWTH_SYSTEM, prompt, 6000);
      const parsed = parseModelJson<Record<string, any>>(text);
      const { data: report, error } = await supabase.from('sponsorship_reports').insert({
        title: parsed.title ?? 'Dossier sponsor FEGESPORT',
        event_id: eventId,
        period_start: new Date(Date.now() - days * 86400000).toISOString().slice(0, 10),
        period_end: new Date().toISOString().slice(0, 10),
        audience_metrics: { ...totals, ...(parsed.audience_summary ?? {}) },
        highlights: parsed.highlights ?? [],
        media_value_estimate: parsed.media_value_estimate ?? null,
        content: parsed.content ?? '',
        status: 'draft',
        model: CLAUDE_MODEL,
        created_by: admin.id,
      }).select().single();
      if (error) throw error;
      await logAiUsage(supabase, { function_name: 'media-growth:sponsorship', model: CLAUDE_MODEL, ...usage });
      return jsonResponse({ success: true, report });
    }

    // ============================================================
    // AGENT 14 — INTERNATIONAL RELATIONS MONITOR
    // ============================================================
    if (action === 'opportunities') {
      const INSTITUTIONS = ['IESF', 'ACES', 'GEF', 'WESCO', 'FIFA', 'EWC'];
      const { data: news } = await supabase
        .from('collected_news')
        .select('id, title, summary, raw_excerpt, url, published_at, news_sources(organization)')
        .order('collected_at', { ascending: false })
        .limit(60);
      const institutional = (news ?? []).filter((n) => {
        const org = ((n as Record<string, any>).news_sources?.organization ?? '').toUpperCase();
        return INSTITUTIONS.some((i) => org.includes(i));
      });
      const { data: existingAlerts } = await supabase.from('opportunity_alerts').select('collected_news_id');
      const known = new Set((existingAlerts ?? []).map((a) => a.collected_news_id));
      const fresh = institutional.filter((n) => !known.has(n.id));

      if (!fresh.length) return jsonResponse({ success: true, created: 0, message: 'Aucune nouvelle actualité institutionnelle à analyser.' });

      const prompt = `Actualités d'organisations esport institutionnelles (IESF, ACES, GEF, WESCO, FIFAe, Esports World Cup) :
${JSON.stringify(fresh.map((n) => ({ id: n.id, org: (n as Record<string, any>).news_sources?.organization, title: n.title, summary: n.summary ?? n.raw_excerpt }))).slice(0, 6000)}

Pour CHAQUE actualité qui contient une opportunité concrète pour la FEGESPORT (appel à participation,
subvention, compétition ouverte aux fédérations africaines, coopération, formation), crée une alerte.
Ignore les actualités sans opportunité actionnable.
PRODUIS ce JSON :
{
  "alerts": [
    {
      "collected_news_id": "id fourni",
      "source_org": "IESF|ACES|GEF|WESCO|FIFAe|EWC",
      "title": "titre de l'opportunité",
      "alert_type": "call_for_participation|grant|competition|cooperation|training|other",
      "deadline": "YYYY-MM-DD si mentionnée explicitement, sinon null",
      "priority": "urgent|priority|standard",
      "summary_fr": "résumé + action recommandée pour la FEGESPORT en 2 phrases"
    }
  ]
}`;

      const { text, usage } = await callClaude(GROWTH_SYSTEM, prompt, 4000);
      const parsed = parseModelJson<{ alerts: Array<Record<string, any>> }>(text);
      let created = 0;
      for (const a of parsed.alerts ?? []) {
        const source = fresh.find((n) => n.id === a.collected_news_id);
        const { error } = await supabase.from('opportunity_alerts').insert({
          source_org: a.source_org ?? 'autre',
          title: a.title,
          alert_type: ['call_for_participation', 'grant', 'competition', 'cooperation', 'training'].includes(a.alert_type) ? a.alert_type : 'other',
          url: source?.url ?? null,
          deadline: a.deadline ?? null,
          priority: ['urgent', 'priority'].includes(a.priority) ? a.priority : 'standard',
          ai_summary: a.summary_fr ?? null,
          collected_news_id: a.collected_news_id ?? null,
        });
        if (!error) created += 1;
      }
      await logAiUsage(supabase, { function_name: 'media-growth:opportunities', model: CLAUDE_MODEL, ...usage });
      return jsonResponse({ success: true, created });
    }

    // ============================================================
    // AGENT 15 — REPUTATION MONITOR
    // ============================================================
    if (action === 'reputation') {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const [{ data: news }, { data: published }, { data: campaigns }] = await Promise.all([
        supabase.from('collected_news').select('title, summary, raw_excerpt').gte('collected_at', since).limit(60),
        supabase.from('generated_articles').select('title, published_at').eq('status', 'published').gte('created_at', since),
        supabase.from('newsletter_campaigns').select('recipients_count, opens_count, clicks_count').eq('status', 'sent').gte('created_at', since),
      ]);

      const mentions = (news ?? []).filter((n) =>
        `${n.title} ${n.summary ?? ''} ${n.raw_excerpt ?? ''}`.toLowerCase().match(/fegesport|guin[ée]e/));

      const prompt = `Analyse de réputation FEGESPORT sur 30 jours, à partir des SEULES données disponibles :
MENTIONS (veille contenant FEGESPORT/Guinée) : ${JSON.stringify(mentions).slice(0, 4000)}
ACTIVITÉ ÉDITORIALE : ${published?.length ?? 0} articles publiés, ${campaigns?.length ?? 0} newsletters
ENGAGEMENT NEWSLETTER : ${JSON.stringify(campaigns ?? [])}

PRODUIS ce JSON (sois prudent : peu de données = scores moyens avec réserve explicite) :
{
  "mentions_positive": nombre,
  "mentions_negative": nombre,
  "mentions_neutral": nombre,
  "controversies": [{"topic": "...", "severity": "low|medium|high", "recommendation": "..."}],
  "communication_opportunities": [{"opportunity": "...", "action": "..."}],
  "reputation_score": 0-100,
  "visibility_score": 0-100,
  "trust_score": 0-100,
  "caveats": "limites de l'analyse (sources couvertes, volume de données)"
}`;

      const { text, usage } = await callClaude(GROWTH_SYSTEM, prompt, 4000);
      const parsed = parseModelJson<Record<string, any>>(text);
      const { data: snapshot, error } = await supabase.from('reputation_snapshots').insert({
        mentions_positive: parsed.mentions_positive ?? 0,
        mentions_negative: parsed.mentions_negative ?? 0,
        mentions_neutral: parsed.mentions_neutral ?? 0,
        controversies: parsed.controversies ?? [],
        communication_opportunities: parsed.communication_opportunities ?? [],
        reputation_score: Math.min(100, Math.max(0, Number(parsed.reputation_score ?? 50))),
        visibility_score: Math.min(100, Math.max(0, Number(parsed.visibility_score ?? 50))),
        trust_score: Math.min(100, Math.max(0, Number(parsed.trust_score ?? 50))),
        ai_analysis: parsed,
        model: CLAUDE_MODEL,
      }).select().single();
      if (error) throw error;
      await logAiUsage(supabase, { function_name: 'media-growth:reputation', model: CLAUDE_MODEL, ...usage });
      return jsonResponse({ success: true, snapshot });
    }

    return jsonResponse({ error: `action inconnue : ${action}` }, 400);
  } catch (error) {
    console.error('media-growth error:', error);
    return jsonResponse({ error: `Agent croissance en échec : ${String(error).slice(0, 300)}` }, 500);
  }
});
