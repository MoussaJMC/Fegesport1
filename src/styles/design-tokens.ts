/**
 * FEGESPORT Design System v2 — Federation Identity Tokens
 * Single source of truth for shared constants used in components.
 * Tailwind classes are preferred; use these tokens for JS-driven logic only.
 */

// Federation brand colors (for JS logic, charts, dynamic styles)
export const COLORS = {
  fedRed: {
    500: '#DC2626',
    600: '#B91C1C',
    700: '#991B1B',
  },
  fedGold: {
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
  },
  dark: {
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    950: '#020617',
  },
  light: {
    100: '#F1F5F9',
    300: '#CBD5E1',
    400: '#94A3B8',
  },
} as const;

// Category color map (unified — used by CardItem, NewsCard, EventCard)
export const CATEGORY_COLORS: Record<string, string> = {
  'Communiqué': 'bg-accent-blue-500',
  'Compétition': 'bg-emerald-600',
  'Partenariat': 'bg-purple-600',
  'Formation': 'bg-fed-gold-500',
  'International': 'bg-orange-500',
  'Gouvernance': 'bg-fed-red-500',
  'default': 'bg-dark-700',
};

export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
};

// Image fallbacks (centralized)
export const FALLBACK_IMAGES = {
  news: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=800',
  event: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=800',
  hero: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=1200',
  person: 'https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=400',
  partner: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
} as const;

// International affiliations data
export const INTERNATIONAL_AFFILIATIONS = [
  {
    id: 'iesf',
    name: 'International Esports Federation',
    shortName: 'IESF',
    description_fr: 'Organisme mondial de gouvernance de l\'esport, regroupant plus de 140 fédérations nationales membres.',
    description_en: 'Global esports governing body, uniting over 140 national member federations.',
    // No logo asset shipped yet. Leaving an empty string makes
    // InternationalSection render the shortName badge instead
    // (`affiliation.logo ? <img> : <div badge>`). The previous value
    // `/images/iesf-logo.png` 404ed into the SPA shell, which Netlify
    // served as text/html, which the browser then refused with
    // ERR_BLOCKED_BY_RESPONSE.NotSameOrigin — polluting the console
    // on every homepage view.
    logo: '',
    url: 'https://iesf.org',
  },
  // NOTE: l'entrée `aesf` a été retirée. Le token portait le nom
  // « African Esports Federation » avec un logo `/images/aesf-logo.png`
  // qui n'existe pas dans le dépôt. Elle ne peut pas être remplacée par
  // un logo ACES tant qu'aucun asset ACES n'est fourni. La liste des
  // affiliations vivantes est complétée côté administration Supabase
  // (table `page_sections`, section_key = 'international').
] as const;
