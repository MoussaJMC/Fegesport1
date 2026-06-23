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
// FEGESPORT Editorial Guardrails
// These rules prevent unsupported claims, exaggerated wording, and generic administrative writing.
// They must apply to all generated articles, newsletters and social posts.
const FEGESPORT_EDITORIAL_RULES = `
## Règles éditoriales FEGESPORT
- Écrire comme un journaliste esport professionnel.
- Ne pas rédiger comme un rapport administratif.
- Ton institutionnel, mais vivant, humain et dynamique.
- Mettre en avant les joueurs, les équipes, les clubs et la représentation de la Guinée.
- Valoriser les performances sans exagération.
- Donner envie au lecteur de suivre les prochaines activités de la FEGESPORT.
- Utiliser uniquement les informations fournies par la source.
- Ne jamais inventer de scores.
- Ne jamais inventer d'adversaires.
- Ne jamais inventer de statistiques.
- Ne jamais inventer de citations.
- Ne jamais supposer les conditions techniques de jeu (ping, lag, serveur difficile, problèmes de connexion), sauf si explicitement fournies.
- Ne jamais attribuer une performance individuelle à un joueur si elle n'est pas documentée.
- Les rôles esport (EXP Laner, Jungler, Gold Laner, Mid Laner, Roamer…) peuvent être expliqués brièvement, mais sans inventer ce que le joueur a fait dans le match.
- Éviter les mots : historique, exploit, exceptionnel, domination, héroïque, majeur — sauf si la source démontre clairement ces qualificatifs.
- Préférer les formulations sobres : progression, parcours prometteur, étape importante, participation encourageante, expérience internationale, visibilité continentale.
- Pour les compétitions africaines, mettre en avant la progression de l'esport guinéen sans déclarer une supériorité non prouvée.
- En cas de contradiction entre deux informations, signaler l'incohérence et privilégier la donnée structurée.
- En cas d'information manquante, ne pas la deviner.`;

const SYSTEM_PROMPT = `Tu es le rédacteur officiel du Centre Média de la FEGESPORT (Fédération Guinéenne d'Esport).
Tu écris en français professionnel, dans un style journalistique sobre et factuel.

RÈGLES ABSOLUES (anti-hallucination) :
1. Utilise UNIQUEMENT les faits fournis dans les données de l'événement. N'invente JAMAIS de noms, scores, chiffres, citations, déclarations ou détails.
2. Si une information manque (ex: résultats non fournis), n'en parle pas — ne la déduis pas.
3. Aucune promesse ni annonce non fournie (dates futures, partenariats, dotations).
4. Toute citation directe est interdite sauf si elle figure mot pour mot dans les données.
5. Réponds STRICTEMENT au format JSON demandé, sans texte avant ni après.
${FEGESPORT_EDITORIAL_RULES}`;

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

// Consignes de style pour l'article de presse — fournies en PROSE (hors gabarit JSON)
// pour ne PAS corrompre le JSON que le modèle doit produire.
const PRESS_ARTICLE_STYLE = `STYLE ARTICLE ESPORT (pour le champ press_article.content) :
- Commencer par un angle journalistique fort.
- Présenter rapidement l'équipe, le pays représenté et la compétition.
- Mentionner les joueurs dès le début lorsque leurs noms sont disponibles.
- Structurer l'article avec des sous-titres clairs (intertitres ##).
- Ajouter une section "## Composition de l'équipe" UNIQUEMENT si une composition est fournie.
- Expliquer l'importance du résultat sans l'exagérer.
- Conclure sur les perspectives futures pour la discipline en Guinée.
- Éviter les phrases de remplissage et les répétitions.
- Ne PAS transformer un test, un brouillon ou une information interne en fait public.

OUVERTURE DES ARTICLES ESPORT — s'applique UNIQUEMENT aux contenus esport compétitifs (compétition, tournoi, championnat, participation internationale) :
- Commencer l'article par le résultat sportif, l'enjeu compétitif ou le parcours réalisé.
- Faire apparaître rapidement l'équipe, les joueurs ou la sélection concernée.
- Mettre en avant l'impact pour l'esport guinéen et créer immédiatement l'intérêt du lecteur.
- ÉVITER les ouvertures encyclopédiques (ex: "L'événement ... a accueilli", "La compétition ... est organisée par", "Le tournoi ... est une compétition").
- PRIVILÉGIER une ouverture centrée sur : l'équipe, les joueurs, le parcours, la qualification, la participation internationale, la progression de l'esport guinéen.
- Exemple de ton recherché : Face à des équipes venues de plusieurs pays africains, la sélection a porté les couleurs de la Guinée jusqu'aux phases finales — une campagne qui confirme la progression continue de l'esport guinéen.
- Si le contenu n'est PAS une compétition esport (formation, communiqué institutionnel), conserver une ouverture journalistique classique sans appliquer cette règle d'ouverture compétitive.`;

