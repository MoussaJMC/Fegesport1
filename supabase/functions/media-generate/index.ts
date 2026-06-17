// CENTRE MÉDIA FEGESPORT — Génération IA
// Agents : Collecteur (intake), Analyseur (résumé/mots-clés/SEO),
//          Rédacteur (6 versions), Éditeur (contrôle qualité)
//
// POST { event_id, targets?: ContentTarget[], instructions?: string }
//   targets absent → génération complète (analyse + 6 contenus)
//   targets présent → régénération ciblée (ex: ["facebook"]) avec consignes optionnelles
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import {
  corsHeaders,
  jsonResponse,
  getServiceClient,
  requireAdmin,
  callClaude,
  parseModelJson,
  logAiUsage,
  logPublication,
  checkAiQuota,
  slugify,
  CLAUDE_MODEL,
} from '../_shared/mediaCenter.ts';

type ContentTarget =
  | 'press_article' | 'short_news' | 'web_seo' | 'newsletter'
  | 'facebook' | 'linkedin' | 'twitter' | 'instagram' | 'whatsapp' | 'telegram';

const ALL_TARGETS: ContentTarget[] = [
  'press_article', 'short_news', 'web_seo', 'newsletter',
  'facebook', 'linkedin', 'twitter', 'instagram', 'whatsapp', 'telegram',
];
const ARTICLE_TYPES = new Set(['press_article', 'short_news', 'web_seo', 'newsletter']);
const SOCIAL_PLATFORMS = new Set(['facebook', 'linkedin', 'twitter', 'instagram', 'whatsapp', 'telegram']);
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://fegesport224.org';
const PROMPT_VERSION = 'v2';

// ------------------------------------------------------------------
// Prompts — protection contre les hallucinations : l'IA ne doit JAMAIS
// inventer de faits, noms, chiffres ou citations absents des données.
// ------------------------------------------------------------------
const SYSTEM_PROMPT = `Tu es le rédacteur officiel du Centre Média de la FEGESPORT (Fédération Guinéenne d'Esport).
Tu écris en français professionnel, dans un style journalistique sobre et factuel.

RÈGLES ABSOLUES (anti-hallucination) :
1. Utilise UNIQUEMENT les faits fournis dans les données de l'événement. N'invente JAMAIS de noms, scores, chiffres, citations, déclarations ou détails.
2. Si une information manque (ex: résultats non fournis), n'en parle pas — ne la déduis pas.
3. Aucune promesse ni annonce non fournie (dates futures, partenariats, dotations).
4. Toute citation directe est interdite sauf si elle figure mot pour mot dans les données.
5. Réponds STRICTEMENT au format JSON demandé, sans texte avant ni après.`;

function eventFacts(event: Record<string, unknown>, files: Array<Record<string, unknown>>): string {
  const clubs = Array.isArray(event.clubs) ? (event.clubs as string[]).join(', ') : '';
  const results = Array.isArray(event.results) && (event.results as unknown[]).length
    ? JSON.stringify(event.results)
    : 'non communiqués';
  const fileList = files.length
    ? files.map((f) => `- ${f.file_type}: ${f.file_name ?? f.public_url}${f.caption ? ` (légende: ${f.caption})` : ''}`).join('\n')
    : 'aucun';

  return `DONNÉES DE L'ÉVÉNEMENT (seule source de vérité) :
Titre : ${event.title}
Date : ${event.event_date ?? 'non communiquée'}${event.event_time ? ` à ${event.event_time}` : ''}
Lieu : ${event.location ?? 'non communiqué'}
Organisateur : ${event.organizer ?? 'FEGESPORT'}
Catégorie : ${event.category ?? 'non communiquée'}
Nombre de participants : ${event.participants_count ?? 'non communiqué'}
Clubs présents : ${clubs || 'non communiqués'}
Résultats : ${results}
Description fournie par l'administrateur :
${event.description}

Médias joints :
${fileList}`;
}

