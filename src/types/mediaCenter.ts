// Types du Centre Média IA FEGESPORT

export type MediaEventStatus = 'draft' | 'generating' | 'in_review' | 'published' | 'archived';
export type MediaEventCategory = 'tournoi' | 'formation' | 'partenariat' | 'institutionnel' | 'communaute' | 'international' | 'autre';
export type MediaFileType = 'photo' | 'poster' | 'pdf' | 'video';
export type GeneratedContentType = 'press_article' | 'short_news' | 'web_seo' | 'newsletter';
export type SocialPlatform = 'facebook' | 'linkedin' | 'twitter' | 'instagram' | 'whatsapp' | 'telegram';
export type ReviewStatus = 'pending_review' | 'approved' | 'rejected' | 'published';
export type CampaignStatus = 'draft' | 'pending_review' | 'approved' | 'scheduled' | 'sending' | 'sent' | 'failed';
export type CampaignType = 'event' | 'weekly' | 'monthly' | 'urgent';
export type SubscriberSegment = 'general' | 'players' | 'clubs' | 'partners' | 'press';
export type CollectedNewsStatus = 'new' | 'analyzed' | 'flagged' | 'used' | 'dismissed';
export type EditorialPriority = 'urgent' | 'priority' | 'standard' | 'archive';
export type EditorialDecision = 'publish' | 'revise' | 'ignore';

export interface ExtractedEntities {
  players?: string[];
  clubs?: string[];
  partners?: string[];
  scores?: string[];
  quotes?: string[];
}

export interface StrategicScores {
  impact?: number;
  recruitment?: number;
  institutional?: number;
  media_visibility?: number;
  partnership?: number;
}

export const STRATEGIC_SCORE_LABELS: Record<keyof StrategicScores, string> = {
  impact: 'Impact FEGESPORT',
  recruitment: 'Potentiel recrutement',
  institutional: 'Valeur institutionnelle',
  media_visibility: 'Visibilité média',
  partnership: 'Potentiel partenariat',
};

export const RECRUITMENT_OBJECTIVE_LABELS: Record<string, string> = {
  recruit_clubs: 'Recruter des clubs',
  recruit_volunteers: 'Recruter des bénévoles',
  recruit_schools: 'Recruter des écoles',
  recruit_universities: 'Recruter des universités',
  recruit_players: 'Recruter des joueurs',
  recruit_partners: 'Recruter des partenaires',
  recruit_sponsors: 'Recruter des sponsors',
};

export interface FactCheckResult {
  confidence?: number;
  quality_score?: number;
  spelling_ok?: boolean;
  coherence_ok?: boolean;
  hallucination_risk?: 'none' | 'low' | 'high';
  checked_facts?: { claim: string; source: string; confidence: number; date: string | null }[];
  issues?: string[];
}

export interface EventResult {
  rank: number;
  name: string;
  prize?: string;
}

