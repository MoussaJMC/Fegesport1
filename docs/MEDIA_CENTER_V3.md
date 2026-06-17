# FEGESPORT AI MEDIA ECOSYSTEM V3 — Moteur de croissance

Le système n'est plus un outil de publication : c'est un **outil de développement institutionnel**. Chaque contenu sert un objectif mesurable (recruter joueurs, clubs, partenaires, sponsors, journalistes, bénévoles, abonnés ; visibilité internationale ; crédibilité institutionnelle), et 6 nouveaux agents transforment les données média en décisions de croissance.

V1 = pipeline éditorial · V2 = salle de rédaction (9 agents) · **V3 = intelligence de croissance (agents 10-15)** — toujours 100 % incrémental sur l'existant.

---

## 1. Architecture V3

```
                       ┌─────────────── DONNÉES (déjà en production) ───────────────┐
                       │ media_events · generated_articles · social_posts ·          │
                       │ newsletter_campaigns · collected_news · media_kpi_daily ·   │
                       │ members · partners · sponsors · website_analytics           │
                       └────────────┬────────────────────────────────────────────────┘
                                    │
                     Edge Function media-growth (6 actions = 6 agents)
                                    │
   ┌──────────┬──────────┬──────────┼──────────┬──────────────┬─────────────┐
   ▼          ▼          ▼          ▼          ▼              ▼             │
 Agent 10   Agent 11   Agent 12   Agent 13   Agent 14      Agent 15        │
 Growth     Partner.   Athlete&   Sponsor.   Intl.         Reputation      │
 Manager    Intell.    Club Det.  Content    Relations     Monitor         │
   │          │          │          │          │              │            │
   ▼          ▼          ▼          ▼          ▼              ▼            ▼
 growth_   prospects  ecosystem_ sponsorship_ opportunity_ reputation_  executive_
 insights             profiles   reports      alerts       snapshots    kpi_monthly (vue)
   └──────────┴──────────┴──────────┴──────────┴──────────────┴─────────────┘
                                    │
                    /admin/media/growth — Tableau de bord DG
```

## 2-4. Schéma de données & nouveaux agents

Migration : `supabase/migrations/20260612140000_media_center_v3_growth.sql`

| Agent | Table | Ce qu'il produit |
|---|---|---|
| **10. Community Growth Manager** | `growth_insights` | Top contenus/sujets/hashtags/canaux, meilleurs créneaux, recommandations rattachées à un objectif de croissance |
| **11. Partnership Intelligence** | `prospects` | Prospects (gaming, télécom, banque, assurance, équipementier, PC, éditeurs) avec raisons de contact, opportunités, **score de compatibilité 0-100**, pipeline CRM (new → contacted → in_discussion → partner) |
| **12. Athlete & Club Detector** | `ecosystem_profiles` | Fiches joueurs/clubs/organisateurs/créateurs détectés dans les entités extraites (V2), **classement par score d'activité**, suggestion de contact (licence, affiliation) |
| **13. Sponsorship Content Generator** | `sponsorship_reports` | Dossiers sponsors basés sur les **métriques réelles** (articles, posts, newsletters, abonnés, membres) : portée, faits marquants, valeur média estimée (prudente et qualifiée), argumentaire markdown |
| **14. International Relations Monitor** | `opportunity_alerts` | Alertes IESF/ACES/GEF/WESCO/FIFAe/EWC : appels à participation, subventions, compétitions, coopérations — avec échéance, priorité et suivi (applied/won/missed) |
| **15. Reputation Monitor** | `reputation_snapshots` | Scores réputation/visibilité/confiance 0-100, mentions ±, controverses, opportunités de communication |

Plus : `growth_objectives` (jsonb) sur `media_events` et `newsletter_campaigns` — chaque contenu déclare l'objectif qu'il sert. Source WESCO ajoutée à la veille. RLS admin + index sur toutes les nouvelles tables.

**Garde-fous anti-hallucination V3** : les agents raisonnent uniquement sur les données fournies (prompts verrouillés), les prospects doivent être des entreprises notoires (sinon exclus), les estimations de valeur média sont obligatoirement qualifiées d'estimations, et tout passe par revue humaine (pipelines de statuts).

## 5. Dashboard stratégique DG (`/admin/media/growth`)

- **Bandeau KPI exécutifs** : nouveaux joueurs, clubs, partenaires, sponsors, abonnés, articles, posts, vues site — mois en cours avec delta vs mois précédent (vue `executive_kpi_monthly`, 12 mois, branchée sur les vraies tables de prod)
- **6 onglets agents** avec bouton « Lancer l'agent » : Recommandations · Prospects (CRM) · Écosystème · Dossiers sponsors · Opportunités internationales · Réputation

