// Service du Centre Média IA FEGESPORT
// Toutes les opérations passent par Supabase (RLS admin) ;
// les appels IA et l'envoi Resend passent par les Edge Functions.
import { supabase } from './supabase';
import type {
  MediaEvent,
  MediaEventFile,
  MediaFileType,
  GeneratedArticle,
  SocialPost,
  NewsletterCampaign,
  NewsSource,
  CollectedNews,
  PublicationLog,
  AiUsageLog,
  GenerationTarget,
  MediaKpiDaily,
  GrowthInsight,
  Prospect,
  EcosystemProfile,
  SponsorshipReport,
  OpportunityAlert,
  ReputationSnapshot,
  ExecutiveKpiMonthly,
} from '../types/mediaCenter';

const BUCKET = 'media-center';

async function invokeFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    // supabase-js masque le corps d'erreur des edge functions : on le récupère si possible
    let message = error.message;
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === 'function') {
        const parsed = await ctx.json();
        if (parsed?.error) message = parsed.error;
      }
    } catch { /* corps illisible, on garde le message générique */ }
    throw new Error(message);
  }
  if (data && typeof data === 'object' && 'error' in data && (data as { error?: string }).error) {
    throw new Error((data as { error: string }).error);
  }
  return data as T;
}

async function logAction(entry: {
  entity_type: string;
  entity_id: string;
  action: string;
  channel?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('publication_logs').insert({
    ...entry,
    performed_by: user?.id ?? null,
    performed_by_email: user?.email ?? null,
  });
}

// ------------------------------------------------------------------
// Événements (Agent 1 — Collecteur)
// ------------------------------------------------------------------

export async function listMediaEvents(status?: string): Promise<MediaEvent[]> {
  let query = supabase.from('media_events').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as MediaEvent[];
}

export async function getMediaEvent(id: string): Promise<MediaEvent> {
  const { data, error } = await supabase.from('media_events').select('*').eq('id', id).single();
  if (error) throw error;
  return data as MediaEvent;
}

export async function saveMediaEvent(
  event: Partial<MediaEvent> & { title: string; description: string },
): Promise<MediaEvent> {
  const { data: { user } } = await supabase.auth.getUser();
  const payload = { ...event, created_by: event.created_by ?? user?.id ?? null };

  if (event.id) {
    const { id, created_by: _cb, created_at: _ca, updated_at: _ua, ...updates } = payload as Record<string, unknown> & { id: string };
    const { data, error } = await supabase.from('media_events').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as MediaEvent;
  }

  const { data, error } = await supabase.from('media_events').insert(payload).select().single();
  if (error) throw error;
  await logAction({ entity_type: 'media_event', entity_id: (data as MediaEvent).id, action: 'created' });
  return data as MediaEvent;
}

export async function deleteMediaEvent(id: string): Promise<void> {
  const { error } = await supabase.from('media_events').delete().eq('id', id);
  if (error) throw error;
}

// ------------------------------------------------------------------
// Médias (photos, affiches, PDF, vidéos)
// ------------------------------------------------------------------

export async function listEventFiles(eventId: string): Promise<MediaEventFile[]> {
  const { data, error } = await supabase
    .from('media_event_files').select('*').eq('event_id', eventId).order('sort_order');
  if (error) throw error;
  return (data ?? []) as MediaEventFile[];
}

export async function uploadEventFile(
  eventId: string,
  file: File,
  fileType: MediaFileType,
  caption?: string,
): Promise<MediaEventFile> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const path = `${eventId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data, error } = await supabase.from('media_event_files').insert({
    event_id: eventId,
    file_type: fileType,
    storage_path: path,
    public_url: publicUrl,
    file_name: file.name,
    file_size: file.size,
    caption: caption ?? null,
  }).select().single();
  if (error) throw error;
  return data as MediaEventFile;
}

export async function deleteEventFile(file: MediaEventFile): Promise<void> {
  await supabase.storage.from(BUCKET).remove([file.storage_path]);
  const { error } = await supabase.from('media_event_files').delete().eq('id', file.id);
  if (error) throw error;
}

// ------------------------------------------------------------------
// Génération IA (Agents 3, 4, 5 — via Edge Function media-generate)
// ------------------------------------------------------------------

export interface GenerationResult {
  success: boolean;
  analysis: { summary?: string; keywords?: string[]; categories?: string[]; seo_tags?: string[] };
  generated: Record<string, GeneratedArticle | SocialPost>;
  usage: { input_tokens: number; output_tokens: number };
}

export async function generateContent(
  eventId: string,
  targets?: GenerationTarget[],
  instructions?: string,
): Promise<GenerationResult> {
  return invokeFunction<GenerationResult>('media-generate', {
    event_id: eventId,
    ...(targets && targets.length ? { targets } : {}),
    ...(instructions ? { instructions } : {}),
  });
}

// ------------------------------------------------------------------
// Contenus générés : lecture, édition, validation humaine (Étape 4)
// ------------------------------------------------------------------

export async function listGeneratedArticles(filters?: { event_id?: string; status?: string }): Promise<GeneratedArticle[]> {
  let query = supabase.from('generated_articles').select('*').order('created_at', { ascending: false });
  if (filters?.event_id) query = query.eq('event_id', filters.event_id);
  if (filters?.status) query = query.eq('status', filters.status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as GeneratedArticle[];
}

export async function listSocialPosts(filters?: { event_id?: string; status?: string }): Promise<SocialPost[]> {
  let query = supabase.from('social_posts').select('*').order('created_at', { ascending: false });
  if (filters?.event_id) query = query.eq('event_id', filters.event_id);
  if (filters?.status) query = query.eq('status', filters.status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as SocialPost[];
}

export async function updateGeneratedArticle(id: string, updates: Partial<GeneratedArticle>): Promise<GeneratedArticle> {
  const { data, error } = await supabase.from('generated_articles').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as GeneratedArticle;
}

export async function updateSocialPost(id: string, updates: Partial<SocialPost>): Promise<SocialPost> {
  const { data, error } = await supabase.from('social_posts').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as SocialPost;
}

async function reviewEntity(
  table: 'generated_articles' | 'social_posts',
  id: string,
  decision: 'approved' | 'rejected',
  reason?: string,
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from(table).update({
    status: decision,
    rejection_reason: decision === 'rejected' ? (reason ?? null) : null,
    reviewed_by: user?.id ?? null,
    reviewed_at: new Date().toISOString(),
  }).eq('id', id);
  if (error) throw error;
  await logAction({
    entity_type: table === 'generated_articles' ? 'generated_article' : 'social_post',
    entity_id: id,
    action: decision,
    details: reason ? { reason } : {},
  });
}

export const approveArticle = (id: string) => reviewEntity('generated_articles', id, 'approved');
export const rejectArticle = (id: string, reason?: string) => reviewEntity('generated_articles', id, 'rejected', reason);
export const approveSocialPost = (id: string) => reviewEntity('social_posts', id, 'approved');
export const rejectSocialPost = (id: string, reason?: string) => reviewEntity('social_posts', id, 'rejected', reason);

// ------------------------------------------------------------------
// Publication (Étape 5)
// ------------------------------------------------------------------

/** Tronque proprement sur une frontière de mot, entre minLen et maxLen. */
function clampExcerpt(text: string, maxLen = 200, minLen = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  const slice = clean.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > minLen ? slice.slice(0, lastSpace) : slice;
  return `${cut.replace(/[.,;:!?\s]+$/, '')}…`;
}

/** Retire le balisage markdown pour dériver un extrait lisible depuis le corps. */
function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')          // blocs de code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')      // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')    // liens → texte
    .replace(/^#{1,6}\s+/gm, '')                // titres
    .replace(/[*_>`~]/g, '')                    // emphase / citations
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Garantit un extrait non vide pour la publication (la fonction SQL
 * create_news_as_admin rejette un excerpt vide).
 * Cascade SANS inventer d'information :
 *   1. excerpt existant → 2. meta_description → 3. début du corps de l'article
 *   → 4. titre + phrase institutionnelle générique (dernier recours).
 */