export interface MediaEvent {
  id: string;
  title: string;
  slug: string | null;
  event_date: string | null;
  event_time: string | null;
  location: string | null;
  description: string;
  organizer: string | null;
  category: MediaEventCategory;
  participants_count: number | null;
  clubs: string[];
  results: EventResult[];
  status: MediaEventStatus;
  ai_summary: string | null;
  ai_keywords: string[];
  ai_categories: string[];
  ai_seo_tags: string[];
  ai_analyzed_at: string | null;
  extracted_entities: ExtractedEntities | null;
  editorial_priority: EditorialPriority | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaEventFile {
  id: string;
  event_id: string;
  file_type: MediaFileType;
  storage_path: string;
  public_url: string;
  file_name: string | null;
  file_size: number | null;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface GeneratedArticle {
  id: string;
  event_id: string | null;
  collected_news_id: string | null;
  content_type: GeneratedContentType;
  title: string;
  excerpt: string | null;
  content: string;
  word_count: number | null;
  slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[];
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  schema_org: Record<string, unknown> | null;
  status: ReviewStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  model: string | null;
  prompt_version: string | null;
  editor_check: FactCheckResult | null;
  fact_check: FactCheckResult | null;
  fact_check_score: number | null;
  needs_mandatory_review: boolean;
  // FEGESPORT Perspective (articles issus de la veille)
  fegesport_category: string | null;
  recruitment_objective: string | null;
  strategic_scores: StrategicScores | null;
  fegesport_impact_score: number | null;
  generation_count: number;
  generated_from_watch?: boolean;
  published_news_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialPost {
  id: string;
  event_id: string | null;
  collected_news_id: string | null;
  platform: SocialPlatform;
  content: string;
  hashtags: string[];
  cta: string | null;
  visual_suggestion: string | null;
  suggested_image_url: string | null;
  status: ReviewStatus | 'ready';
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  model: string | null;
  generation_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsletterCampaign {
  id: string;
  event_id: string | null;
  generated_article_id: string | null;
  subject: string;
  preheader: string | null;
  html_content: string;
  text_content: string | null;
  status: CampaignStatus;
  campaign_type: CampaignType;
  target_segments: string[];
  scheduled_for: string | null;
  sent_at: string | null;
  recipients_count: number;
  delivered_count: number;
  opens_count: number;
  clicks_count: number;
  bounces_count: number;
  unsubscribes_count: number;
  error_message: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsSource {
  id: string;
  name: string;
  organization: string | null;
  website_url: string | null;
  feed_url: string | null;
  source_type: 'rss' | 'html' | 'api';
  topics: string[];
  is_active: boolean;
  last_fetched_at: string | null;
  last_fetch_status: string | null;
  fetch_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollectedNews {
  id: string;
  source_id: string | null;
  title: string;
  url: string;
  summary: string | null;
  raw_excerpt: string | null;
  image_url: string | null;
  published_at: string | null;
  collected_at: string;
  ai_importance: number | null;
  ai_impact: number | null;
  ai_impact_africa: number | null;
  ai_relevance_guinea: number | null;
  ai_category: string | null;
  ai_analysis: Record<string, unknown> | null;
  ai_analyzed_at: string | null;
  editorial_priority: EditorialPriority | null;
  editorial_decision: EditorialDecision | null;
  editorial_reason: string | null;
  status: CollectedNewsStatus;
  used_for_generation: boolean;
  generated_article_id: string | null;
  created_at: string;
  news_sources?: Pick<NewsSource, 'name' | 'organization'> | null;
}

export interface PublicationLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  channel: string | null;
  performed_by: string | null;
  performed_by_email: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface AiUsageLog {
  id: string;
  function_name: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  event_id: string | null;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

export interface MediaKpiDaily {
  day: string;
  articles_published: number;
  social_posts_ready: number;
  newsletters_sent: number;
  newsletter_recipients: number;
  newsletter_opens: number;
  newsletter_clicks: number;
  news_collected: number;
  ai_calls: number;
  ai_tokens_in: number;
  ai_tokens_out: number;
  new_subscribers: number;
}

// ------------------------------------------------------------------
// V3 — Moteur de croissance (Agents 10-15)
// ------------------------------------------------------------------

export type GrowthObjective =
  | 'recruit_players' | 'recruit_clubs' | 'recruit_partners' | 'recruit_sponsors'
  | 'recruit_journalists' | 'recruit_volunteers' | 'grow_newsletter'
  | 'international_visibility' | 'institutional_credibility';

export const GROWTH_OBJECTIVE_LABELS: Record<GrowthObjective, string> = {
  recruit_players: 'Recruter des joueurs',
  recruit_clubs: 'Recruter des clubs',
  recruit_partners: 'Recruter des partenaires',
  recruit_sponsors: 'Recruter des sponsors',
  recruit_journalists: 'Recruter des journalistes',
  recruit_volunteers: 'Recruter des bénévoles',
  grow_newsletter: 'Abonnés newsletter',
  international_visibility: 'Visibilité internationale',
  institutional_credibility: 'Crédibilité institutionnelle',
};

export interface GrowthInsight {
  id: string;
  period_start: string;
  period_end: string;
  top_contents: { title: string; channel: string; why: string }[];
  top_topics: string[];
  top_hashtags: string[];
  top_channels: { channel: string; verdict: string }[];
  best_times: { slot: string; rationale: string }[];
  recommendations: { recommendation: string; rationale: string; objective: string }[];
  created_at: string;
}

export interface Prospect {
  id: string;
  name: string;
  sector: string;
  country: string;
  website: string | null;
  contact_info: Record<string, string>;
  contact_reasons: string[];
  opportunities: string[];
  compatibility_score: number | null;
  ai_rationale: string | null;
  status: 'new' | 'qualified' | 'contacted' | 'in_discussion' | 'partner' | 'declined' | 'dormant';
  origin: string;
  notes: string | null;
  created_at: string;
}

export const PROSPECT_SECTOR_LABELS: Record<string, string> = {
  gaming: 'Gaming', telecom: 'Télécom', bank: 'Banque', insurance: 'Assurance',
  equipment: 'Équipementier', pc_hardware: 'Constructeur PC', game_publisher: 'Éditeur de jeux',
  media: 'Média', institution: 'Institution', other: 'Autre',
};

export interface EcosystemProfile {
  id: string;
  profile_type: 'player' | 'club' | 'organizer' | 'creator';
  name: string;
  activity_score: number;
  mentions_count: number;
  first_seen_at: string;
  last_seen_at: string;
  source_refs: { type: string; id: string; title: string }[];
  suggested_action: string | null;
  status: 'new' | 'watch' | 'contacted' | 'member' | 'ignored';
  created_at: string;
}

export interface SponsorshipReport {
  id: string;
  title: string;
  event_id: string | null;
  period_start: string | null;
  period_end: string | null;
  audience_metrics: Record<string, unknown>;
  highlights: string[];
  media_value_estimate: string | null;
  content: string;
  status: 'draft' | 'ready' | 'sent' | 'archived';
  created_at: string;
}

export interface OpportunityAlert {
  id: string;
  source_org: string;
  title: string;
  alert_type: string;
  url: string | null;
  deadline: string | null;
  priority: 'urgent' | 'priority' | 'standard';
  ai_summary: string | null;
  status: 'new' | 'in_progress' | 'applied' | 'won' | 'missed' | 'dismissed';
  created_at: string;
}

export interface ReputationSnapshot {
  id: string;
  snapshot_date: string;
  mentions_positive: number;
  mentions_negative: number;
  mentions_neutral: number;
  controversies: { topic: string; severity: string; recommendation: string }[];
  communication_opportunities: { opportunity: string; action: string }[];
  reputation_score: number | null;
  visibility_score: number | null;
  trust_score: number | null;
  created_at: string;
}

export interface ExecutiveKpiMonthly {
  month: string;
  new_players: number;
  new_clubs: number;
  new_partners: number;
  new_sponsors: number;
  new_subscribers: number;
  articles_published: number;
  social_posts: number;
  newsletters_sent: number;
  newsletter_opens: number;
  newsletter_clicks: number;
  site_page_views: number;
}

// ------------------------------------------------------------------
// Diffusion multicanale (Phase A — file d'attente, sans API externe)
// ------------------------------------------------------------------

export type DistributionChannel = 'facebook' | 'linkedin' | 'twitter' | 'telegram' | 'whatsapp' | 'newsletter';
export type DistributionStatus = 'draft' | 'ready' | 'queued' | 'publishing' | 'published' | 'failed' | 'skipped';

export interface DistributionItem {
  id: string;
  event_id: string;
  generated_article_id: string | null;
  channel: DistributionChannel;
  status: DistributionStatus;
  payload_ref: string | null;
  content_preview: string | null;
  external_id: string | null;
  external_url: string | null;
  error_message: string | null;
  attempts: number;
  queued_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export const DISTRIBUTION_CHANNELS: DistributionChannel[] = [
  'facebook', 'linkedin', 'twitter', 'telegram', 'whatsapp', 'newsletter',
];

export const DISTRIBUTION_CHANNEL_LABELS: Record<DistributionChannel, string> = {
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  twitter: 'X / Twitter',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  newsletter: 'Newsletter',
};

export const DISTRIBUTION_STATUS_LABELS: Record<DistributionStatus, { label: string; cls: string }> = {
  draft: { label: 'Brouillon', cls: 'bg-dark-700 text-light-300' },
  ready: { label: 'Prêt', cls: 'bg-accent-blue-400/10 text-accent-blue-400' },
  queued: { label: 'En file', cls: 'bg-fed-gold-500/10 text-fed-gold-500' },
  publishing: { label: 'Diffusion…', cls: 'bg-fed-gold-500/10 text-fed-gold-500' },
  published: { label: 'Publié', cls: 'bg-emerald-500/10 text-emerald-400' },
  failed: { label: 'Échec', cls: 'bg-fed-red-500/10 text-fed-red-400' },
  skipped: { label: 'Ignoré', cls: 'bg-dark-700 text-light-400' },
};

export type GenerationTarget = GeneratedContentType | SocialPlatform;

export const ALL_GENERATION_TARGETS: GenerationTarget[] = [
  'press_article', 'short_news', 'web_seo', 'newsletter',
  'facebook', 'linkedin', 'twitter', 'instagram', 'whatsapp', 'telegram',
];

export const TARGET_LABELS: Record<GenerationTarget, string> = {
  press_article: 'Article de presse',
  short_news: 'Actualité courte',
  web_seo: 'Site web (SEO)',
  newsletter: 'Newsletter',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  twitter: 'X / Twitter',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp Channel',
  telegram: 'Telegram',
};

export const PRIORITY_LABELS: Record<EditorialPriority, { label: string; cls: string }> = {
  urgent: { label: 'Urgent', cls: 'bg-fed-red-500/15 text-fed-red-400' },
  priority: { label: 'Prioritaire', cls: 'bg-fed-gold-500/15 text-fed-gold-500' },
  standard: { label: 'Standard', cls: 'bg-accent-blue-400/10 text-accent-blue-400' },
  archive: { label: 'Archive', cls: 'bg-dark-700 text-light-400' },
};

export const DECISION_LABELS: Record<EditorialDecision, string> = {
  publish: 'Publier',
  revise: 'À réviser',
  ignore: 'Ignorer',
};

export const SEGMENT_LABELS: Record<SubscriberSegment, string> = {
  general: 'Général',
  players: 'Joueurs',
  clubs: 'Clubs',
  partners: 'Partenaires',
  press: 'Presse',
};

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  event: 'Événement',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuelle',
  urgent: 'Urgente',
};
