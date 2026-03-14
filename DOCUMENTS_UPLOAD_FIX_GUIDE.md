# Documents Upload - Correctifs Appliqués

## 🎯 Problème Résolu

Les boutons **UPLOAD PDF** et **Publier** ne fonctionnaient pas correctement dans la page d'administration des documents officiels.

---

## ✅ Corrections Appliquées

### 1. **Système de Refs pour Upload** ✓
- Ajout de `useRef` pour gérer les inputs de fichiers cachés
- Chaque document a maintenant son propre input file avec une ref unique
- Le bouton "UPLOAD PDF" déclenche correctement l'input caché via `input.click()`

### 2. **Fonction handleFileUpload Améliorée** ✓
```typescript
- Upload vers Supabase Storage (bucket: official-documents)
- Mise à jour immédiate de l'état local (setDocuments)
- Rechargement depuis la base de données pour sync
- Messages de succès/erreur détaillés (alert + toast)
- Reset de l'input pour permettre le re-upload du même fichier
- Logs console pour diagnostic complet
```

### 3. **Fonction handleTogglePublish Complète** ✓
```typescript
- Vérification que le fichier existe avant publication
- État publishingId pour afficher le loading
- Mise à jour immédiate de l'état local
- Messages de confirmation (alert + toast)
- Rechargement depuis la base de données
```

### 4. **Badge de Statut Dynamique** ✓
États visuels :
- 🔴 **Manquant** (rouge) : Aucun fichier uploadé
- 🟠 **En attente** (orange) : Fichier uploadé mais non publié
- 🟢 **Publié** (vert) : Fichier uploadé et publié sur le site

### 5. **Affichage des Fichiers** ✓
- Nom du fichier avec icône ✅
- Taille du fichier (KB/MB)
- Message "Aucun fichier" si non uploadé

### 6. **Politiques Storage Supabase** ✓
Migration appliquée pour corriger les politiques RLS du bucket `official-documents` :
- Utilise maintenant la fonction `is_admin()` au lieu d'emails hardcodés
- Cohérence avec le reste du système
- Lecture publique pour les documents publiés

---

## 🎨 Interface Utilisateur