function buildExcerpt(article: GeneratedArticle): string {
  const excerpt = article.excerpt?.trim();
  if (excerpt) return clampExcerpt(excerpt);

  const meta = article.meta_description?.trim();
  if (meta) return clampExcerpt(meta);

  const body = stripMarkdown(article.content ?? '');
  if (body.length >= 40) return clampExcerpt(body);

  const title = article.title?.trim() || 'Actualité FEGESPORT';
  return clampExcerpt(`${title} — Actualité publiée par la Fédération Guinéenne d'Esport (FEGESPORT).`);
}

/** Publie un article approuvé sur le site via le pipeline news existant. */
export async function publishArticleToSite(article: GeneratedArticle): Promise<string> {
  const { data, error } = await supabase.rpc('create_news_as_admin', {
    p_title: article.title,
    p_excerpt: buildExcerpt(article),
    p_content: article.content,
    p_category: 'esport',
    p_image_url: article.og_image,
    p_published: true,
  });
  if (error) throw error;

  const created = typeof data === 'string' ? JSON.parse(data) : data;
  const newsId: string | undefined = created?.id ?? created?.news?.id;

  if (newsId) {
    // SEO (Agent 6) : slug + métadonnées complètes — Open Graph, Twitter Cards, Schema.org
    await supabase.from('news').update({
      slug: article.slug,
      seo: {
        meta_title: article.meta_title,
        meta_description: article.meta_description,
        keywords: article.keywords,
        og_title: article.og_title,
        og_description: article.og_description,
        og_image: article.og_image,
        twitter_card: {
          card: article.og_image ? 'summary_large_image' : 'summary',
          title: article.og_title ?? article.meta_title ?? article.title,
          description: article.og_description ?? article.meta_description,
          image: article.og_image,
          site: '@fegesport224',
        },
        schema_org: article.schema_org,
      },
    }).eq('id', newsId);

    await supabase.from('generated_articles').update({
      status: 'published',
      published_news_id: newsId,
      published_at: new Date().toISOString(),
    }).eq('id', article.id);

    if (article.event_id) {
      await supabase.from('media_events').update({ status: 'published' }).eq('id', article.event_id);
    }
    await logAction({
      entity_type: 'generated_article', entity_id: article.id,
      action: 'published', channel: 'site', details: { news_id: newsId },
    });
  }
  return newsId ?? '';
}

