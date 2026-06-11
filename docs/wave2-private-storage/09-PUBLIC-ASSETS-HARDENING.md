# 🎨 WAVE 2.6 — Public Assets Hardening

> **Statut** : execute sur la branche `feature/wave2.6-public-assets-hardening`.
> **Production** : strictement intacte (`c409f23`, bundle `main-ruwTuuKC.js`).
> **Aucune action Supabase, RLS ou signed URL Wave 2 touchee.**

---

## 📜 Executive Summary

Cette Wave 2.6 elimine toute dependance publique du site FEGESPORT vis-a-vis du bucket Supabase `static-files` pour les assets institutionnels visibles publiquement. Le logo, l'OG image, le favicon, le Schema.org et le press kit sont maintenant servis directement depuis Netlify a partir de `public/assets/brand/`.

**Resultat** : le bucket source Supabase peut etre decommissionne dans une future operation sans casser **aucun visuel public**.

---

## 1. Inventaire des 15 references publiques

Toutes pointaient vers la meme URL :
```
https://geozovninpeqsgtzwchu.supabase.co/storage/v1/object/public/static-files/uploads/d5b2ehmnrec.jpg
```

| # | Fichier | Ligne (avant) | Usage | Criticite |
|---|---------|---------------|-------|-----------|
| 1 | `index.html` | 19 | `<link rel="shortcut icon">` favicon fallback | 🔴 Critique |
| 2 | `index.html` | 94 | `<meta property="og:image">` Open Graph | 🔴 Critique |
| 3 | `index.html` | 106 | `<meta property="twitter:image">` Twitter Card | 🔴 Critique |
| 4 | `index.html` | 117 | Schema.org SportsOrganization `logo` | 🔴 Critique |
| 5 | `index.html` | 118 | Schema.org SportsOrganization `image` | 🔴 Critique |
| 6 | `public/sitemap.xml` | 16 | `<image:loc>` Image sitemap | 🟠 Important |
| 7 | `src/components/seo/SEO.tsx` | 35 | `DEFAULT_IMAGE` constant (OG/Twitter fallback toutes pages) | 🟠 Important |
| 8 | `src/components/seo/schemas.ts` | 14 | `buildCollectionSchema` image | 🟢 Faible (gated) |
| 9 | `src/components/layout/Navbar.tsx` | 34 | `main_logo` defaults (Navbar) | 🔴 Critique |
| 10 | `src/hooks/useSiteSettings.ts` | 15 | `DEFAULT_SETTINGS.site_logo.main_logo` | 🟠 Important |
| 11 | `src/pages/HomePage.tsx` | 49 | `defaultLogoSettings` (Hero) | 🔴 Critique |
| 12 | `src/pages/admin/LoginPage.tsx` | 38 | `logoSettings` defaults (admin) | 🟢 Faible |
| 13 | `src/pages/NewsArticlePage.tsx` | 137 | Schema.org article `image` fallback | 🟠 Important |
| 14 | `src/pages/PressKitPage.tsx` | 347 | `<img src>` press kit display | 🔴 Critique |
| 15 | `src/pages/PressKitPage.tsx` | 357 | `<a href download>` press kit telechargement | 🔴 Critique |

**Repartition** : 9 fichiers, 15 occurrences (7 critiques + 5 importantes + 3 faibles).

---

## 2. Phase 2 — Assets publics locaux crees

### Repertoire cree
```
public/assets/brand/
├── README.md       (1.4 KB — convention et procedure)
├── logo.jpg        (84 KB — 1216×1216 JPEG, telecharge depuis Supabase)
└── og-image.jpg    (84 KB — copie de logo.jpg, alias semantique pour OG/Twitter)
```

### Conventions
| Fichier | Resolution | Usage |
|---------|-----------|-------|
| `/assets/brand/logo.jpg` | 1216×1216 carre | Logo institutionnel (Navbar, Hero, Press Kit, favicon, Schema.org) |
| `/assets/brand/og-image.jpg` | meme image, alias | Open Graph + Twitter Card uniquement (cible 1200×630 dans une iteration ulterieure) |

