# Guide de Déploiement - FEGESPORT Website avec LEG

## État Actuel

✅ **Build réussi!** Le projet compile sans erreurs
✅ **Page LEG intégrée** - Accessible via `/leg`
✅ **Route ajoutée** dans App.tsx
✅ **Lien dans la navbar** - "LEG" apparaît automatiquement
✅ **Configuration Netlify** prête dans `netlify.toml`

## Options de Déploiement

### Option 1: Déploiement via Netlify Dashboard (Recommandé)

#### Étape 1: Préparer le Repository Git

```bash
# Initialiser Git si ce n'est pas déjà fait
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "feat: Add LEG (League eSport de Guinée) page with 8 clubs and 5 disciplines"

# Ajouter votre repository distant (GitHub/GitLab/Bitbucket)
git remote add origin YOUR_REPOSITORY_URL

# Pousser vers le repository
git push -u origin main
```

#### Étape 2: Connecter à Netlify

1. Aller sur [netlify.com](https://netlify.com) et se connecter
2. Cliquer sur "Add new site" → "Import an existing project"
3. Choisir votre provider Git (GitHub, GitLab, ou Bitbucket)
4. Sélectionner votre repository
5. Les paramètres seront automatiquement détectés depuis `netlify.toml`:
   - **Build command**: `npx vite build`
   - **Publish directory**: `dist`
6. Cliquer sur "Deploy site"

#### Étape 3: Configuration du Domaine (si applicable)

Si vous avez le domaine `fegesport224.org`:

1. Dans Netlify Dashboard → Domain settings
2. Ajouter un custom domain: `fegesport224.org`
3. Configurer les DNS selon les instructions Netlify
4. Activer HTTPS (automatique avec Let's Encrypt)

### Option 2: Déploiement via Netlify CLI

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter à Netlify
netlify login

# Déployer directement
netlify deploy --prod --dir=dist
```

### Option 3: Drag & Drop (Test rapide)

1. Aller sur [app.netlify.com/drop](https://app.netlify.com/drop)
2. Glisser-déposer le dossier `dist/` (déjà généré)
3. Obtenir une URL de preview instantanément

## Variables d'Environnement

Les variables suivantes sont déjà configurées dans `netlify.toml`:

```toml
VITE_SUPABASE_URL = "https://geozovninpeqsgtzwchu.supabase.co"
VITE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
NODE_VERSION = "20"
NODE_ENV = "production"
```

**Note**: Ces variables sont publiques (anon key) donc pas de souci de sécurité.

## Structure du Projet LEG

### Nouveaux Fichiers Ajoutés

```
src/
├── data/
│   └── legData.ts          # Base de données des clubs et disciplines
├── pages/
│   └── LEGPage.tsx          # Page principale LEG (2000+ lignes)
└── components/
    └── layout/
        └── Navbar.tsx       # Modifié pour inclure le lien LEG

docs/
└── LEG_README.md           # Documentation complète LEG

DEPLOYMENT_GUIDE.md         # Ce fichier
```

### Routes Disponibles

| Route | Description |
|-------|-------------|
| `/` | Page d'accueil |
| `/leg` | **NOUVEAU** - League eSport de Guinée |
| `/about` | À propos |
| `/news` | Actualités |
| `/membership` | Adhésion |
| `/contact` | Contact |
| `/direct` | Streaming Direct |
| `/admin` | Panel d'administration |

## Test en Local

```bash
# Démarrer le serveur de développement
npm run dev

# Ouvrir dans le navigateur
http://localhost:5173/leg
```

## Vérifications Post-Déploiement

### ✅ Checklist

- [ ] Page LEG accessible via `/leg`
- [ ] Lien "LEG" visible dans la navbar
- [ ] 8 clubs affichés correctement
- [ ] 5 disciplines visibles
- [ ] Animations fonctionnent (parallax, hover, particles)
- [ ] Responsive sur mobile/tablet/desktop
- [ ] Carte interactive cliquable
- [ ] Modal de club s'ouvre au clic
- [ ] Classements filtrables par discipline
- [ ] Section tournois affichée
- [ ] Footer avec drapeaux guinéens

### 🧪 Tests Recommandés

```bash
# Build de production
npm run build

# Preview du build
npm run preview

# Ouvrir http://localhost:4173/leg
```

## Performance

### Métriques du Build

```
dist/index.html                2.40 kB
dist/assets/main-*.css        74.50 kB (12.74 kB gzip)
dist/assets/main-*.js      1,167.75 kB (250.29 kB gzip)
```

**Note**: Le bundle principal est gros (~1.16 MB) à cause de:
- Framer Motion (animations)
- React PDF
- Leaflet (carte future)
- Supabase client

### Optimisations Futures Recommandées

1. **Code Splitting**: Charger LEG à la demande
   ```typescript
   const LEGPage = lazy(() => import('./pages/LEGPage'));
   ```

2. **Image Optimization**: Utiliser WebP pour les images
3. **Lazy Load**: Charger les clubs progressivement
4. **CDN**: Héberger les assets statiques sur CDN

## Rollback (si nécessaire)

Si vous devez revenir en arrière:

```bash
# Via Git
git revert HEAD

# Via Netlify Dashboard
# → Deployments → Choisir un déploiement précédent → "Publish deploy"
```

## Monitoring

### Netlify Analytics (si activé)

- Trafic sur `/leg`
- Temps de chargement
- Erreurs 404
- Pays des visiteurs

### Performance Monitoring

Utiliser Lighthouse pour tester:

```bash
npx lighthouse https://fegesport224.org/leg --view
```

## SEO pour LEG

La page LEG change le titre dynamiquement:

```typescript
document.title = 'LEG - League eSport de Guinée | 8 Clubs, 5 Disciplines';
```

### Améliorations SEO Futures

Ajouter dans `index.html` ou via un Helmet:

```html
<meta name="description" content="League eSport de Guinée - 8 clubs régionaux, 5 disciplines (Stratégie, FPS, Football, Racing, Fighting). La première ligue nationale d'eSport en Guinée." />
<meta property="og:title" content="LEG - League eSport de Guinée" />
<meta property="og:description" content="8 clubs, 5 disciplines, 1 nation. Rejoignez la révolution eSport guinéenne!" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://fegesport224.org/leg" />
<meta name="twitter:card" content="summary_large_image" />
```

## Support

### En cas de problème

1. **Build Error**: Vérifier les logs Netlify
2. **Page 404**: Vérifier les redirects dans `netlify.toml`
3. **Données manquantes**: Vérifier `src/data/legData.ts`
4. **Styles cassés**: Clear cache Netlify et rebuild

### Logs Netlify

```
Netlify Dashboard → Site → Deploys → [Dernier déploiement] → Deploy log
```

## Contact & Documentation

- **Documentation LEG**: Voir `LEG_README.md`
- **Documentation Technique**: Voir `README.md`
- **Configuration Email**: Voir `EMAIL_SYSTEM_GUIDE.md`
- **Sécurité**: Voir `SECURITY.md`

## Commandes Utiles

```bash
# Build local
npm run build

# Preview du build
npm run preview

# Lint
npm run lint

# Dev server
npm run dev

# Clear cache Netlify (via CLI)
netlify build --clear-cache
```

## Prochaines Étapes Recommandées

1. **Intégration Supabase**: Migrer les données clubs vers la BDD
2. **Leaflet Map**: Remplacer le placeholder par une vraie carte
3. **Twitch API**: Intégrer les streams live réels
4. **Admin Panel**: Ajouter gestion des clubs dans `/admin`
5. **Analytics**: Suivre l'engagement sur la page LEG
6. **Newsletter**: Ajouter formulaire d'inscription LEG
7. **Discord Bot**: Notifications tournois automatiques

---

**Déploiement préparé par**: Claude AI
**Date**: 3 Février 2026
**Version**: 1.0.0 - LEG Launch

🚀 **Le site est prêt pour le déploiement!** 🇬🇳🎮
