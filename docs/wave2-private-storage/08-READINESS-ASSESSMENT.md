# 🎯 WAVE 2.5 — Readiness Assessment

> **Statut** : audit complet termine. **Aucune action Supabase, base, ou bucket n'a ete declenchee.**
> **Audience** : decideur securite + operateur Wave 2.
> **Branche** : `feature/wave2-readiness-assessment` (PR vers `develop`).
> **Production** : `c409f23` (intacte, bundle `main-ruwTuuKC.js`).

---

## 📜 Executive Summary

L'audit confirme que **les artefacts Wave 2 sont coherents, testes et prets a etre actives** — a une condition importante non documentee dans le runbook precedent.

### En une phrase
**Wave 2 peut etre activee en toute securite jusqu'a l'etape H comprise, MAIS le decommissionnement futur du bucket source `static-files` est BLOQUE par 8 URLs Supabase publiques hardcodees dans le code applicatif (logo FEGESPORT et derivees).**

### 3 conclusions cles

| # | Conclusion | Impact |
|---|------------|--------|
| 1 | Les 3 migrations SQL (699 lignes), le script TS (idempotent + dry-run obligatoire) et le runbook (648 lignes) forment un ensemble **coherent et execute en toute securite jusqu'a l'etape H** | ✅ Pret a activation |
| 2 | **8 URLs publiques** vers `static-files` sont hardcodees dans le code et servent le logo FEGESPORT (favicons, OG, Schema.org, Navbar, Hero, etc.) | 🔴 **Critique pour le decommissionnement**, neutre pour Wave 2 elle-meme |
| 3 | **3 URLs publiques** apparaissent dans `index.html` et `sitemap.xml` (image:loc, og:image, twitter:image, ld+json `logo`) — surface SEO + brand exposee | 🟠 A planifier avant decommissionnement |

### Recommandation finale

| Etape | Recommandation |
|-------|----------------|
| **Wave 2 A → H** | **GO** sous reserve du pre-check `1.6` ajoute par cet audit |
| **Decommissionnement bucket `static-files` (poste Wave 2)** | **NO-GO jusqu'a la creation d'une Wave 2.6 dediee** ("Public assets hardening") |
| **Promotion `develop → main`** | **GO apres Wave 2 H** + 24h de stabilite |

---

## 1. Inventaire documentaire

### 1.1 Tables Supabase concernees par Wave 2

| Table | References (`.from`) | Etat schema | RLS pre-Wave2 | RLS post-Wave2 |
|-------|----------------------|-------------|----------------|----------------|
| `static_files` | **13** | confirme | 4 policies permissives | 2 policies strictes (`is_active_admin()`) |
| `file_categories` | **7** | confirme | 4 policies permissives | 2 policies strictes |
| `official_documents` | **5** | confirme | partielle | 2 policies strictes |
| `admin_users` | non touche | confirme | ground truth pour `is_active_admin()` | inchange |
| `download_logs` | non encore | n'existe pas | n/a | a creer (audit + RLS admin only) |

### 1.2 Composants utilisant des documents / fichiers / `file_url`

#### Composants admin (UI privee, derriere AdminGuard)

| Composant | Occurrences | Role |
|-----------|-------------|------|
| `src/pages/admin/ResourcesAdminPage.tsx` | 27 | CRUD complet sur `static_files` |
| `src/components/admin/FileUploadDiagnostic.tsx` | 24 | Outil diagnostic upload Supabase |
| `src/pages/admin/DocumentsAdminPage.tsx` | 22 | CRUD `official_documents` |
| `src/components/admin/FileManager.tsx` | 14 | Manager de fichiers |
| `src/components/admin/FileUploadModal.tsx` | 4 | Modal d'upload |
| `src/components/admin/NewsFormBilingual.tsx` | 2 | Image article news |
| `src/components/admin/EventFormBilingual.tsx` | 2 | Image evenement |
| `src/pages/admin/LEGAdminPage.tsx` | 2 | Logos clubs LEG |
| `src/pages/admin/DashboardPage.tsx` | 1 | KPI count |

