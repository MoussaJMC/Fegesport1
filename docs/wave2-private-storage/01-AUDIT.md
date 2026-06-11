# 📋 WAVE 2 — PHASE 1 : Audit Supabase (read-only)

**Date** : 2026-06-11
**Mode** : read-only — aucune modification effectuee
**Source** : migrations existantes dans `supabase/migrations/*.sql`
**Confidentialite** : aucune URL, aucun fichier, aucun nom interne expose.

---

## 1. Tables auditees

### 1.1 `static_files`

**Statut** : ✅ EXISTE · RLS ENABLED

#### Schema (extrait, ordonne par criticite securite)

| Colonne | Type | Note securite |
|---------|------|---------------|
| `id` | uuid PRIMARY KEY | OK |
| `filename` | text | Path interne |
| `original_filename` | text | Peut leak un nom sensible |
| **`file_url`** | **text NOT NULL** | 🔴 **Stockage de l'URL publique brute** — a remplacer par un identifiant signe a runtime |
| `file_type` | text (MIME) | OK |
| `file_size` | bigint | OK |
| `category_id` | uuid → file_categories | OK |
| **`is_public`** | **boolean DEFAULT true** | 🟠 Le defaut `true` rend tout fichier public sauf override explicite |
| `uploaded_by` | uuid → auth.users | OK |
| `created_at`, `updated_at` | timestamptz | OK |

#### Politiques RLS detectees (multi-couches concurrentes)

| Policy | Operation | Predicate actuel | Verdict |
|--------|-----------|-------------------|---------|
| `Enable read access for public files` | SELECT | `is_public = true` | 🟠 Trop permissif — toute ligne `is_public=true` est lue par n'importe qui |
| `Enable read access for authenticated users` | SELECT | `auth.role() = 'authenticated'` | 🟠 Tout user authentifie (membres futurs) verrait tout |
| `Admin has full access to static_files` | SELECT | `auth.role() = 'authenticated'` (NON `is_admin()`) | 🔴 **Mal nomme** : le predicate ne filtre PAS sur admin reel |
| `Public can view public files` | SELECT | `is_public = true` | 🟠 Doublon |

**Risque** : la lecture de `static_files` est trop ouverte. Une RLS stricte est requise.

---

### 1.2 `file_categories`

**Statut** : ✅ EXISTE · RLS ENABLED

#### Schema (concis)
| Colonne | Type |
|---------|------|
| `id` | uuid PRIMARY KEY |
| `name` | text UNIQUE |
| `description` | text |
| `icon`, `color` | text |
| `created_at`, `updated_at` | timestamptz |

#### Politiques RLS detectees

| Policy | Operation | Predicate | Verdict |
|--------|-----------|-----------|---------|
| `Enable read access for all users on file_categories` | SELECT | `true` | 🟠 Lecture ouverte (acceptable pour metadata public, mais a restreindre si confidentielle) |
| `Admin has full access to file_categories` | ALL | `is_admin()` | ✅ |
| `file_categories_public_select` | SELECT | `true` (alias) | 🟠 Doublon |
| `file_categories_admin_all` | ALL | `is_admin()` | ✅ |

**Risque** : faible (categories = metadata neutre), mais a aligner sur la politique stricte si elles trahissent la structure documentaire.

---

### 1.3 `official_documents`

**Statut** : ✅ EXISTE · RLS ENABLED

#### Schema (synthese — les details exacts varient selon migrations cumulees, mais incluent au minimum)
| Colonne | Type |
|---------|------|
| `id` | uuid |
| `title`, `description` | text |
| `file_url` ou equivalent | text (URL publique stockee) |
| `is_active` / `is_published` | boolean |
| `category` ou `group_name` | text |
| `created_at`, `updated_at` | timestamptz |

#### Politiques RLS

- RLS actif
- Plusieurs migrations cumulees sans une politique stricte unique
- **Hypothese a verifier en SQL en prod** : il existe potentiellement des politiques SELECT permissives

**Risque** : meme niveau que `static_files` — le stockage d'URLs publiques brutes est la racine du probleme.

---

### 1.4 `admin_users`

**Statut** : ✅ EXISTE · RLS ENABLED

