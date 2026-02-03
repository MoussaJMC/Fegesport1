# Configuration de Google Maps pour la page LEG

## Pourquoi Google Maps?

La page LEG (League eSport de Guinée) utilise Google Maps pour afficher une carte interactive de la Guinée avec les 8 clubs régionaux marqués par des pins colorés.

## Obtenir une Clé API Google Maps

### Étape 1: Créer un Projet Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Se connecter avec votre compte Google
3. Cliquer sur le sélecteur de projet en haut
4. Cliquer sur "NOUVEAU PROJET"
5. Nommer le projet: `FEGESPORT-LEG` (ou autre nom)
6. Cliquer sur "CRÉER"

### Étape 2: Activer l'API Maps JavaScript

1. Dans le menu de gauche, aller sur **APIs et services** → **Bibliothèque**
2. Chercher "Maps JavaScript API"
3. Cliquer sur le résultat
4. Cliquer sur **ACTIVER**

### Étape 3: Créer une Clé API

1. Aller sur **APIs et services** → **Identifiants**
2. Cliquer sur **+ CRÉER DES IDENTIFIANTS**
3. Sélectionner **Clé API**
4. Votre clé est créée! Elle ressemble à: `AIzaSyXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX`

### Étape 4: Restreindre la Clé (Recommandé pour la Sécurité)

#### Restrictions d'Application

1. Cliquer sur la clé que vous venez de créer
2. Sous "Restrictions relatives à l'application", sélectionner:
   - **Sites web (références HTTP)**
3. Ajouter vos domaines autorisés:
   ```
   https://fegesport224.org/*
   http://localhost:5173/*
   ```

#### Restrictions d'API

1. Sous "Restrictions relatives aux API"
2. Sélectionner **Restreindre la clé**
3. Cocher uniquement:
   - ✅ **Maps JavaScript API**

4. Cliquer sur **ENREGISTRER**

### Étape 5: Configurer la Facturation (Obligatoire)

Google Maps nécessite un compte de facturation, mais offre **200$ de crédit gratuit par mois**.

1. Aller sur **Facturation** dans le menu
2. Cliquer sur **ASSOCIER UN COMPTE DE FACTURATION**
3. Suivre les instructions pour ajouter une carte de crédit

**Note**: Avec l'utilisation typique d'un site comme FEGESPORT, vous ne dépasserez pas les 200$ gratuits mensuels.

## Configuration dans le Projet

### Développement Local

Éditer le fichier `.env`:

```env
# Remplacer par votre clé
VITE_GOOGLE_MAPS_API_KEY=VOTRE_CLE_API_ICI
```

### Déploiement sur Netlify

#### Option 1: Via le Dashboard Netlify

1. Aller sur [app.netlify.com](https://app.netlify.com)
2. Sélectionner votre site
3. Aller dans **Site settings** → **Environment variables**
4. Cliquer sur **Add a variable**
5. Key: `VITE_GOOGLE_MAPS_API_KEY`
6. Value: `VOTRE_CLE_API`
7. Cliquer sur **Save**

#### Option 2: Via netlify.toml (Déjà configuré)

Le fichier `netlify.toml` est déjà configuré avec la variable. Il suffit de:

1. Aller dans **Netlify Dashboard** → **Environment variables**
2. Ajouter `VITE_GOOGLE_MAPS_API_KEY` avec votre clé

## Vérifier que ça Fonctionne

### En Local

```bash
npm run dev
# Ouvrir http://localhost:5173/leg
# Scroller vers la section "Carte Interactive"
# La carte Google Maps doit s'afficher avec les 8 clubs
```

### En Production

1. Déployer sur Netlify
2. Visiter `https://fegesport224.org/leg`
3. Scroller vers la carte
4. Les marqueurs colorés doivent apparaître sur la Guinée

## Fonctionnalités de la Carte

### Markers Interactifs

- **8 marqueurs colorés** correspondant aux couleurs des clubs
- **Animation DROP** au chargement
- **InfoWindow** au clic sur un marker avec:
  - Nom du club
  - Ville et région
  - Stats (trophées, win rate, rang)
  - Bouton "Voir le Profil Complet"

### Style Dark Gaming

La carte utilise un style sombre personnalisé qui s'intègre avec le design gaming de la page LEG:
- Background noir/gris
- Textes en vert/cyan
- Routes sombres
- Eau bleu foncé

### Légende

Sous la carte, une légende affiche tous les clubs avec leurs couleurs et villes.

## Coûts

### Tarification Google Maps

- **Chargement de carte**: $7 pour 1000 chargements
- **200$ gratuits/mois** = ~28,500 chargements gratuits
- Pour un site avec 10,000 visiteurs/mois qui voient la page LEG: **GRATUIT**

### Estimation FEGESPORT

Avec un trafic estimé de:
- 5,000 visiteurs/mois
- 50% visitent la page LEG
- = 2,500 chargements de carte/mois
- **Coût**: $0 (largement sous les 200$ gratuits)

## Alternatives (Si Nécessaire)

Si vous préférez ne pas utiliser Google Maps:

### 1. OpenStreetMap avec Leaflet

```bash
npm install leaflet react-leaflet
```

Avantages:
- ✅ Gratuit et open-source
- ✅ Pas de clé API nécessaire
- ❌ Moins de fonctionnalités
- ❌ Moins fluide

### 2. Mapbox

Avantages:
- ✅ 50,000 chargements gratuits/mois
- ✅ Design moderne
- ❌ Nécessite une clé API

## Dépannage

### Erreur: "This page can't load Google Maps correctly"

**Solution**: Vérifier que:
1. La clé API est valide
2. La facturation est activée
3. Maps JavaScript API est activée
4. Le domaine est autorisé dans les restrictions

### La carte est grise/vide

**Solution**: Ouvrir la console DevTools (F12) et vérifier:
- Messages d'erreur API
- Clé API incorrecte
- Problème de CORS

### Markers n'apparaissent pas

**Solution**: Vérifier que:
- Les coordonnées sont valides (latitude, longitude)
- Le fichier `legData.ts` contient les bonnes coordonnées

## Coordonnées des Clubs

Les coordonnées actuelles dans `src/data/legData.ts`:

| Club | Ville | Latitude | Longitude |
|------|-------|----------|-----------|
| Capital eSport Elite | Conakry | 9.6412 | -13.5784 |
| Kankan Cyber Kings | Kankan | 10.3853 | -9.3056 |
| Kindia Gaming Force | Kindia | 10.0573 | -12.8637 |
| Labé Strategy Masters | Labé | 11.3177 | -12.2895 |
| Mamou Speed Demons | Mamou | 10.3759 | -12.0914 |
| Nzérékoré FPS Fury | Nzérékoré | 7.7553 | -8.8179 |
| Boké Fight Legion | Boké | 10.9425 | -14.2920 |
| Faranah Foot Legends | Faranah | 10.0408 | -10.7440 |

## Support

En cas de problème:
1. Consulter [Google Maps Platform Docs](https://developers.google.com/maps/documentation)
2. Vérifier la [console Google Cloud](https://console.cloud.google.com/)
3. Voir les logs Netlify si erreur de build

---

**Configuration préparée par**: Claude AI
**Date**: 3 Février 2026
**Documentation**: GOOGLE_MAPS_SETUP.md

🗺️ La carte de la Guinée vous attend! 🇬🇳