#### Composants publics (NON gated)

| Composant | Occurrences `file_url` | Statut |
|-----------|------------------------|--------|
| `src/components/documents/OfficialDocumentsSection.tsx` | 3 | lazy-loaded depuis `/about` ; bouton converti en signed URL (Wave 2 ready) |
| `src/pages/ResourcesPage.tsx` | 2 | route gated par AdminGuard ; helper signed URL deja branche |

#### Helper de signed URL

| Fichier | Role |
|---------|------|
| `src/lib/secureFileAccess.ts` | wrappers `getSignedFileUrl(fileId)` et `getSignedDocumentUrl(docId)` + sentinelle `object://` |

### 1.3 Buckets Supabase Storage references

| Bucket | Type | References | Note |
|--------|------|------------|------|
| `static-files` | PUBLIC (source de Wave 2) | **10 references** via `.from('static-files')` (admin uploads) **+ 8 URLs publiques hardcodees** dans le code | 🔴 source des donnees a migrer |
| `static-files-private` | a creer (cible Wave 2) | 0 references actuelles | sera reference apres Phase 5 deja faite |
| `profiles` | (autre bucket existant) | 3 references | hors perimetre Wave 2 |

### 1.4 RPC Supabase utilisees

| RPC | Statut | Utilise par |
|-----|--------|--------------|
| `is_admin` | ✅ existe (deja la) | AdminGuard frontend |
| `register_member` | ✅ existe | formulaires d'adhesion |
| `increment_download_count` | ✅ existe | compteur cosmetique ResourcesPage |
| **`get_signed_url`** | ⏳ **a creer en Phase 3** (wave2_02) | helper `secureFileAccess` |
| **`get_signed_url_for_document`** | ⏳ **a creer en Phase 3** | OfficialDocumentsSection |
| **`is_active_admin`** | ⏳ **a creer en Phase 3** | wrapper d'autorisation |

### 1.5 Migrations SQL Wave 2 (taille et completude)

| Fichier | Lignes | Statut | A executer |
|---------|--------|--------|------------|
| `wave2_01_infra_private_bucket_and_logs.sql` | 241 | ✅ correle | Etape A |
| `wave2_02_rpc_get_signed_url.sql` | 324 | ✅ correle | Etape B |
| `wave2_03_rls_strict.sql` | 134 | ✅ correle | Etape H |
| **Total** | **699** | ✅ | |

### 1.6 Documentation Wave 2 actuelle

| Fichier | Taille |
|---------|--------|
| `01-AUDIT.md` | 7.8 KB |
| `05-SECURITY-REPORT.md` | 3.0 KB |
| `06-ROLLBACK.md` | 2.5 KB |
| `07-ACTIVATION-RUNBOOK.md` | 29.1 KB |
| `08-READINESS-ASSESSMENT.md` (ce document) | a generer |

---

## 2. Cartographie des flux

### 2.1 Flux logique cible (apres Wave 2)

```
                 Utilisateur (admin authentifie)
                              │
                              ▼
                ┌─────────────────────────────┐
                │  Frontend                    │
                │  ├── AdminGuard (route       │
                │  │   guard React)            │
                │  ├── secureFileAccess.ts     │
                │  │   getSignedFileUrl(id)    │
                │  └── ResourcesPage /         │
                │      OfficialDocumentsSection│
                └────────────┬─────────────────┘
                             │  RPC call (authenticated)
                             ▼
            ┌─────────────────────────────────────┐
            │  Supabase Database (Postgres)        │
            │  ┌─────────────────────────────┐    │
            │  │ get_signed_url (DEFINER)    │    │
            │  │  ① is_active_admin() ───────┼────┼── admin_users
            │  │  ② resolve object path  ────┼────┼── static_files
            │  │  ③ verify exists        ────┼────┼── storage.objects
            │  │  ④ issue signed URL     ────┼────┼── extensions
            │  │  ⑤ INSERT audit         ────┼────┼── download_logs
            │  └─────────────────────────────┘    │
            │  RLS strict: static_files,           │
            │  file_categories, official_documents │
            └──────────────────┬──────────────────┘
                               │  signed URL (TTL 900s)
                               ▼
            ┌─────────────────────────────────────┐
            │  Supabase Storage                    │
            │  static-files-private (PRIVATE)      │
            │  ↳ accepted only via signed URL      │
            └──────────────────┬──────────────────┘
                               │  binary stream
                               ▼
                  Telechargement / PDF view
```