## 6. KPI exécutifs

Vue `executive_kpi_monthly` (12 mois glissants) : `new_players`, `new_clubs`, `new_partners`, `new_sponsors`, `new_subscribers`, `articles_published`, `social_posts`, `newsletters_sent`, `newsletter_opens/clicks`, `site_page_views`. Sources : tables de production existantes — zéro double saisie.

## 7. Budget V3

| Poste | V2 | Ajout V3 | Total/mois |
|---|---|---|---|
| Claude API | ~20-25 $ | Agents 10-15 : ~30 appels/mois × 8-15k tokens ≈ 5-8 $ | **~25-33 $** |
| Supabase Pro | 25 $ | 0 (tables + vues seulement) | **25 $** |
| Resend | 0-20 $ | 0 | **0-20 $** |
| Netlify | 0 $ | 0 | **0 $** |
| **Total** | | | **≈ 50-80 $/mois** (~500 000-800 000 GNF) |

## 8. Priorisation MVP (ordre de mise en service conseillé)

1. **Semaine 1 — Agent 14 (Opportunités intl.)** : ROI immédiat, zéro dépendance — une subvention ou qualification détectée paie l'année du système.
2. **Semaine 1 — Agent 12 (Écosystème)** : gratuit en tokens (pas d'appel IA), exploite les entités V2 déjà extraites.
3. **Semaine 2 — Agent 13 (Dossiers sponsors)** : arme commerciale concrète pour la direction.
4. **Semaine 3 — Agent 11 (Prospects)** : alimente le pipeline partenariats.
5. **Semaine 4 — Agents 10 & 15** : utiles quand ~1 mois de données de publication s'est accumulé.

Cron conseillé (en plus de la veille 6 h) : `opportunities` 1×/jour, `insights` + `reputation` 1×/semaine, `detect` après chaque génération (ou 1×/jour).

## 9. Estimation ROI sur 12 mois

Hypothèses prudentes pour une fédération nationale en structuration :

| Levier | Mécanisme | Estimation annuelle |
|---|---|---|
| **1 sponsor national** (télécom/banque) | Dossiers sponsors chiffrés + pipeline prospects | 5 000-15 000 $ (contrat junior local) |
| **1-2 opportunités internationales captées** | Alertes IESF/ACES/GEF (subventions, prises en charge de délégations) | 2 000-10 000 $ de valeur |
| **Licences & affiliations** | Détection joueurs/clubs + relance ciblée : +20-50 joueurs, +5-10 clubs | revenus de licences + base sportive élargie |
| **Économie de production média** | 6-10 contenus/événement générés vs rédaction manuelle (~2-3 j/homme/mois économisés) | 1 800-3 600 $ équivalent |
| **Coût total du système** | | ~600-960 $/an |

**ROI attendu : 5× à 20× le coût annuel**, le premier contrat sponsor couvrant à lui seul plusieurs années de fonctionnement. Le levier dominant n'est pas l'économie de rédaction mais la **conversion** : opportunités internationales captées à temps + dossiers sponsors professionnels + pipeline de prospects suivi.

## 10. Roadmap V3 → V4

**V4 — Plateforme d'écosystème** :
- Scoring prédictif des prospects (historique des interactions → probabilité de signature)
- Espace sponsor en ligne : dashboards de visibilité temps réel par sponsor (logo views, mentions)
- CRM complet : relances automatiques, emails de prospection générés et envoyés via Resend
- Social listening réel (APIs Meta/X/TikTok) pour le Reputation Monitor — mentions hors veille RSS
- Portail public joueurs/clubs : profils `ecosystem_profiles` revendiqués → onboarding licence en self-service
- Matching automatique opportunité internationale ↔ joueurs/clubs éligibles (sélections nationales)
- Rapport DG mensuel PDF auto-généré et envoyé au bureau exécutif

## Déploiement

```bash
supabase db push                                  # migration V3
supabase functions deploy media-growth            # nouvel agent (JWT vérifié par défaut)
# cron (optionnel) — mêmes en-têtes X-Cron-Key que media-watch :
#   opportunities 1×/jour, insights+reputation 1×/semaine, detect 1×/jour
# Frontend : git push → Netlify
```

**Recette** : ouvrir `/admin/media/growth` → vérifier le bandeau KPI (données de prod réelles) → lancer chaque agent depuis son onglet → vérifier l'apparition des résultats et leur traçabilité dans `ai_usage_logs`.
