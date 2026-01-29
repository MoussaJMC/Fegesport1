# Fix de la création d'articles dans l'interface admin

## Problème identifié

Les administrateurs ne pouvaient pas créer de nouveaux articles depuis l'interface admin car la politique RLS (Row Level Security) de la table `news` ne comportait pas de clause `WITH CHECK` pour les opérations d'insertion.

## Détails techniques

### Ancienne configuration
La politique "Admin has full access to news" avait :
- `USING (is_admin())` - permettait SELECT, UPDATE, DELETE
- `WITH CHECK` = null - **bloquait les INSERT**

### Cause
La clause `WITH CHECK` est requise pour les opérations INSERT et UPDATE dans PostgreSQL RLS. Sans cette clause, même si la politique permet "ALL", les insertions sont rejetées.

## Solution appliquée

### Migration créée : `fix_news_insert_policy.sql`

```sql
-- Suppression des anciennes politiques
DROP POLICY IF EXISTS "Admin has full access to news" ON public.news;
DROP POLICY IF EXISTS "Public can view published news" ON public.news;

-- Nouvelle politique complète pour les admins
CREATE POLICY "Admin can do everything with news"
  ON public.news
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());  -- ✓ Clause ajoutée

-- Politique de lecture publique
CREATE POLICY "Public can view published news"
  ON public.news
  FOR SELECT
  USING (published = true OR public.is_admin());
```

## Résultat

✓ Les administrateurs peuvent maintenant :
- Créer de nouveaux articles
- Modifier les articles existants
- Supprimer des articles
- Publier/dépublier des articles

✓ Le public peut :
- Voir uniquement les articles publiés

## Test de validation

- Build réussi ✓
- Politiques RLS vérifiées ✓
- Clause WITH CHECK présente ✓

## Impact

Zéro impact sur les fonctionnalités existantes. Correction uniquement de la création d'articles.
