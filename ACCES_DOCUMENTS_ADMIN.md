# Comment Accéder à la Page de Gestion des Documents

## Étape par Étape

### 1. Connexion
- Allez sur : `http://localhost:5173/admin/login`
- Ou cliquez sur le lien admin dans le footer

### 2. Dans le Menu Latéral Gauche
Vous verrez une longue liste de liens. **Scrollez vers le bas** jusqu'à voir :

```
📊 Notre Direction
🕐 Notre Histoire
📄 Documents Officiels    ← CLIQUEZ ICI
🏢 Partenaires
💬 Messages
```

### 3. Cliquez sur "Documents Officiels"
L'icône est : 📄 (FileText)

### 4. Vous Devriez Voir
Une page avec :
- Un titre : **"Documents Officiels"**
- Sous-titre : "Gérer les documents publiés sur le site"
- Une barre de progression rouge : **"0 / 7 documents publiés"**
- Des instructions dans un cadre bleu
- Un **TABLEAU** avec 7 lignes (les 7 documents)
- Chaque ligne a 3 boutons dans la colonne "Actions" :
  - **📤 Upload** ← CE BOUTON PERMET D'UPLOADER LES PDF
  - **👁️ Publier** (désactivé tant qu'il n'y a pas de fichier)
  - **🗑️** (désactivé tant qu'il n'y a pas de fichier)

## URL Directe
`http://localhost:5173/admin/documents`

## Si Vous Ne Voyez Toujours Pas les Boutons

### Vérifiez que vous êtes sur la bonne page :
- L'URL doit être : `/admin/documents`
- Le titre de la page doit être : "Documents Officiels"
- Il doit y avoir une barre de progression en haut

### Si vous voyez une page différente :
- Vous êtes peut-être sur `/admin/files` (Fichiers) - ce n'est PAS la même page
- Assurez-vous de cliquer sur **"Documents Officiels"** dans le menu (icône 📄)
- PAS sur "Fichiers" (icône 📁)

## Capture de ce que vous devriez voir :

```
┌─────────────────────────────────────────────────────────────────┐
│                    Documents Officiels                          │
│          Gérer les documents publiés sur le site                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  0 / 7 documents publiés                            0%     │ │
│  │  [████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ℹ️ Instructions:                                               │
│  • Uploadez un fichier PDF (max 20MB) pour chaque document    │
│  • Cliquez sur "Publier" pour rendre le document visible      │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ # │ Document         │ Langue │ Statut   │ Fichier │ Actions │
│  ├───┼─────────────────┼────────┼──────────┼─────────┼─────────┤
│  │ 1 │ 📋 Statuts de... │  FR    │ Manquant │ Aucun   │ 📤 👁️ 🗑️ │
│  │ 2 │ 📋 Federation... │  EN    │ Manquant │ Aucun   │ 📤 👁️ 🗑️ │
│  │ 3 │ 📜 Règlement...  │  FR    │ Manquant │ Aucun   │ 📤 👁️ 🗑️ │
│  │ 4 │ 📜 Internal...   │  EN    │ Manquant │ Aucun   │ 📤 👁️ 🗑️ │
│  │ 5 │ 📊 Rapport...    │  FR    │ Manquant │ Aucun   │ 📤 👁️ 🗑️ │
│  │ 6 │ 🎯 Plan Stra... │  FR    │ Manquant │ Aucun   │ 📤 👁️ 🗑️ │
│  │ 7 │ 🌍 Programme...  │ FR/EN  │ Manquant │ Aucun   │ 📤 👁️ 🗑️ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Comment Utiliser les Boutons

### Bouton "📤 Upload"
1. Cliquez dessus
2. Une fenêtre de sélection de fichier s'ouvre
3. Sélectionnez un fichier PDF
4. Le fichier est uploadé automatiquement
5. Un message vert apparaît : "Document uploadé avec succès"

### Bouton "👁️ Publier"
- Ce bouton est désactivé tant qu'aucun fichier n'est uploadé
- Après l'upload, il devient actif
- Cliquez pour publier le document sur le site public

### Bouton "🗑️ Supprimer"
- Ce bouton est désactivé tant qu'aucun fichier n'est uploadé
- Après l'upload, il devient actif
- Cliquez pour supprimer définitivement le fichier

## Problème Courant

**"Je suis dans l'admin mais je ne vois pas cette page"**

→ Solution : Dans le menu de gauche, scrollez jusqu'à voir "Documents Officiels" (📄)
→ C'est entre "Notre Histoire" et "Partenaires"
→ Ne confondez pas avec "Fichiers" qui est une page différente