function articlesPrompt(facts: string, targets: ContentTarget[], instructions?: string): string {
  const parts: string[] = [];
  if (targets.includes('press_article')) {
    parts.push(`"press_article": {
  "title": "titre journalistique",
  "excerpt": "chapeau de 2-3 phrases",
  "content": "article de presse complet en markdown, 600 à 1200 mots, structuré (introduction, corps avec intertitres ##, conclusion), style journalistique professionnel",
  "meta_title": "max 60 caractères",
  "meta_description": "max 155 caractères",
  "keywords": ["5 à 8 mots-clés SEO"]
}`);
  }
  if (targets.includes('short_news')) {
    parts.push(`"short_news": {
  "title": "titre court",
  "content": "actualité de 150 à 300 mots, factuelle et directe",
  "meta_title": "max 60 caractères",
  "meta_description": "max 155 caractères",
  "keywords": ["3 à 5 mots-clés"]
}`);
  }
  if (targets.includes('web_seo')) {
    parts.push(`"web_seo": {
  "title": "titre optimisé SEO contenant le mot-clé principal",
  "excerpt": "chapeau de 2 phrases avec le mot-clé principal",
  "content": "version site web en markdown, 300 à 500 mots, optimisée SEO : mot-clé principal dans le premier paragraphe, intertitres ## descriptifs, phrases courtes, maillage sémantique esport Guinée",
  "meta_title": "max 60 caractères, mot-clé principal en tête",
  "meta_description": "max 155 caractères, incitative",
  "keywords": ["6 à 10 mots-clés SEO longue traîne inclus"]
}`);
  }
  if (targets.includes('newsletter')) {
    parts.push(`"newsletter": {
  "subject": "objet d'email accrocheur mais sobre, max 70 caractères",
  "preheader": "texte d'aperçu, max 100 caractères",
  "html": "newsletter HTML complète : table layout 600px max-width, styles inline uniquement, en-tête FEGESPORT (fond #111827, texte blanc), corps de l'actualité, bouton 'Lire sur le site' vers {{ARTICLE_URL}}, pied de page avec lien {{UNSUBSCRIBE_URL}}"
}`);
  }
  return `${facts}

${instructions ? `CONSIGNES SUPPLÉMENTAIRES DE L'ADMINISTRATEUR : ${instructions}\n` : ''}
PRODUIS ce JSON exactement (uniquement les clés listées) :
{
  "analysis": {
    "summary": "résumé factuel de 3-4 phrases",
    "keywords": ["mots-clés"],
    "categories": ["catégories éditoriales"],
    "seo_tags": ["tags SEO"],
    "entities": {
      "players": ["joueurs explicitement nommés dans les données, sinon []"],
      "clubs": ["clubs explicitement nommés, sinon []"],
      "partners": ["partenaires/sponsors explicitement nommés, sinon []"],
      "scores": ["scores/résultats explicitement fournis, sinon []"],
      "quotes": ["citations mot pour mot présentes dans les données, sinon []"]
    },
    "editorial_priority": "urgent | priority | standard | archive (selon importance, impact Guinée, nouveauté)"
  },
  ${parts.join(',\n  ')}
}`;
}

const SOCIAL_SPECS: Record<string, string> = {
  facebook: '"facebook": { "content": "publication Facebook LONG format, 5-10 phrases, ton fédérateur, storytelling, emojis adaptés", "hashtags": ["3 à 5 hashtags"], "cta": "appel à l\'action clair (ex: Suivez la FEGESPORT…)", "visual_suggestion": "description du visuel idéal à publier" }',
  linkedin: '"linkedin": { "content": "publication LinkedIn institutionnelle et professionnelle, 4-8 phrases, met en avant le développement de l\'esport guinéen, emojis très sobres", "hashtags": ["3 à 5 hashtags"], "cta": "appel à l\'action professionnel", "visual_suggestion": "visuel idéal" }',
  twitter: '"twitter": { "content": "publication X/Twitter de 280 caractères MAXIMUM hashtags inclus, percutante", "hashtags": ["2 à 3 hashtags"], "cta": "CTA très court", "visual_suggestion": "visuel idéal" }',
  instagram: '"instagram": { "content": "légende Instagram, 3-6 phrases, ton visuel et inspirant, emojis bienvenus, saut de lignes", "hashtags": ["8 à 15 hashtags pertinents"], "cta": "CTA engagement (commentez, taguez…)", "visual_suggestion": "description précise du visuel/carrousel idéal" }',
  whatsapp: '"whatsapp": { "content": "message WhatsApp Channel court et direct, 2-4 phrases, *gras WhatsApp* autorisé, 1-2 emojis", "hashtags": [], "cta": "lien ou action simple", "visual_suggestion": "image unique recommandée" }',
  telegram: '"telegram": { "content": "message Telegram informatif, 3-5 phrases, markdown léger autorisé", "hashtags": ["1 à 3 hashtags"], "cta": "action claire", "visual_suggestion": "image recommandée" }',
};

function socialPrompt(facts: string, targets: ContentTarget[], instructions?: string): string {
  const parts = targets.filter((t) => SOCIAL_SPECS[t]).map((t) => SOCIAL_SPECS[t]);
  return `${facts}

${instructions ? `CONSIGNES SUPPLÉMENTAIRES DE L'ADMINISTRATEUR : ${instructions}\n` : ''}
PRODUIS ce JSON exactement :
{
  ${parts.join(',\n  ')}
}`;
}

const FACT_CHECKER_SYSTEM = `Tu es le Fact Checker du Centre Média FEGESPORT (Agent 5).
Ta mission : empêcher toute hallucination. INTERDICTIONS absolues dans un article :
scores inventés, citations inventées, noms inventés, partenaires inventés, résultats inventés.
Tu compares CHAQUE affirmation de l'article aux données sources fournies.
Tu contrôles aussi qualité, orthographe et cohérence.
Réponds STRICTEMENT en JSON.`;

function factCheckerPrompt(facts: string, articleTitle: string, articleContent: string): string {
  return `${facts}

ARTICLE À VÉRIFIER :
Titre : ${articleTitle}

${articleContent}

PRODUIS ce JSON :
{
  "confidence": 0-100 (100 = toutes les affirmations sont tracées aux données sources),
  "quality_score": 0-100,
  "spelling_ok": true/false,
  "coherence_ok": true/false,
  "hallucination_risk": "none" | "low" | "high",
  "checked_facts": [
    { "claim": "affirmation vérifiée", "source": "données événement | non trouvée", "confidence": 0-100, "date": "date de la donnée si connue, sinon null" }
  ],
  "issues": ["problèmes détectés (faits non sourcés, fautes, incohérences), vide si aucun"],
  "corrected_content": "l'article corrigé en markdown SI des corrections sont nécessaires (faits non sourcés RETIRÉS, fautes corrigées), sinon null"
}`;
}

// ------------------------------------------------------------------

function buildSchemaOrg(article: { title: string; excerpt?: string; slug: string; meta_description?: string; keywords?: string[] }, event: Record<string, unknown>, imageUrl?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.meta_description ?? article.excerpt ?? '',
    image: imageUrl ? [imageUrl] : [],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: { '@type': 'Organization', name: 'FEGESPORT', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'FEGESPORT — Fédération Guinéenne d\'Esport',
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/news/${article.slug}`,
    keywords: (article.keywords ?? []).join(', '),
    about: event.title,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Méthode non autorisée' }, 405);

  const supabase = getServiceClient();
  let eventId: string | null = null;
  let totalIn = 0;
  let totalOut = 0;

  try {
    const admin = await requireAdmin(req, supabase);
    if (!admin) return jsonResponse({ error: 'Accès réservé aux administrateurs' }, 401);

    const body = await req.json();
    eventId = body.event_id as string;
    const targets: ContentTarget[] = Array.isArray(body.targets) && body.targets.length
      ? body.targets.filter((t: string) => ALL_TARGETS.includes(t as ContentTarget))
      : ALL_TARGETS;
    const instructions: string | undefined = body.instructions;
    if (!eventId) return jsonResponse({ error: 'event_id requis' }, 400);

    // Quota API journalier
    if (!(await checkAiQuota(supabase))) {
      return jsonResponse({ error: 'Quota IA journalier atteint. Réessayez demain ou augmentez media_ai_daily_quota.' }, 429);
    }

    // Récupération de l'événement et de ses médias
    const { data: event, error: eventError } = await supabase
      .from('media_events').select('*').eq('id', eventId).single();
    if (eventError || !event) return jsonResponse({ error: 'Événement introuvable' }, 404);

    const { data: files } = await supabase
      .from('media_event_files').select('*').eq('event_id', eventId).order('sort_order');

    await supabase.from('media_events').update({ status: 'generating' }).eq('id', eventId);

    const facts = eventFacts(event, files ?? []);
    const articleTargets = targets.filter((t) => ARTICLE_TYPES.has(t));
    const socialTargets = targets.filter((t) => SOCIAL_PLATFORMS.has(t));
    const coverImage = (files ?? []).find((f) => f.file_type === 'photo' || f.file_type === 'poster')?.public_url as string | undefined;

    const generated: Record<string, unknown> = {};

    // --- Appel 1 : Analyseur + Rédacteur (contenus longs) ---
    let analysis: { summary?: string; keywords?: string[]; categories?: string[]; seo_tags?: string[] } = {};
    if (articleTargets.length) {
      const { text, usage } = await callClaude(SYSTEM_PROMPT, articlesPrompt(facts, articleTargets, instructions), 12000);
      totalIn += usage.input_tokens; totalOut += usage.output_tokens;
      const parsed = parseModelJson<Record<string, any>>(text);
      analysis = parsed.analysis ?? {};

      for (const type of articleTargets) {
        const item = parsed[type];
        if (!item) continue;

        const title = type === 'newsletter' ? (item.subject ?? event.title) : item.title;
        let content = type === 'newsletter' ? item.html : item.content;
        let factCheck: Record<string, any> | null = null;

        // --- Agent 5 Fact Checker : score de confiance sur les contenus longs ---
        if (type === 'press_article' || type === 'web_seo') {
          try {
            const checkRes = await callClaude(FACT_CHECKER_SYSTEM, factCheckerPrompt(facts, title, content), 8000);
            totalIn += checkRes.usage.input_tokens; totalOut += checkRes.usage.output_tokens;
            factCheck = parseModelJson<Record<string, any>>(checkRes.text);
            if (factCheck.corrected_content && typeof factCheck.corrected_content === 'string' && factCheck.corrected_content.length > 100) {
              content = factCheck.corrected_content;
            }
          } catch (e) {
            console.error('Fact-check échoué (contenu conservé, relecture obligatoire):', e);
            factCheck = { confidence: 0, issues: ['Fact-check indisponible — relecture manuelle requise'] };
          }
        }
        const confidence: number | null = factCheck ? Math.min(100, Math.max(0, Number(factCheck.confidence ?? 0))) : null;

        const slug = slugify(title);
        const row = {
          event_id: eventId,
          content_type: type,
          title,
          excerpt: item.excerpt ?? item.preheader ?? null,
          content,
          word_count: typeof content === 'string' ? content.split(/\s+/).length : null,
          slug,
          meta_title: item.meta_title ?? title,
          meta_description: item.meta_description ?? item.preheader ?? null,
          keywords: item.keywords ?? analysis.keywords ?? [],
          og_title: item.meta_title ?? title,
          og_description: item.meta_description ?? null,
          og_image: coverImage ?? null,
          schema_org: type !== 'newsletter' ? buildSchemaOrg({ title, excerpt: item.excerpt, slug, meta_description: item.meta_description, keywords: item.keywords }, event, coverImage) : null,
          status: 'pending_review',
          model: CLAUDE_MODEL,
          prompt_version: PROMPT_VERSION,
          editor_check: factCheck,
          fact_check: factCheck,
          fact_check_score: confidence,
          // Score < 70 → RELECTURE OBLIGATOIRE avant approbation
          needs_mandatory_review: confidence !== null && confidence < 70,
        };

        // Régénération : on remplace la version en attente existante du même type
        const { data: existing } = await supabase
          .from('generated_articles').select('id, generation_count')
          .eq('event_id', eventId).eq('content_type', type)
          .in('status', ['pending_review', 'rejected'])
          .maybeSingle();

        if (existing) {
          const { data: updated } = await supabase
            .from('generated_articles')
            .update({ ...row, generation_count: (existing.generation_count ?? 1) + 1, rejection_reason: null, reviewed_by: null, reviewed_at: null })
            .eq('id', existing.id).select().single();
          generated[type] = updated;
        } else {
          const { data: inserted } = await supabase
            .from('generated_articles').insert(row).select().single();
          generated[type] = inserted;
        }
      }
    }

    // --- Appel 2 : Rédacteur (réseaux sociaux) ---
    if (socialTargets.length) {
      const { text, usage } = await callClaude(SYSTEM_PROMPT, socialPrompt(facts, socialTargets, instructions), 4000);
      totalIn += usage.input_tokens; totalOut += usage.output_tokens;
      const parsed = parseModelJson<Record<string, any>>(text);

      for (const platform of socialTargets) {
        const item = parsed[platform];
        if (!item) continue;
        const row = {
          event_id: eventId,
          platform,
          content: item.content,
          hashtags: item.hashtags ?? [],
          cta: item.cta ?? null,
          visual_suggestion: item.visual_suggestion ?? null,
          suggested_image_url: coverImage ?? null,
          status: 'pending_review',
          model: CLAUDE_MODEL,
        };
        const { data: existing } = await supabase
          .from('social_posts').select('id, generation_count')
          .eq('event_id', eventId).eq('platform', platform)
          .in('status', ['pending_review', 'rejected'])
          .maybeSingle();

        if (existing) {
          const { data: updated } = await supabase
            .from('social_posts')
            .update({ ...row, generation_count: (existing.generation_count ?? 1) + 1, rejection_reason: null, reviewed_by: null, reviewed_at: null })
            .eq('id', existing.id).select().single();
          generated[platform] = updated;
        } else {
          const { data: inserted } = await supabase
            .from('social_posts').insert(row).select().single();
          generated[platform] = inserted;
        }
      }
    }

    // --- Mise à jour de l'événement avec l'analyse (Agents 2 & 3) ---
    const eventUpdate: Record<string, unknown> = { status: 'in_review' };
    if (analysis.summary) {
      eventUpdate.ai_summary = analysis.summary;
      eventUpdate.ai_keywords = analysis.keywords ?? [];
      eventUpdate.ai_categories = analysis.categories ?? [];
      eventUpdate.ai_seo_tags = analysis.seo_tags ?? [];
      eventUpdate.ai_analyzed_at = new Date().toISOString();
      const a = analysis as Record<string, unknown>;
      if (a.entities) eventUpdate.extracted_entities = a.entities;
      if (typeof a.editorial_priority === 'string' &&
          ['urgent', 'priority', 'standard', 'archive'].includes(a.editorial_priority)) {
        eventUpdate.editorial_priority = a.editorial_priority;
      }
    }
    await supabase.from('media_events').update(eventUpdate).eq('id', eventId);

    await logAiUsage(supabase, {
      function_name: 'media-generate',
      model: CLAUDE_MODEL,
      input_tokens: totalIn,
      output_tokens: totalOut,
      event_id: eventId,
    });
    await logPublication(supabase, {
      entity_type: 'media_event',
      entity_id: eventId,
      action: targets.length === ALL_TARGETS.length ? 'generated' : 'regenerated',
      performed_by: admin.id,
      performed_by_email: admin.email,
      details: { targets, model: CLAUDE_MODEL, input_tokens: totalIn, output_tokens: totalOut },
    });

    return jsonResponse({ success: true, analysis, generated, usage: { input_tokens: totalIn, output_tokens: totalOut } });
  } catch (error) {
    console.error('media-generate error:', error);
    if (eventId) {
      await supabase.from('media_events').update({ status: 'in_review' }).eq('id', eventId);
      await logAiUsage(supabase, {
        function_name: 'media-generate',
        model: CLAUDE_MODEL,
        input_tokens: totalIn,
        output_tokens: totalOut,
        event_id: eventId,
        success: false,
        error_message: String(error).slice(0, 500),
      });
    }
    return jsonResponse({ error: `Génération échouée : ${String(error).slice(0, 300)}` }, 500);
  }
});
