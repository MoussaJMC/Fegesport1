# PHASE 5 — Knowledge Graph FEGESPORT

> Objectif : forger l'entite "FEGESPORT" comme une **entite reconnue** par les systemes de Knowledge Graph (Google, Bing, Wikidata, LLMs).
> Resultat attendu : panel Google Knowledge a droite des SERPs, citations dans Wikipedia, reconnaissance par ChatGPT/Claude/Gemini/Perplexity.

---

## 1. Etat des lieux de l'entite

| Source | Statut | Action |
|--------|--------|--------|
| Google Knowledge Graph | Non present | A construire via signal d'autorite |
| Wikipedia FR | Non present | A creer (apres atteinte criteres notoriete) |
| Wikipedia EN | Non present | A traduire ensuite |
| Wikidata | Non present | A creer en priorite (entree pour Google) |
| Schema.org sur site | ✅ Present (SportsOrganization) | OK |
| LinkedIn Org | A verifier | A optimiser |
| YouTube channel | A creer | A creer |
| ChatGPT/Claude/Gemini reconnaissance | Aleatoire | A renforcer via contenus structures |

---

## 2. Donnees d'entite a publier (factuelles)

> **REGLE :** chaque element ci-dessous doit etre **factuellement verifiable** avant publication.

### Identite

```yaml
nom_officiel: Federation Guineenne d'Esport
acronyme: FEGESPORT
nom_alternatif_en: Guinean Esports Federation
date_creation: 2023  # a confirmer avec la federation
forme_juridique: Federation sportive nationale
pays: Guinee
ville_siege: Conakry
site_officiel: https://fegesport224.org
email_officiel: contact@fegesport224.org  # a confirmer
langues: francais, anglais
logo_url: https://geozovninpeqsgtzwchu.supabase.co/.../logo.jpg
```

### Mission

```yaml
mission: "Promouvoir, encadrer et developper l'esport en Guinee, representer la Guinee sur la scene internationale de l'esport."
objectifs:
  - Reconnaissance officielle de l'esport
  - Structuration des athletes et clubs
  - Organisation de competitions nationales (LEG)
  - Representation internationale
  - Education et gaming responsable
```

### Gouvernance

```yaml
president: # nom officiel a confirmer aupres de la federation
bureau_executif: 20+ membres (geres via /admin/leadership)
assemblee_generale: annuelle
mandat: 4 ans
```

### Affiliations internationales

```yaml
affiliations:
  - nom: International Esports Federation (IESF)
    site: https://iesf.org
    statut: membre
  - nom: Africa Esports Confederation (ACES)
    statut: membre fondateur
  - nom: West Esports Confederation (WESCO)
    statut: membre fondateur
  - nom: Global Esports Federation (GEF)
    statut: membre
```

### Competitions organisees

```yaml
competitions:
  - LEG — League eSport Guinee (annuelle)
  - Coupe de Guinee d'esport
  - Championnats par discipline
  - Tournois feminins
  - Tournois scolaires
```

### Disciplines reconnues

```yaml
disciplines:
  - FIFA / EA FC
  - Mobile Legends Bang Bang (MLBB)
  - Free Fire
  - eFootball / PES
  - Tekken
  # (a completer avec la liste exacte en base leg_disciplines)
```

---

## 3. Schema.org JSON-LD enrichi (a injecter sur /federation-guineenne-esport et /about)

```json
{
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  "@id": "https://fegesport224.org/#organization",
  "name": "Federation Guineenne d'Esport",
  "alternateName": ["FEGESPORT", "Federation Guineenne d Esport", "Guinean Esports Federation"],
  "url": "https://fegesport224.org",
  "logo": {
    "@type": "ImageObject",
    "url": "https://fegesport224.org/og-image.jpg",
    "width": 1200,
    "height": 630
  },
  "image": "https://fegesport224.org/og-image.jpg",
  "description": "Federation officielle representant l'esport en Republique de Guinee. Affiliee IESF, ACES, WESCO, GEF.",
  "foundingDate": "2023",
  "foundingLocation": {
    "@type": "Place",
    "name": "Conakry, Guinee"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "GN",
    "addressLocality": "Conakry"
  },
  "sport": ["Esports", "Electronic Sports", "Competitive Gaming"],
  "memberOf": [
    {
      "@type": "SportsOrganization",
      "name": "International Esports Federation",
      "alternateName": "IESF",
      "url": "https://iesf.org"
    },
    {
      "@type": "SportsOrganization",
      "name": "Africa Esports Confederation",
      "alternateName": "ACES"
    },
    {
      "@type": "SportsOrganization",
      "name": "West Esports Confederation",
      "alternateName": "WESCO"
    },
    {
      "@type": "SportsOrganization",
      "name": "Global Esports Federation",
      "alternateName": "GEF"
    }
  ],
  "sameAs": [
    "https://www.facebook.com/fegesport",
    "https://twitter.com/fegesport",
    "https://www.linkedin.com/company/fegesport",
    "https://www.youtube.com/@fegesport",
    "https://www.instagram.com/fegesport",
    "https://www.wikidata.org/wiki/Q-FEGESPORT-A-CREER"
  ],
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "contactType": "general",
      "email": "contact@fegesport224.org",
      "availableLanguage": ["French", "English"]
    },
    {
      "@type": "ContactPoint",
      "contactType": "press",
      "email": "press@fegesport224.org"
    }
  ],
  "knowsLanguage": ["fr", "en"],
  "areaServed": {
    "@type": "Country",
    "name": "Guinea"
  }
}
```

---

