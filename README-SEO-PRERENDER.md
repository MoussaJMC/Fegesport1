# SEO prerender — opérations

Le site est une SPA React + Vite. Pour que les crawlers qui n'exécutent
pas JavaScript (Bingbot, aperçus sociaux non-OG, LLM crawlers, budget
réduit de Googlebot) voient le vrai contenu de chaque route, le build
Netlify génère un fichier `dist/<route>/index.html` **par route stable**,
avec les méta et le H1 déjà présents en source.

Ce document explique **comment ça marche** et **quand relancer un
build**.

## Routes concernées

Liste dans `vite.config.ts`, constante `PRERENDER_ROUTES`.
16 routes stables au moment du setup. Les routes dynamiques
(`/news/:id`, `/events/:id`) **ne sont pas** pré-rendues dans cette
phase — elles continuent de passer par le fallback SPA. La phase 2
ouvrira une PR dédiée pour générer ces IDs depuis Supabase au build.

## État figé — points de vigilance

Le prerender capture l'état de l'application **au moment où le build
tourne**. Trois pages à retenir :

| Route | Ce qui est figé | Quand relancer un build |
|---|---|---|
| `/leg` | État « LEG en Preparation » + `<meta name="robots" content="noindex, follow">` | **Dès qu'un club ou une discipline est publié en base Supabase.** Sans quoi la page restera noindex pour les crawlers non-JS. |
| `/direct` | État « aucun live en cours » (fallback). Les streams actifs apparaissent uniquement côté client au runtime. | Peu critique : les crawlers n'ont pas d'intérêt à indexer un live en cours. |
| `/news` et `/events` | Listes des articles / événements au moment du build. | À chaque publication importante, pour que la liste SSR serve la bonne version. Alternative : build hook Netlify déclenché depuis Supabase. |

Pour **relancer un build** sans changement de code : dashboard Netlify →
Deploys → *Trigger deploy* → *Deploy site*. Le build complet (prerender
inclus) prend environ **5 à 8 minutes**.

## Comment un signal `prerender-ready` est émis

Chaque composant `<SEO>` dispatche
`document.dispatchEvent(new Event('prerender-ready'))` à la fin de son
`useEffect`, mais **uniquement si** `window.__PRERENDER__` est truthy
(flag posé par `@prerenderer/renderer-puppeteer` via `injectProperty`).

Puppeteer attend cet événement avant de sérialiser le DOM
(`renderAfterDocumentEvent: 'prerender-ready'` dans `vite.config.ts`).
Timeout de sécurité : 20 s par route.

Si une nouvelle page est ajoutée au tableau `PRERENDER_ROUTES` sans
qu'elle n'appelle `<SEO>`, le build tombera en timeout — c'est voulu,
pour éviter des pages pré-rendues sans méta.

## Analytics et cookie banner au build

`src/main.tsx` lit `window.__PRERENDER__` et **monte un arbre
minimal** quand il est vrai : pas de `AnalyticsProvider`, pas de
`CookieBanner`. Objectif : ne pas polluer GA4 / Clarity et ne pas
capturer la bannière dans le HTML sérialisé.

## Vérification post-build

Le script `scripts/prerender-check.mjs` tourne après `vite build` et
vérifie, pour chaque route listée :

- présence d'un `<title>` non vide,
- `<meta name="description">` d'au moins 20 caractères,
- `<link rel="canonical">`,
- `<h1>` non vide,
- la canonical pointe vers la route elle-même, pas vers l'accueil.

Il casse le build (`process.exit(1)`) à la première route qui échoue.

## Si Puppeteer casse sur Netlify

Deux signaux probables dans les logs de build Netlify :

