import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  schema?: Record<string, any>;
}

const DEFAULT_TITLE = "FEGESPORT - Fédération Guinéenne d'Esport";
const DEFAULT_DESCRIPTION = "La Fédération Guinéenne d'Esport (FEGESPORT) est l'organisation nationale officielle reconnue pour l'esport en République de Guinée. Membre IESF, AESF, WESCO et GEF.";
const DEFAULT_IMAGE = "https://geozovninpeqsgtzwchu.supabase.co/storage/v1/object/public/static-files/uploads/d5b2ehmnrec.jpg";
const SITE_URL = "https://fegesport224.org";

/**
 * Set or update a meta tag dynamically
 */
const setMeta = (selector: string, attr: string, value: string) => {
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    const [type, name] = selector.replace(/[\[\]"]/g, '').split('=');
    if (type.includes('property')) {
      el.setAttribute('property', name);
    } else {
      el.setAttribute('name', name);
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

const setLink = (rel: string, href: string) => {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
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

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  type = 'website',
  noindex = false,
  schema,
}) => {
  const location = useLocation();
  const fullUrl = `${SITE_URL}${location.pathname}`;
  const finalTitle = title ? `${title} | FEGESPORT` : DEFAULT_TITLE;
  const finalDescription = description || DEFAULT_DESCRIPTION;
  const finalImage = image || DEFAULT_IMAGE;

  useEffect(() => {
    // Title
    document.title = finalTitle;

    // Standard meta tags
    setMeta('meta[name="title"]', 'content', finalTitle);
    setMeta('meta[name="description"]', 'content', finalDescription);
    if (keywords) setMeta('meta[name="keywords"]', 'content', keywords);
    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');

    // Canonical
    setLink('canonical', fullUrl);

    // Open Graph
    setMeta('meta[property="og:title"]', 'content', finalTitle);
    setMeta('meta[property="og:description"]', 'content', finalDescription);
    setMeta('meta[property="og:image"]', 'content', finalImage);
    setMeta('meta[property="og:url"]', 'content', fullUrl);
    setMeta('meta[property="og:type"]', 'content', type);

    // Twitter
    setMeta('meta[property="twitter:title"]', 'content', finalTitle);
    setMeta('meta[property="twitter:description"]', 'content', finalDescription);
    setMeta('meta[property="twitter:image"]', 'content', finalImage);
    setMeta('meta[property="twitter:url"]', 'content', fullUrl);

    // Page-specific schema
    if (schema) {
      setSchemaScript('page-schema', schema);
    }

    // Cleanup on unmount
    return () => {
      if (schema) {
        removeSchemaScript('page-schema');
      }
    };
  }, [finalTitle, finalDescription, finalImage, fullUrl, keywords, type, noindex, schema]);

  return null;
};

export default SEO;
