# Centre Média IA FEGESPORT

Système éditorial assisté par IA intégré au site fegesport224.org : un administrateur saisit une activité FEGESPORT, l'IA produit automatiquement 6 contenus (article de presse, actualité courte, posts Facebook/LinkedIn/X, newsletter HTML), un humain valide, puis tout se publie via les canaux existants.

---

## 1. Architecture complète

```
┌──────────────────────────────── NETLIFY (frontend React/Vite) ────────────────────────────────┐
│                                                                                                │
│  /admin/media/*  (pages admin, design identique au reste du site, protégées par AdminLayout)   │
│     Dashboard · Nouvel événement · Brouillons · Revue · Articles · Veille · Sources ·          │
│     Newsletters · Statistiques                                                                 │
│                                                                                                │
│  src/lib/mediaCenterService.ts  ←— couche service unique (CRUD + invocation Edge Functions)    │
└───────────────┬───────────────────────────────────────────────────────────────────────────────┘
                │ supabase-js (anon key + JWT admin, RLS)
┌───────────────▼───────────────────────────── SUPABASE ────────────────────────────────────────┐
│                                                                                                │
│  PostgreSQL : media_events, media_event_files, generated_articles, social_posts,               │
│               newsletter_campaigns, news_sources, collected_news, publication_logs,            │
│               ai_usage_logs  (+ tables existantes réutilisées : news, newsletter_subscriptions,│
│               admin_users, email_logs)                                                         │
│  Storage    : bucket "media-center" (photos, affiches, PDF, vidéos — lecture publique,         │
│               écriture admin)                                                                  │
│                                                                                                │
│  Edge Functions (Deno, secrets côté serveur — aucune clé IA dans le navigateur) :              │
│   • media-generate   → Claude API : analyse + rédaction des 6 contenus + passe éditeur         │
│   • media-watch      → veille RSS des sources officielles + scoring Claude                     │
│   • newsletter-send  → envoi Resend par lots + désabonnement one-click + webhook stats         │
│   • send-email       → (existante, inchangée)                                                  │
└───────────────┬──────────────────────────────┬────────────────────────────────────────────────┘
                │                              │
        ┌───────▼────────┐             ┌───────▼────────┐
        │  Claude API    │             │    Resend      │
        │  (Anthropic)   │             │  (emails)      │
        └────────────────┘             └────────────────┘
```

**Choix d'intégration clés (zéro casse en production) :**

| Besoin | Décision |
|---|---|
| Table `events` demandée | La table `events` de prod existe déjà (inscriptions, paiements) → nouvelles tables **`media_events`** / **`media_event_files`**, la prod n'est pas touchée |
| Table `newsletter_subscribers` demandée | **`newsletter_subscriptions`** existe déjà avec des abonnés → réutilisée telle quelle (+ colonne nullable `unsubscribe_token`) |
| Publication site | Passe par le RPC existant **`create_news_as_admin`** → l'article apparaît dans le pipeline news déjà en prod (NewsPage, SEO, sitemap) |
| Contrôle d'accès | Fonction SQL existante **`is_admin_user()`** + table `admin_users`, réutilisées dans toutes les RLS et Edge Functions |
| Envoi email | **Resend déjà configuré** (RESEND_API_KEY dans les secrets Supabase) |

## 2. Diagramme des flux

### Flux 1 — Activité interne (Agents 1, 3, 4, 5)

```
Admin                    Frontend                  media-generate (Edge Fn)            Supabase
  │  saisit événement       │                              │                              │
  │  + photos/PDF/vidéos    │── insert media_events ──────────────────────────────────────▶
  │                         │── upload bucket media-center ───────────────────────────────▶
  │  clic "Générer IA"      │── POST event_id ────────────▶│                              │
  │                         │                              │ vérifie admin + quota IA     │
  │                         │                              │ [Agent 3] Claude: analyse    │
  │                         │                              │   résumé, mots-clés, SEO     │
  │                         │                              │ [Agent 4] Claude: rédige     │
  │                         │                              │   article 600-1200 mots,     │
  │                         │                              │   actu 150 mots, newsletter, │
  │                         │                              │   FB / LinkedIn / X          │
  │                         │                              │ [Agent 5] Claude: contrôle   │
  │                         │                              │   qualité + hallucinations   │
  │                         │                              │── insert generated_articles, │
  │                         │                              │   social_posts (pending) ────▶
  │  ÉTAPE 4 — REVUE        │◀─────── contenus ────────────│                              │
  │  Modifier / Régénérer / Approuver / Rejeter  (validation humaine OBLIGATOIRE)          │
  │                         │                                                             │
  │  ÉTAPE 5 — PUBLICATION  │                                                             │
  │   site        ──────────│── rpc create_news_as_admin + SEO ───────────────────────────▶
  │   newsletter  ──────────│── newsletter_campaigns → Edge Fn newsletter-send → Resend    │
  │   réseaux     ──────────│── statut "ready" + bouton Copier (textes prêts à coller)     │
  │                         │   (chaque action → publication_logs)                         │
```

