# PHASE 4 — Pages piliers FEGESPORT (specifications completes)

> 8 pages piliers a creer comme "documents de reference nationale".
> Objectif : chaque page = 2000 a 4000 mots, autorite definitive sur sa requete cible.

---

## 🏛️ Pilier 1 — /esport-guinee

**URL :** `https://fegesport224.org/esport-guinee`
**Mot-cle principal :** `esport guinee`
**Mots-cles secondaires :** electronic sports guinea, jeux video competitifs guinee, esport en Guinee
**Volume cible :** 4000 mots
**Intention :** informationnelle dominante
**Schema.org :** Article + AboutPage + FAQPage

### Structure recommandee

```
1. Definition : qu'est-ce que l'esport en Guinee ? (300 mots)
2. Histoire de l'esport guineen (frise 2010-2026) (500 mots)
3. La FEGESPORT : federation officielle reconnue (400 mots)
4. Les disciplines pratiquees en Guinee (FIFA, MLBB, Free Fire, etc.) (600 mots)
5. Les competitions nationales (LEG, Coupe de Guinee, etc.) (500 mots)
6. Les acteurs : athletes, clubs, joueurs pro (400 mots)
7. L'esport guineen sur la scene internationale (IESF, ACES, GEF) (400 mots)
8. Comment participer a l'esport en Guinee (guide) (400 mots)
9. Esport et jeunesse, education, gaming responsable (300 mots)
10. FAQ : 10 questions essentielles (300 mots)
```

### Maillage interne (sortant)
- /about, /leg, /news, /events, /membership, /athletes-esport-guinee, /clubs-esport-guinee, /histoire-esport-guinee, /femmes-esport-guinee

### Maillage entrant attendu
- Lien depuis la HomePage (sticky)
- Lien depuis le footer
- Cite dans tous les articles "actualite"

---

## 🏛️ Pilier 2 — /federation-guineenne-esport

**URL :** `https://fegesport224.org/federation-guineenne-esport`
**Mot-cle principal :** `federation guineenne d'esport`
**Mots-cles secondaires :** FEGESPORT, federation esport Guinee, federation officielle esport
**Volume cible :** 3500 mots
**Schema.org :** AboutPage + SportsOrganization + FAQPage

### Structure
1. Presentation officielle de la FEGESPORT (500)
2. Mission, vision, valeurs (400)
3. Date de creation, statut juridique (300)
4. Bureau executif et gouvernance (CRUD existant integre) (400)
5. Affiliations : IESF, ACES, WESCO, GEF (700)
6. Realisations cle (chiffres + jalons) (400)
7. Strategie 2025-2030 (300)
8. Comment travailler avec la FEGESPORT (partenariats, sponsoring) (300)
9. FAQ institutionnelle (200)

### Schema special
```json
{
  "@type": "SportsOrganization",
  "name": "Federation Guineenne d'Esport",
  "alternateName": ["FEGESPORT", "Federation Guineenne d Esport"],
  "url": "https://fegesport224.org",
  "logo": "https://...logo...jpg",
  "foundingDate": "2023",
  "memberOf": [
    {"@type":"SportsOrganization","name":"International Esports Federation (IESF)"},
    {"@type":"SportsOrganization","name":"Africa Esports Confederation (ACES)"},
    {"@type":"SportsOrganization","name":"West Esports Confederation (WESCO)"},
    {"@type":"SportsOrganization","name":"Global Esports Federation (GEF)"}
  ]
}
```

---

## 🏛️ Pilier 3 — /athletes-esport-guinee

**URL :** `https://fegesport224.org/athletes-esport-guinee`
**Mot-cle principal :** `athletes esport guinee`
**Mots-cles secondaires :** joueurs esport Guinee, pro gamers guineens, joueurs guineens
**Volume cible :** 3000 mots + annuaire dynamique
**Schema.org :** CollectionPage + ItemList(Person)

### Structure
1. Definition : qu'est-ce qu'un athlete esport en Guinee (400)
2. Comment devenir athlete affilie FEGESPORT (procedure) (400)
3. Annuaire des athletes affilies (composant dynamique alimente par Supabase) (variable)
4. Classements nationaux par discipline (table dynamique) (variable)
5. Team Guinea : la selection nationale (500)
6. Palmares national et international (400)
7. Carriere : du joueur amateur au pro (500)
8. Soutien FEGESPORT aux athletes (400)
9. Devenir athlete pro : ressources et formation (400)

