# Guide de téléchargement des documents officiels

## Problème résolu
Le système de documents officiels est maintenant complètement fonctionnel avec téléchargement intégré.

## Comment télécharger vos documents PDF

### Étape 1 : Accéder à l'administration
1. Connectez-vous à `/admin/login`
2. Allez sur `/admin/documents`

### Étape 2 : Modifier un document existant
1. Trouvez le document que vous voulez mettre à jour
2. Cliquez sur le bouton **"Modifier"** (icône crayon)

### Étape 3 : Télécharger le PDF
1. Dans le formulaire, cherchez la section **"Fichier PDF"**
2. Cliquez sur le bouton **"Sélectionner le fichier PDF"**
3. Choisissez votre fichier PDF (max 50MB)
4. Attendez que le téléchargement se termine
5. Vous verrez une coche verte **"Fichier sélectionné"** quand c'est prêt
6. L'URL du fichier s'affichera automatiquement en dessous

### Étape 4 : Enregistrer
1. Remplissez les autres champs si nécessaire
2. Cliquez sur **"Enregistrer"**

## Résultat
- Le document sera visible sur la page `/about`
- Les utilisateurs pourront le consulter dans le visualiseur sécurisé
- Le PDF sera protégé contre le téléchargement

## Où sont stockés les fichiers ?
Les fichiers sont stockés dans le bucket Supabase `official-documents` :
- Limite : 50MB par fichier
- Format accepté : PDF uniquement
- Accès : Public en lecture, admins peuvent modifier

## Que faire en cas d'erreur ?
Si vous voyez toujours une erreur après avoir téléchargé un fichier :
1. Vérifiez que le fichier est bien un PDF valide
2. Vérifiez que le fichier ne dépasse pas 50MB
3. Assurez-vous d'avoir cliqué sur "Enregistrer" après le téléchargement
4. Actualisez la page `/about` pour voir les changements

## Important
- Les anciens documents avec des URLs externes (africau.edu, etc.) afficheront un message d'alerte
- Vous devez remplacer ces URLs par de vrais fichiers PDF via le système de téléchargement
- Une fois téléchargé, le PDF sera accessible immédiatement
