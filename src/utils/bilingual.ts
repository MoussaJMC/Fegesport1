/**
 * Bilingual content helper for FEGESPORT
 *
 * Reads translated content from Supabase `translations` JSONB field.
 * Falls back to the default (French) field if no translation exists.
 *
 * Usage:
 *   const title = bi(item, 'title', lang);
 *   // Returns item.translations?.en?.title if lang='en' and exists
 *   // Otherwise returns item.title (French default)
 */

/**
 * Get a bilingual field value from a Supabase record.
 *
 * @param item - The database record with a `translations` JSONB field
 * @param field - The field name to read (e.g., 'title', 'content', 'excerpt', 'description', 'name', 'position', 'bio')
 * @param lang - Current language ('fr' or 'en')
 * @returns The translated value or the default (French) value
 */
export function bi(
  item: any,
  field: string,
  lang: string
): string {
  if (!item) return '';

  // If French, always return the default field
  if (lang === 'fr') {
    return item[field] || '';
  }

  // For English, try translations.en.field first
  const translated = item?.translations?.en?.[field];
  if (translated && translated.trim() !== '') {
    return translated;
  }

  // Fallback: try translations.fr.field (some records store FR in translations too)
  const frTranslated = item?.translations?.fr?.[field];
  if (frTranslated && frTranslated.trim() !== '') {
    return frTranslated;
  }

  // Final fallback: default field (French)
  return item[field] || '';
}

/**
 * Get multiple bilingual fields at once.
 *
 * @param item - The database record
 * @param fields - Array of field names
 * @param lang - Current language
 * @returns Object with translated values
 */
export function biMultiple(
  item: any,
  fields: string[],
  lang: string
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const field of fields) {
    result[field] = bi(item, field, lang);
  }
  return result;
}

/**
 * Check if an item has English translations for a given field.
 */
export function hasTranslation(item: any, field: string): boolean {
  const val = item?.translations?.en?.[field];
  return !!val && val.trim() !== '';
}