## 4. Wikidata — creation prioritaire

**Pourquoi :** Wikidata alimente Google Knowledge Graph et est la principale source d'entrees pour les LLMs.

### Procedure

1. Creer un compte sur https://www.wikidata.org
2. Creer un nouvel element : "Federation Guineenne d'Esport"
3. Renseigner les declarations factuelles :
   - **P31** (nature) : organisation sportive
   - **P17** (pays) : Guinee
   - **P159** (siege) : Conakry
   - **P571** (date de fondation) : 2023
   - **P856** (site officiel) : https://fegesport224.org
   - **P361** (fait partie de) : IESF, ACES, GEF
   - **P641** (sport) : esport / sport electronique
   - **P1813** (nom court) : FEGESPORT
   - **P407** (langue) : francais, anglais

4. Ajouter des references (citations) : pages /about, /federation-guineenne-esport, articles de presse externes.

**Apres validation Wikidata (10-30 jours), Google commence a indexer l'entite.**

---

## 5. Wikipedia — strategie

### Criteres de notoriete Wikipedia FR

Pour qu'un article FEGESPORT survive sur Wikipedia :
- Avoir ete cite dans **au moins 3 sources independantes secondaires** (presse nationale, presse esport reconnue)
- Couverture mediatique significative dans la duree (pas juste 1 article)
- Reconnaissance institutionnelle (IESF, ministere, etc.)

### Strategie 12 mois

1. **M1-M3 :** Acquerir 5-10 mentions presse independantes (RTG, presse nationale guineenne, presse esport africaine)
2. **M4-M6 :** Brouillon Wikipedia FR retenu en "atelier"
3. **M7-M9 :** Soumission a la communaute Wikipedia
4. **M10-M12 :** Article publie + traduction EN

### Contenu type article Wikipedia (a preparer)

```
Federation Guineenne d'Esport
=============================

La Federation Guineenne d'Esport (FEGESPORT) est l'organisation
sportive nationale qui regit l'esport en Republique de Guinee.

Histoire
--------
[paragraphe factuel sourcage]

Gouvernance
-----------
[bureau executif sourcage]

Affiliations
------------
La FEGESPORT est membre de l'IESF<ref/>, de l'ACES<ref/>, de la WESCO<ref/>
et de la GEF<ref/>.

Competitions
------------
[LEG, Coupe de Guinee, sourcage]

Voir aussi
----------
* IESF
* ACES
* Esport en Afrique

Liens externes
--------------
* Site officiel: https://fegesport224.org
```

**Ne pas auto-publier en tant que FEGESPORT** : risque de conflit d'interet. Demander a un wikipedien benevole ou contributeur reconnu (relations presse).

---

## 6. Profils satellites essentiels (sameAs pour Knowledge Graph)

| Profil | Statut a creer | Priorite |
|--------|----------------|----------|
| **LinkedIn Organization** | A optimiser/creer | 🔴 |
| **YouTube Channel** | A creer | 🔴 |
| **Facebook Page officielle** | A verifier | 🟠 |
| **Twitter/X officiel** | A verifier | 🟠 |
| **Instagram officiel** | A verifier | 🟠 |
| **TikTok officiel** | A creer | 🟡 |
| **Wikidata** | A creer | 🔴 |
| **Crunchbase** | A creer | 🟠 |
| **Google Business Profile** | A creer (siege Conakry) | 🔴 |

**Toutes ces URLs doivent figurer dans le tableau `sameAs` du schema.org SportsOrganization.**

---

## 7. Knowledge Panel Google — checklist

Pour declencher l'apparition d'un panneau Knowledge Graph FEGESPORT a droite des SERPs :

- [ ] Entite presente sur Wikidata avec >= 8 declarations
- [ ] Site officiel verifie dans Google Search Console (deja fait ✅)
- [ ] Schema.org SportsOrganization deploye (deja fait ✅)
- [ ] Logo carre haute resolution disponible sur le site
- [ ] >= 5 profils sociaux officiels lies par `sameAs`
- [ ] Citations externes coherentes (memes nom, logo, mission partout)
- [ ] Google Business Profile pour le siege a Conakry
- [ ] Au moins 3 articles de presse independants mentionnent FEGESPORT
- [ ] Trafic organique direct sur recherches "fegesport" suffisant (> 100/mois)

**Delai realiste pour apparaitre : 6-9 mois apres mise en place.**

---

## 8. Entites liees a renforcer

Pour batir le graphe semantique autour de FEGESPORT, citer/lier ces entites dans nos contenus :

| Entite | Type | Action |
|--------|------|--------|
| IESF | Organisation | Liens externes vers iesf.org, page dediee /partenaires-internationaux |
| ACES | Organisation | Idem |
| GEF | Organisation | Idem |
| Conakry | Lieu | Schema Place + mentions geo |
| Guinea | Pays | hreflang fr-GN deja en place |
| Esport / Electronic sports | Concept | Page glossaire |
| FIFA (jeu), MLBB, Free Fire | Things (VideoGame) | Pages disciplines |
| Ministere Jeunesse et Sports Guinee | GovOrg | Citation + lien |

---

## 9. Resultat attendu sous 12 mois

✅ Entite Wikidata creee et validee
✅ Article Wikipedia FR publie
✅ Panneau Knowledge Graph Google active sur "FEGESPORT"
✅ Reconnaissance par ChatGPT/Claude/Gemini sur "Qui est FEGESPORT"
✅ 10+ profils satellites coherents
✅ 20+ citations presse independantes
✅ Trafic direct "fegesport" : 500+/mois