### Composant React requis
`<AthletesDirectory />` : filtres par discipline, region, niveau. Lis depuis nouvelle table `athletes`.

---

## 🏛️ Pilier 4 — /competitions-esport-guinee

**URL :** `https://fegesport224.org/competitions-esport-guinee`
**Mot-cle principal :** `competitions esport guinee`
**Mots-cles secondaires :** tournoi esport Guinee, LEG, championnat esport Conakry
**Volume cible :** 3500 mots
**Schema.org :** CollectionPage + ItemList(SportsEvent)

### Structure
1. Panorama des competitions FEGESPORT (400)
2. LEG : la League eSport Guinee (lien vers /leg + resume) (500)
3. Coupe de Guinee d'esport (400)
4. Championnats par discipline (FIFA, MLBB, Free Fire, etc.) (700)
5. Tournois open et amateurs (300)
6. Comment s'inscrire a une competition (guide) (400)
7. Reglement general des competitions (300)
8. Calendrier annuel des competitions (composant dynamique) (variable)
9. Resultats et archives (lien vers /events) (200)
10. Devenir organisateur de tournoi reconnu FEGESPORT (300)

---

## 🏛️ Pilier 5 — /esport-africain

**URL :** `https://fegesport224.org/esport-africain`
**Mot-cle principal :** `esport africain`
**Mots-cles secondaires :** esport Afrique, federation esport Afrique, electronic sports africa
**Volume cible :** 3500 mots
**Schema.org :** Article + AboutPage

### Structure
1. Etat de l'esport en Afrique en 2026 (500)
2. ACES — Africa Esports Confederation (500)
3. Federations nationales africaines (panorama) (700)
4. Joueurs africains de niveau mondial (400)
5. Tournois pan-africains majeurs (500)
6. Place de la Guinee dans l'esport africain (500)
7. Croissance du marche esport africain (300)
8. Defis et opportunites (cybersecurite, infrastructure, sponsoring) (300)

### Audience cible
SEO panafricain : positionner FEGESPORT sur les requetes regionales.

---

## 🏛️ Pilier 6 — /esport-scolaire-guinee

**URL :** `https://fegesport224.org/esport-scolaire-guinee`
**Mot-cle principal :** `esport scolaire guinee`
**Mots-cles secondaires :** esport lycee, gaming etudes, esport universite Guinee
**Volume cible :** 2500 mots
**Schema.org :** Article + EducationalOrganization

### Structure
1. Le programme esport scolaire FEGESPORT (400)
2. Etablissements partenaires (liste evolutive) (300)
3. Championnat inter-lycees (400)
4. Valeurs educatives de l'esport (cognitif, social, professionnel) (400)
5. Comment integrer l'esport dans son etablissement (HowTo) (400)
6. Partenariat avec le Ministere de l'Education (300)
7. Esport universitaire (300)

### Audience cible
Etablissements scolaires, parents, ministere.

---

## 🏛️ Pilier 7 — /gaming-guinee

**URL :** `https://fegesport224.org/gaming-guinee`
**Mot-cle principal :** `gaming guinee`
**Mots-cles secondaires :** jeux video Guinee, gaming Conakry, communaute gaming
**Volume cible :** 3000 mots
**Schema.org :** Article + AboutPage

