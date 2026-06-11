# 🛠️ WAVE 2 — Runbook d'activation Supabase

> **Statut** : runbook prepare. **AUCUNE etape execute** par l'auteur de ce document.
> **Audience** : operateur Supabase + reviewer securite.
> **Pre-requis** : PR #11 mergee sur `develop` (commit `ee7a30d`). Production prod commit `c409f23` intacte.
> **Duree estimee end-to-end** : 60 a 90 minutes (humain compris).
> **Validation humaine OBLIGATOIRE entre chaque etape** (criteres GO/NO-GO explicites).

---

## 📂 Index

1. [Pre-checks Supabase](#1-pre-checks-supabase) — environ 10 min
2. [Sauvegarde + rollback prepare](#2-sauvegarde--rollback-prepare) — environ 10 min
3. [Sequence d'activation A → H](#3-sequence-dactivation-a--h) — environ 30 min
4. [Criteres GO / NO-GO par etape](#4-criteres-go--no-go-par-etape)
5. [Tests fonctionnels obligatoires](#5-tests-fonctionnels-obligatoires) — environ 15 min
6. [Risques et procedures de rollback](#6-risques-et-procedures-de-rollback)
7. [Gates avant promotion `develop` → `main`](#7-gates-avant-promotion-develop--main)

---

# 1. Pre-checks Supabase

## 1.1 Verifier l'integrite de la production AVANT toute intervention

> ⚠️ **Bloquant** : si la production ne fonctionne pas a ce moment, abandonner et planifier a une autre fenetre.

| Test | Commande / action | Attendu |
|------|-------------------|---------|
| Production accessible | `curl -sI https://fegesport224.org/ \| head -1` | `HTTP/2 200` |
| Sitemap.xml | `curl -s https://fegesport224.org/sitemap.xml \| grep -c "<loc>"` | `16` |
| `/esport-guinee` | `curl -sI https://fegesport224.org/esport-guinee \| head -1` | `HTTP/2 200` |
| `/federation-guineenne-esport` | idem | `HTTP/2 200` |
| `/histoire-esport-guinee` | idem | `HTTP/2 200` |

**NO-GO** si l'une de ces verifications echoue : ne pas activer Wave 2 aujourd'hui.

## 1.2 Verifier l'existence des tables et colonnes critiques (SQL READ-ONLY)

> A executer dans le **SQL Editor Supabase Dashboard**. Aucune ecriture.

```sql
-- Verifier que les 4 tables existent
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'static_files',
    'file_categories',
    'official_documents',
    'admin_users'
  )
ORDER BY table_name;
-- Resultat attendu : 4 lignes (les 4 tables)
```

```sql
-- Verifier les colonnes critiques de static_files
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'static_files'
  AND column_name IN ('id', 'filename', 'file_url', 'file_type',
                      'file_size', 'category_id', 'is_public', 'uploaded_by')
ORDER BY column_name;
-- Resultat attendu : 8 lignes
```

```sql
-- Verifier la colonne pivot d'authorisation
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'admin_users'
  AND column_name IN ('user_id', 'email', 'role', 'is_active');
-- Resultat attendu : 4 lignes incluant is_active boolean
```

## 1.3 Comptages de reference (avant migration)

```sql
-- Nombre de lignes dans static_files
SELECT COUNT(*) AS total_static_files,
       COUNT(*) FILTER (WHERE is_public = true) AS public_files
FROM public.static_files;
-- Noter ces valeurs : seront comparees apres migration.
```

```sql
-- Nombre de lignes dans official_documents
SELECT COUNT(*) AS total_official_documents,
       COUNT(*) FILTER (WHERE is_published = true) AS published_documents
FROM public.official_documents;
```

```sql
-- Nombre de lignes dans file_categories
SELECT COUNT(*) AS total_file_categories FROM public.file_categories;
```

```sql
-- Admins actifs
SELECT COUNT(*) AS active_admin_count
FROM public.admin_users
WHERE is_active = true;
-- Attendu : >= 1. Si 0, NO-GO : on serait lockout apres Phase 6.
```

## 1.4 Comptage du bucket `static-files`

> A executer dans le **Dashboard Storage** OU via SQL :

```sql
-- Nombre d'objets dans le bucket public source
SELECT bucket_id, COUNT(*) AS object_count, SUM((metadata->>'size')::bigint) AS total_bytes
FROM storage.objects
WHERE bucket_id = 'static-files'
GROUP BY bucket_id;
-- Noter object_count et total_bytes. Reference de migration.
```

## 1.5 Tableau de bord pre-activation (a remplir)

| Indicateur | Valeur observee | Date / heure |
|------------|-----------------|--------------|
| Production HTTP 200 sur les 11 routes | ___ / 11 | ___ |
| Nombre de tables (target = 4) | ___ | ___ |
| Lignes `static_files` | ___ | ___ |
| Lignes `static_files` `is_public=true` | ___ | ___ |
| Lignes `official_documents` | ___ | ___ |
| Lignes `file_categories` | ___ | ___ |
| Admins actifs (`is_active=true`) | ___ | ___ |
| Objets dans bucket `static-files` | ___ | ___ |
| Total bytes du bucket `static-files` | ___ | ___ |

**GO** si : (toutes les 11 routes OK) ET (4 tables presentes) ET (active_admin_count >= 1).
**NO-GO** sinon.

---

# 2. Sauvegarde + rollback prepare

## 2.1 Exporter les 4 tables

### Option A — Dashboard Supabase (recommande pour petits volumes)

1. Dashboard → `Table Editor`
2. Pour chaque table : `static_files`, `file_categories`, `official_documents`, `admin_users`
   - Click sur la table
   - Menu `Export` (icone "..." en haut)
   - Format : **CSV** (encoder UTF-8)
   - Nommer : `backup-<table>-YYYYMMDD-HHmm.csv`
3. Stocker dans un repertoire date local : `~/wave2-backups/YYYY-MM-DD/`

### Option B — pg_dump (recommande pour gros volumes ou audit)

```bash
# 4 tables, structure + data, dans un fichier compresse
SUPABASE_DB_URL="postgres://postgres:<password>@db.<ref>.supabase.co:5432/postgres"
pg_dump "$SUPABASE_DB_URL" \
  --schema=public \
  --table=static_files \
  --table=file_categories \
  --table=official_documents \
  --table=admin_users \
  --data-only \
  --column-inserts \
  --file=backup-tables-$(date +%Y%m%d-%H%M).sql
```

## 2.2 Exporter les policies RLS actuelles

```sql
-- A executer en SQL Editor puis copier-coller le resultat dans un fichier
-- nomme `backup-policies-YYYYMMDD-HHmm.sql`. Le contenu est suffisamment
-- petit pour etre stocke en texte.

SELECT
  format(
    'CREATE POLICY %I ON %I.%I FOR %s TO %s USING (%s)%s;',
    policyname,
    schemaname,
    tablename,
    cmd,
    array_to_string(roles, ', '),
    COALESCE(qual, 'true'),
    CASE WHEN with_check IS NOT NULL
         THEN ' WITH CHECK (' || with_check || ')' ELSE '' END
  ) AS policy_definition
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('static_files', 'file_categories', 'official_documents', 'admin_users')
ORDER BY tablename, policyname;
```

Sauvegarder aussi les policies du **storage.objects** :

```sql
SELECT
  format(
    'CREATE POLICY %I ON storage.objects FOR %s TO %s USING (%s)%s;',
    policyname, cmd, array_to_string(roles, ', '),
    COALESCE(qual, 'true'),
    CASE WHEN with_check IS NOT NULL
         THEN ' WITH CHECK (' || with_check || ')' ELSE '' END
  )
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects';
```

## 2.3 Exporter la liste des objets du bucket `static-files`

```sql
-- Liste exportable en CSV (Dashboard SQL Editor -> Download CSV)
SELECT
  name AS object_path,
  bucket_id,
  metadata->>'size' AS size_bytes,
  metadata->>'mimetype' AS mime_type,
  created_at
FROM storage.objects
WHERE bucket_id = 'static-files'
ORDER BY name;
```

Sauver : `backup-objects-static-files-YYYYMMDD-HHmm.csv`.

## 2.4 Snapshot d'environnement

| Element | Outil |
|---------|-------|
| Variables d'environnement Netlify | Capture d'ecran du dashboard env vars |
| URL du projet Supabase | Noter `SUPABASE_URL` |
| Numero de version Supabase | Dashboard → Settings → Database |
| Hash de la branche `develop` | `git rev-parse origin/develop` |

## 2.5 Rollback prepare — fichiers prets a executer

Tous les rollbacks SQL sont deja documentes dans `docs/wave2-private-storage/06-ROLLBACK.md`. Garder ce document ouvert dans un autre onglet pendant toute l'activation.

---

# 3. Sequence d'activation A → H

> **Regle d'or** : ne pas passer a l'etape suivante sans avoir valide le critere GO de l'etape courante.
>
> **Frequence d'arret** : a chaque etape, prendre 2 minutes pour relire le resultat avant de continuer.

## Etape A — Infra (private bucket + download_logs)

**Action** : executer `supabase/migrations/wave2_01_infra_private_bucket_and_logs.sql`.

**Voies** :
- Dashboard SQL Editor : copier le contenu, click Run.
- Supabase CLI : `supabase db push` si la convention de migration est respectee.

**Verification immediate** (executer le bloc SELECT a la fin du script) :
```sql
SELECT 'storage_bucket' AS check_name,
  CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'static-files-private' AND public = false)
       THEN 'OK' ELSE 'MISSING' END AS status;
SELECT 'download_logs_table' AS check_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'download_logs')
       THEN 'OK' ELSE 'MISSING' END AS status;
SELECT 'download_logs_indexes' AS check_name,
  (SELECT count(*) FROM pg_indexes WHERE tablename = 'download_logs')::text AS status;
```

**Resultats attendus** : 3 lignes `OK / OK / 4` (4 indexes).

## Etape B — RPC `get_signed_url`

**Action** : executer `supabase/migrations/wave2_02_rpc_get_signed_url.sql`.

**Verification immediate** :
```sql
SELECT proname,
       pronamespace::regnamespace AS schema,
       prosecdef AS is_security_definer,
       proacl AS access_control
FROM pg_proc
WHERE proname IN ('is_active_admin', 'get_signed_url', 'get_signed_url_for_document')
  AND pronamespace = 'public'::regnamespace
ORDER BY proname;
```

**Resultats attendus** : 3 lignes, toutes avec `is_security_definer = true`.

**Mini test manuel d'autorisation** (au choix) :
```sql
-- En SQL Editor connecte comme admin, ce SELECT doit retourner true
SELECT public.is_active_admin();
```
Si `false` ou erreur : NO-GO. Verifier que la session SQL Editor utilise bien le role authenticated d'un admin (ou que `is_admin()` fonctionne avec le JWT role).

## Etape C — Dry-run migration

**Action** : depuis un terminal local **avec acces aux deux cles** :

```bash
export SUPABASE_URL="https://<project-ref>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"

cd /chemin/vers/Fegesport1
npx tsx scripts/migrate-files-to-private.ts --dry-run
```

**Comportement attendu** :
1. Le script liste les fichiers du bucket source.
2. Telecharge chacun pour calculer le SHA-256.
3. Genere `migration-report-<timestamp>.csv` a la racine du projet.

**Aucune modification** cote target (DRY_RUN court-circuite l'upload).

## Etape D — Analyse du rapport CSV

**A verifier ligne par ligne** :

| Colonne | Verifier |
|---------|----------|
| `source_path` | nombre de lignes = nombre attendu (cf. pre-check 1.4) |
| `target_path` | identique a `source_path` (preserve la structure) |
| `source_size` | concorde avec les meta-donnees du bucket |
| `source_sha256` | rempli partout (64 caracteres hexa) |
| `status` | toutes les lignes `copied` ou `already_present` |
| `error` | vide partout |

**Compter** : nombre de `copied` + nombre de `already_present` doit egaler le nombre total de lignes. Si autre statut → NO-GO.

## Etape E — Migration reelle

**Action** :
```bash
# Meme variables d'environnement que C
npx tsx scripts/migrate-files-to-private.ts --confirm-live --checksums
```

**Le flag `--confirm-live` est obligatoire** — sans lui, le script refuse de tourner.

`--checksums` recalcule le SHA-256 cote target et compare au source pour garantir l'integrite bit-a-bit.

**Comportement attendu** :
1. Re-liste les objets du source.
2. Pour chaque : download → upload vers target → re-download pour verifier.
3. Si `--already_present` (deja la), skip propre.
4. Genere `migration-report-<timestamp>.csv` avec les colonnes target_sha256 remplies.

**Verification ad-hoc en SQL** :
```sql
-- Compter les fichiers dans le nouveau bucket
SELECT COUNT(*) FROM storage.objects WHERE bucket_id = 'static-files-private';
-- Doit egaler le total du bucket source.
```

## Etape F — Test acces admin sur develop

**URL** : https://develop--fegesport224.netlify.app/admin/login

**Action humaine** :
1. Se connecter avec un compte admin (`is_active=true`)
2. Aller dans la section qui liste les documents officiels (`/about` sous-section ou panneau admin)
3. Cliquer sur "Voir" / "Telecharger" pour un document
4. Le fichier doit s'ouvrir (signed URL emis correctement)

**Si l'ouverture du fichier echoue** : NO-GO. Verifier les logs console DevTools + les logs Supabase Functions.

## Etape G — Verifier `download_logs`

```sql
SELECT id, file_id, user_id, downloaded_at, source, filename_snapshot, bucket_snapshot
FROM public.download_logs
ORDER BY downloaded_at DESC
LIMIT 10;
```

**Attendu** : au moins 1 ligne correspondant aux clics de l'etape F. `user_id` non-null, `bucket_snapshot = 'static-files-private'`, `source = 'rpc:get_signed_url'`.

**Si aucune ligne** : NO-GO. La RPC n'a pas insere → debug l'audit avant de durcir.

## Etape H — RLS stricte

> ⚠️ **C'est l'etape finale et la plus risquee** : elle ferme l'acces lecture aux trois tables documentaires pour TOUS les non-admins.
> Ne lancer **QUE si** les etapes A-G sont vertes et le admin acces fonctionne via signed URLs.

**Action** : executer `supabase/migrations/wave2_03_rls_strict.sql`.

**Verification immediate** (executer le bloc SELECT a la fin du script) :
```sql
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('static_files', 'file_categories', 'official_documents')
ORDER BY tablename, policyname;
```

**Attendu** :
- 2 policies par table (un select + un all/admin_modify) — total 6 lignes.
- Toutes les `qual` referencent `is_active_admin()`.
- Aucune policy `USING (true)` ne subsiste.

**Re-test l'acces admin** (etape F repete) : doit toujours fonctionner.

**Re-test acces public** : ouvrir `/about` en navigation privee → la page doit charger normalement (le contenu institutionnel ne depend pas de ces tables).

---

# 4. Criteres GO / NO-GO par etape

| Etape | Continuer si | Arreter si | Rollback si |
|-------|--------------|------------|-------------|
| **Pre-check 1.x** | 11/11 routes OK + 4 tables + >=1 admin actif | Sinon | n/a (aucune action faite) |
| **Sauvegarde 2.x** | 4 CSV exportes + policies sauvees + objects sauves | Si exports incomplets | n/a |
| **A — Infra** | 3 SELECT renvoient `OK/OK/4` | Sinon | Rollback Cas 2 |
| **B — RPC** | 3 fonctions presentes avec `is_security_definer=true` ET `is_active_admin()` renvoie `true` pour un admin | Sinon | Rollback Cas 3 |
| **C — Dry-run** | Rapport CSV genere sans `download_failed` ni `unknown_error` | Sinon | n/a (rien execute) |
| **D — Analyse CSV** | Tous les statuts sont `copied` ou `already_present`, aucun `error` | Sinon | Investiguer avant E |
| **E — Migration reelle** | COUNT du bucket target = COUNT du bucket source | Sinon | Rollback Cas 4 |
| **F — Admin acces** | Admin peut ouvrir un fichier via signed URL | Sinon | Rollback Cas 4 |
| **G — `download_logs`** | Au moins 1 ligne avec `user_id` non null et `bucket_snapshot='static-files-private'` | Sinon | Rollback Cas 4 |
| **H — RLS stricte** | 6 policies + Admin acces fonctionne + pages publiques HTTP 200 | Sinon | Rollback Cas 5 |

**Regle d'or** : a chaque etape, prendre 2 minutes de respiration avant de declarer GO. Ne jamais signer un GO sans lecture explicite des sorties.

---

# 5. Tests fonctionnels obligatoires

> A executer **apres l'etape H** (donc apres durcissement complet).
> Si l'un de ces tests echoue : **rollback total** (Cas 5 + Cas 4).

## 5.1 Admin connecte (devrait passer)

| # | Action | Attendu |
|---|--------|---------|
| 1 | Login `/admin/login` avec admin actif | Redirige vers `/admin` |
| 2 | Lister documents officiels (UI) | Liste retournee (rows de `official_documents`) |
| 3 | Cliquer "Telecharger" sur un document | Telecharge le fichier |
| 4 | Cliquer "Voir" sur un PDF | Ouvre le PDF dans le viewer |
| 5 | `SELECT count(*) FROM public.download_logs` (apres clics) | Au moins +2 lignes par rapport au snapshot |
| 6 | Lister fichiers via `/admin/files` (selon l'UI existante) | Liste retournee (rows de `static_files`) |

## 5.2 Utilisateur non connecte (devrait etre bloque)

| # | Action | Attendu |
|---|--------|---------|
| 7 | Ouvrir `/resources` en navigation privee | Redirection vers `/admin/login` |
| 8 | Appeler `supabase.from('static_files').select('*')` en console anon | `count: 0` ou erreur RLS |
| 9 | Tester URL Supabase signed URL ancienne (si conservee) | Pas applicable (URL signees expirent en 15 min) |

## 5.3 Utilisateur authentifie non-admin (devrait etre bloque)

| # | Action | Attendu |
|---|--------|---------|
| 10 | Login avec un user normal (membre) | Login OK |
| 11 | Tenter d'ouvrir `/resources` | Spinner puis redirect `/admin/login` (AdminGuard intercepte) |
| 12 | RPC manuel `supabase.rpc('get_signed_url', {...})` en console | Erreur `unauthorized` (code 42501) |
| 13 | `SELECT * FROM public.static_files` direct | `count: 0` |

## 5.4 Acces direct ancien fichier public

| # | Action | Attendu |
|---|--------|---------|
| 14 | Ouvrir l'URL d'un ancien fichier public (`https://<ref>.supabase.co/storage/v1/object/public/static-files/<path>`) | Statut 400 ou 401/403 (bucket reste public au depart, mais les RLS Wave 2 ne touchent pas storage.objects sur ce bucket — voir Annexe pour decommissionnement bucket source) |

> Le decommissionnement du bucket public **`static-files`** est une etape post-Wave 2 (Phase E.16 du plan global). Ne pas le faire dans ce runbook.

## 5.5 Telechargement document

| # | Action | Attendu |
|---|--------|---------|
| 15 | Cliquer "Telecharger" comme admin | Fichier sauve, MIME type correct |
| 16 | Verifier les bytes telecharges = `source_size` du rapport | SHA-256 identique |

## 5.6 Apercu PDF

| # | Action | Attendu |
|---|--------|---------|
| 17 | Cliquer "Voir" sur un PDF en tant qu'admin | Modal PDFViewer s'ouvre, premier rendu en < 2s |
| 18 | Naviguer pages 2 et 3 | Pas d'erreur 401/403 |

## 5.7 `download_logs`

| # | Action | Attendu |
|---|--------|---------|
| 19 | Apres tests 1-18, requeter `download_logs` | Nombre de lignes >= nombre de clics view+download faits |
| 20 | Inspecter la colonne `user_id` | Tous les ids correspondent a l'admin de test |
| 21 | Inspecter `downloaded_at` | Timestamps en UTC, ordonnes |
| 22 | Inspecter `bucket_snapshot` | Tous valent `static-files-private` |

## 5.8 Regression sur les 11 routes publiques

```bash
PROD_LIKE="https://develop--fegesport224.netlify.app"
for u in "/" "/about" "/news" "/contact" "/membership" "/privacy" "/terms" "/partners" "/esport-guinee" "/federation-guineenne-esport" "/histoire-esport-guinee"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "${PROD_LIKE}${u}")
  echo "  HTTP $code  ${u}"
done
```

Attendu : 11 × HTTP 200. Si une seule erreur : NO-GO + rollback total.

---

# 6. Risques et procedures de rollback

| # | Risque | Probabilite | Severite | Procedure de rollback |
|---|--------|-------------|----------|------------------------|
| R1 | Erreur Etape A : bucket non cree, policies storage non appliquees | Faible | Modere | `docs/06-ROLLBACK.md` Cas 2 + relire le SQL avant re-execution |
| R2 | Erreur Etape B : RPC absente ou plante | Faible | Eleve | `docs/06-ROLLBACK.md` Cas 3 ; admin ne peut plus telecharger via signed URL → utiliser l'ancienne page (qui marche encore tant que H non lancee) |
| R3 | Erreur Etape E : migration partielle (certains fichiers manquent) | Modere | Modere | Garder bucket source intact (deja la consigne), relancer le script (idempotent), reviser CSV pour ne pas re-uploader ce qui est `already_present` |
| R4 | Erreur Etape H : RLS lockout admin | Faible | **Critique** | Executer rapidement Cas 5 (drop wave2 select policies). Si l'admin ne peut plus se connecter, utiliser la cle `service_role` cote dashboard pour revoquer. |
| R5 | Admin lockout (admin_users devient mal configure) | Faible | **Critique** | Verifier `admin_users.is_active = true` AVANT Etape H (pre-check 1.3). Service_role override possible. |
| R6 | Fichiers introuvables apres migration (path mismatch) | Faible | Modere | Le script preserve les paths. Si mismatch : re-lancer dry-run pour diagnostic. |
| R7 | Signed URLs invalides (extensions.create_signed_url indisponible) | Modere | Bas | Fallback sentinelle `object://` deja code dans la RPC. Le client `secureFileAccess.ts` resout via supabase-js. |
| R8 | Erreur de propagation Supabase (cache, transactions) | Tres faible | Modere | Patienter 60s, re-tester. Si persistance, rollback complet et investiguer. |
| R9 | Production publique impactee (jamais attendu) | Tres faible | **Critique** | Wave 2 ne touche pas les pages publiques. Si regression observee : rollback total et investigation immediate. |

## Rollback total (procedure d'urgence)

```sql
-- Executer dans l'ordre INVERSE de l'activation
BEGIN;
  -- 1. Rollback Phase 6 (RLS stricte) — restaurer les policies pre-Wave2
  DROP POLICY IF EXISTS "wave2_static_files_admin_select" ON public.static_files;
  DROP POLICY IF EXISTS "wave2_static_files_admin_modify" ON public.static_files;
  DROP POLICY IF EXISTS "wave2_file_categories_admin_select" ON public.file_categories;
  DROP POLICY IF EXISTS "wave2_file_categories_admin_modify" ON public.file_categories;
  DROP POLICY IF EXISTS "wave2_official_documents_admin_select" ON public.official_documents;
  DROP POLICY IF EXISTS "wave2_official_documents_admin_modify" ON public.official_documents;
  -- Restaurer les policies du backup (cf. fichier policies-backup-YYYYMMDD)

  -- 2. Rollback Phase 3 (RPC)
  DROP FUNCTION IF EXISTS public.get_signed_url(uuid, integer);
  DROP FUNCTION IF EXISTS public.get_signed_url_for_document(uuid, integer);
  DROP FUNCTION IF EXISTS public.is_active_admin();

  -- 3. Rollback Phase 2 (infra)
  DROP POLICY IF EXISTS "wave2_private_admin_select" ON storage.objects;
  DROP POLICY IF EXISTS "wave2_private_admin_insert" ON storage.objects;
  DROP POLICY IF EXISTS "wave2_private_admin_update" ON storage.objects;
  DROP POLICY IF EXISTS "wave2_private_admin_delete" ON storage.objects;
  DROP TABLE IF EXISTS public.download_logs CASCADE;
COMMIT;
```

> Le bucket `static-files-private` reste cree mais vide-utilisable. Il peut etre supprime manuellement via Dashboard si plus aucun usage.

---

# 7. Gates avant promotion `develop` → `main`

> **Ne pas creer la PR develop → main tant que les 7 points suivants ne sont pas tous OK sur develop.**

| # | Gate | Verification |
|---|------|--------------|
| G1 | Admin acces fonctionne sur `develop` | Test 5.1 = OK |
| G2 | Signed URLs emis correctement | Test 5.5 + 5.6 = OK |
| G3 | `download_logs` recoit des lignes | Test 5.7 = OK |
| G4 | RLS stricte active sans lockout | Test 5.1 = OK ET 6 policies en place |
| G5 | Aucune regression publique | Test 5.8 = 11/11 HTTP 200 |
| G6 | Production fegesport224.org toujours 11/11 HTTP 200 | `curl` check |
| G7 | Sitemap / robots.txt / llms.txt inchanges (16 URLs / 34 Disallow / HTTP 200) | `curl` check |

**GO PROMOTION** si les 7 gates sont OK pendant au moins 24h sans incident sur `develop`.
**NO-GO PROMOTION** sinon — debug et reprendre.

---

## 🧭 Recapitulatif visuel

```
                    ┌───────────────────────────────────────┐
                    │ Pre-checks (1.x)                      │
                    │ Sauvegarde (2.x)                      │
                    └──────────────────┬────────────────────┘
                                       │ GO
                                       ▼
                    ┌───────────────────────────────────────┐
                    │ Etape A  Infra (wave2_01)             │ ──┐
                    └──────────────────┬────────────────────┘   │
                                       │ GO                     │
                    ┌──────────────────▼────────────────────┐   │
                    │ Etape B  RPC (wave2_02)               │ ──┤
                    └──────────────────┬────────────────────┘   │
                                       │ GO                     │
                    ┌──────────────────▼────────────────────┐   │
                    │ Etape C  Dry-run migration            │   │
                    └──────────────────┬────────────────────┘   │
                                       │ GO                     │ NO-GO -> Rollback
                    ┌──────────────────▼────────────────────┐   │
                    │ Etape D  Analyse CSV                  │   │
                    └──────────────────┬────────────────────┘   │
                                       │ GO                     │
                    ┌──────────────────▼────────────────────┐   │
                    │ Etape E  Migration --confirm-live     │   │
                    └──────────────────┬────────────────────┘   │
                                       │ GO                     │
                    ┌──────────────────▼────────────────────┐   │
                    │ Etape F  Test admin sur develop       │   │
                    └──────────────────┬────────────────────┘   │
                                       │ GO                     │
                    ┌──────────────────▼────────────────────┐   │
                    │ Etape G  Verifier download_logs       │   │
                    └──────────────────┬────────────────────┘   │
                                       │ GO                     │
                    ┌──────────────────▼────────────────────┐   │
                    │ Etape H  RLS stricte (wave2_03)       │ ──┘
                    └──────────────────┬────────────────────┘
                                       │ GO
                                       ▼
                    ┌───────────────────────────────────────┐
                    │ Tests fonctionnels (5.1 a 5.8)        │
                    └──────────────────┬────────────────────┘
                                       │ GO
                                       ▼
                    ┌───────────────────────────────────────┐
                    │ Stabilite 24h + Gates G1-G7           │
                    └──────────────────┬────────────────────┘
                                       │ GO
                                       ▼
                                Promotion develop → main
```

---

## 🚫 Ce que ce runbook NE FAIT PAS

- ✅ Aucune execution Supabase
- ✅ Aucun fichier deplace
- ✅ Aucune RLS modifiee
- ✅ Aucune PR vers `main`
- ✅ Aucune modification de la production

Ce document est **statique** et sert exclusivement de plan d'execution humain.

---

## 📎 Annexes utiles

- `docs/wave2-private-storage/01-AUDIT.md` — etat des lieux pre-Wave 2
- `docs/wave2-private-storage/05-SECURITY-REPORT.md` — tableau avant/apres
- `docs/wave2-private-storage/06-ROLLBACK.md` — procedures de rollback par cas
- `supabase/migrations/wave2_01_infra_private_bucket_and_logs.sql`
- `supabase/migrations/wave2_02_rpc_get_signed_url.sql`
- `supabase/migrations/wave2_03_rls_strict.sql`
- `scripts/migrate-files-to-private.ts`