// FEGESPORT Perspective — couche stratégique (UNIQUEMENT pour les articles issus de la veille).
// Transforme une actu internationale en levier de positionnement + recrutement, SANS perdre
// la crédibilité journalistique (règle d'or 70-80% info factuelle / 20-30% perspective FEGESPORT).
const FEGESPORT_PERSPECTIVE_LAYER = `
COUCHE « FEGESPORT PERSPECTIVE » (à intégrer À LA FIN du champ content, APRÈS le corps journalistique) :
Règle d'or : 70 à 80% du texte = information factuelle/journalistique ; 20 à 30% MAXIMUM = perspective FEGESPORT.
Ordre imposé en fin d'article (markdown, intertitres ##) :
1. "## Et en Guinée ?" — pourquoi l'info compte pour la Guinée, leçons locales, lien avec le développement
   de l'esport guinéen, opportunités pour jeunes/clubs/écoles/universités/institutions.
2. "## La position de la FEGESPORT" — factuel et professionnel, JAMAIS de décision officielle inventée.
   Positionne la FEGESPORT comme acteur du développement (gouvernance, éducation, inclusion jeunesse,
   participation féminine, innovation numérique, détection de talents, coopération internationale).
   RÈGLE STRICTE (anti-engagement fictif) : ne JAMAIS présenter comme une décision officielle, un programme
   existant ou un engagement institutionnel ce qui n'a pas été explicitement validé dans les données source.
   Formulations PRUDENTES autorisées : « la FEGESPORT considère que… », « la FEGESPORT suit avec intérêt… »,
   « cette initiative pourrait inspirer… », « cette expérience constitue une piste de réflexion… ».
   Formulations INTERDITES (sauf si présentes explicitement dans les données) : « la FEGESPORT lancera… »,
   « la FEGESPORT mettra en place… », « la FEGESPORT a décidé… », « la FEGESPORT prévoit… ».
3. "## Opportunités pour la Guinée" — UNIQUEMENT si sujet à forte valeur (esport scolaire/universitaire,
   fédérations nationales, partenariats internationaux, intégrité, développement de la jeunesse) :
   liste d'opportunités concrètes.
4. CTA de recrutement contextuel (titre ## court) aligné sur "recruitment_objective", avec contact
   contact@fegesport224.org / fegesport224.org.
Sujets légers (résultats de matchs, transferts, patchs) : se limiter à "## Et en Guinée ?" + un CTA discret.
La position FEGESPORT et les opportunités restent prudentes et non inventées (respect des règles anti-hallucination).`;

const PERSPECTIVE_ANALYSIS_FIELDS = `,
    "fegesport_category": "Governance|Education|Esports School Programs|University Esports|Youth Development|Women in Esports|International Cooperation|Competition|Technology|Inclusion|Digital Innovation",
    "recruitment_objective": "recruit_clubs|recruit_volunteers|recruit_schools|recruit_universities|recruit_players|recruit_partners|recruit_sponsors (le plus pertinent)",
    "strategic_scores": { "impact": 0-100, "recruitment": 0-100, "volunteer_recruitment": 0-100, "institutional": 0-100, "media_visibility": 0-100, "partnership": 0-100 }`;