### Flux 2 — Veille mondiale (Agents 2, 3)

```
Cron (pg_cron / manuel)──▶ media-watch ──▶ fetch RSS des news_sources actives
                                │            (IESF, GEF, Riot, EA FC, PUBG M, …)
                                ├──▶ dédup par URL → insert collected_news (status: new)
                                ├──▶ [Agent 3] Claude : importance / impact / pertinence Guinée (0-100)
                                └──▶ score Guinée ≥ 60 → status "flagged" ⭐ (mis en avant dans l'admin)
Admin : lit, "Marquer utilisée" ou "Ignorer", ou s'en inspire pour créer un événement/article.
```

## 3–4. Schéma Supabase & migration SQL

Fichier : `supabase/migrations/20260611200000_create_media_center.sql`

- 9 tables avec contraintes CHECK sur tous les statuts de workflow
- 25 index (statuts, FK, tris par date, scores de veille)
- RLS sur toutes les tables : `is_admin_user()` partout ; `publication_logs` en lecture/insertion seule (audit inviolable) ; `ai_usage_logs` insérés uniquement par les Edge Functions (service_role)
- Bucket `media-center` (50 Mo max, types MIME limités images/PDF/vidéo)
- `check_media_ai_quota()` : quota IA journalier (50 appels/jour par défaut, modifiable via `site_settings.media_ai_daily_quota`)
- Seed des 12 sources de veille demandées
- Extensions douces : `news.slug` + `news.seo` (nullables), `newsletter_subscriptions.unsubscribe_token`

## 5. Structure React

```
src/
├── types/mediaCenter.ts                    # tous les types + labels FR
├── lib/mediaCenterService.ts               # couche service unique
└── pages/admin/media/
    ├── MediaDashboardPage.tsx              # /admin/media
    ├── MediaEventFormPage.tsx              # /admin/media/new + /admin/media/events/:id/edit
    ├── MediaDraftsPage.tsx                 # /admin/media/drafts
    ├── MediaReviewPage.tsx                 # /admin/media/events/:id/review  (Étape 4)
    ├── MediaArticlesPage.tsx               # /admin/media/articles
    ├── MediaWatchPage.tsx                  # /admin/media/watch
    ├── MediaSourcesPage.tsx                # /admin/media/sources
    ├── MediaNewslettersPage.tsx            # /admin/media/newsletters
    └── MediaStatsPage.tsx                  # /admin/media/stats
```

Routes branchées dans `src/App.tsx`, groupe « Centre Média IA » ajouté dans la sidebar (`src/pages/admin/AdminLayout.tsx`). Design : classes existantes (`bg-dark-800`, `fed-red-500`, `fed-gold-500`, `font-heading`), icônes lucide, toasts sonner.

## 6. Services TypeScript

`mediaCenterService.ts` expose ~30 fonctions : CRUD événements/fichiers/sources, `generateContent()` (génération complète ou régénération ciblée avec consignes), approbations/rejets avec audit automatique, `publishArticleToSite()` (RPC news + SEO), campagnes (`sendCampaign`, `sendCampaignTest`), veille (`runWatch`), stats (`getDashboardStats`, logs).

## 7. Intégration Claude API

- Serveur uniquement (Edge Functions) — la clé n'atteint jamais le navigateur
- Modèle par défaut `claude-sonnet-4-6` (surchargeable via secret `ANTHROPIC_MODEL`)
- **Anti-hallucination** : prompt système strict (« uniquement les faits fournis, ne jamais inventer noms/scores/citations ») + passe Agent Éditeur qui scanne l'article (score qualité, risque d'hallucination `none/low/high`, correctifs) — affiché dans l'UI de revue + validation humaine obligatoire avant publication
- Quota journalier SQL + journal `ai_usage_logs` (tokens in/out par appel)