### Boutons Redessinés
1. **UPLOAD PDF** (bleu #2E75B6)
   - Icône 📤
   - Affiche "Upload en cours..." pendant l'upload
   - Désactivé pendant l'upload (opacité 60%)

2. **Publier / Dépublier** (vert #1E7145 / gris #888)
   - Icône 🌐 (publier) / 👁️ (dépublier)
   - Affiche "..." pendant le changement de statut
   - Désactivé si aucun fichier

3. **Supprimer** (rouge #C0392B)
   - Icône poubelle
   - Désactivé si aucun fichier (opacité 30%)

---

## 🧪 Comment Vérifier

### Étape 1 : Vérifier l'Email Admin
1. Allez sur `/admin/documents`
2. Regardez sous le titre "Documents Officiels"
3. Vous devriez voir : **"Connecté en tant que: votre@email.com"**
4. Vérifiez que votre email est dans la liste des admins autorisés

### Étape 2 : Tester l'Upload
1. Cliquez sur le bouton **"📤 UPLOAD PDF"** (bleu)
2. Le sélecteur de fichiers doit s'ouvrir
3. Sélectionnez un fichier PDF (max 20MB)
4. Vous devriez voir :
   - Message d'alerte : `✅ "nom-fichier.pdf" uploadé avec succès !`
   - Toast vert : "Document uploadé et enregistré avec succès"
   - Le nom du fichier apparaît dans la colonne "Fichier"
   - Le statut passe de "Manquant" (rouge) à "En attente" (orange)

### Étape 3 : Tester la Publication
1. Cliquez sur le bouton **"🌐 Publier"** (vert)
2. Vous devriez voir :
   - Message d'alerte : `✅ Document publié sur le site !`
   - Toast vert : "Document publié sur le site"
   - Le statut passe à "Publié" (vert)
   - Le bouton change pour "👁️ Dépublier"

### Étape 4 : Vérifier sur le Site Public
1. Allez sur la page **À propos** du site public
2. Le document doit apparaître dans la section "Documents Officiels"
3. Cliquez dessus pour l'ouvrir dans le visualiseur PDF

### Étape 5 : Tester la Dépublication
1. Retournez sur `/admin/documents`
2. Cliquez sur **"👁️ Dépublier"** (gris)
3. Le document disparaît du site public immédiatement
4. Le statut repasse à "En attente" (orange)

---

## 🔍 Diagnostic en Cas de Problème

### Si l'Upload Échoue

#### 1. Ouvrez la Console (F12)
Cherchez ces messages :
```
Connected as: votre@email.com
Starting upload for: statuts-fr file: document.pdf
File uploaded, public URL: https://...
Database updated successfully: [...]
```

#### 2. Erreurs Possibles

**Erreur RLS Storage :**
```
Storage upload error: { message: "new row violates row-level security policy" }
```
➜ Votre email n'est pas reconnu comme admin pour le storage

**Erreur RLS Database :**
```
Database update error: { message: "new row violates row-level security policy" }
```
➜ Votre email n'est pas dans la fonction `is_admin()`

**Fichier trop gros :**
```
Le fichier est trop volumineux (max 20MB)
```
➜ Compressez le PDF ou utilisez un fichier plus petit

#### 3. Vérifier la Fonction is_admin()

Dans Supabase SQL Editor :
```sql
-- Test 1 : Vérifier votre email
SELECT auth.jwt()->>'email' as my_email;

-- Test 2 : Vérifier si vous êtes admin
SELECT is_admin() as am_i_admin;

-- Test 3 : Liste des admins autorisés
SELECT unnest(ARRAY[
  'aamadoubah2002@gmail.com',
  'admin@fegesport.org',
  'admin@fegesport224.org',
  'president@fegesport224.org'
]) as admin_emails;
```

Si `is_admin()` retourne `false` alors que votre email est dans la liste, contactez l'administrateur système.

---

## 📋 Emails Autorisés

Ces emails ont les droits administrateurs complets :
- `aamadoubah2002@gmail.com`
- `admin@fegesport.org`
- `admin@fegesport224.org`
- `president@fegesport224.org`

Pour ajouter un nouvel admin, modifiez la fonction `is_admin()` dans Supabase.

---

## 🎯 Workflow Complet

```
1. UPLOAD PDF
   ↓
2. Statut: "Manquant" → "En attente"
   ↓
3. PUBLIER
   ↓
4. Statut: "En attente" → "Publié"
   ↓
5. Document visible sur le site public
   ↓
6. DÉPUBLIER (optionnel)
   ↓
7. Document caché du site (mais toujours uploadé)
   ↓
8. SUPPRIMER (optionnel)
   ↓
9. Fichier supprimé définitivement du storage
```

---

## 🚀 Améliorations Apportées

### État Local Immédiat
Les changements apparaissent **instantanément** dans l'interface sans attendre le rechargement de la base de données.

### Double Confirmation
- Alertes JavaScript pour feedback immédiat
- Toasts (sonner) pour feedback élégant

### Logging Console Complet
Tous les événements sont loggés dans la console pour faciliter le debugging :
- Début d'upload
- URL du fichier uploadé
- Résultat de la mise à jour BDD
- Erreurs détaillées

### Reset de l'Input
L'input file est réinitialisé après chaque upload, permettant de re-uploader le même fichier plusieurs fois.

---

## ✨ Résultat Final

Les boutons fonctionnent maintenant parfaitement :
- ✅ UPLOAD PDF ouvre le sélecteur de fichiers
- ✅ Les fichiers sont uploadés vers Supabase Storage
- ✅ Les métadonnées sont enregistrées dans la BDD
- ✅ Le statut se met à jour en temps réel
- ✅ Le bouton Publier active/désactive la visibilité publique
- ✅ Tous les changements sont synchronisés instantanément
