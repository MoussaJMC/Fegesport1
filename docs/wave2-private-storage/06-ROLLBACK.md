# 🔁 WAVE 2 — Procedure de rollback

**Principe** : tout est joue en migrations SQL idempotentes + 1 commit front. Le rollback se fait inversement, sans toucher aux pages piliers ni au SEO.

## Cas 1 — La PR est mergee mais aucune migration SQL executee
- Revert le merge Git : `git revert <merge-commit>`
- Aucune action SQL necessaire (les migrations Wave 2 n'ont pas tourne)

## Cas 2 — Migration SQL Phase 2 executee
- Rollback :
```sql
BEGIN;
DROP POLICY IF EXISTS "wave2_private_admin_select" ON storage.objects;
DROP POLICY IF EXISTS "wave2_private_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "wave2_private_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "wave2_private_admin_delete" ON storage.objects;
DROP TABLE IF EXISTS public.download_logs CASCADE;
-- Bucket: garder en place (vide), supprimable manuellement via Dashboard.
COMMIT;
```

## Cas 3 — Migration SQL Phase 3 executee
- Rollback :
```sql
DROP FUNCTION IF EXISTS public.get_signed_url(uuid, integer);
DROP FUNCTION IF EXISTS public.get_signed_url_for_document(uuid, integer);
DROP FUNCTION IF EXISTS public.is_active_admin();
```
- Recharger le front sans helper `secureFileAccess`

## Cas 4 — Migration des fichiers TS executee
- Le bucket source `static-files` n'est jamais vide pendant la migration : les anciens fichiers restent accessibles via URL publique tant que ce bucket n'est pas explicitement bascule en private.
- Pour revenir totalement :
  1. Reverter le commit front (cf. cas 1)
  2. Optionnellement vider le bucket prive : `Dashboard → Storage → static-files-private → Empty bucket`

## Cas 5 — RLS stricte Phase 6 executee
- Rollback :
```sql
BEGIN;
DROP POLICY IF EXISTS "wave2_static_files_admin_select" ON public.static_files;
DROP POLICY IF EXISTS "wave2_static_files_admin_modify" ON public.static_files;
DROP POLICY IF EXISTS "wave2_file_categories_admin_select" ON public.file_categories;
DROP POLICY IF EXISTS "wave2_file_categories_admin_modify" ON public.file_categories;
DROP POLICY IF EXISTS "wave2_official_documents_admin_select" ON public.official_documents;
DROP POLICY IF EXISTS "wave2_official_documents_admin_modify" ON public.official_documents;
-- (Optionnel) Recreer les politiques permissives precedentes
COMMIT;
```

## Garde-fous
- Aucune URL publique modifiee
- Aucun pilier SEO touche
- `robots.txt`, `sitemap.xml`, `llms.txt` intacts
- Footer/Navbar intacts
- Aucun fichier supprime tant qu'un humain ne valide pas la depreciation du bucket public