### Structure
1. La culture gaming en Guinee (500)
2. Communautes locales (Conakry, Kankan, N'Zerekore...) (500)
3. Salles de gaming et cybercafes esport (300)
4. Top jeux pratiques en Guinee (statistiques officielles FEGESPORT) (500)
5. Materiel et infrastructure : etat des lieux (300)
6. Gaming responsable et sante (400)
7. Comment rejoindre la communaute gaming guineenne (300)
8. Difference entre gaming et esport (200)

---

## 🏛️ Pilier 8 — /histoire-esport-guinee

**URL :** `https://fegesport224.org/histoire-esport-guinee`
**Mot-cle principal :** `histoire esport guinee`
**Mots-cles secondaires :** debut esport Guinee, origines esport Conakry, fegesport creation
**Volume cible :** 3000 mots
**Schema.org :** Article + Timeline

### Structure
1. Avant 2015 : les debuts informels (300)
2. 2015-2020 : emergence des premieres communautes (400)
3. 2020-2023 : structuration vers une federation (500)
4. 2023 : creation officielle de la FEGESPORT (500)
5. 2024-2025 : reconnaissance institutionnelle (IESF, ACES) (500)
6. 2026 : strategie nationale d'esport (300)
7. Frise chronologique interactive (composant React) (200)
8. Pionniers et figures historiques (300)

### Composant requis
`<EsportTimeline />` : frise chronologique animee, alimentee depuis table `historical_events`.

---

## 🎯 Bonus : pages utilitaires connexes

Ces pages ne sont pas dans les 8 piliers strategiques mais alimentent l'autorite thematique.

| URL | Type | Volume | Schema |
|-----|------|--------|--------|
| `/faq-esport-guinee` | FAQ | 2000 mots | FAQPage |
| `/glossaire-esport` | Glossaire | 3000 mots | DefinedTermSet |
| `/clubs-esport-guinee` | Annuaire | 2500 mots | CollectionPage |
| `/femmes-esport-guinee` | Pilier feminin | 2500 mots | Article |
| `/metiers-esport-guinee` | Pilier metiers | 3000 mots | Occupation[] |
| `/gaming-responsable-guinee` | Sante | 2500 mots | MedicalWebPage |

---

## 🛠️ Implementation technique

### Routes a creer dans React Router

```tsx
// src/routes.tsx (extrait)
<Route path="/esport-guinee" element={<PillarEsportGuinee />} />
<Route path="/federation-guineenne-esport" element={<PillarFederation />} />
<Route path="/athletes-esport-guinee" element={<PillarAthletes />} />
<Route path="/competitions-esport-guinee" element={<PillarCompetitions />} />
<Route path="/esport-africain" element={<PillarAfrique />} />
<Route path="/esport-scolaire-guinee" element={<PillarScolaire />} />
<Route path="/gaming-guinee" element={<PillarGaming />} />
<Route path="/histoire-esport-guinee" element={<PillarHistoire />} />

// pages utilitaires
<Route path="/faq-esport-guinee" element={<FAQPage />} />
<Route path="/glossaire-esport" element={<GlossaryPage />} />
<Route path="/clubs-esport-guinee" element={<ClubsDirectory />} />
<Route path="/femmes-esport-guinee" element={<FemmesPage />} />
<Route path="/metiers-esport-guinee" element={<MetiersPage />} />
<Route path="/gaming-responsable-guinee" element={<GamingResponsable />} />
```

### Composant pilier reutilisable

`<PillarPageLayout>` :
- Hero avec titre H1 (mot-cle principal)
- Sommaire ancres (TOC)
- 8 a 10 sections H2
- Composants dynamiques imbriquables (annuaire, frise, tableau)
- Bloc "Articles lies" (3-5)
- Bloc CTA (adhesion, contact)
- Schema.org injecte via composant SEO

### Sitemap

Ajouter les 14 nouvelles URLs (8 piliers + 6 utilitaires) au `sitemap.xml`.

---

## 📊 KPI par pilier (cibles 12 mois)

| Pilier | Position cible Google | Trafic mensuel cible | Backlinks acquis |
|--------|------------------------|----------------------|-------------------|
| /esport-guinee | Top 3 sur "esport guinee" | 2000 | 15 |
| /federation-guineenne-esport | Top 1 sur "fegesport" | 3000 | 25 |
| /athletes-esport-guinee | Top 3 | 1500 | 10 |
| /competitions-esport-guinee | Top 3 | 2500 | 15 |
| /esport-africain | Top 10 | 1000 | 8 |
| /esport-scolaire-guinee | Top 5 | 800 | 12 |
| /gaming-guinee | Top 5 | 1500 | 10 |
| /histoire-esport-guinee | Top 3 | 1000 | 8 |

**Trafic organique cumule cible : ~13 300 visites/mois venant des seuls piliers (en M12)**
