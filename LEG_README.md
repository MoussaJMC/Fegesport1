# LEG - League eSport de Guinée 🎮🔥

## Vue d'ensemble

Une page captivante et immersive dédiée à la **League eSport de Guinée (LEG)**, présentant 8 clubs régionaux (un par capitale de Guinée) compétant dans 5 disciplines eSport majeures.

## Accès à la page

🔗 **URL**: `http://localhost:5173/leg`

Le lien "LEG" est automatiquement ajouté à la barre de navigation principale du site.

## Structure de la LEG

### 🏆 8 Clubs Régionaux

Chaque club représente une capitale guinéenne et est dirigé par un Représentant Fédéral:

| Capitale | Club | Couleur | Spécialité |
|----------|------|---------|-----------|
| **Conakry** | Capital eSport Elite | Rouge | Excellence globale |
| **Kankan** | Kankan Cyber Kings | Orange | Stratégie & Leadership |
| **Kindia** | Kindia Gaming Force | Vert | Force & Unité |
| **Labé** | Labé Strategy Masters | Violet | Maîtrise stratégique |
| **Mamou** | Mamou Speed Demons | Orange | Vitesse & Agilité |
| **Nzérékoré** | Nzérékoré FPS Fury | Rouge | FPS & Précision |
| **Boké** | Boké Fight Legion | Rose | Combat & Fighting |
| **Faranah** | Faranah Foot Legends | Vert | Football virtuel |

### 🎮 5 Disciplines eSport

Chaque club participe aux 5 disciplines:

1. **Stratégie** 🧠
   - League of Legends
   - Dota 2

2. **FPS** 🎯
   - CS:GO
   - Valorant

3. **Football** ⚽
   - FC 26
   - eFootball

4. **Racing** 🏎️
   - F1 24
   - Gran Turismo

5. **Fighting** 🥊
   - Tekken 8
   - Street Fighter 6

## Fonctionnalités de la page

### 🌟 Hero Section Explosive
- Animation de particules dynamiques
- Couleurs du drapeau guinéen (rouge, jaune, vert)
- CTA attractifs pour naviguer vers les sections principales
- Effet parallax au scroll

### 🗺️ Carte Interactive
- Visualisation géographique des 8 clubs
- Pins pulsants colorés par club
- Modal détaillé au clic sur un club
- Info-bulles au survol

### 🏅 Profils de Clubs
- Cards 3D avec effet flip au survol
- Badge de classement
- Statistiques en temps réel:
  - Nombre de trophées
  - Win rate
  - Viewers Twitch
- Info leader (nom, citation motivante)
- Badges des 5 disciplines

### 📊 Classements Live
- Onglets filtrables par discipline
- Classement général
- Tableau interactif avec:
  - Position
  - Win rate visualisé
  - Nombre de viewers
  - Trophées

### 🎯 Section Tournois
- Compte à rebours du prochain tournoi
- Informations détaillées (discipline, format, prize pool)
- Liste des streams en direct
- Intégration future avec Twitch

### 👥 Communauté
- Appel à rejoindre Discord
- Newsletter
- Liens vers les réseaux sociaux

## Design & Animations