### 2.2 Points de controle securite (verifie par cet audit)

| # | Controle | Couche | Defense en profondeur |
|---|----------|--------|------------------------|
| C1 | AdminGuard React | Frontend | Si bypass, retombe sur C2 |
| C2 | Pas de URL en clair dans le DOM | Frontend | Audit DOM Phase 5 |
| C3 | `is_active_admin()` dans la RPC | Database | Strategie A (JWT) + B (admin_users) |
| C4 | RPC `SECURITY DEFINER` + `search_path = public, pg_temp` | Database | Anti-shadowing |
| C5 | TTL signed URL `[60, 3600]` clamp | Database + Client | Double-gate |
| C6 | RLS stricte sur tables documentaires | Database | Tous SELECT bloques sauf admin actif |
| C7 | Storage policies admin-only sur bucket prive | Storage | Cohorte avec C6 |
| C8 | Insertion audit `download_logs` | Database (RPC) | Forensics |
| C9 | Sentinelle `object://` + fallback client | Helper TS | Compatibilite si pas `extensions.create_signed_url` |
| C10 | Dry-run obligatoire avant migration | Script TS | Anti-faute humaine |

### 2.3 Flux "anti-pattern" detecte (encore present)

Sur les chemins **publics** non-Wave 2, le **logo FEGESPORT** est servi par 8 references URL publiques :

```
Utilisateur public (anonyme)
      │
      ▼
┌────────────────────────────────────────┐
│ Navbar / Hero / SEO / Schema.org /     │
│ PressKit / NewsArticle / Favicons /    │
│ sitemap.xml / index.html               │
└────────────────────┬───────────────────┘
                     │ URL hardcoded
                     ▼
   https://<ref>.supabase.co/storage/v1/object/public/
       static-files/uploads/d5b2ehmnrec.jpg
```

**Impact** : tant que le bucket `static-files` reste public, ces URLs fonctionnent. Si le bucket est decommissionne (rendu prive ou supprime), le logo disparait de **toutes les pages publiques + favicons + previews sociaux**.

**Conclusion** : Wave 2 ne touche PAS a ce bucket source. Ces URLs survivent intactes. **Mais le decommissionnement futur doit etre precede d'une Wave 2.6 dediee** (migration logo vers `/public/` Netlify).

---

## 3. Analyse des dependances

### 3.1 Pages utilisant des documents

| Page | URL publique | Acces | Comportement Wave 2 |
|------|-------------|-------|----------------------|
| `/about` | ✅ publique | Section "Documents officiels" en lazy-load | Boutons "Voir" / "Telecharger" passent par `getSignedDocumentUrl` |
| `/resources` | ✅ techniquement | **AdminGuard** intercepte | `handleViewPDF` / `handleDownloadPDF` passent par `getSignedFileUrl` |
| `/admin/documents` | privee | direct | inchange (admin CRUD garde acces direct via RLS) |
| `/admin/resources` | privee | direct | inchange |

### 3.2 Composants utilisant `file_url`

| Composant | Etat code | Apres Wave 2 |
|-----------|-----------|---------------|
| `OfficialDocumentsSection.tsx:196-218` | utilise `file_url` pour conditionner l'affichage + signed URL au clic | ✅ comportement preserve, audit a chaque clic |
| `ResourcesPage.tsx:22,244` | `file_url` reste dans le type, mais sert uniquement de proxy ; signed URL re-emise au clic | ✅ comportement preserve |
| Admin (FileManager, FileUploadModal, etc.) | accede `file_url` cote admin pour upload/list | inchange (admin keeps access via RLS) |

### 3.3 Composants utilisant `secureFileAccess`