## 8. Intégration Resend

- `newsletter-send` : envoi par lots de 100 (endpoint batch), pause 600 ms entre lots (rate limit), tag `campaign_id` sur chaque email
- Désabonnement one-click : lien `{{UNSUBSCRIBE_URL}}` unique par abonné → page de confirmation publique
- Webhook Resend (opened/clicked/bounced/delivered) → compteurs de la campagne → stats dans l'admin
- Email de test avant envoi réel

## 9. Plan de déploiement

```bash
# 1. Base de données
supabase db push          # ou exécuter la migration dans le SQL Editor du dashboard

# 2. Secrets des Edge Functions
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set SITE_URL=https://fegesport224.org
supabase secrets set NEWSLETTER_FROM_EMAIL=newsletter@fegesport224.org
supabase secrets set MEDIA_CRON_KEY=<chaîne aléatoire longue>     # pour le cron de veille
# RESEND_API_KEY existe déjà

# 3. Edge Functions
supabase functions deploy media-generate
supabase functions deploy media-watch    --no-verify-jwt   # appels cron via X-Cron-Key
supabase functions deploy newsletter-send --no-verify-jwt  # désabonnement + webhook publics

# 4. Webhook Resend (dashboard Resend → Webhooks)
#    URL : https://<project-ref>.supabase.co/functions/v1/newsletter-send
#    Événements : email.delivered, email.opened, email.clicked, email.bounced

# 5. Veille automatique (SQL Editor — toutes les 6 h)
select cron.schedule('media-watch-6h', '0 */6 * * *', $$
  select net.http_post(
    url     := 'https://<project-ref>.supabase.co/functions/v1/media-watch',
    headers := '{"Content-Type":"application/json","X-Cron-Key":"<MEDIA_CRON_KEY>"}'::jsonb,
    body    := '{"action":"full"}'::jsonb
  );
$$);

# 6. Frontend : git push → build Netlify automatique (aucune variable à ajouter)
```

Vérifications post-déploiement : créer un événement test → générer → vérifier les 6 contenus → approuver l'actualité courte → publier → contrôler `/news` ; envoyer un email de test de newsletter ; lancer la veille depuis l'admin.

## 10. Roadmap

**MVP (livré ici)** — saisie événement + médias, génération des 6 contenus, passe éditeur anti-hallucination, validation humaine, publication site via pipeline news existant, newsletters Resend avec stats, veille RSS scorée, audit complet, quotas IA.

**V2** — analyse des images par l'IA (vision Claude : légender les photos uploadées et enrichir l'article) ; traduction EN automatique (le site est bilingue) ; scraping des sources sans flux RSS (ACES, EWC…) ; génération d'article directement depuis une actu de veille « flagged » ; programmation d'envoi des newsletters (`scheduled_for` + cron) ; éditeur riche (markdown WYSIWYG) dans la revue.

**V3** — publication directe Facebook/LinkedIn via les API Meta/LinkedIn (OAuth) ; A/B testing des objets de newsletter ; tableau de bord analytique croisé (trafic article ↔ ouvertures ↔ réseaux) ; suggestions proactives (« 3 actus de veille méritent un article cette semaine ») ; archives de presse publiques `/presse` alimentées par `generated_articles`.

---

## Récapitulatif des fichiers

| Fichier | Rôle |
|---|---|
| `supabase/migrations/20260611200000_create_media_center.sql` | Schéma complet (tables, index, RLS, quota, bucket, seed) |
| `supabase/functions/_shared/mediaCenter.ts` | Auth admin, client Claude, parsing JSON, logs, quota |
| `supabase/functions/media-generate/index.ts` | Agents Analyseur + Rédacteur + Éditeur |
| `supabase/functions/media-watch/index.ts` | Agents Veille + Analyseur (scoring Guinée) |
| `supabase/functions/newsletter-send/index.ts` | Resend : envoi, test, désabonnement, webhook |
| `src/types/mediaCenter.ts` | Types TypeScript |
| `src/lib/mediaCenterService.ts` | Couche service frontend |
| `src/pages/admin/media/*.tsx` | 9 pages admin |
| `src/App.tsx`, `src/pages/admin/AdminLayout.tsx` | Routes + menu (modifiés) |
