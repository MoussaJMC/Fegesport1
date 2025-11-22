/**
 * Translation utilities for multilingual content from database
 */

export type Language = 'fr' | 'en';

export interface Translations {
  fr?: Record<string, any>;
  en?: Record<string, any>;
}

/**
 * Get translated value from translations object
 */
export const getTranslation = (
  translations: Translations | null | undefined,
  field: string,
  language: Language = 'fr',
  fallbackLanguage: Language = 'fr'
): string => {
  if (!translations) return '';

  // Try requested language
  const langData = translations[language];
  if (langData && langData[field] && langData[field] !== '') {
    return langData[field];
  }

  // Try fallback language
  const fallbackData = translations[fallbackLanguage];
  if (fallbackData && fallbackData[field]) {
    return fallbackData[field];
  }

  return '';
};

/**
 * Get full translation object for a language
 */
export const getFullTranslation = (
  translations: Translations | null | undefined,
  language: Language = 'fr',
  fallbackLanguage: Language = 'fr'
): Record<string, any> => {
  if (!translations) return {};

  // Try requested language
  if (translations[language]) {
    return translations[language] as Record<string, any>;
  }

  // Try fallback language
  if (translations[fallbackLanguage]) {
    return translations[fallbackLanguage] as Record<string, any>;
  }

  return {};
};

/**
 * Get translated news article
 */
export interface NewsTranslations extends Translations {
  fr?: {
    title: string;
    excerpt: string;
    content: string;
  };
  en?: {
    title: string;
    excerpt: string;
    content: string;
  };
}

export const getNewsTranslation = (
  translations: NewsTranslations | null | undefined,
  language: Language = 'fr'
) => {
  const data = getFullTranslation(translations, language);
  return {
    title: data.title || '',
    excerpt: data.excerpt || '',
    content: data.content || '',
  };
};

/**
 * Get translated event
 */
export interface EventTranslations extends Translations {
  fr?: {
    title: string;
    description: string;
    location: string;
  };
  en?: {
    title: string;
    description: string;
    location: string;
  };
}

export const getEventTranslation = (
  translations: EventTranslations | null | undefined,
  language: Language = 'fr'
) => {
  const data = getFullTranslation(translations, language);
  return {
    title: data.title || '',
    description: data.description || '',
    location: data.location || '',
  };
};

/**
 * Get translated partner
 */
export interface PartnerTranslations extends Translations {
  fr?: {
    name: string;
    description: string;
  };
  en?: {
    name: string;
    description: string;
  };
}

export const getPartnerTranslation = (
  translations: PartnerTranslations | null | undefined,
  language: Language = 'fr'
) => {
  const data = getFullTranslation(translations, language);
  return {
    name: data.name || '',
    description: data.description || '',
  };
};

/**
 * Get translated card
 */
export interface CardTranslations extends Translations {
  fr?: {
    title: string;
    content: string;
  };
  en?: {
    title: string;
    content: string;
  };
}

export const getCardTranslation = (
  translations: CardTranslations | null | undefined,
  language: Language = 'fr'
) => {
  const data = getFullTranslation(translations, language);
  return {
    title: data.title || '',
    content: data.content || '',
  };
};

/**
 * Get translated slideshow image
 */
export interface SlideshowTranslations extends Translations {
  fr?: {
    title: string;
    description: string;
  };
  en?: {
    title: string;
    description: string;
  };
}

export const getSlideshowTranslation = (
  translations: SlideshowTranslations | null | undefined,
  language: Language = 'fr'
) => {
  const data = getFullTranslation(translations, language);
  return {
    title: data.title || '',
    description: data.description || '',
  };
};

/**
 * Get translated stream
 */
export interface StreamTranslations extends Translations {
  fr?: {
    title: string;
    description: string;
  };
  en?: {
    title: string;
    description: string;
  };
}

export const getStreamTranslation = (
  translations: StreamTranslations | null | undefined,
  language: Language = 'fr'
) => {
  const data = getFullTranslation(translations, language);
  return {
    title: data.title || '',
    description: data.description || '',
  };
};

/**
 * Get translated leadership member
 */
export interface LeadershipTranslations extends Translations {
  fr?: {
    name: string;
    position: string;
    bio: string;
  };
  en?: {
    name: string;
    position: string;
    bio: string;
  };
}

export const getLeadershipTranslation = (
  translations: LeadershipTranslations | null | undefined,
  language: Language = 'fr'
) => {
  const data = getFullTranslation(translations, language);
  return {
    name: data.name || '',
    position: data.position || '',
    bio: data.bio || '',
  };
};

/**
 * Get translated membership type
 */
export interface MembershipTypeTranslations extends Translations {
  fr?: {
    name: string;
    description: string;
    period: string;
    features: string[];
  };
  en?: {
    name: string;
    description: string;
    period: string;
    features: string[];
  };
}

export const getMembershipTypeTranslation = (
  translations: MembershipTypeTranslations | null | undefined,
  language: Language = 'fr'
) => {
  const data = getFullTranslation(translations, language);
  return {
    name: data.name || '',
    description: data.description || '',
    period: data.period || '',
    features: data.features || [],
  };
};

/**
 * Get translated page
 */
export interface PageTranslations extends Translations {
  fr?: {
    title: string;
    meta_description: string;
  };
  en?: {
    title: string;
    meta_description: string;
  };
}

export const getPageTranslation = (
  translations: PageTranslations | null | undefined,
  language: Language = 'fr'
) => {
  const data = getFullTranslation(translations, language);
  return {
    title: data.title || '',
    meta_description: data.meta_description || '',
  };
};

/**
 * Get translated page section
 */
export interface PageSectionTranslations extends Translations {
  fr?: {
    title: string;
    content: string;
  };
  en?: {
    title: string;
    content: string;
  };
}

export const getPageSectionTranslation = (
  translations: PageSectionTranslations | null | undefined,
  language: Language = 'fr'
) => {
  const data = getFullTranslation(translations, language);
  return {
    title: data.title || '',
    content: data.content || '',
  };
};

/**
 * Get translated file category
 */
export interface FileCategoryTranslations extends Translations {
  fr?: {
    name: string;
    description: string;
  };
  en?: {
    name: string;
    description: string;
  };
}

export const getFileCategoryTranslation = (
  translations: FileCategoryTranslations | null | undefined,
  language: Language = 'fr'
) => {
  const data = getFullTranslation(translations, language);
  return {
    name: data.name || '',
    description: data.description || '',
  };
};

/**
 * Build translations object for saving to database
 */
export const buildTranslations = (
  frData: Record<string, any>,
  enData: Record<string, any>
): Translations => {
  return {
    fr: frData,
    en: enData,
  };
};

/**
 * Check if translation is complete for a language
 */
export const isTranslationComplete = (
  translations: Translations | null | undefined,
  language: Language,
  requiredFields: string[]
): boolean => {
  if (!translations || !translations[language]) return false;

  const langData = translations[language] as Record<string, any>;
  return requiredFields.every(
    (field) => langData[field] && langData[field] !== ''
  );
};

/**
 * Get translation completion percentage
 */
export const getTranslationCompleteness = (
  translations: Translations | null | undefined,
  language: Language,
  requiredFields: string[]
): number => {
  if (!translations || !translations[language]) return 0;

  const langData = translations[language] as Record<string, any>;
  const completedFields = requiredFields.filter(
    (field) => langData[field] && langData[field] !== ''
  ).length;

  return Math.round((completedFields / requiredFields.length) * 100);
};
