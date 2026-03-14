# Guide de Téléchargement des Documents - Version Améliorée

## Ce qui a été amélioré

### Boutons ULTRA VISIBLES
Les boutons ont été redesignés pour être impossibles à manquer :

1. **Bouton "UPLOAD PDF"** :
   - Couleur : ROUGE VIF (#C0392B - couleur FEGESPORT)
   - Texte : "UPLOAD PDF" en MAJUSCULES blanches
   - Icône : 📤 (flèche vers le haut)
   - Taille : Grande, avec padding généreux
   - Effet hover : Plus foncé quand vous passez la souris

2. **Bouton "Publier"** :
   - Couleur : VERT (#059669)
   - Texte : "Publier" avec icône œil
   - Désactivé (gris) tant que le fichier n'est pas uploadé

3. **Bouton "Supprimer"** :
   - Couleur : ROUGE pour suppression
   - Icône : 🗑️ (poubelle)
   - Désactivé (gris) tant que le fichier n'est pas uploadé

## Comment Accéder à la Page

1. Connectez-vous à `/admin/login`
2. Dans le menu latéral GAUCHE, cliquez sur **"Documents Officiels"** (icône 📄)
3. Ou allez directement à : `http://localhost:5173/admin/documents`

## Ce Que Vous DEVEZ Voir

- Un titre "Documents Officiels" en haut
- Une boîte JAUNE avec instructions (si aucun doc uploadé)
- Une barre de progression rouge "0 / 7 documents publiés"
- Un TABLEAU avec 7 lignes
- Dans chaque ligne, 3 boutons dans la colonne "Actions" :
  - **ROUGE** avec "UPLOAD PDF" (toujours actif)
  - **VERT** avec "Publier" (désactivé jusqu'à upload)
  - **ROUGE** poubelle (désactivé jusqu'à upload)

## Comment Utiliser

1. Cliquez sur le bouton **ROUGE "UPLOAD PDF"**
2. Sélectionnez un fichier PDF (max 20MB)
3. Le fichier s'uploade automatiquement
4. Cliquez sur le bouton **VERT "Publier"**
5. Le document apparaît sur la page "À propos"