/** Marque un post social approuvé comme prêt à publier (texte à copier). */
export async function markSocialPostReady(id: string, platform: string): Promise<void> {
  const { error } = await supabase.from('social_posts').update({
    status: 'ready',
    published_at: new Date().toISOString(),
  }).eq('id', id);
  if (error) throw error;
  await logAction({ entity_type: 'social_post', entity_id: id, action: 'published', channel: platform });
}

// ------------------------------------------------------------------
// Newsletters (Resend)
// ------------------------------------------------------------------

export async function listCampaigns(): Promise<NewsletterCampaign[]> {
  const { data, error } = await supabase
    .from('newsletter_campaigns').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as NewsletterCampaign[];
}

export async function createCampaignFromArticle(
  article: GeneratedArticle,
  options?: { campaign_type?: string; target_segments?: string[] },
): Promise<NewsletterCampaign> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('newsletter_campaigns').insert({
    event_id: article.event_id,
    generated_article_id: article.id,
    subject: article.title,
    preheader: article.excerpt?.trim() || buildExcerpt(article),
    html_content: article.content,
    status: 'approved',
    campaign_type: options?.campaign_type ?? 'event',
    target_segments: options?.target_segments ?? ['general'],
    created_by: user?.id ?? null,
  }).select().single();
  if (error) throw error;
  return data as NewsletterCampaign;
}

export async function updateCampaign(
  id: string,
  updates: Partial<Pick<NewsletterCampaign, 'campaign_type' | 'target_segments' | 'subject'>>,
): Promise<void> {
  const { error } = await supabase.from('newsletter_campaigns').update(updates).eq('id', id);
  if (error) throw error;
}

export async function sendCampaign(campaignId: string): Promise<{ success: boolean; sent: number; recipients: number; errors: string[] }> {
  return invokeFunction('newsletter-send', { action: 'send', campaign_id: campaignId });
}

export async function sendCampaignTest(campaignId: string, testEmail: string): Promise<{ success: boolean; message: string }> {
  return invokeFunction('newsletter-send', { action: 'test', campaign_id: campaignId, test_email: testEmail });
}

export async function countActiveSubscribers(): Promise<number> {
  const { count, error } = await supabase
    .from('newsletter_subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');
  if (error) throw error;
  return count ?? 0;
}

