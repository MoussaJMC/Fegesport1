# Guide de Gestion des Traductions FR/EN

Ce document explique comment gérer le contenu bilingue (Français/Anglais) du site FEGESPORT.

---

## Vue d'ensemble

Le site FEGESPORT est maintenant entièrement bilingue avec support FR/EN pour :
- Articles/Actualités
- Événements
- Partenaires
- Cartes d'information
- Diaporama
- Streams en direct
- Équipe de direction
- Types d'adhésion
- Pages CMS
- Catégories de fichiers

---

## Architecture des Traductions

### Structure de Base de Données

Chaque table de contenu possède une colonne `translations` de type JSONB :

```json
{
  "fr": {
    "title": "Titre en français",
    "content": "Contenu en français"
  },
  "en": {
    "title": "Title in English",
    "content": "Content in English"
  }
}
```

### Tables Concernées

1. **news** - Articles
   - title, excerpt, content

2. **events** - Événements
   - title, description, location

3. **partners** - Partenaires
   - name, description

4. **cards** - Cartes d'information
   - title, content

5. **slideshow_images** - Images du diaporama
   - title, description

6. **streams** - Diffusions en direct
   - title, description

7. **leadership_team** - Équipe de direction
   - name, position, bio

8. **membership_types** - Types d'adhésion
   - name, description, period, features (array)

9. **pages** - Pages CMS
   - title, meta_description

10. **page_sections** - Sections de pages
    - title, content

11. **file_categories** - Catégories de fichiers
    - name, description

---

## Utilisation dans l'Administration

### 1. Composant TranslationEditor

Le composant `TranslationEditor` fournit une interface complète pour gérer les traductions :

```tsx
import TranslationEditor from './components/admin/TranslationEditor';
import { buildTranslations } from './utils/translations';

const [translations, setTranslations] = useState({
  fr: { title: '', content: '' },
  en: { title: '', content: '' },
});

<TranslationEditor
  fields={[
    { name: 'title', label: 'Titre', type: 'text', required: true },
    { name: 'content', label: 'Contenu', type: 'textarea', required: true },
  ]}
  translations={translations}
  onChange={setTranslations}
/>
```

### 2. Types de Champs

**text** - Champ texte simple
```tsx
{ name: 'title', label: 'Titre', type: 'text', required: true }
```

**textarea** - Zone de texte multi-lignes
```tsx
{ name: 'content', label: 'Contenu', type: 'textarea', required: false }
```

**array** - Liste d'éléments
```tsx
{ name: 'features', label: 'Fonctionnalités', type: 'array', required: false }
```

### 3. Indicateurs de Complétion

Le TranslationEditor affiche automatiquement :
- ✅ Coche verte si la traduction est complète
- 📊 Pourcentage de complétion si incomplete
- ⚠️ Avertissement pour les champs manquants

---

## Utilisation dans le Frontend

### 1. Hook useLanguage

```tsx
import { useLanguage } from '../hooks/useLanguage';

const { currentLanguage, changeLanguage, isCurrentLanguage } = useLanguage();

// currentLanguage: 'fr' | 'en'
// changeLanguage('en') - Change la langue
// isCurrentLanguage('fr') - Vérifie si 'fr' est actif
```

### 2. Fonctions de Traduction

#### Pour les Articles

```tsx
import { getNewsTranslation } from '../utils/translations';

const translated = getNewsTranslation(news.translations, currentLanguage);
// Returns: { title, excerpt, content }
```

#### Pour les Événements

```tsx
import { getEventTranslation } from '../utils/translations';

const translated = getEventTranslation(event.translations, currentLanguage);
// Returns: { title, description, location }
```

#### Pour les Partenaires

```tsx
import { getPartnerTranslation } from '../utils/translations';

const translated = getPartnerTranslation(partner.translations, currentLanguage);
// Returns: { name, description }
```

### 3. Fonction Générique

Pour n'importe quel champ :

```tsx
import { getTranslation } from '../utils/translations';

const title = getTranslation(translations, 'title', currentLanguage);
// Fallback automatique au français si traduction manquante
```

---

## Exemples d'Implémentation

### 1. Composant d'Affichage

```tsx
import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { getNewsTranslation } from '../utils/translations';

const NewsCard = ({ news }) => {
  const { currentLanguage } = useLanguage();
  const translated = getNewsTranslation(news.translations, currentLanguage);

  return (
    <article>
      <h3>{translated.title}</h3>
      <p>{translated.excerpt}</p>
    </article>
  );
};
```

### 2. Formulaire d'Administration