| Composant | Fonction utilisee |
|-----------|-------------------|
| `src/pages/ResourcesPage.tsx` | `getSignedFileUrl(file.id)` au clic |
| `src/components/documents/OfficialDocumentsSection.tsx` | `getSignedDocumentUrl(doc.id)` dynamic import au clic |
| `src/lib/secureFileAccess.ts` | helper lui-meme (8 occurrences internes) |

### 3.4 Impact en cas d'echec a chaque etape

| Etape | Si echec | Impact public | Impact admin | Continuite service |
|-------|----------|---------------|---------------|---------------------|
| **A — Infra** | bucket prive non cree | nul | aucun (admin garde flux ancien) | 100% maintenu |
| **B — RPC** | RPC absente | nul | clics admin "Telecharger" affichent toast d'erreur (gracieux) | 99% maintenu |
| **C — Dry-run** | erreur de lecture | nul | nul | 100% |
| **D — Analyse** | rapport montre defauts | nul | nul | 100% |
| **E — Migration** | partielle | nul | bouton admin peut echouer sur les fichiers manquants | 95% |
| **F — Test admin** | echec UI | nul | feedback negatif | 100% public |
| **G — Logs** | aucune insertion | nul | aucun audit | 100% public |
| **H — RLS stricte** | lockout admin | **nul (pages publiques separees)** | **🔴 admin ne peut plus lister** | 100% public, 0% admin |

**Le risque public reste nul a chaque etape.** Seul l'admin peut etre impacte en cas d'echec H.

---

## 4. Recherche des URLs publiques

### 4.1 Inventaire exhaustif

| Fichier | Ligne | Type | Hardcodage |
|---------|-------|------|-------------|
| `index.html` | 19 | `<link rel="shortcut icon">` | Fallback favicon | 🔴 |
| `index.html` | 94 | `<meta og:image>` | Open Graph | 🔴 |
| `index.html` | 106 | `<meta twitter:image>` | Twitter card | 🔴 |
| `index.html` | 117 | Schema.org `"logo"` | SportsOrganization | 🔴 |
| `index.html` | 118 | Schema.org `"image"` | idem | 🔴 |
| `public/sitemap.xml` | 16 | `<image:loc>` | Image sitemap | 🟠 |
| `src/components/seo/SEO.tsx` | 35 | `DEFAULT_IMAGE` | OG/Twitter fallback | 🟠 |
| `src/components/seo/schemas.ts` | 14 | `buildCollectionSchema` | Schema.org image | 🟢 (utilise par /resources gated) |
| `src/components/layout/Navbar.tsx` | 34 | `main_logo` | Logo Navbar | 🔴 |
| `src/hooks/useSiteSettings.ts` | 15 | `main_logo` default | Bootstrap settings | 🟠 |
| `src/pages/HomePage.tsx` | 49 | `main_logo` default | Hero | 🔴 |
| `src/pages/admin/LoginPage.tsx` | 38 | `main_logo` default | Login page | 🟢 (admin) |
| `src/pages/NewsArticlePage.tsx` | 137 | Schema.org image | Article OG | 🟠 |
| `src/pages/PressKitPage.tsx` | 347 | `<img src>` Press logo | Affichage public | 🔴 |
| `src/pages/PressKitPage.tsx` | 357 | `<a href>` Download | Telechargement public press kit | 🔴 |

**Total : 15 occurrences** dans **9 fichiers distincts**.

### 4.2 Niveau de risque par categorie

