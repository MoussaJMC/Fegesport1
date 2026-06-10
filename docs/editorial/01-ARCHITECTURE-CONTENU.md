# PHASE 2 — Architecture editoriale FEGESPORT

> Cartographie hierarchique des 16 poles editoriaux.
> Objectif : couvrir l'integralite de l'univers semantique "esport + Guinee + Afrique" de facon structuree, cluster par cluster.

---

## Modele d'architecture : "Hub & Spoke" thematique

Chaque pole = un **HUB** (page pilier) + des **SPOKES** (articles satellites) interconnectes.

```
                  [ HOMEPAGE / Entite FEGESPORT ]
                              |
       ┌──────────────┬───────┴───────┬──────────────┐
       |              |               |              |
  [INSTITUTIONNEL] [COMPETITIONS] [COMMUNAUTE]  [CONNAISSANCE]
       |              |               |              |
   ...spokes      ...spokes        ...spokes      ...spokes
```

---

## 1. POLE INSTITUTIONNEL

**Hub principal :** `/about` (a enrichir) + nouvelle page pilier `/federation-guineenne-esport`

### Spokes :
- Histoire de la FEGESPORT (frise chronologique)
- Statuts officiels (page dediee)
- Bureau executif (CRUD admin existant)
- Gouvernance et reglementation
- Affiliations internationales (IESF, ACES, WESCO, GEF) — page par affiliation
- Rapport d'activite annuel (template repete chaque annee)
- Communiques officiels (sous /news avec tag "communique")

**Schema.org :** SportsOrganization, AboutPage, GovernmentService

---

## 2. POLE ACTUALITES (FEGESPORT)

**Hub principal :** `/news` (existant)

### Sous-categories a creer (tags news) :
- Communiques officiels
- Resultats de competitions
- Annonces de partenariats
- Tribunes et editoriaux
- Couverture mediatique
- Internationale (representation IESF/GEF)

**Rythme cible :** 1 article/semaine minimum = 52/an

**Schema.org :** NewsArticle, ItemList

---

## 3. POLE COMPETITIONS NATIONALES

**Hub principal :** `/competitions-esport-guinee` (NOUVELLE PAGE PILIER)

### Spokes :
- Saison LEG en cours (deja `/leg`)
- Coupe de Guinee d'esport (page dediee, schema SportsEvent)
- Championnats par discipline (FIFA Guinee, MLBB Guinee, Free Fire Guinee, etc.)
- Calendrier officiel (CRUD events existant)
- Reglements de competition (par discipline)
- Resultats et classements (cluster sous /events)
- Archives saisons precedentes

**Schema.org :** SportsEvent, EventSeries, SportsTeam

---

## 4. POLE COMPETITIONS INTERNATIONALES

**Hub principal :** Section sous `/competitions-esport-guinee` + page `/esport-international`

### Spokes :
- Coupe d'Afrique d'esport (ACES)
- IESF World Esports Championship
- Global Esports Games (GEF)
- Calendrier international suivi par FEGESPORT
- Selection nationale guineenne (Team Guinea)
- Resultats internationaux (par edition)
- Comment qualifier pour les internationales

**Schema.org :** SportsEvent, OrganizationRole

---

## 5. POLE ATHLETES GUINEENS

**Hub principal :** `/athletes-esport-guinee` (NOUVELLE PAGE PILIER)

### Structure :
- Annuaire des athletes officiellement enregistres
- Portrait individuel par athlete (template repete)
- Palmares
- Classements nationaux par discipline
- Interview (1/mois cible)
- Equipe nationale (Team Guinea)

**Rythme cible :** 12 portraits/an + 12 interviews/an

**Schema.org :** Person (avec affiliation a SportsOrganization), Article

---

## 6. POLE CLUBS ET EQUIPES

**Hub principal :** `/clubs-esport-guinee` (NOUVELLE PAGE PILIER)

### Spokes :
- Annuaire des clubs affilies (CRUD existant dans LEG)
- Carte interactive (par region/ville)
- Comment creer un club esport en Guinee (guide)
- Comment affilier son club a la FEGESPORT (procedure)
- Reglement des clubs
- Top clubs par discipline

**Schema.org :** SportsTeam, Place, HowTo

---

## 7. POLE ESPORT SCOLAIRE

**Hub principal :** `/esport-scolaire-guinee` (NOUVELLE PAGE PILIER)

### Spokes :
- Programme FEGESPORT dans les lycees
- Championnat inter-lycees
- Partenariats Ministere de l'Education
- Comment integrer l'esport dans son etablissement
- Valeurs educatives de l'esport
- Esport universitaire en Guinee

**Schema.org :** EducationalOrganization, EducationEvent

---

## 8. POLE GAMING RESPONSABLE

**Hub principal :** `/gaming-responsable-guinee` (NOUVELLE PAGE PILIER)

### Spokes :
- Gaming et sante (sommeil, posture, ecrans)
- Prevention de l'addiction
- Equilibre etudes / esport
- Parents et esport : guide
- Cyberharcelement et fair-play
- Hygiene de vie du joueur pro

**Schema.org :** MedicalWebPage, Article, FAQPage

---

## 9. POLE HISTOIRE DE L'ESPORT EN GUINEE

**Hub principal :** `/histoire-esport-guinee` (NOUVELLE PAGE PILIER)

### Spokes :
- Frise chronologique (2010-2026)
- Premiers tournois LAN a Conakry
- Annee 2023 : creation de la FEGESPORT
- Adhesion IESF, ACES, WESCO, GEF
- Premieres reconnaissances institutionnelles
- Pionniers de l'esport guineen

**Schema.org :** Article, Event (historique)

---

## 10. POLE JEUX OFFICIELS

**Hub principal :** Section sous `/leg` + pages dediees par jeu

