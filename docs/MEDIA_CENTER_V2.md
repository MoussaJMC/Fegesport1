# FEGESPORT AI MEDIA CENTER V2 — Salle de rédaction numérique

Évolution de la V1 (voir `docs/MEDIA_CENTER.md`) en véritable rédaction multi-agents couvrant les activités nationales, africaines et mondiales de l'esport. Tout est incrémental : aucune fonctionnalité V1 ni table de production n'est cassée.

---

## 1. Architecture complète — les 9 agents

| # | Agent | Implémentation | Déclencheur |
|---|-------|----------------|-------------|
| 1 | **World Esport Scout** | `media-watch` (étape fetch) — 18 sources (RSS + sites officiels), dédup par URL | Cron 6 h + bouton admin |
| 2 | **FEGESPORT Field Reporter** | Formulaire `/admin/media/new` + passe d'analyse de `media-generate` : résumé, mots-clés, **entités extraites** (joueurs, clubs, partenaires, scores, citations) → `media_events.extracted_entities` | Admin |
| 3 | **Editor in Chief** | Passe de triage dans `media-watch` (veille) et `media-generate` (interne) : priorité **urgent / prioritaire / standard / archive** + décision **publier / réviser / ignorer** + justification | Automatique |
| 4 | **Press Writer** | `media-generate` : 7 produits — presse 600-1200 mots, actu 150-300 mots, **version site SEO 300-500 mots**, newsletter HTML responsive, Facebook long, LinkedIn institutionnel, X court | Admin (bouton Générer) |
| 5 | **Fact Checker** | Passe dédiée dans `media-generate` : compare chaque affirmation aux données sources, retire les faits non sourcés, produit `checked_facts` (claim/source/confiance/date) + **score de confiance 0-100** ; **score < 70 → RELECTURE OBLIGATOIRE** (bandeau rouge dans la revue) | Automatique après rédaction |
| 6 | **SEO Master** | Génération : slug, meta title/description, keywords, OG ; publication : **Twitter Cards** + Schema.org NewsArticle écrits dans `news.seo` | Automatique |
| 7 | **Social Media Manager** | `media-generate` : **6 canaux** (Facebook, LinkedIn, X, Instagram, WhatsApp Channel, Telegram) avec hashtags, emojis adaptés au canal, **CTA** et **visuel suggéré** | Automatique |
| 8 | **Newsletter Manager** | `newsletter-send` : **segments** (général/joueurs/clubs/partenaires/presse), types de campagne (événement/hebdo/mensuel/urgent), stats ouvertures/clics/bounces, désabonnement one-click | Admin |
| 9 | **Media Analytics** | Vue SQL `media_kpi_daily` (90 jours) + dashboard **journalier/hebdomadaire/mensuel** dans `/admin/media/stats` | Temps réel |

Chaque « agent » est une étape déterministe d'un pipeline (prompt spécialisé + traitement), pas un processus autonome : coûts maîtrisés, comportement prévisible, audit complet.

## 2–4. Base de données (schéma, tables, migrations)

- **V1** : `20260611200000_create_media_center.sql` (9 tables, RLS, audit, quota, bucket)
- **V2** : `20260612090000_media_center_v2_newsroom.sql` :
  - `collected_news` + `ai_impact_africa`, `editorial_priority`, `editorial_decision`, `editorial_reason`
  - `media_events` + `extracted_entities`, `editorial_priority`
  - `generated_articles` + type `web_seo`, `fact_check`, `fact_check_score`, `needs_mandatory_review`
  - `social_posts` + plateformes `instagram/whatsapp/telegram`, `cta`, `visual_suggestion`
  - `newsletter_subscriptions` + `segment` ; `newsletter_campaigns` + `campaign_type`, `target_segments`
  - Vue `media_kpi_daily` (security_invoker, admin uniquement)
  - 6 sources ajoutées : HLTV (Counter-Strike), Valorant Esports, Liquipedia, Esports Insider, Dot Esports, The Esports Advocate*

\* The Esports Observer a été absorbé par Sports Business Journal (payant) ; The Esports Advocate le remplace comme source business accessible. Ajustable dans `/admin/media/sources`.

## 5. Edge Functions

| Fonction | Agents | Rôle V2 |
|---|---|---|
| `media-generate` | 2, 3, 4, 5, 6, 7 | Analyse + entités + priorité → rédaction 7 produits + 6 posts sociaux → fact-check scoré → SEO |
| `media-watch` | 1, 3 | Fetch 18 sources → scoring importance/impact/**Afrique**/Guinée → triage rédaction en chef |
| `newsletter-send` | 8 | Envoi Resend segmenté par lots, test, désabonnement public, webhook stats |

## 6. Cron jobs (pg_cron + pg_net, SQL Editor Supabase)

```sql
-- Veille mondiale toutes les 6 h (Agent 1 + 3)
select cron.schedule('media-watch-6h', '0 */6 * * *', $$
  select net.http_post(
    url     := 'https://<project-ref>.supabase.co/functions/v1/media-watch',
    headers := '{"Content-Type":"application/json","X-Cron-Key":"<MEDIA_CRON_KEY>"}'::jsonb,
    body    := '{"action":"full"}'::jsonb);
$$);

-- Purge des actualités de veille ignorées/archivées de plus de 90 jours
select cron.schedule('media-watch-purge', '0 3 * * 0', $$
  delete from collected_news
  where status = 'dismissed' and collected_at < now() - interval '90 days';
$$);
```

(V3 : cron hebdomadaire qui assemble automatiquement la newsletter « digest » de la semaine.)

## 7. Dashboard admin

