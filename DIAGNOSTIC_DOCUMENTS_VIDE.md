# Diagnostic : Tableau de Documents Vide

## Problème Identifié

Vous voyez les **en-têtes** du tableau (#, Document, Langue, Statut, Fichier, Actions) mais **AUCUNE ligne de données** en dessous.

## Cause Principale

Le problème vient des **permissions RLS (Row Level Security)** : votre compte admin ne peut pas lire les données de la table `official_documents`.

## Solution Appliquée

Une migration a été créée et appliquée pour corriger les politiques RLS :
- **Fichier** : `supabase/migrations/20260314180000_fix_official_documents_admin_select.sql`
- **Action** : Remplace les anciennes politiques par de nouvelles utilisant la fonction `is_admin()`

## Comment Vérifier Maintenant

### 1. Rechargez la Page
1. Allez sur `/admin/documents`
2. Appuyez sur **Ctrl+Shift+R** (ou Cmd+Shift+R sur Mac) pour forcer le rechargement
3. Vous devriez maintenant voir **7 lignes** dans le tableau

### 2. Si le Tableau est Toujours Vide

Vous verrez maintenant une **grande boîte ROUGE** avec le message :
```
ERREUR : Aucun document chargé depuis la base de données
```

Suivez ces étapes :

#### A. Vérifiez la Console du Navigateur
1. Appuyez sur **F12** pour ouvrir les outils développeur
2. Allez dans l'onglet **"Console"**
3. Rechargez la page
4. Cherchez les messages rouges d'erreur

#### B. Vérifiez Votre Email Admin

L'email avec lequel vous êtes connecté doit être dans cette liste :
- `aamadoubah2002@gmail.com`
- `admin@fegesport.org`
- `admin@fegesport224.org`
- `president@fegesport224.org`

Pour vérifier votre email actuel :
1. Ouvrez la console (F12)
2. Tapez :
```javascript
supabase.auth.getUser().then(({data}) => console.log('Mon email:', data.user?.email))
```
3. Appuyez sur Entrée
4. Regardez l'email affiché

#### C. Si Votre Email N'est PAS dans la Liste

Vous devez l'ajouter à la fonction `is_admin()` :

1. Allez dans votre dashboard Supabase
2. Allez dans **SQL Editor**
3. Exécutez cette requête en remplaçant `VOTRE_EMAIL@example.com` :

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
user_email text;
BEGIN
  -- Récupérer l'email depuis le JWT
  user_email := auth.jwt() ->> 'email';
  
  -- Vérifier si l'email est dans la liste des admins
  RETURN user_email IN (
    'aamadoubah2002@gmail.com',
    'admin@fegesport.org',
    'admin@fegesport224.org',
    'president@fegesport224.org',
    'VOTRE_EMAIL@example.com'  -- AJOUTEZ VOTRE EMAIL ICI
  );
END;
$$;
```

4. Déconnectez-vous et reconnectez-vous
5. Rechargez la page `/admin/documents`

### 3. Ce Que Vous DEVEZ Voir si Tout Fonctionne

```
┌──────────────────────────────────────────────────────────────────────┐
│ # │ Document              │ Langue │ Statut   │ Fichier │ Actions    │
├───┼──────────────────────┼────────┼──────────┼─────────┼────────────┤
│ 1 │ 📋 Statuts de la...  │  FR    │ Manquant │ Aucun   │ 🔴🟢🗑️     │
│ 2 │ 📋 Federation Sta... │  EN    │ Manquant │ Aucun   │ 🔴🟢🗑️     │
│ 3 │ 📜 Règlement Inté... │  FR    │ Manquant │ Aucun   │ 🔴🟢🗑️     │
│ 4 │ 📜 Internal Regul... │  EN    │ Manquant │ Aucun   │ 🔴🟢🗑️     │
│ 5 │ 📊 Rapport Annuel    │  FR    │ Manquant │ Aucun   │ 🔴🟢🗑️     │
│ 6 │ 🎯 Plan Stratégique  │  FR    │ Manquant │ Aucun   │ 🔴🟢🗑️     │
│ 7 │ 🌍 Programme Déve... │ FR/EN  │ Manquant │ Aucun   │ 🔴🟢🗑️     │
└──────────────────────────────────────────────────────────────────────┘
```

🔴 = Bouton ROUGE "UPLOAD PDF"
🟢 = Bouton VERT "Publier" (grisé)
🗑️ = Bouton poubelle rouge (grisé)

## Messages de Diagnostic Ajoutés

La page affiche maintenant :
1. **Console** : "Documents loaded: X" où X = nombre de documents
2. **Toast rouge** : Si erreur avec le message exact
3. **Toast rouge** : "Aucun document trouvé" si la requête réussit mais retourne 0 résultats
4. **Boîte rouge** : Message d'erreur visible si tableau vide après chargement

## Vérification Manuelle dans Supabase

Pour vérifier que les données existent vraiment :

1. Allez dans votre dashboard Supabase
2. Allez dans **SQL Editor**
3. Exécutez :
```sql
SELECT id, label_fr, lang FROM official_documents ORDER BY sort_order;
```

Vous devriez voir 7 lignes.

## Si Rien ne Fonctionne

1. Vérifiez que vous êtes **connecté** (pas redirigé vers /admin/login)
2. Vérifiez l'URL : doit être exactement `/admin/documents`
3. Ouvrez la console (F12) et copiez TOUS les messages d'erreur
4. Vérifiez que la migration a bien été appliquée :

```sql
SELECT * FROM official_documents LIMIT 1;
```

Si cette requête fonctionne dans Supabase SQL Editor mais pas dans l'app, le problème est dans l'authentification.