### Spokes (1 page par discipline) :
- `/disciplines/fifa-ea-fc` — FIFA / EA FC
- `/disciplines/mobile-legends` — MLBB
- `/disciplines/free-fire` — Free Fire
- `/disciplines/pes-efootball` — PES / eFootball
- `/disciplines/tekken` — Tekken
- (toutes disciplines listees dans table `leg_disciplines`)

Chaque page : presentation du jeu, tournois FEGESPORT, reglement, top joueurs guineens, ressources.

**Schema.org :** VideoGame (Thing), Article

---

## 11. POLE FORMATION ET METIERS

**Hub principal :** `/metiers-esport-guinee` (NOUVELLE PAGE PILIER)

### Spokes :
- Joueur professionnel
- Coach esport
- Arbitre / referee
- Commentateur / shoutcaster
- Manager d'equipe
- Organisateur d'evenements esport
- Createur de contenu gaming
- Developpeur / metiers techniques
- Marketing esport

Chaque metier : formation, debouches, salaire indicatif, comment se former en Guinee.

**Schema.org :** Occupation, JobPosting (si offres), Course

---

## 12. POLE GOUVERNANCE ET REGLEMENTATION

**Hub principal :** Section sous `/about` + page `/reglementation-esport-guinee`

### Spokes :
- Cadre legal de l'esport en Guinee
- Statuts FEGESPORT (page dediee)
- Reglement disciplinaire
- Anti-cheat et fair-play
- Politique anti-dopage
- Code d'ethique
- Protection des mineurs

**Schema.org :** Legislation, GovernmentService, Article

---

## 13. POLE PARTENARIATS

**Hub principal :** `/partners` (a enrichir)

### Spokes :
- Page partenaire individuelle (storytelling)
- Pourquoi devenir partenaire FEGESPORT
- Plans de sponsoring (Bronze/Silver/Gold/Platinum)
- Etudes de cas (ROI partenaires)
- Partenariats institutionnels (Ministere, IESF, etc.)
- Comment proposer un partenariat

**Schema.org :** Organization, Service

---

## 14. POLE ESPORT AFRICAIN

**Hub principal :** `/esport-africain` (NOUVELLE PAGE PILIER)

### Spokes :
- Panorama de l'esport en Afrique de l'Ouest
- ACES (Africa Esports Confederation)
- Federations africaines homologues
- Tournois pan-africains
- Joueurs africains de niveau mondial
- Croissance du marche esport en Afrique
- La Guinee dans l'esport africain

**Schema.org :** Article, AboutPage, Place (region)

---

## 15. POLE FEMMES ET ESPORT

**Hub principal :** `/femmes-esport-guinee` (NOUVELLE PAGE PILIER)

### Spokes :
- Section feminine FEGESPORT
- Joueuses guineennes (portraits)
- Tournois feminins
- Initiatives d'inclusion
- Mentorat
- Comment encourager les filles a jouer

**Schema.org :** Article, Person, AboutPage

---

## 16. POLE JEUNESSE ET ESPORT

**Hub principal :** Page `/jeunesse-esport-guinee`

### Spokes :
- Esport et insertion professionnelle des jeunes
- Programmes FEGESPORT pour la jeunesse
- Bourses et opportunites
- Esport et entreprenariat
- Mentorat jeunes joueurs

**Schema.org :** Article, AboutPage, EducationalOccupationalProgram

---

## ⚙️ Connexions et maillage interne

### Regles de maillage (a implementer)

1. **Chaque article cite au minimum 2 pages piliers**
2. **Chaque page pilier cite 5+ articles satellites**
3. **Chaque portrait d'athlete pointe vers son club + sa discipline**
4. **Chaque page de discipline pointe vers la competition associee**
5. **Maillage transverse :** athletes ↔ clubs ↔ disciplines ↔ competitions

### Composant React reutilisable propose

`<RelatedContent type="pillar|article|athlete|discipline" tags={[...]} />`
qui se branche sur la table `news` ou une nouvelle table `editorial_content` pour suggerer 3-5 contenus pertinents.

---

## 📊 Synthese par pole

| # | Pole | Page pilier | Spokes prevus | Priorite |
|---|------|-------------|---------------|----------|
| 1 | Institutionnel | `/about` + `/federation-guineenne-esport` | 7 | 🔴 |
| 2 | Actualites | `/news` | 52/an | 🔴 |
| 3 | Competitions nationales | `/competitions-esport-guinee` | 8 | 🔴 |
| 4 | Competitions internationales | `/esport-international` | 7 | 🟠 |
| 5 | Athletes | `/athletes-esport-guinee` | 12+24/an | 🔴 |
| 6 | Clubs | `/clubs-esport-guinee` | 6 | 🟠 |
| 7 | Esport scolaire | `/esport-scolaire-guinee` | 6 | 🟠 |
| 8 | Gaming responsable | `/gaming-responsable-guinee` | 6 | 🟡 |
| 9 | Histoire | `/histoire-esport-guinee` | 6 | 🔴 |
| 10 | Jeux officiels | `/disciplines/*` | 1 par discipline | 🔴 |
| 11 | Metiers | `/metiers-esport-guinee` | 9 | 🟠 |
| 12 | Reglementation | `/reglementation-esport-guinee` | 7 | 🟠 |
| 13 | Partenariats | `/partners` enrichi | 6 | 🟠 |
| 14 | Esport africain | `/esport-africain` | 7 | 🔴 |
| 15 | Femmes | `/femmes-esport-guinee` | 6 | 🟠 |
| 16 | Jeunesse | `/jeunesse-esport-guinee` | 5 | 🟡 |

**TOTAL VOLUME EDITORIAL CIBLE A 12 MOIS : ~200 contenus**
