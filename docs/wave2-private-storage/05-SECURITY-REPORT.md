# 🛡️ WAVE 2 — Rapport securite Avant / Apres

**Date** : 2026-06-11
**Branche** : `feature/wave2-private-storage`
**Statut** : artefacts PRETS — migration SQL **NON EXECUTEE** — RLS stricte **NON ACTIVEE**
**A executer apres validation** : Phase 2 SQL → Phase 3 SQL → migration TS → Phase 6 RLS

---

## Tableau Avant / Apres

| Controle | Avant Wave 2 | Apres Wave 2 |
|----------|--------------|---------------|
| Bucket public | **Oui** (`static-files`) | **Non** (`static-files-private`, `public=false`) |
| URL publique stockee en clair en base | **Oui** (`static_files.file_url`) | **Non** (resolu en runtime via signed URL) |
| Signed URL avec TTL court | **Non** | **Oui** (default 900s, clamp 60-3600s) |
| Audit logs telechargements | **Non** | **Oui** (`download_logs` table + RPC inserts) |
| RLS stricte sur `static_files` | **Partielle** (`is_public=true` permet SELECT public, "Admin has full access" filtrait sur `authenticated` au lieu de admin) | **Complete** (`is_active_admin()` requise pour TOUS les acces) |
| RLS stricte sur `file_categories` | **Partielle** (SELECT par tous) | **Complete** |
| RLS stricte sur `official_documents` | **Partielle** | **Complete** |
| Politique storage.objects | SELECT public sur bucket | SELECT reserve a `is_admin()` sur bucket prive |
| Defense en profondeur cote app | `AdminGuard` route + nettoyage maillage | `AdminGuard` + signed URL + RLS + audit |
| Tracabilite | Aucune | `download_logs` (file_id, user_id, time, ip, ua, source) |
| Resistance aux URLs leak | Faible (URLs publiques permanentes) | Forte (signed URLs expirent en 15 min) |
| Resistance au scraping | Faible (URLs cles fixes) | Forte (URLs ne sont jamais en clair en DOM) |

---

## Quel niveau de risque restant ?

| Risque residuel | Severite | Mitigation deja en place |
|------------------|----------|--------------------------|
| Un admin malveillant divulgue volontairement une signed URL | Modere | Audit log permet d'identifier l'origine ; TTL 15 min limite l'impact |
| Un admin colle une signed URL valide dans un mail public | Modere | TTL limite ; defense humaine (procedure interne) |
| Token JWT admin compromis | Eleve | Authn Supabase + 2FA recommande au niveau Supabase Auth |
| Anciennes copies Wayback Machine | Modere | A traiter via demande de retrait apres bucket public depreciee |

---

## Conformite aux contraintes du chantier

| Contrainte | Respectee |
|------------|-----------|
| Aucun changement sur `/esport-guinee`, `/federation-guineenne-esport`, `/histoire-esport-guinee` | ✅ |
| Aucun changement sur `/about`, `/news`, `/contact`, `/membership`, `/privacy`, `/terms`, `/partners` | ✅ |
| Aucun changement sur `robots.txt`, `sitemap.xml`, `llms.txt` | ✅ |
| Aucun changement de footer/Navbar/UX | ✅ |
| Aucun changement de schema.org / meta SEO | ✅ |
| Aucune URL publique modifiee | ✅ |
| Aucune migration executee automatiquement | ✅ |
| Toutes les protections deja en place renforcees | ✅ |
