import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  type?: 'website' | 'article' | 'profile' | 'video.other';
  noindex?: boolean;
  /** Optional additional Schema.org JSON-LD object */
  schema?: Record<string, any>;
  /** Optional breadcrumb trail for BreadcrumbList Schema (homepage auto-prepended) */
  breadcrumbs?: BreadcrumbItem[];
  /** Article publication date (ISO 8601) */
  publishedTime?: string;
  /** Article last modified date (ISO 8601) */
  modifiedTime?: string;
  /** Article author */
  author?: string;
  /** Article section (category) */
  section?: string;
}

const DEFAULT_TITLE = "FEGESPORT - Fédération Guinéenne d'Esport";
const DEFAULT_DESCRIPTION = "La Fédération Guinéenne d'Esport (FEGESPORT) est l'organisation nationale officielle reconnue pour l'esport en République de Guinée. Membre IESF, ACES, WESCO et GEF.";
const DEFAULT_IMAGE = "https://geozovninpeqsgtzwchu.supabase.co/storage/v1/object/public/static-files/uploads/d5b2ehmnrec.jpg";
const SITE_URL = "https://fegesport224.org";

/**
 * Set or update a meta tag (also creates if missing).
 */
const setMeta = (selector: string, attr: string, value: string) => {
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    const match = selector.match(/\[(name|property|http-equiv)="([^"]+)"\]/);
    if (match) {
      el.setAttribute(match[1], match[2]);
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

const setLink = (rel: string, href: string, hreflang?: string) => {
  const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.querySelector(sel) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (hreflang) el.setAttribute('hreflang', hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

const setSchemaScript = (id: string, schema: Record<string, any>) => {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(schema);
};

const removeSchemaScript = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.remove();
};

/**
 * Build the BreadcrumbList Schema.org JSON-LD
 */
const buildBreadcrumbSchema = (breadcrumbs: BreadcrumbItem[], lang: string) => {
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: lang === 'fr' ? 'Accueil' : 'Home',
      item: SITE_URL,
    },
    ...breadcrumbs.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 2,
      name: b.name,
      item: b.url.startsWith('http') ? b.url : `${SITE_URL}${b.url}`,
    })),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
};

/**
 * SEO component — handles all per-page SEO concerns:
 * - <title> (with brand suffix)
 * - meta description, keywords, robots
 * - canonical URL
 * - Open Graph + Twitter cards (with dimensions, alt, author, dates)
 * - hreflang fr / en / x-default
 * - <html lang> attribute
 * - JSON-LD Schema.org (custom + auto BreadcrumbList)
 */
const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  imageWidth = 1200,
  imageHeight = 630,
  type = 'website',
  noindex = false,
  schema,
  breadcrumbs,
  publishedTime,
  modifiedTime,
  author,
  section,
}) => {
  const location = useLocation();
  const { i18n } = useTranslation();
  const lang = i18n.language === 'fr' ? 'fr' : 'en';
  const fullUrl = `${SITE_URL}${location.pathname}`;
  const finalTitle = title ? `${title} | FEGESPORT` : DEFAULT_TITLE;
  const finalDescription = description || DEFAULT_DESCRIPTION;
  const finalImage = image || DEFAULT_IMAGE;
  const ogLocale = lang === 'fr' ? 'fr_FR' : 'en_US';
  const ogLocaleAlt = lang === 'fr' ? 'en_US' : 'fr_FR';

  useEffect(() => {
    // <html lang>
    document.documentElement.lang = lang;

    // Title
    document.title = finalTitle;

    // Standard meta tags
    setMeta('meta[name="title"]', 'content', finalTitle);
    setMeta('meta[name="description"]', 'content', finalDescription);
    if (keywords) setMeta('meta[name="keywords"]', 'content', keywords);
    setMeta('meta[name="robots"]', 'content',
      noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    // Canonical
    setLink('canonical', fullUrl);

    // hreflang
    setLink('alternate', fullUrl, 'fr');
    setLink('alternate', `${fullUrl}?lang=en`, 'en');
    setLink('alternate', fullUrl, 'x-default');

    // Open Graph
    setMeta('meta[property="og:title"]', 'content', finalTitle);
    setMeta('meta[property="og:description"]', 'content', finalDescription);
    setMeta('meta[property="og:image"]', 'content', finalImage);
    setMeta('meta[property="og:image:width"]', 'content', String(imageWidth));
    setMeta('meta[property="og:image:height"]', 'content', String(imageHeight));
    setMeta('meta[property="og:image:alt"]', 'content', `${finalTitle} — Logo FEGESPORT`);
    setMeta('meta[property="og:url"]', 'content', fullUrl);
    setMeta('meta[property="og:type"]', 'content', type);
    setMeta('meta[property="og:site_name"]', 'content', 'FEGESPORT');
    setMeta('meta[property="og:locale"]', 'content', ogLocale);
    setMeta('meta[property="og:locale:alternate"]', 'content', ogLocaleAlt);

    // Article-specific Open Graph
    if (type === 'article') {
      if (publishedTime) setMeta('meta[property="article:published_time"]', 'content', publishedTime);
      if (modifiedTime) setMeta('meta[property="article:modified_time"]', 'content', modifiedTime);
      if (author) setMeta('meta[property="article:author"]', 'content', author);
      if (section) setMeta('meta[property="article:section"]', 'content', section);
      setMeta('meta[property="article:publisher"]', 'content', 'https://fegesport224.org');
    }

    // Twitter / X Cards
    setMeta('meta[property="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[property="twitter:title"]', 'content', finalTitle);
    setMeta('meta[property="twitter:description"]', 'content', finalDescription);
    setMeta('meta[property="twitter:image"]', 'content', finalImage);
    setMeta('meta[property="twitter:image:alt"]', 'content', `Logo officiel FEGESPORT`);
    setMeta('meta[property="twitter:url"]', 'content', fullUrl);
    setMeta('meta[name="twitter:domain"]', 'content', 'fegesport224.org');

    // Page-specific schema
    if (schema) {
      setSchemaScript('page-schema', schema);
    } else {
      removeSchemaScript('page-schema');
    }

    // Breadcrumb schema (auto)
    if (breadcrumbs && breadcrumbs.length > 0) {
      setSchemaScript('breadcrumb-schema', buildBreadcrumbSchema(breadcrumbs, lang));
    } else {
      removeSchemaScript('breadcrumb-schema');
    }

    // Cleanup on unmount
    return () => {
      removeSchemaScript('page-schema');
      removeSchemaScript('breadcrumb-schema');
    };
  }, [
    finalTitle, finalDescription, finalImage, fullUrl, keywords, type, noindex,
    schema, breadcrumbs, lang, ogLocale, ogLocaleAlt, imageWidth, imageHeight,
    publishedTime, modifiedTime, author, section,
  ]);

  return null;
};

export default SEO;