```tsx
import React, { useState } from 'react';
import TranslationEditor from './TranslationEditor';
import { supabase } from '../lib/supabase';

const NewsForm = ({ initialData, onSuccess }) => {
  const [translations, setTranslations] = useState(
    initialData?.translations || {
      fr: { title: '', excerpt: '', content: '' },
      en: { title: '', excerpt: '', content: '' },
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from('news')
      .insert([{
        translations,
        // Keep old fields for compatibility
        title: translations.fr.title,
        excerpt: translations.fr.excerpt,
        content: translations.fr.content,
      }]);

    if (!error) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit}>
      <TranslationEditor
        fields={[
          { name: 'title', label: 'Titre', type: 'text', required: true },
          { name: 'excerpt', label: 'Résumé', type: 'textarea' },
          { name: 'content', label: 'Contenu', type: 'textarea', required: true },
        ]}
        translations={translations}
        onChange={setTranslations}
      />
      <button type="submit">Enregistrer</button>
    </form>
  );
};
```

---

## Bonnes Pratiques

### 1. Toujours Fournir une Traduction Française

Le français est la langue par défaut. Une traduction française complète est **obligatoire**.

### 2. Validation des Traductions

Avant de sauvegarder :
```tsx
if (!translations.fr?.title || !translations.fr?.content) {
  toast.error('Les champs français sont requis');
  return;
}
```

### 3. Compatibilité Descendante

Lors de la sauvegarde, conservez les anciens champs :
```tsx
const saveData = {
  translations,
  title: translations.fr.title, // Pour compatibilité
  content: translations.fr.content,
};
```

### 4. Fallback Intelligent

Utilisez toujours le français comme fallback :
```tsx
const title = translated.title || news.title;
```

---

## Migration du Contenu Existant

### Contenu Existant

Tout le contenu existant a été automatiquement migré vers `translations.fr`.

### Ajout de Traductions Anglaises

1. Accédez à la section d'administration
2. Éditez l'élément de contenu
3. Cliquez sur l'onglet "English"
4. Remplissez les champs en anglais
5. Enregistrez

---

## Fonctions SQL Utiles

### get_translation()

Extrait une traduction spécifique :
```sql
SELECT get_translation(translations, 'en', 'title', 'fr') as title
FROM news;
```

### get_full_translation()

Obtient l'objet complet de traduction :
```sql
SELECT get_full_translation(translations, 'en', 'fr') as translation
FROM news;
```

---

## Vérification de la Complétion

### Dans le Code

```tsx
import { getTranslationCompleteness, isTranslationComplete } from '../utils/translations';

// Pourcentage de complétion
const completeness = getTranslationCompleteness(
  translations,
  'en',
  ['title', 'content']
);
console.log(`English: ${completeness}%`);

// Est-ce complet ?
const isComplete = isTranslationComplete(
  translations,
  'en',
  ['title', 'content']
);
```

---

## Dépannage

### Problème : Traductions Non Affichées

**Cause** : Le composant n'utilise pas `useLanguage`

**Solution** :
```tsx
import { useLanguage } from '../hooks/useLanguage';
const { currentLanguage } = useLanguage();
```

### Problème : Erreur "translations is null"

**Cause** : Données anciennes sans colonne translations

**Solution** : Ajoutez une vérification :
```tsx
const translated = news.translations
  ? getNewsTranslation(news.translations, currentLanguage)
  : { title: news.title, content: news.content };
```

### Problème : Champs Vides en Anglais

**Cause** : Traductions anglaises non remplies

**Solution** : Utilisez le fallback français :
```tsx
const title = translated.title || news.title;
```

---

## Support et Aide

Pour toute question sur les traductions :
- Consultez `src/utils/translations.ts` pour les fonctions utilitaires
- Consultez `src/components/admin/TranslationEditor.tsx` pour l'éditeur
- Consultez `docs/DATABASE.md` pour la structure de base de données

---

## Checklist pour Nouveau Contenu

- [ ] Ajouter colonne `translations JSONB` à la table
- [ ] Créer index GIN sur `translations`
- [ ] Migrer données existantes vers `translations.fr`
- [ ] Créer interface TypeScript pour les traductions
- [ ] Ajouter fonction `getXTranslation()` dans `utils/translations.ts`
- [ ] Mettre à jour le composant d'affichage pour utiliser les traductions
- [ ] Mettre à jour le formulaire admin avec `TranslationEditor`
- [ ] Tester le changement de langue
- [ ] Documenter les champs traduisibles

---

## Exemple Complet

Voir `src/components/admin/NewsFormBilingual.tsx` pour un exemple complet d'implémentation.