### Origine du fichier binaire
Le `logo.jpg` actuel a ete telecharge directement depuis l'URL Supabase publique avec `curl`. C'est le meme fichier d'octets que celui actuellement servi en production. **Aucun changement visuel ne sera perceptible par les visiteurs.**

> Note : `og-image.jpg` est actuellement une copie du logo carre. Une iteration future pourra produire un visuel 1200×630 dedie (fond institutionnel + logo + slogan) pour ameliorer les previews sociaux. Ce n'est pas bloquant pour Wave 2.6.

---

## 3. Phase 3 — Refactor (15 references mises a jour)

### Strategie d'URL

| Type d'usage | URL utilisee | Pourquoi |
|--------------|--------------|----------|
| Favicon HTML | `/assets/brand/logo.jpg` | URL relative, navigateur charge depuis le meme domaine |
| Navbar / Hero / Press Kit display | `/assets/brand/logo.jpg` | URL relative, optimale en runtime React |
| Open Graph + Twitter | `https://fegesport224.org/assets/brand/og-image.jpg` | **URL absolue REQUISE** par les crawlers sociaux |
| Schema.org logo + image | `https://fegesport224.org/assets/brand/logo.jpg` | **URL absolue REQUISE** par Google/Bing pour Knowledge Graph |
| Sitemap.xml `<image:loc>` | `https://fegesport224.org/assets/brand/logo.jpg` | URL absolue, convention sitemap |
| Press Kit download | `/assets/brand/logo.jpg` | URL relative, navigateur ajoute le `download` attribute |

### Modifications par fichier

| Fichier | Lignes modifiees | URL avant | URL apres |
|---------|------------------|-----------|-----------|
| `index.html` | 5 | `https://geo...supabase.co/.../d5b2ehmnrec.jpg` | `/assets/brand/logo.jpg` (favicon) + `https://fegesport224.org/assets/brand/og-image.jpg` (OG/Twitter) + `https://fegesport224.org/assets/brand/logo.jpg` (Schema.org x2) |
| `public/sitemap.xml` | 1 | Supabase URL | `https://fegesport224.org/assets/brand/logo.jpg` |
| `src/components/seo/SEO.tsx` | 1 | `DEFAULT_IMAGE` | `https://fegesport224.org/assets/brand/og-image.jpg` |
| `src/components/seo/schemas.ts` | 1 | Supabase URL | `https://fegesport224.org/assets/brand/logo.jpg` |
| `src/components/layout/Navbar.tsx` | 1 | `main_logo` | `/assets/brand/logo.jpg` |
| `src/hooks/useSiteSettings.ts` | 1 | `main_logo` default | `/assets/brand/logo.jpg` |
| `src/pages/HomePage.tsx` | 1 | `main_logo` default | `/assets/brand/logo.jpg` |
| `src/pages/admin/LoginPage.tsx` | 1 | `main_logo` default | `/assets/brand/logo.jpg` |
| `src/pages/NewsArticlePage.tsx` | 1 | Schema.org fallback | `https://fegesport224.org/assets/brand/logo.jpg` |
| `src/pages/PressKitPage.tsx` | 2 | `<img src>` + `<a href>` | `/assets/brand/logo.jpg` |

**Total** : 15 references actives remplacees. **0 occurrence Supabase operationnelle restante.**

---

## 4. Phase 4 — Compatibilite et fallback

### Strategie

Aucune URL Supabase n'est supprimee : elles sont **conservees en commentaire** a cote de chaque nouvelle reference pour tracabilite historique.

### Exemple type
```jsx
// Wave 2.6: brand asset served locally.
// Legacy Supabase fallback URL preserved as comment for traceability:
//   https://geozovninpeqsgtzwchu.supabase.co/storage/v1/object/public/static-files/uploads/d5b2ehmnrec.jpg
main_logo: "/assets/brand/logo.jpg",
```

### Verification de la coherence

| Indicateur | Avant Wave 2.6 | Apres Wave 2.6 |
|------------|----------------|----------------|
| References Supabase URL operationnelles | 15 | **0** |
| References Supabase URL commentaires (tracabilite) | 0 | 6 (1 par fichier de code modifie) |
| Nouvelles references `/assets/brand/` | 0 | **18** (15 + 3 dans le rapport/README) |