/** Répartition des abonnés actifs par segment (Agent 8). */
export async function countSubscribersBySegment(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('newsletter_subscriptions')
    .select('segment')
    .eq('status', 'active');
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const segment = (row as { segment: string | null }).segment ?? 'general';
    counts[segment] = (counts[segment] ?? 0) + 1;
  }
  return counts;
}

// ------------------------------------------------------------------
// Veille mondiale (Agents 2 & 3)
// ------------------------------------------------------------------

export async function listSources(): Promise<NewsSource[]> {
  const { data, error } = await supabase.from('news_sources').select('*').order('name');
  if (error) throw error;
  return (data ?? []) as NewsSource[];
}

export async function saveSource(source: Partial<NewsSource> & { name: string }): Promise<NewsSource> {
  if (source.id) {
    const { id, created_at: _ca, updated_at: _ua, ...updates } = source as Record<string, unknown> & { id: string };
    const { data, error } = await supabase.from('news_sources').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data as NewsSource;
  }
  const { data, error } = await supabase.from('news_sources').insert(source).select().single();
  if (error) throw error;
  return data as NewsSource;
}

export async function deleteSource(id: string): Promise<void> {
  const { error } = await supabase.from('news_sources').delete().eq('id', id);
  if (error) throw error;
}

export async function listCollectedNews(status?: string): Promise<CollectedNews[]> {
  let query = supabase
    .from('collected_news')
    .select('*, news_sources(name, organization)')
    .order('ai_relevance_guinea', { ascending: false, nullsFirst: false })
    .order('collected_at', { ascending: false })
    .limit(200);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CollectedNews[];
}

export async function updateCollectedNewsStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from('collected_news').update({ status }).eq('id', id);
  if (error) throw error;
}

export interface WatchResult {
  success: boolean;
  fetched: number;
  inserted: number;
  analyzed: number;
  sources_ok: number;
  sources_failed: number;
  errors: string[];
}

export async function runWatch(action: 'fetch' | 'analyze' | 'full' = 'full'): Promise<WatchResult> {
  return invokeFunction<WatchResult>('media-watch', { action });
}

// ------------------------------------------------------------------
// Statistiques & audit
// ------------------------------------------------------------------

export async function listPublicationLogs(limit = 100): Promise<PublicationLog[]> {
  const { data, error } = await supabase
    .from('publication_logs').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as PublicationLog[];
}

/** KPI Agent 9 — série journalière des 90 derniers jours (vue media_kpi_daily). */
export async function getKpiDaily(): Promise<MediaKpiDaily[]> {
  const { data, error } = await supabase
    .from('media_kpi_daily')
    .select('*')
    .order('day', { ascending: true });
  if (error) throw error;
  return (data ?? []) as MediaKpiDaily[];
}

/** Agrège la série journalière en périodes jour / semaine / mois. */
export function aggregateKpi(rows: MediaKpiDaily[], period: 'day' | 'week' | 'month'): MediaKpiDaily[] {
  if (period === 'day') return rows;
  const buckets = new Map<string, MediaKpiDaily>();
  for (const row of rows) {
    const d = new Date(row.day);
    let key: string;
    if (period === 'week') {
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      key = monday.toISOString().slice(0, 10);
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    }
    const acc = buckets.get(key) ?? { ...row, day: key, articles_published: 0, social_posts_ready: 0, newsletters_sent: 0, newsletter_recipients: 0, newsletter_opens: 0, newsletter_clicks: 0, news_collected: 0, ai_calls: 0, ai_tokens_in: 0, ai_tokens_out: 0, new_subscribers: 0 };
    acc.articles_published += row.articles_published;
    acc.social_posts_ready += row.social_posts_ready;
    acc.newsletters_sent += row.newsletters_sent;
    acc.newsletter_recipients += row.newsletter_recipients;
    acc.newsletter_opens += row.newsletter_opens;
    acc.newsletter_clicks += row.newsletter_clicks;
    acc.news_collected += row.news_collected;
    acc.ai_calls += row.ai_calls;
    acc.ai_tokens_in += row.ai_tokens_in;
    acc.ai_tokens_out += row.ai_tokens_out;
    acc.new_subscribers += row.new_subscribers;
    buckets.set(key, acc);
  }
  return [...buckets.values()].sort((a, b) => a.day.localeCompare(b.day));
}

