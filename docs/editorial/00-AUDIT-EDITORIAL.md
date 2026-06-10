# PHASE 1 — Audit editorial FEGESPORT

> Date : 2026-06-10
> Perimetre : https://fegesport224.org
> Methode : analyse des routes React + tables Supabase + sitemap.xml + couverture des intentions de recherche.

---

## 1. Pages existantes (inventaire)

| Route | Page React | Statut editorial | Profondeur SEO actuelle |
|-------|-----------|------------------|--------------------------|
| `/` | HomePage | Hub | Forte (mais survol) |
| `/about` | AboutPage | Institutionnel | Moyenne |
| `/news` | NewsPage | Liste actualites | Forte (alimentee) |
| `/news/:slug` | NewsArticlePage | Article individuel | Variable |
| `/events` | EventsListPage | Liste evenements | Moyenne |
| `/events/:id` | EventPage | Evenement detail | Faible |
| `/membership` | MembershipPage | Adhesion | Moyenne |
| `/membership/community` | CommunityPage | Communaute | Moyenne |
| `/membership/card` | CardPage | Carte de membre | Faible |
| `/leg` | LEGPage | League eSport Guinee | Forte |
| `/partners` | PartnersPage | Partenaires | Faible |
| `/resources` | ResourcesPage | Documents | Faible |
| `/contact` | ContactPage | Contact | Moyenne |
| `/direct` | DirectPage | Live streams | Tres faible |
| `/press-kit` | PressKitPage | Kit presse | Moyenne |
| `/privacy`, `/terms` | Legal | Legal | NA |

**Total : 14 routes publiques indexables**

---

## 2. Thematiques actuellement couvertes

- Institution (qui sommes-nous, mission, gouvernance)
- Adhesion membres
- Actualites (avec backend admin)
- League eSport Guinee (LEG)
- Disciplines officielles
- Contact / Direct streaming
- Documents officiels (statuts, reglements)

## 3. Thematiques NON COUVERTES (gaps critiques)

| Thematique manquante | Volume recherche estime (FR-GN/Afrique) | Priorite |
|----------------------|------------------------------------------|----------|
| Athletes guineens (portraits, palmares) | Eleve | 🔴 |
| Histoire de l'esport en Guinee | Moyen | 🔴 |
| Clubs / equipes esport locales | Eleve | 🔴 |
| Esport scolaire et universitaire | Faible mais strategique | 🟠 |
| Femmes dans l'esport | Moyen, en croissance | 🔴 |
| Gaming responsable / sante | Moyen | 🟠 |
| Metiers de l'esport | Eleve | 🟠 |
| Esport africain (panorama) | Moyen | 🟠 |
| Compétitions internationales (panorama) | Moyen | 🟠 |
| Reglementation / gouvernance | Faible mais autoritatif | 🔴 |
| Guides "comment faire" (creer un club, devenir joueur pro) | Tres eleve | 🔴 |
| Glossaire / FAQ | Tres eleve (LLM friendly) | 🔴 |

---

## 4. Intentions de recherche non couvertes

### Informationnelles (le pilier perdu)
- "qu'est-ce que la fegesport"
- "qu'est-ce que l'esport en Guinee"
- "histoire de l'esport en Guinee"
- "qui dirige l'esport en Guinee"
- "fegesport partenaires"
- "fegesport IESF" / "fegesport affiliation"

### Transactionnelles
- "comment adherer FEGESPORT" (couvert partiellement)
- "comment creer un club esport en Guinee"
- "comment participer competition esport Guinee"
- "comment devenir joueur pro esport Guinee"

### Locales
- "tournoi esport Conakry"
- "club esport Conakry / Kankan / N'Zerekore"
- "esport [region]" pour chaque region administrative

### Navigationnelles
- "fegesport actualites"
- "fegesport leg"
- "fegesport contact"

### LLM-direct
- "Qui est le president de la FEGESPORT ?"
- "La Guinee a-t-elle une federation esport reconnue ?"
- "Quels jeux sont officiels en Guinee ?"

---

## 5. Pages a enrichir (existantes mais sous-exploitees)

| Page | Probleme | Action recommandee |
|------|----------|---------------------|
| `/about` | Trop concis, peu de mots | Etendre a 2500 mots, ajouter section "Notre histoire" + frise chronologique |
| `/partners` | Liste froide | Storytelling par partenaire + section "Devenir partenaire" |
| `/resources` | Documents bruts | Resumer chaque document avec contexte, schema NewsArticle ou WebPage |
| `/direct` | Page vide hors live | Rediger un guide "Comment regarder l'esport guineen en direct" |
| `/events/:id` | Evenement detail | Template enrichi : reglement, jeux, prizepool, partenaires, schema SportsEvent (deja en place) |
| `/membership/card` | Page transactionnelle pure | Ajouter FAQ + temoignages membres |

---

## 6. Concurrents directs (audit)

Sur les requetes cibles :
- **"esport guinee"** : aucun concurrent fort, opportunite N°1
- **"esport afrique"** : AESF, Esports Insider, Africa Esports Times
- **"federation esport"** : IESF (international), federations nationales (FRA, SEN, MAR)
- **"gaming guinee"** : pages Facebook, groupes WhatsApp, pas de site autoritatif

**Conclusion :** la position dominante sur le couple "esport + Guinee" est libre. FEGESPORT peut devenir la reference incontestee en 6 a 12 mois avec un effort editorial soutenu.

---

## 7. Indicateurs initiaux (baseline)

A mesurer dans GA4 + Search Console une fois actifs :

- Pages indexees : ~14 (cible 90 jours : 50+, cible 12 mois : 150+)
- Mots-cles positionnes : a determiner
- Backlinks : a determiner (objectif 12 mois : 50+ liens institutionnels)
- Authority Score : N/A (objectif 12 mois : DA 25+)
- Volume de trafic organique : baseline a etablir

---

## 8. Forces editoriales existantes

- Schema.org JSON-LD complet (SportsOrganization, NewsArticle, etc.)
- Backend Supabase deja en place pour news/events/disciplines
- Architecture bilingue FR/EN deja deployee
- Brand identite forte (fed-red, fed-gold, dark theme)
- Reconnaissance institutionnelle (IESF, ACES, WESCO, GEF)
- Admin panel mature pour publier sans developpeur

---

## 9. Faiblesses editoriales

- Volume de contenu insuffisant (< 50 000 mots total estime)
- Absence de pages piliers thematiques
- Pas de FAQ dediee
- Pas de glossaire
- Pas de blog/dossier de fond
- Pages courtes (moyenne estimee : 400-800 mots)
- Pas de presence Wikipedia
- Pas de strategie YouTube/podcast
- Maillage interne sous-exploite

---

## 10. Verdict global

**Score editorial actuel : 4/10**
**Potentiel a 12 mois : 9/10**

Le site possede **toutes les fondations techniques** (SEO, schema, multilingue, admin). Il manque desormais **la masse editoriale** et **les pages d'autorite thematique** pour saturer la SERP guineenne et africaine francophone.

La phase 2 propose l'architecture qui transforme cette opportunite en domination.
