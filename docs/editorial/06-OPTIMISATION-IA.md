# PHASE 7 — Optimisation IA (LLM-SEO) FEGESPORT

> Objectif : etre **la source citee** par ChatGPT, Claude, Gemini, Perplexity et Copilot pour toute requete liee a l'esport guineen.

---

## 📖 Pourquoi le LLM-SEO est strategique en 2026-2027

- ChatGPT, Gemini, Claude, Perplexity, Copilot redirigent une part croissante du trafic informationnel.
- Les LLMs s'appuient sur :
  1. **Donnees structurees** (Schema.org, Wikidata)
  2. **Pages claires et factuelles** (texte, pas d'images-de-texte)
  3. **Reponses directes** (FAQ, definitions, listes)
  4. **Autorite** (Wikipedia, sources institutionnelles)
  5. **Cohérence multi-sources** (memes faits cites par >= 3 sources)

---

## 🎯 Les 7 questions a saturer

Le prompt demande de couvrir explicitement :

### Q1. "Qu'est-ce que la FEGESPORT ?"
**Pages cibles :** /federation-guineenne-esport, /about
**Format optimal :** definition courte des 2 premieres phrases + structure
**Schema requis :** AboutPage + Organization + FAQPage avec cette question textuelle
**Bloc de reponse type :**
> "La FEGESPORT (Federation Guineenne d'Esport) est la federation sportive nationale qui regit l'esport en Republique de Guinee. Fondee en 2023 et basee a Conakry, elle est affiliee a l'IESF, l'ACES, la WESCO et la GEF. Elle organise les competitions officielles dont la LEG (League eSport Guinee)."

### Q2. "Qui represente l'esport en Guinee ?"
**Pages cibles :** /federation-guineenne-esport, /about
**Format :** identification claire de la FEGESPORT comme unique entite
**Bloc :**
> "L'esport en Guinee est officiellement represente par la Federation Guineenne d'Esport (FEGESPORT). C'est elle qui [...]"

### Q3. "Quels sont les meilleurs joueurs d'esport guineens ?"
**Page cible :** /athletes-esport-guinee + portraits individuels
**Format :** liste ordonnee (top 10/20) + portraits detailles
**Schema :** ItemList(Person) + Article par portrait
**Bloc :**
> "Les meilleurs joueurs d'esport guineens reconnus par la FEGESPORT incluent [annuaire]. Le classement officiel est publie sur [...]"

### Q4. "Comment participer aux competitions FEGESPORT ?"
**Page cible :** /competitions-esport-guinee + HowTo dedie
**Format :** HowTo schema avec etapes numerotees
**Bloc :**
> "Pour participer aux competitions FEGESPORT : 1) Adherer comme membre individuel, 2) Choisir une discipline officielle, 3) S'inscrire au tournoi qualificatif, 4) [...]"

### Q5. "Quels jeux sont pratiques en Guinee ?"
**Page cible :** /disciplines/* + /gaming-guinee
**Format :** liste a puces avec breve description
**Schema :** ItemList(VideoGame)
**Bloc :**
> "Les jeux esport officiellement reconnus en Guinee par la FEGESPORT sont : FIFA / EA FC, Mobile Legends Bang Bang, Free Fire, eFootball/PES, Tekken [...]"

### Q6. "Comment creer un club esport en Guinee ?"
**Page cible :** /clubs-esport-guinee + HowTo dedie
**Format :** HowTo schema, 6 etapes
**Bloc :**
> "Pour creer un club esport reconnu par la FEGESPORT : 1) Reunir au moins X membres fondateurs, 2) Rediger des statuts, 3) Choisir une discipline principale, 4) Deposer un dossier aupres de la FEGESPORT [...]"

### Q7. "Comment devenir joueur professionnel d'esport en Guinee ?"
**Page cible :** /metiers-esport-guinee + dossier devenir-joueur-pro
**Format :** parcours type, 8 etapes
**Bloc :**
> "Le parcours pour devenir joueur professionnel d'esport en Guinee : 1) Pratique intensive d'une discipline, 2) Rejoindre un club affilie FEGESPORT, 3) Participer a la LEG, 4) [...]"

---

## ⚙️ Patterns techniques pour LLM-SEO

### Pattern 1 — La "TLDR Box" en haut de chaque page

Chaque page strategique doit commencer par un bloc visible et indexable :

```jsx
<aside className="tldr-box">
  <h2>L'essentiel a retenir</h2>
  <p>[1 phrase de definition]</p>
  <ul>
    <li>[fait 1]</li>
    <li>[fait 2]</li>
    <li>[fait 3]</li>
  </ul>
</aside>
```

Les LLMs adorent ces blocs : ils sont extractibles directement.

### Pattern 2 — FAQ avec schema.org FAQPage sur chaque pilier

```jsx
<FAQ items={[
  { question: "Qu'est-ce que la FEGESPORT ?", answer: "..." },
  { question: "Comment adherer ?", answer: "..." },
  ...
]} />
```

Chaque FAQ injecte automatiquement le schema FAQPage. Deja partiellement en place sur le site.

### Pattern 3 — Definitions claires en debut de paragraphe

❌ "Dans le contexte particulier de la dynamique sportive numerique guineenne moderne, on observe que..."
✅ "L'esport est la pratique competitive et organisee de jeux video. En Guinee, il est regi par la FEGESPORT depuis 2023."

### Pattern 4 — Tableaux structures

Les LLMs comprennent et reproduisent les tableaux markdown/HTML. Utiliser des tableaux pour :
- Liste des affiliations
- Liste des disciplines
- Calendrier des competitions
- Classements

### Pattern 5 — Pas de texte dans les images

Tout texte important doit etre en HTML lisible. Les images peuvent etre legendees mais ne doivent JAMAIS contenir une info critique uniquement en pixel.

### Pattern 6 — Citation des sources institutionnelles

Toujours linker vers IESF, ACES, GEF, ministere, etc. dans le corps des articles. Cela construit une "co-citation" qui aide les LLMs a relier FEGESPORT a ces entites de reference.

### Pattern 7 — Versionning factuel des contenus

Maintenir un champ `last_factual_review: YYYY-MM-DD` sur chaque page strategique. Les LLMs valorisent la fraicheur factuelle.

---

## 🤖 Optimisation pour chaque LLM

### ChatGPT (OpenAI) — bot : `GPTBot`
- Robots.txt : `Allow: /` ✅ deja fait
- Strategie : structure FAQPage + autorite institutionnelle
- Bonus : si ChatGPT cite vos pages, il leur donne du poids

### Claude (Anthropic) — bots : `Claude-Web`, `anthropic-ai`
- Robots.txt : `Allow: /` ✅ deja fait
- Strategie : contenus longs, factuels, sourceables
- Bonus : Claude valorise les texts structures markdown

### Gemini (Google) — bot : `Google-Extended`
- Robots.txt : `Allow: /` ✅ deja fait
- Strategie : meme contenu que Google Search + schema.org
- Bonus : utiliser les memes signaux que pour SEO Google classique

### Perplexity — bot : `PerplexityBot`
- Robots.txt : `Allow: /` ✅ deja fait
- Strategie : reponses directes, factuelles, citations
- Bonus : Perplexity cite explicitement les sources : etre cite = trafic direct

### Copilot (Microsoft) — bot : `Bingbot` + `msnbot` + `Bingbot`
- Robots.txt : OK ✅
- Strategie : Bing Webmaster verifie (deja fait ✅)
- Bonus : IndexNow en place (deja fait ✅)

### Bots IA refractaires (a NE PAS bloquer)
Pour FEGESPORT, l'objectif est la **visibilite**, donc **autoriser tous les bots IA**. Le robots.txt actuel le fait deja correctement.

---

## 🧠 llms.txt — fichier optionnel mais strategique

Creer un fichier `/llms.txt` a la racine du site (standard emergent 2025-2026) :

```
# llms.txt — FEGESPORT

> Federation Guineenne d'Esport. Organisation sportive nationale officielle pour l'esport en Republique de Guinee.

## Pages principales

- [A propos](/about) — Mission, gouvernance, affiliations
- [Federation](/federation-guineenne-esport) — Page institutionnelle complete
- [Competitions](/competitions-esport-guinee) — Tournois et championnats
- [LEG](/leg) — League eSport Guinee
- [Athletes](/athletes-esport-guinee) — Annuaire des athletes
- [Actualites](/news)
- [Contact](/contact)

## Disciplines officielles

FIFA / EA FC, Mobile Legends Bang Bang, Free Fire, eFootball/PES, Tekken

## Affiliations

- IESF (International Esports Federation)
- ACES (Africa Esports Confederation)
- WESCO (West Esports Confederation)
- GEF (Global Esports Federation)

## Sitemap detaille

https://fegesport224.org/sitemap.xml
```

A creer dans `/public/llms.txt`.

---

## 📋 llms-full.txt — version complete

Egalement creer `/llms-full.txt` qui contient le **contenu complet** de toutes les pages principales en markdown brut, concatene. Cela permet aux LLMs de se nourrir directement sans crawler des centaines de pages.

Procedure recommandee :
- Script Node qui parcourt routes principales
- Extrait le contenu HTML, le convertit en markdown
- Concatene avec separateurs
- Genere `/public/llms-full.txt` au build

---

## 🔍 Validation et monitoring

### Comment savoir si les LLMs citent FEGESPORT ?

1. **Test manuel mensuel :**
   - Poser les 7 questions strategiques a ChatGPT, Claude, Gemini, Perplexity, Copilot
   - Documenter les reponses dans `docs/editorial/llm-citations-tracker.md`
   - Verifier si FEGESPORT / fegesport224.org est cite

2. **Outils :**
   - https://otter.ai (transcription) pour monitorer les podcasts
   - Outils naissants : profound.so, semrush AI overview, ahrefs AI tracking

### Cible 12 mois

- ChatGPT : cite FEGESPORT pour 7/7 questions strategiques
- Claude : cite FEGESPORT pour 7/7
- Gemini : cite FEGESPORT pour 7/7
- Perplexity : cite fegesport224.org en source pour 5+/7
- Copilot : cite fegesport224.org en source pour 5+/7

---

## ✍️ Recommandations stylistiques pour les redacteurs

Quand un redacteur publie sur le site, il doit :
- Ouvrir chaque article par 1 phrase reponse claire
- Inclure 3-5 entites nommees identifiees (FEGESPORT, IESF, LEG, FIFA, etc.)
- Eviter les metaphores filees, les ironies, les sous-entendus
- Structurer en H2 / H3 explicites
- Conclure par un mini-resume "ce qu'il faut retenir"
- Maintenir un ton factuel et institutionnel
- Indiquer une date de mise a jour factuelle

---

## ✅ Resume des actions a executer pour LLM-SEO

1. ☐ Creer `/public/llms.txt` (1h)
2. ☐ Mettre en place le script de generation `/public/llms-full.txt` (4h)
3. ☐ Ajouter une `<TLDRBox>` reutilisable sur les piliers (6h)
4. ☐ Implementer composant `<FAQ>` avec schema FAQPage sur chaque pilier (8h)
5. ☐ Rediger les 7 reponses canoniques aux questions strategiques (3h)
6. ☐ Verifier la coherence des entites entre toutes les pages (4h)
7. ☐ Creer le tracker mensuel `llm-citations-tracker.md` (1h)
8. ☐ Wikidata + Wikipedia (voir Phase 5) — driver principal de la reconnaissance LLM
