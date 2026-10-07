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

## Phase 2 (PR séparée)

- Génération d'un sitemap dynamique au build à partir de Supabase
  (articles publiés + événements actifs).
- Prerender des `/news/:id` et `/events/:id` correspondant.
- Build hook Netlify déclenché par un trigger Supabase à chaque
  publication.

À ne pas démarrer tant que cette phase 1 n'est pas stable en prod.