function articlesPrompt(facts: string, targets: ContentTarget[], instructions?: string, perspective = false): string {
  const parts: string[] = [];
  if (targets.includes('press_article')) {
    parts.push(`"press_article": {
  "title": "titre journalistique avec un angle fort",
  "excerpt": "chapeau de 2-3 phrases",
  "content": "article de presse complet en markdown, 600 à 1200 mots, en respectant le STYLE ARTICLE ESPORT décrit plus haut",
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
  "subject": "objet COURT et clair, max 70 caractères, sans exagération",
  "preheader": "texte d'aperçu NON VIDE, max 100 caractères",
  "html": "newsletter HTML responsive : table layout 600px max-width, styles inline uniquement, en-tête FEGESPORT (fond #111827, texte blanc). Structure imposée : 1) introduction humaine et chaleureuse ; 2) résumé en 3 points MAXIMUM (liste) ; 3) bouton 'Lire l'article' vers {{ARTICLE_URL}} ; 4) pied de page avec lien de désabonnement {{UNSUBSCRIBE_URL}}. Ne pas exagérer les résultats. Ne pas annoncer comme historique ce qui n'est pas démontré."
}`);
  }
  return `${facts}

${targets.includes('press_article') ? `${PRESS_ARTICLE_STYLE}\n\n` : ''}${perspective ? `${FEGESPORT_PERSPECTIVE_LAYER}\n\n` : ''}${instructions ? `CONSIGNES SUPPLÉMENTAIRES DE L'ADMINISTRATEUR : ${instructions}\n` : ''}
PRODUIS ce JSON exactement (uniquement les clés listées). IMPORTANT : retourne UNIQUEMENT du JSON valide, sans commentaire, sans texte hors JSON :
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
    "editorial_priority": "urgent | priority | standard | archive (selon importance, impact Guinée, nouveauté)"${perspective ? PERSPECTIVE_ANALYSIS_FIELDS : ''}
  },
  ${parts.join(',\n  ')}
}`;
}

// Spécifications par canal — limites strictes de longueur / hashtags / ton (règles éditoriales FEGESPORT).
const SOCIAL_SPECS: Record<string, string> = {
  facebook: '"facebook": { "content": "publication Facebook, ton communautaire, valorise l\'équipe et les joueurs, storytelling sobre sans exagération", "hashtags": ["5 hashtags MAXIMUM"], "cta": "appel à l\'action clair (ex: Suivez la FEGESPORT…)", "visual_suggestion": "description du visuel idéal" }',
  linkedin: '"linkedin": { "content": "publication LinkedIn, ton institutionnel, met en avant la structuration, la progression et la visibilité de l\'écosystème esport guinéen, emojis très sobres", "hashtags": ["3 à 5 hashtags"], "cta": "appel à l\'action professionnel", "visual_suggestion": "visuel idéal" }',
  twitter: '"twitter": { "content": "publication X/Twitter, 240 caractères MAXIMUM hashtags inclus, message direct", "hashtags": ["2 hashtags MAXIMUM"], "cta": "CTA très court", "visual_suggestion": "visuel idéal" }',
  instagram: '"instagram": { "content": "légende Instagram, ton visuel et inspirant, emojis bienvenus, sauts de ligne, sans exagération", "hashtags": ["8 à 15 hashtags pertinents"], "cta": "CTA engagement (commentez, taguez…)", "visual_suggestion": "description précise du visuel/carrousel idéal" }',
  whatsapp: '"whatsapp": { "content": "message WhatsApp Channel TRÈS COURT, 80 à 180 caractères, ton chaleureux, pas de jargon technique, 1 à 2 emojis maximum", "hashtags": [], "cta": "CTA simple", "visual_suggestion": "image unique recommandée" }',
  telegram: '"telegram": { "content": "message Telegram, 150 à 250 caractères, ton direct, pas de long paragraphe, 1 à 3 emojis maximum", "hashtags": ["2 à 4 hashtags maximum"], "cta": "action claire", "visual_suggestion": "image recommandée" }',
};

const SOCIAL_PERSPECTIVE = `
PERSPECTIVE FEGESPORT (obligatoire pour chaque post — ne JAMAIS faire un simple résumé d'actu internationale) :
- une perspective LOCALE (ce que ça signifie pour la Guinée) ;
- une perspective FEGESPORT (la fédération comme actrice du développement de l'esport guinéen) ;
- un appel à l'action de recrutement quand c'est pertinent (clubs, bénévoles, écoles, universités, joueurs…).
Rester factuel et sobre, sans inventer de décision officielle.`;

function socialPrompt(facts: string, targets: ContentTarget[], instructions?: string, perspective = false): string {
  const parts = targets.filter((t) => SOCIAL_SPECS[t]).map((t) => SOCIAL_SPECS[t]);
  return `${facts}

${perspective ? `${SOCIAL_PERSPECTIVE}\n\n` : ''}${instructions ? `CONSIGNES SUPPLÉMENTAIRES DE L'ADMINISTRATEUR : ${instructions}\n` : ''}
PRODUIS ce JSON exactement :
{
  ${parts.join(',\n  ')}
}`;
}

const FACT_CHECKER_SYSTEM = `Tu es le Fact Checker du Centre Média FEGESPORT (Agent 5).
Ta mission : empêcher toute hallucination ET faire respecter la ligne éditoriale FEGESPORT.
Tu compares CHAQUE affirmation de l'article aux données sources fournies.

Tu dois DÉTECTER et SIGNALER :
- toute exagération non sourcée ;
- tout mot trop fort non justifié : historique, exploit, exceptionnel, domination, héroïque, majeur ;
- toute hypothèse sur les conditions techniques de jeu (ping, lag, serveur, connexion) ;
- toute attribution de performance individuelle non sourcée ;
- toute contradiction entre la description libre et les champs structurés ;
- tout score, adversaire, classement ou résultat inventé ;
- toute citation attribuée sans source.

Tu contrôles aussi qualité, orthographe et cohérence. Réponds STRICTEMENT en JSON.`;

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
  "inconsistencies": ["incohérences détectées (contradiction description/champs structurés, etc.), vide si aucune"],
  "claims_to_verify": ["affirmations à vérifier avant publication, vide si aucune"],
  "overused_words": ["mots trop forts non justifiés trouvés (historique, exploit, exceptionnel, domination, héroïque, majeur…), vide si aucun"],
  "editorial_recommendations": ["recommandations éditoriales concrètes, vide si aucune"],
  "issues": ["problèmes détectés (faits non sourcés, fautes, incohérences), vide si aucun"],
  "status": "VALIDABLE | À RÉVISER | RELECTURE OBLIGATOIRE",
  "corrected_content": "l'article corrigé en markdown SI des corrections sont nécessaires (faits non sourcés RETIRÉS, mots exagérés remplacés par des formulations sobres, fautes corrigées), sinon null"
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
    // FEGESPORT Perspective : activé pour les articles issus de la veille (drapeau explicite)
    const perspective: boolean = body.fegesport_perspective === true;
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
    let analysis: { summary?: string; keywords?: string[]; categories?: string[]; seo_tags?: string[];
      fegesport_category?: string; recruitment_objective?: string; strategic_scores?: Record<string, number> } = {};
    if (articleTargets.length) {
      const { text, usage } = await callClaude(SYSTEM_PROMPT, articlesPrompt(facts, articleTargets, instructions, perspective), 12000);
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
          // RELECTURE OBLIGATOIRE si score < 70 OU si le Fact Checker rend ce statut
          needs_mandatory_review:
            (confidence !== null && confidence < 70) ||
            factCheck?.status === 'RELECTURE OBLIGATOIRE',
          // FEGESPORT Perspective (uniquement si activé) — niveau événement, appliqué à chaque article
          ...(perspective ? {
            fegesport_category: analysis.fegesport_category ?? null,
            recruitment_objective: analysis.recruitment_objective ?? null,
            strategic_scores: analysis.strategic_scores ?? null,
            fegesport_impact_score: typeof analysis.strategic_scores?.impact === 'number'
              ? Math.min(100, Math.max(0, analysis.strategic_scores.impact)) : null,
          } : {}),
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
      const { text, usage } = await callClaude(SYSTEM_PROMPT, socialPrompt(facts, socialTargets, instructions, perspective), 4000);
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