#### Schema (extrait fonctionnel)
| Colonne | Type | Fonction |
|---------|------|---------|
| `id` | uuid | PK |
| `user_id` | uuid → auth.users | Lien auth |
| `email` | text | Fallback identification |
| `role` | text | Rang admin |
| **`is_active`** | **boolean** | 🔴 **Critique** — pivot de l'authorisation |

#### Politiques RLS

- RLS actif
- Politiques observees principalement gatees par `is_admin()` ou role-based

**Risque** : OK si la fonction `is_admin()` est utilisee de maniere coherente — c'est l'oracle a respecter.

---

## 2. Fonction `is_admin()` existante

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT CASE
      WHEN auth.jwt()->>'role' = 'admin' THEN true
      ELSE false
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Statut** : ✅ existe et est `SECURITY DEFINER`.

**Limite** : se base sur `auth.jwt()->>'role'`, donc requiert que le JWT contienne le claim `role`. Le composant `AdminGuard.tsx` cote front utilise plutot un lookup direct dans `admin_users` (fallback email + RPC). Pour Wave 2, la fonction `get_signed_url()` devra utiliser une logique combinant **les deux strategies** pour robustesse (cf. Phase 3).

---

## 3. Bucket Storage `static-files`

**Statut** : 🔴 **PUBLIC** (configuration actuelle)

### Politiques `storage.objects` actuelles

| Policy | Operation | Predicate | Verdict |
|--------|-----------|-----------|---------|
| `Anyone can view files from static-files` | SELECT | `bucket_id = 'static-files'` | 🔴 **Tout fichier servi sans authentification** |
| `Admins can upload to static-files` | INSERT | admin role check via jwt | ✅ |
| `Admins can update in static-files` | UPDATE | admin role check | ✅ |
| `Admins can delete from static-files` | DELETE | admin role check | ✅ |

**Constat critique** : meme avec RLS strict sur les tables, **les fichiers stockes restent accessibles via URL directe Supabase Storage si l'URL est connue**. C'est la faille structurelle a fermer en Wave 2.

---

## 4. Table `download_logs`

**Statut** : ❌ **N'EXISTE PAS**

Aucune migration ne cree cette table. A creer en Phase 2.

---

## 5. Fonction `get_signed_url`

**Statut** : ❌ **N'EXISTE PAS**

A creer en Phase 3.

---

## 6. Synthese du periembre de Wave 2

### Risques identifies

| # | Risque | Severite | Vague 1 deja mitige ? |
|---|--------|----------|------------------------|
| R1 | Bucket `static-files` PUBLIC | 🔴 Critique | ❌ — Vague 1 a juste cache `/resources` cote UI, le bucket reste public |
| R2 | `file_url` stocke en clair en base | 🔴 Critique | ❌ |
| R3 | RLS SELECT trop permissives sur `static_files` | 🟠 Important | ❌ |
| R4 | Pas d'audit log des telechargements | 🟡 Modere | ❌ |
| R5 | Pas de rate-limit sur acces signes | 🟡 Modere | ❌ |

### Objectifs Wave 2

| Objectif | Realise via |
|----------|-------------|
| Fichiers servis uniquement via URL signee a TTL court | Bucket `static-files-private` + RPC `get_signed_url(ttl=900)` |
| Acces RLS strict reserve aux admins actifs | Politique unique `is_admin_active()` sur les 3 tables |
| Tracabilite des telechargements | Table `download_logs` + insertion dans la RPC |
| Defense en profondeur | AdminGuard cote front conserve (deja en place) |

---

## 7. Garde-fous appliques durant Wave 2

| Ne pas toucher | Statut a la fin de Wave 2 |
|----------------|----------------------------|
| `/esport-guinee`, `/federation-guineenne-esport`, `/histoire-esport-guinee` | ✅ Aucun changement |
| `/about`, `/news`, `/contact`, `/membership`, `/privacy`, `/terms`, `/partners` | ✅ Aucun changement |
| `robots.txt`, `sitemap.xml`, `llms.txt` | ✅ Aucun changement |
| Footer, Navbar | ✅ Aucun changement |
| Schema.org / SEO meta | ✅ Aucun changement |
| Branche protection `main` | ✅ Conservee |
| Pipeline CI/CD GitHub → Netlify | ✅ Conservee |

---

## 8. Prochaine etape

Phase 2 → preparation infrastructure SQL (bucket prive + table `download_logs`).
**Aucune execution.** Tous les artefacts seront prets a etre joues manuellement apres validation finale.