### 🎨 Thème Gaming Épique
- **Background**: Dégradés sombres (noir, gris 900)
- **Couleurs principales**:
  - Vert (#10B981) - Guinée
  - Jaune (#F59E0B) - Guinée
  - Rouge (#DC2626) - Guinée
- **Accents**: Violet, Orange, Rose, Bleu

### ✨ Animations
- **Particules**: 50 particules animées en arrière-plan
- **Parallax**: Hero section avec effet de profondeur
- **Hover Effects**:
  - Scale & rotation 3D sur les cards
  - Glow effects sur les boutons
  - Transitions fluides
- **Scroll Animations**: Révélation progressive des sections
- **Pulsations**: Badges de classement et pins de carte

### 📱 Responsive Design
- Grilles adaptatives (1, 2, 3, 4, 5 colonnes)
- Menu mobile optimisé
- Breakpoints: mobile, tablet, desktop
- Touch-friendly sur mobile

## Structure des données

### 📦 Fichiers créés

1. **`/src/data/legData.ts`**
   - Interfaces TypeScript (Club, Discipline, ClubStats)
   - Données des 8 clubs
   - Données des 5 disciplines
   - Fonctions utilitaires (classements, filtres)

2. **`/src/pages/LEGPage.tsx`**
   - Composant React principal
   - 2000+ lignes de code
   - Sections modulaires

### 🔧 Personnalisation facile

Pour modifier les données:

```typescript
// Dans legData.ts

// Ajouter un club
export const clubs: Club[] = [
  {
    id: 'nouveau-club',
    name: 'Nouveau Club Gaming',
    city: 'Ville',
    region: 'Région',
    leader: {
      name: 'Rep. Féd. Ville',
      title: 'Représentant Fédéral',
      quote: "Citation motivante"
    },
    coordinates: [latitude, longitude],
    color: '#HEX_COLOR',
    stats: { trophies: 0, streamViewers: 0, winRate: 0, rank: 9 },
    disciplines: { /* ... */ },
    socials: { /* ... */ }
  }
];

// Modifier une discipline
disciplines.push({
  id: 'nouvelle-discipline',
  name: 'Battle Royale',
  games: ['Fortnite', 'Apex Legends'],
  icon: '🏹',
  color: '#FF6B6B'
});
```

## Technologies utilisées

- **React 18** avec TypeScript
- **Framer Motion** pour les animations
- **Lucide React** pour les icônes
- **Tailwind CSS** pour le styling
- **React Router** pour la navigation

## Intégrations futures recommandées

### 🗺️ Carte interactive avancée
```bash
npm install react-leaflet leaflet
```
Remplacer le placeholder de carte par une vraie carte Leaflet de Guinée.

### 🎥 Intégration Twitch
```bash
npm install react-player
```
Pour afficher les streams live directement sur la page.

### 🔥 Animations avancées
```bash
npm install gsap @gsap/react three @react-three/fiber
```
Pour des effets 3D et des animations complexes.

### 🔊 Sons interactifs
```bash
npm install use-sound
```
Pour ajouter des effets sonores au survol et aux clics.

### 📊 Données en temps réel
Intégrer avec Supabase pour:
- Classements live
- Statistiques de joueurs
- Résultats de tournois
- Calendrier d'événements

## Migration vers base de données

Pour passer des données statiques vers Supabase:

```sql
-- Créer les tables
CREATE TABLE leg_clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  leader_name TEXT NOT NULL,
  leader_quote TEXT,
  color TEXT NOT NULL,
  coordinates POINT,
  trophies INTEGER DEFAULT 0,
  stream_viewers INTEGER DEFAULT 0,
  win_rate INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE leg_disciplines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  games TEXT[] NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE leg_club_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES leg_clubs(id),
  discipline_id UUID REFERENCES leg_disciplines(id),
  roster TEXT[],
  achievements TEXT[],
  stats JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## SEO & Performance

### Meta tags recommandés
```html
<meta name="description" content="LEG - League eSport de Guinée : 8 clubs, 5 disciplines, 1 nation. Rejoignez la révolution eSport guinéenne!" />
<meta property="og:title" content="LEG - League eSport de Guinée" />
<meta property="og:description" content="8 clubs régionaux, 5 disciplines eSport. La première ligue nationale d'eSport en Guinée." />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```

### Optimisations possibles
- Code splitting par section
- Lazy loading des images
- Service Worker pour PWA
- Image optimization (WebP, formats modernes)
- Compression des assets

## Support & Contribution

Pour toute question ou amélioration:
1. Vérifier la structure des données dans `legData.ts`
2. Consulter la documentation Framer Motion pour les animations
3. Tester sur différents appareils et navigateurs

## Liens utiles

- 📖 Documentation Framer Motion: https://www.framer.com/motion/
- 🗺️ Documentation Leaflet: https://leafletjs.com/
- 🎨 Couleurs Tailwind: https://tailwindcss.com/docs/customizing-colors
- 🎮 Ressources eSport: https://esportsobserver.com/

---

**Créé avec passion pour l'eSport guinéen** 🇬🇳🎮🔥