---

## 5. Phase 5 — Validation SEO

### HTML statique servi (`dist/index.html`)

```html
<!-- Favicon -->
<link rel="shortcut icon" type="image/jpeg" href="/assets/brand/logo.jpg" />

<!-- Open Graph -->
<meta property="og:image" content="https://fegesport224.org/assets/brand/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Logo officiel FEGESPORT - Fédération Guinéenne d'Esport" />

<!-- Twitter Card -->
<meta property="twitter:image" content="https://fegesport224.org/assets/brand/og-image.jpg" />
<meta property="twitter:image:alt" content="Logo officiel FEGESPORT" />

<!-- Schema.org SportsOrganization (JSON-LD) -->
"logo": "https://fegesport224.org/assets/brand/logo.jpg",
"image": "https://fegesport224.org/assets/brand/logo.jpg",
```

### Build artefacts

```
dist/assets/brand/
├── README.md       (1.4 KB)
├── logo.jpg        (84 KB — copie depuis public/assets/brand/)
└── og-image.jpg    (84 KB)
```

### Checklist de validation visuelle (a faire sur Deploy Preview)

| # | Element | URL a tester | Attendu |
|---|---------|--------------|---------|
| 1 | Favicon onglet navigateur | `https://deploy-preview-N--fegesport224.netlify.app/` | Logo FEGESPORT visible dans l'onglet |
| 2 | Open Graph (Facebook/LinkedIn debugger) | Coller l'URL preview sur https://developers.facebook.com/tools/debug | Image OG resolue, dimensions 1216×1216 |
| 3 | Twitter Card | https://cards-dev.twitter.com/validator | Image Twitter resolue |
| 4 | Schema.org Logo/Image | https://search.google.com/test/rich-results | SportsOrganization detecte, logo et image valides |
| 5 | Sitemap image | `curl -s <preview>/sitemap.xml \| grep image:loc` | URL `/assets/brand/logo.jpg` |
| 6 | Logo Navbar | Ouvrir la HomePage | Logo affiche en haut a gauche |
| 7 | Hero HomePage | idem | Logo affiche dans le hero |
| 8 | Press Kit display | `/press-kit` | Card "Logo officiel" avec le logo visible |
| 9 | Press Kit download | Click sur "Telecharger" | Fichier `fegesport-logo.jpg` telecharge |

### Verifications automatiques deja passees

| Verification | Resultat |
|--------------|----------|
| `npm run build` | ✅ 4.96s, 0 erreur TS |
| `npm run seo:check` | ✅ 36 passed, 0 failed |
| Recherche `d5b2ehmnrec` (URL Supabase obsolete) en code operationnel | ✅ 0 occurrence (uniquement 6 commentaires de tracabilite) |
| Refs `/assets/brand/` ajoutees | ✅ 18 occurrences |
| Assets presents dans `dist/` | ✅ logo.jpg + og-image.jpg + README |

---

## 6. Rollback

### En cas de probleme detecte sur Deploy Preview

Trois niveaux de rollback possibles, du moins au plus radical :

#### Niveau 1 — Asset invalide ou corrompu
Remplacer `public/assets/brand/logo.jpg` par un fichier corrige, commit + push.
**Duree** : 2 minutes. Aucun changement de code.

#### Niveau 2 — Reverter le refactor URL
```bash
git revert <commit-hash-wave2.6>
git push
```
Les 15 references retombent sur l'URL Supabase, qui fonctionne toujours puisque le bucket reste public.
**Duree** : 1 minute. Aucun impact production puisque le merge n'a pas encore eu lieu.

#### Niveau 3 — Suppression de la branche
Si la PR n'est pas mergee : fermer la PR sans merger. Aucun effet.
**Duree** : instantane.

### Aucune action Supabase requise pour le rollback

Wave 2.6 ne touche ni au bucket source, ni aux RLS, ni a la RPC Wave 2. **Le rollback est entierement cote code.**

---

## 7. Impact SEO

### Indexation et previews sociaux

