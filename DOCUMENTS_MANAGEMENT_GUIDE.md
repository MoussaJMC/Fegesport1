# Guide de Gestion des Documents Officiels

## Accès à la Page Admin

Pour accéder à l'interface de gestion des documents :

1. Connectez-vous à l'admin : `/admin/login`
2. Dans le menu latéral gauche, cliquez sur **"Documents Officiels"** (icône 📄)
3. Ou accédez directement à : `/admin/documents`

## Interface de Gestion

### Barre de Progression
En haut de la page, vous verrez :
- **"X / 7 documents publiés"** avec un pourcentage
- Une barre de progression rouge (couleur FEGESPORT)

### Tableau des Documents
Le tableau affiche 7 documents avec les colonnes :

1. **#** - Numéro d'ordre
2. **Document** - Icône et nom (ex: 📋 Statuts de la Fédération)
3. **Langue** - Badge FR (rouge), EN (bleu), ou FR/EN (mixte)
4. **Statut** :
   - 🟢 **Publié** - Fichier uploadé ET publié sur le site
   - 🟠 **En attente** - Fichier uploadé mais pas encore publié
   - 🔴 **Manquant** - Aucun fichier uploadé
5. **Fichier** - Nom du fichier et taille (si uploadé)
6. **Actions** - 3 boutons :
   - **📤 Upload** - Pour uploader un PDF
   - **👁️ Publier** / **🙈 Dépublier** - Toggle la visibilité publique
   - **🗑️ Supprimer** - Retire le fichier (irréversible)

## Workflow Complet

### Étape 1 : Upload d'un Document
1. Cliquez sur le bouton **"Upload"** pour un document
2. Sélectionnez un fichier PDF (max 20MB)
3. Le fichier est uploadé vers Supabase Storage
4. Le statut passe de "Manquant" 🔴 à "En attente" 🟠
5. Un toast confirme : *"Document uploadé avec succès"*

### Étape 2 : Publication
1. Une fois le fichier uploadé, cliquez sur **"Publier"**
2. Le statut passe à "Publié" 🟢
3. Un toast confirme : *"Document publié sur le site"*
4. **Le document apparaît INSTANTANÉMENT sur la page "À propos" du site public**

### Étape 3 : Vérification
1. Ouvrez la page publique "À propos" dans un autre onglet
2. Scrollez jusqu'à la section "Statuts & Documents Officiels"
3. Le document publié est maintenant visible et cliquable
4. Les visiteurs peuvent le consulter en lecture seule (pas de téléchargement)

### Options Supplémentaires

**Dépublier** :
- Cliquez sur "Dépublier" pour retirer temporairement le document du site
- Le fichier reste en base, mais n'est plus visible publiquement
- Statut : "En attente" 🟠

**Supprimer** :
- Cliquez sur l'icône 🗑️ pour supprimer définitivement le fichier
- Une confirmation est demandée : *"Supprimer ce fichier ? Cette action est irréversible."*
- Le fichier est retiré de Supabase Storage
- Statut : "Manquant" 🔴

## Synchronisation en Temps Réel

Le système utilise **Supabase Realtime** :
- Quand vous publiez un document, il apparaît **instantanément** sur le site public
- Pas besoin de rafraîchir la page
- Les mises à jour se synchronisent automatiquement

## Documents Disponibles

Les 7 documents pré-configurés sont :

### Textes Fondateurs
1. **Statuts de la Fédération** (FR) 📋
2. **Federation Statutes** (EN) 📋
3. **Règlement Intérieur** (FR) 📜
4. **Internal Regulations** (EN) 📜

### Rapports & Plans
5. **Rapport Annuel** (FR) 📊
6. **Plan Stratégique** (FR) 🎯
7. **Programme Développement Jeunes** (FR/EN) 🌍

## Contraintes Techniques

- **Format** : PDF uniquement
- **Taille max** : 20 MB
- **Stockage** : Supabase Storage bucket `official-documents`
- **Sécurité** :
  - Seuls les admins peuvent uploader/publier/supprimer
  - Le public peut seulement lire les documents publiés
  - Lecture seule (pas de téléchargement/impression)

## Dépannage

### Le bouton Upload ne répond pas
- Vérifiez que vous êtes bien connecté en tant qu'admin
- Vérifiez que le fichier est bien un PDF
- Vérifiez que le fichier fait moins de 20 MB

### Le document n'apparaît pas sur le site
- Vérifiez que le statut est bien "Publié" 🟢
- Vérifiez que vous regardez la bonne page : `/about` ou page "À propos"
- Videz le cache du navigateur (Ctrl+Shift+R)

### Erreur lors de l'upload
- Vérifiez votre connexion internet
- Vérifiez les permissions Supabase
- Consultez la console du navigateur (F12) pour les erreurs détaillées

## Base de Données

### Table : `official_documents`
```sql
- id (text, primary key)
- label_fr (text)
- label_en (text)
- description (text)
- icon (text)
- lang (text)
- group_name (text)
- file_url (text)
- file_name (text)
- file_size (integer)
- is_published (boolean)
- sort_order (integer)
- uploaded_at (timestamp)
- created_at (timestamp)
```

### Storage Bucket : `official-documents`
- Public : oui (lecture seule)
- Structure : `{document_id}/{filename}.pdf`
- Exemple : `statuts-fr/statuts-fr-1710437123456.pdf`