Pages V1 conservées + enrichissements V2 :
- **Revue** : bandeau « RELECTURE OBLIGATOIRE » si confiance < 70, panneau Fact Checker dépliable (faits vérifiés avec source/confiance/date), CTA + visuel suggéré par post social, onglets pour les 10 contenus
- **Veille** : badges priorité (Urgent/Prioritaire/Standard/Archive) + décision de la rédaction en chef + score Afrique
- **Newsletters** : type de campagne + ciblage par segments avec compteur d'abonnés par segment
- **Statistiques** : tableau KPI jour/semaine/mois (articles, posts, newsletters, ouvertures, clics, taux d'ouverture, veille, abonnés, appels IA)

## 8. Workflow détaillé (11 étapes)

1. **Scout** collecte (cron 6 h) → `collected_news`
2. **Field Reporter** : l'admin saisit l'activité + médias → `media_events`
3. **Editor in Chief** classe (priorité + décision) — veille et interne
4. **Press Writer** rédige les 7 produits + 6 posts sociaux
5. **Fact Checker** vérifie : confiance 0-100, faits sourcés, corrections ; < 70 → relecture obligatoire
6. **SEO Master** : slug, metas, keywords, OG, Twitter Cards, Schema.org
7. **Validation humaine obligatoire** : Modifier / Régénérer (avec consignes) / Approuver / Rejeter — rien ne sort sans approbation
8. **Publication site** via `create_news_as_admin` (pipeline news en prod)
9. **Diffusion sociale** : textes finalisés par canal, CTA, hashtags, visuel suggéré — copier-coller (V3 : API directes)
10. **Newsletter** : campagne segmentée → Resend → stats
11. **Analytics** : KPI quotidiens, journal d'audit, consommation IA

## 9. Sécurité

- **Accès** : RLS `is_admin_user()` sur 100 % des tables média ; Edge Functions revérifient le JWT + `admin_users` côté serveur ; cron authentifié par secret `X-Cron-Key`
- **Clés** : ANTHROPIC_API_KEY / RESEND_API_KEY uniquement en secrets Supabase, jamais dans le bundle frontend
- **Anti-hallucination** : prompts « source de vérité unique », fact-check systématique, faits non sourcés retirés, relecture obligatoire < 70, validation humaine finale
- **Vérification des sources** : veille = sources officielles seedées, dédup par URL, score de crédibilité dans le triage
- **Anti-spam / abus** : quota IA journalier SQL (50/jour, réglable), rate-limit Resend respecté, désabonnement one-click conforme
- **Audit** : `publication_logs` insert-only (qui, quoi, quand, canal), `ai_usage_logs` (tokens par appel)

## 10. Budget mensuel estimé

Hypothèses : 25 événements/mois générés (génération complète + 1 régénération sur 2), veille 4×/jour avec ~15 analyses.

| Poste | Détail | Coût/mois |
|---|---|---|
| Claude API (Sonnet 4.6 : 3 $/M in, 15 $/M out) | Génération : ~25 × (15k in + 12k out) ≈ 0,55 $/évt → ~17 $ ; veille : ~120 appels × 3k tokens → ~3 $ | **~20-25 $** |
| Supabase Pro (requis : Edge Functions volume, pg_cron, sauvegardes) | | **25 $** |
| Resend | < 3 000 emails/mois : 0 $ ; jusqu'à 50 000 : 20 $ | **0-20 $** |
| Netlify | offre actuelle conservée | **0 $** |
| **Total** | | **≈ 45-70 $/mois** (~450 000-700 000 GNF) |

Leviers : quota IA journalier, modèle Haiku 4.5 pour la veille (÷4 le coût d'analyse), envoi newsletter mensuel plutôt qu'hebdo.

## 11. Roadmap

- **V1 (livrée)** : pipeline complet événement → 6 contenus → validation → publication ; veille RSS scorée ; newsletters Resend ; audit & quotas.
- **V2 (livrée ici)** : 9 agents — entités, triage éditorial, fact-check scoré + relecture obligatoire, version web SEO, 6 canaux sociaux avec CTA/visuels, segments + formats de newsletter, Twitter Cards, KPI jour/semaine/mois, 18 sources.
- **V3 (prochaine)** : vision Claude sur les photos (OCR affiches, légendes auto) ; génération d'article en 1 clic depuis une actu de veille « publier » ; publication directe Facebook/LinkedIn/Telegram via API ; newsletter digest hebdo auto-assemblée (cron) ; traduction EN ; lectures/partages réels par article (analytics on-site) ; A/B testing des objets ; archives presse publiques `/presse`.

## 12. Plan de déploiement production

```bash
# 1. Migrations (V1 puis V2)
supabase db push

# 2. Secrets (si pas déjà fait en V1)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-... SITE_URL=https://fegesport224.org \
  NEWSLETTER_FROM_EMAIL=newsletter@fegesport224.org MEDIA_CRON_KEY=<secret-long>

# 3. Edge Functions
supabase functions deploy media-generate
supabase functions deploy media-watch --no-verify-jwt
supabase functions deploy newsletter-send --no-verify-jwt

# 4. Cron jobs : exécuter le SQL de la section 6 (remplacer <project-ref> et <MEDIA_CRON_KEY>)

# 5. Webhook Resend → https://<project-ref>.supabase.co/functions/v1/newsletter-send
#    (email.delivered, email.opened, email.clicked, email.bounced)

# 6. Frontend : git push → Netlify
```

**Recette** : créer un événement test complet (clubs + résultats + photos) → générer → vérifier les 10 onglets, le score de confiance et les entités extraites → approuver/publier l'actu → lancer la veille → vérifier les badges de triage → envoyer une newsletter de test → contrôler les KPI dans Statistiques.