export async function listAiUsage(limit = 100): Promise<AiUsageLog[]> {
  const { data, error } = await supabase
    .from('ai_usage_logs').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as AiUsageLog[];
}

// ------------------------------------------------------------------
// V3 — Moteur de croissance (Agents 10-15)
// ------------------------------------------------------------------

type GrowthAction = 'insights' | 'prospects' | 'detect' | 'sponsorship' | 'opportunities' | 'reputation';

export async function runGrowthAgent<T = Record<string, unknown>>(
  action: GrowthAction,
  params: Record<string, unknown> = {},
): Promise<T> {
  return invokeFunction<T>('media-growth', { action, ...params });
}

export async function getExecutiveKpi(): Promise<ExecutiveKpiMonthly[]> {
  const { data, error } = await supabase
    .from('executive_kpi_monthly').select('*').order('month', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ExecutiveKpiMonthly[];
}

export async function getLatestInsight(): Promise<GrowthInsight | null> {
  const { data, error } = await supabase
    .from('growth_insights').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data as GrowthInsight | null;
}

export async function listProspects(): Promise<Prospect[]> {
  const { data, error } = await supabase
    .from('prospects').select('*')
    .order('compatibility_score', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as Prospect[];
}

export async function updateProspectStatus(id: string, status: string, notes?: string): Promise<void> {
  const { error } = await supabase.from('prospects')
    .update({ status, ...(notes !== undefined ? { notes } : {}) }).eq('id', id);
  if (error) throw error;
}

export async function listEcosystemProfiles(): Promise<EcosystemProfile[]> {
  const { data, error } = await supabase
    .from('ecosystem_profiles').select('*')
    .neq('status', 'ignored')
    .order('activity_score', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as EcosystemProfile[];
}

export async function updateProfileStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from('ecosystem_profiles').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function listSponsorshipReports(): Promise<SponsorshipReport[]> {
  const { data, error } = await supabase
    .from('sponsorship_reports').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SponsorshipReport[];
}

export async function listOpportunityAlerts(): Promise<OpportunityAlert[]> {
  const { data, error } = await supabase
    .from('opportunity_alerts').select('*')
    .neq('status', 'dismissed')
    .order('priority').order('deadline', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as OpportunityAlert[];
}

export async function updateAlertStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from('opportunity_alerts').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function getLatestReputation(): Promise<ReputationSnapshot | null> {
  const { data, error } = await supabase
    .from('reputation_snapshots').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data as ReputationSnapshot | null;
}

export interface MediaCenterStats {
  events_total: number;
  events_in_review: number;
  articles_pending: number;
  articles_published: number;
  social_ready: number;
  campaigns_sent: number;
  subscribers: number;
  watch_flagged: number;
  ai_calls_today: number;
}

export async function getDashboardStats(): Promise<MediaCenterStats> {
  const head = { count: 'exact' as const, head: true };
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [events, inReview, pending, published, social, campaigns, subs, flagged, aiToday] = await Promise.all([
    supabase.from('media_events').select('id', head),
    supabase.from('media_events').select('id', head).eq('status', 'in_review'),
    supabase.from('generated_articles').select('id', head).eq('status', 'pending_review'),
    supabase.from('generated_articles').select('id', head).eq('status', 'published'),
    supabase.from('social_posts').select('id', head).in('status', ['approved', 'ready']),
    supabase.from('newsletter_campaigns').select('id', head).eq('status', 'sent'),
    supabase.from('newsletter_subscriptions').select('id', head).eq('status', 'active'),
    supabase.from('collected_news').select('id', head).eq('status', 'flagged'),
    supabase.from('ai_usage_logs').select('id', head).gte('created_at', startOfDay.toISOString()),
  ]);

  return {
    events_total: events.count ?? 0,
    events_in_review: inReview.count ?? 0,
    articles_pending: pending.count ?? 0,
    articles_published: published.count ?? 0,
    social_ready: social.count ?? 0,
    campaigns_sent: campaigns.count ?? 0,
    subscribers: subs.count ?? 0,
    watch_flagged: flagged.count ?? 0,
    ai_calls_today: aiToday.count ?? 0,
  };
}