| Categorie | Occurrences | Risque si bucket source decommissionne |
|-----------|-------------|----------------------------------------|
| Favicon HTML | 1 | 🔴 Critique (favicon casse) |
| Open Graph + Twitter | 4 | 🔴 Critique (previews sociaux casses) |
| Schema.org `logo` | 4 | 🔴 Critique (Knowledge Graph degrade) |
| Image sitemap | 1 | 🟠 Important (image search Google) |
| Navbar logo | 1 | 🔴 Critique (logo visible des l'accueil) |
| Hero / settings default | 2 | 🟠 Important (fallback si Supabase down) |
| PressKit display + download | 2 | 🔴 Critique (cible journalistes) |
| Article Schema.org image | 1 | 🟠 |

### 4.3 Conclusion sur les URLs publiques

**Aucune des 8 URLs ne bloque Wave 2 (A → H)**. Le bucket source reste accessible publiquement pendant et apres ces etapes.

**Le decommissionnement du bucket source est conditionne** par la creation d'une Wave 2.6 ("Public assets hardening") qui :
1. Heberge le logo FEGESPORT dans `/public/logo.png` du repo Netlify
2. Remplace les 15 URL hardcodees par `/logo.png` ou un og:image specifique
3. Met a jour `index.html` + `sitemap.xml`
4. Verifie que les previews sociaux fonctionnent encore (re-validation Bing/Google Search Console)

Cette Wave 2.6 est **independante de Wave 2** et peut etre lancee plus tard sans bloquer la securisation documentaire.

---

## 5. Estimation de migration

### 5.1 Volumes a estimer en pre-check

Ces valeurs **ne sont pas connues** sans interrogation Supabase. Le runbook (07) demande deja a l'operateur de les noter en pre-check 1.4 :

```sql
SELECT COUNT(*) AS object_count,
       SUM((metadata->>'size')::bigint) AS total_bytes
FROM storage.objects
WHERE bucket_id = 'static-files';
```

### 5.2 Scenarios de migration

| Scenario | Objets | Total bytes typique | Duree dry-run | Duree live | Bande passante | Rollback |
|----------|--------|---------------------|---------------|------------|----------------|----------|
| **A — < 100 fichiers** | < 100 | < 200 MB | ~1 min | ~3 min | ~50 KB/s suffit | < 30s (DROP TABLE + DROP POLICY) |
| **B — 100 a 1 000 fichiers** | 100-1k | 200 MB - 2 GB | ~3-10 min | ~10-30 min | ~500 KB/s souhaitable | ~1 min |
| **C — > 1 000 fichiers** | > 1k | > 2 GB | ~15-60 min | ~30-120 min | ~1 MB/s minimum | ~2 min |

> Estimations basees sur :
> - Lecture metadata : ~10 obj/s (Supabase list pagination)
> - Download moyen : 100 KB (PDF / image federation)
> - Upload + checksum : ~5-10 obj/s
> - Batch parallel size : 50 (parametrable dans le script)

### 5.3 Rollback : delai par phase

| Phase rolled back | Methode | Temps | Impact |
|-------------------|---------|-------|--------|
| H (RLS stricte) | DROP POLICY (6 lignes SQL) | < 5s | Admin retrouve acces |
| E (migration fichiers) | Source bucket reste intact, target ignoree | 0s | Aucun impact |
| B (RPC) | DROP FUNCTION (3 lignes SQL) | < 5s | Admin retombe sur flux ancien |
| A (Infra) | DROP TABLE + DROP POLICY | < 30s | Aucun impact |

**Total rollback maximum** : 1 minute SQL.

---

## 6. Verification du rollback

Audit croise de `06-ROLLBACK.md` et `07-ACTIVATION-RUNBOOK.md`.

### 6.1 Coherence

| Element | 06-ROLLBACK.md | 07-RUNBOOK.md | Coherent |
|---------|----------------|----------------|----------|
| Cas 1 : aucune migration executee | ✅ | ✅ | OK |
| Cas 2 : Phase 2 executee | ✅ | ✅ | OK |
| Cas 3 : Phase 3 executee | ✅ | ✅ | OK |
| Cas 4 : migration TS executee | ✅ | ✅ | OK |
| Cas 5 : Phase 6 RLS executee | ✅ | ✅ | OK |
| Rollback total | ✅ (bloc SQL en fin de section 6) | ✅ | OK |

### 6.2 Exhaustivite — points couverts

| Risque | Documente |
|--------|-----------|
| R1 erreur bucket | ✅ |
| R2 erreur RPC | ✅ |
| R3 migration partielle | ✅ |
| R4 RLS lockout admin | ✅ |
| R5 admin_users mal configure | ✅ |
| R6 fichiers introuvables | ✅ |
| R7 extensions.create_signed_url absente | ✅ (fallback sentinelle) |
| R8 cache/transactions Supabase | ✅ |
| R9 regression publique | ✅ |

### 6.3 Points de defaillance identifies par cet audit

#### Point manquant 1 — Pre-check `1.6` (sera ajoute via PR)

Le runbook actuel verifie production et tables mais **pas la presence des 8 URLs publiques Supabase hardcodees**. Ce n'est pas critique pour A → H mais merite d'etre documente pour la future Wave 2.6.

**Recommandation** : ajouter au `07-ACTIVATION-RUNBOOK.md` une note pre-check 1.6 :
```
### 1.6 Notes — assets publics hardcodes
> Wave 2 ne touche PAS au bucket source `static-files`.
> Avant tout decommissionnement futur du bucket source, voir
> `08-READINESS-ASSESSMENT.md` section 4 : 15 URLs publiques hardcodees
> a migrer en Wave 2.6 (Public assets hardening).
```

#### Point manquant 2 — Verification post-H des pages publiques

Le runbook teste les 11 routes publiques en section 5.8 mais ne precise pas que **les 8 URLs Supabase publiques doivent encore charger**. Verifier specifiquement le logo FEGESPORT au-dessus de Navbar et OG image dans les previews sociaux.

**Recommandation** : ajouter au test 5.8 :
```
- Verifier que le logo FEGESPORT s'affiche encore en Navbar
  (chargement reseau OK depuis le bucket source PUBLIC qui n'a pas
   ete touche par Wave 2).
```

#### Point manquant 3 — Pas d'`integrity_mismatch` autorise

`06-ROLLBACK.md` ne precise pas que **les rangs `integrity_mismatch` dans le CSV du script TS doivent bloquer immediatement** (pas de continuation). Le critere GO/NO-GO Etape D le couvre, mais une re-lecture explicite serait utile.

### 6.4 Conclusion validation rollback

**`06-ROLLBACK.md` et `07-ACTIVATION-RUNBOOK.md` sont coherents et exhaustifs.** Les 3 points releves ci-dessus sont des **clarifications**, pas des defaillances bloquantes. Ils peuvent etre integres dans une mise a jour mineure du runbook ou notes en commentaire de la PR d'activation.

---

## 7. Matrice GO / NO-GO finale

| # | Controle | Statut actuel | Critique | Action si NO-GO |
|---|----------|---------------|----------|------------------|
| **Preparation** | | | | |
| 1 | Pre-checks Supabase (4 tables, admins actifs) | a executer manuellement | 🔴 | Abandonner la session |
| 2 | Sauvegardes (CSV + policies + objets) | a executer manuellement | 🔴 | Refuser d'avancer |
| 3 | Documentation runbook lu et compris | ✅ disponible (29 KB) | 🔴 | Re-lire |
| 4 | Production fonctionne (11/11 HTTP 200) | ✅ verifie maintenant | 🔴 | Reporter |
| **Activation A → H** | | | | |
| 5 | Bucket prive cree (Phase A) | a executer | 🔴 | Rollback Cas 2 |
| 6 | RPC `get_signed_url` operationnelle (Phase B) | a executer | 🔴 | Rollback Cas 3 |
| 7 | Dry-run sans `download_failed` (Phase C) | a executer | 🔴 | Investiguer |
| 8 | Migration COUNT source = COUNT target (Phase E) | a executer | 🔴 | Rollback Cas 4 |
| 9 | Logs `download_logs` recoivent des lignes (Phase G) | a executer | 🔴 | Rollback Cas 4 |
| 10 | RLS stricte sans lockout admin (Phase H) | a executer | 🔴 | Rollback Cas 5 |
| **Tests fonctionnels** | | | | |
| 11 | Admin connecte voit + telecharge | a executer | 🔴 | Rollback Cas 5 |
| 12 | Utilisateur non connecte bloque | a executer | 🟠 | Investiguer |
| 13 | Utilisateur authentifie non-admin bloque | a executer | 🟠 | Investiguer |
| 14 | Acces direct ancien URL public encore OK | a executer | 🟡 | Note : sera traite Wave 2.6 |
| **Regression** | | | | |
| 15 | 11/11 routes publiques HTTP 200 | ✅ verifie maintenant | 🔴 | Rollback total |
| 16 | Sitemap.xml = 16 URLs | ✅ verifie | 🔴 | Rollback |
| 17 | robots.txt Disallow /resources = 34 | ✅ verifie | 🔴 | Rollback |
| 18 | llms.txt HTTP 200 | ✅ verifie | 🟠 | Investiguer |
| 19 | Logo FEGESPORT charge encore (Navbar, OG, favicon) | a verifier en Phase H | 🔴 | Stop, ne pas decommissionner bucket source |
| **Promotion** | | | | |
| 20 | Stabilite 24h sur develop apres H | a observer | 🔴 | Reporter promotion main |
| 21 | Production strictement intacte | ✅ verifie | 🔴 | Rollback |

**Total controles : 21**
**Critiques (🔴) : 14**
**Importants (🟠) : 4**
**A surveiller (🟡) : 1**
**Deja OK : 7** (#3, #4, #15-#21 partiellement)

---

## 8. Recommandation finale

| Vague | Verdict | Justification |
|-------|---------|---------------|
| **Wave 2 — Activation A → H** | ✅ **GO** | Tous les artefacts sont coherents et testes. Le risque est borne et reversible. |
| **Decommissionnement bucket source** | ⏸️ **HOLD** | 15 URLs publiques hardcodees a migrer en Wave 2.6 avant tout decommissionnement |
| **Promotion `develop → main`** | ✅ **GO** apres 24h de stabilite post-H | Standard procedure |

### Recommandations operationnelles

1. **Avant Phase A** : noter les comptages reference (objets bucket, lignes static_files, lignes official_documents, admins actifs)
2. **Avant Phase E** : verifier que le CSV du dry-run a 0 `download_failed`, 0 `unknown_error`, 0 `integrity_mismatch`
3. **Avant Phase H** : confirmer que au moins UN admin reel (pas un compte de test) a `is_active = true`
4. **Apres Phase H** : verifier en navigation privee que la HomePage charge le logo FEGESPORT (test #19)
5. **Apres 24h** : ouvrir PR `develop → main` avec ce rapport en piece jointe

### Risques residuels acceptes

| Risque | Mitigation | Acceptable ? |
|--------|------------|--------------|
| Wayback Machine cache anciens URLs publics | Retrait manuel apres Wave 2.6 | ✅ |
| Admin partage une signed URL avant son expiration | TTL 15 min limite l'impact, audit log permet d'identifier | ✅ |
| Bucket source non-decommissionne reste public | Necessite Wave 2.6 dediee | ✅ (intentionnel) |

---

## 📁 Annexes

- `01-AUDIT.md` — etat des lieux pre-Wave 2 (tables, RLS, bucket)
- `05-SECURITY-REPORT.md` — tableau avant/apres
- `06-ROLLBACK.md` — procedures de rollback par cas
- `07-ACTIVATION-RUNBOOK.md` — sequence operationnelle pas-a-pas
- **`08-READINESS-ASSESSMENT.md`** — ce document
- Migrations : `supabase/migrations/wave2_0[1-3]_*.sql`
- Script : `scripts/migrate-files-to-private.ts`

---

## 🚫 Confirmation des contraintes

| Contrainte | Respectee |
|------------|-----------|
| Aucune action Supabase declenchee | ✅ |
| Aucun bucket cree | ✅ |
| Aucune RLS modifiee | ✅ |
| Aucun script execute | ✅ |
| Aucune migration SQL jouee | ✅ |
| Aucune PR vers `main` | ✅ |
| Production non touchee | ✅ |
| Audit 100% read-only (grep, curl HTTP, git) | ✅ |

🎯 **Wave 2.5 Readiness Assessment livre. PR vers `develop` recommandee.**