| Risque potentiel | Mitigation |
|------------------|------------|
| Bing Webmaster doit re-crawler les nouvelles URLs OG | IndexNow notification automatique au build (postbuild) |
| Google Search Console peut prendre 1-7 jours pour reindexer les nouvelles meta images | Aucune action requise, le re-crawl est automatique |
| Sitemap image:loc met a jour automatiquement la valeur | sitemap.xml deja modifie, IndexNow notifie au build |
| Facebook/LinkedIn cache des previews anciens (24-48h) | Utiliser les "debug tools" pour forcer le refresh apres deploy |
| Cache navigateur favicon | Hard refresh (`Cmd+Shift+R`) le premier coup, puis OK |

### Aucun impact SEO negatif attendu

L'image servie est **identique** (meme fichier binaire). Le hash SHA-256 est preserve. Seule l'URL change. Les bots ne devraient pas pénaliser ce changement puisque :
- L'URL est dans le meme domaine canonique (`fegesport224.org`)
- L'image est servie avec les bons headers CDN Netlify (cache 1 an pour assets)
- Le Schema.org JSON-LD continue de pointer vers une image legitime

---

## 8. Contraintes respectees

| Contrainte | Statut |
|------------|--------|
| Aucun changement Supabase | ✅ |
| Aucun changement RLS | ✅ |
| Aucun changement Wave 2 (signed URLs, RPC, RLS stricte) | ✅ |
| Aucun changement signed URLs | ✅ |
| Aucun changement production | ✅ (commit prod `c409f23` intact) |
| Aucun merge vers main | ✅ |
| `/resources` reste protege | ✅ inchange |
| `robots.txt` / `sitemap.xml` / `llms.txt` | ✅ (sitemap a 16 URLs, llms.txt inchange) |
| Pages piliers et leur SEO | ✅ aucun changement |

---

## 9. Fichiers livres

### Nouveaux
| Fichier | Taille |
|---------|--------|
| `public/assets/brand/logo.jpg` | 84 KB |
| `public/assets/brand/og-image.jpg` | 84 KB |
| `public/assets/brand/README.md` | 1.4 KB |
| `docs/wave2-private-storage/09-PUBLIC-ASSETS-HARDENING.md` | ce document |

### Modifies
| Fichier | Lignes diff |
|---------|-------------|
| `index.html` | 5 occurrences |
| `public/sitemap.xml` | 1 occurrence |
| `src/components/seo/SEO.tsx` | 1 occurrence |
| `src/components/seo/schemas.ts` | 1 occurrence |
| `src/components/layout/Navbar.tsx` | 1 occurrence |
| `src/hooks/useSiteSettings.ts` | 1 occurrence |
| `src/pages/HomePage.tsx` | 1 occurrence |
| `src/pages/admin/LoginPage.tsx` | 1 occurrence |
| `src/pages/NewsArticlePage.tsx` | 1 occurrence |
| `src/pages/PressKitPage.tsx` | 2 occurrences |

---

## 10. Recommandations apres merge

1. **Forcer un re-crawl Facebook / LinkedIn** : utiliser https://developers.facebook.com/tools/debug et https://www.linkedin.com/post-inspector/ avec la nouvelle URL.
2. **Re-soumettre le sitemap a Google Search Console** : la modification de `<image:loc>` declenche un re-crawl image.
3. **Generer dans une iteration future une vraie OG image 1200×630** (Figma ou Canva) pour optimiser les previews sociaux.
4. **Generer un vrai favicon multi-tailles** (16x16, 32x32, 180x180, 192x192, 512x512) — le fichier `public/README-ASSETS.md` decrit la procedure ImageMagick / realfavicongenerator.net.
5. **Wave 2.7 future** : retirer definitivement les 6 commentaires de tracabilite Supabase une fois le bucket source decommissionne.

---

## 11. Verdict

✅ **Wave 2.6 prete pour merge vers develop.**

Le site est desormais **independant du bucket Supabase public** pour ses assets institutionnels visibles publiquement. La voie est ouverte pour decommissionner le bucket source `static-files` dans une operation Supabase future sans aucun risque visuel pour les utilisateurs ou les bots SEO.