1. **« Could not find Chromium »** → Puppeteer n'a pas téléchargé son
   binaire. Vérifier que `PUPPETEER_SKIP_DOWNLOAD=false` est bien dans
   `netlify.toml` (c'est le cas par défaut dans ce lot).
2. **OOM pendant le prerender** → Netlify kill le process. Le lot a
   déjà `NODE_OPTIONS=--max-old-space-size=4096` et
   `maxConcurrentRoutes: 1`. Si ça ne suffit pas, migrer vers
   `puppeteer-core` + `@sparticuz/chromium` (image Lambda-friendly,
   ~50 Mo) — PR séparée.

Dans tous les cas : **ne jamais commiter sans que le build Netlify du
deploy preview soit vert**. Le script `prerender-check.mjs` est là pour
ça.

## Phase 2 — dynamiques (`/news/:id`, `/events/:id`) et sitemap

### Ce que fait le build en phase 2

- **`vite.config.ts`** interroge Supabase au démarrage via
  `scripts/supabase-fetch.mjs` (clé anon publique, en lecture seule).
  Il récupère :
  - `news` filtré sur `published = true`,
  - `events` filtré sur `status NOT IN (completed, cancelled)`.
  Les ids trouvés sont ajoutés à `PRERENDER_ROUTES`. Puppeteer
  prerender ces routes au même titre que les 16 routes statiques.
- **`scripts/build-sitemap.mjs`** rejoue la même requête et génère
  `dist/sitemap.xml` : 15 routes statiques (`/leg` reste exclue tant
  qu'elle est en `noindex`) + une entrée par article et par
  événement, avec `lastmod` dérivé de `updated_at`. Si Supabase
  échoue, le sitemap tombe à 15 URLs seulement et le build continue.
- **`scripts/prerender-check.mjs`** liste les sous-dossiers
  `dist/news/*` et `dist/events/*` et applique les mêmes contrôles
  qu'aux routes statiques — title, meta description, canonical self,
  `<h1>`, images avec `alt`.
- **`notify-indexnow.js`** lit désormais `dist/sitemap.xml` et non
  plus `public/sitemap.xml` (qui a été supprimé).

### Mettre en place le rebuild automatique à chaque publication

Deux configurations hors code sont nécessaires. Documentées ici
une fois pour toutes, vous les faites manuellement.

#### Côté Netlify — créer un build hook

1. Netlify dashboard → votre site `fegesport224` → **Site settings**
2. **Build & deploy** → **Build hooks** → **Add build hook**
3. Nom : `Supabase publish` · branche : `main` → **Save**
4. Copiez l'URL (`https://api.netlify.com/build_hooks/<id>`). **Elle
   est secrète** — toute personne qui la connaît peut déclencher un
   build. Stockez-la côté Supabase (étape suivante), pas dans le
   dépôt.

#### Côté Supabase — Database Webhook

Pas d'Edge Function. Les Database Webhooks font un `POST` HTTP natif
à chaque mutation.

Le projet Supabase utilisé par fegesport224.org s'appelle
**« Reussite »** (pas FORMALPRO) — vérifier dans l'URL Supabase ou
dans la liste des projets. C'est le projet qui héberge les tables
`public.news` et `public.events`.

**Prérequis** — activer l'intégration **Database Webhooks** si ce
n'est pas déjà fait. Elle installe l'extension PostgreSQL `pg_net`,
sans laquelle la création du premier hook échoue avec
`schema "supabase_functions" does not exist`.

1. Supabase dashboard → **Database** → **Webhooks**.
2. Si le bouton **Install integration** est affiché → cliquer, laisser
   installer `pg_net` seule (c'est la dépendance strictement requise).
3. **Create a new hook** — première hook, table `news` :
   - Name: `netlify_rebuild_news`
   - Table: `public.news`
   - Events: cocher `INSERT`, `UPDATE`, `DELETE`
   - Type: `HTTP Request`
   - Method: `POST`
   - URL: l'URL du build hook Netlify ci-dessus
   - HTTP Headers: `Content-Type: application/json` (optionnel)
   - Timeout: 5000 ms
4. Deuxième hook — même configuration pour `public.events`
   (Name: `netlify_rebuild_events`).

Netlify n'empile qu'un seul build en attente par site : même en cas
de publications multiples quasi-simultanées, un seul rebuild est
déclenché. Pas de debounce à écrire côté Supabase.

### Quand le prerender capture-t-il « prêt » ?

`src/pages/NewsArticlePage.tsx` et `src/pages/EventPage.tsx` passent
`prerenderReady={!loading && !!article}` (ou `!!event`) à `<SEO>`.
Puppeteer attend ce signal avant la capture — la page est
sérialisée avec son titre, sa description, sa canonical, son `<h1>`
et son contenu, pas pendant le spinner initial.

### Rollback

- Pour désactiver le prerender des dynamiques tout en gardant le
  sitemap dynamique : commenter l'appel `resolveDynamicRoutes()`
  dans `vite.config.ts`.
- Pour revenir à la phase 1 : annuler la PR phase 2. Les Database
  Webhooks restent inoffensifs (ils déclencheront un rebuild qui
  ne connaîtra plus les routes dynamiques).
