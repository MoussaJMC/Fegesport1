/**
 * Schema.org JSON-LD builders for FEGESPORT pages.
 *
 * Each function returns a plain object to be passed to <SEO schema={...} />.
 */

const SITE_URL = 'https://fegesport224.org';
const PUBLISHER = {
  '@type': 'Organization',
  name: 'FEGESPORT - Federation Guineenne d\'Esport',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    // Wave 2.6: brand asset served locally. Legacy Supabase URL preserved for reference:
    // https://geozovninpeqsgtzwchu.supabase.co/storage/v1/object/public/static-files/uploads/d5b2ehmnrec.jpg
    url: 'https://fegesport224.org/assets/brand/logo.jpg',
    width: 400,
    height: 400,
  },
};

/**
 * NewsArticle Schema for /news/[id] pages
 */
export function buildArticleSchema(opts: {
  title: string;
  description: string;
  image: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: opts.title,
    description: opts.description,
    image: [opts.image],
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    author: {
      '@type': 'Organization',
      name: opts.author || 'FEGESPORT',
      url: SITE_URL,
    },
    publisher: PUBLISHER,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': opts.url,
    },
    articleSection: opts.category,
    isAccessibleForFree: true,
    inLanguage: 'fr-FR',
  };
}

/**
 * Event Schema for /events/[id] pages
 */
export function buildEventSchema(opts: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  type?: 'online' | 'in-person' | 'hybrid';
  image?: string;
  price?: number;
  maxAttendees?: number;
  url: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}) {
  const attendanceMode = {
    online: 'https://schema.org/OnlineEventAttendanceMode',
    'in-person': 'https://schema.org/OfflineEventAttendanceMode',
    hybrid: 'https://schema.org/MixedEventAttendanceMode',
  }[opts.type || 'in-person'];

  const eventStatus = {
    upcoming: 'https://schema.org/EventScheduled',
    ongoing: 'https://schema.org/EventScheduled',
    completed: 'https://schema.org/EventScheduled',
    cancelled: 'https://schema.org/EventCancelled',
  }[opts.status || 'upcoming'];

  const isOnline = opts.type === 'online';

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: opts.name,
    description: opts.description,
    startDate: opts.startDate,
    ...(opts.endDate ? { endDate: opts.endDate } : {}),
    eventAttendanceMode: attendanceMode,
    eventStatus,
    location: isOnline
      ? {
          '@type': 'VirtualLocation',
          url: SITE_URL,
        }
      : {
          '@type': 'Place',
          name: opts.location,
          address: {
            '@type': 'PostalAddress',
            addressLocality: opts.location,
            addressCountry: 'GN',
          },
        },
    ...(opts.image ? { image: [opts.image] } : {}),
    organizer: PUBLISHER,
    ...(opts.price !== undefined
      ? {
          offers: {
            '@type': 'Offer',
            price: opts.price,
            priceCurrency: 'GNF',
            availability: 'https://schema.org/InStock',
            url: opts.url,
            validFrom: new Date().toISOString(),
          },
        }
      : {}),
    ...(opts.maxAttendees ? { maximumAttendeeCapacity: opts.maxAttendees } : {}),
  };
}

/**
 * FAQPage Schema for pages with question/answer content
 */
export function buildFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}

/**
 * AboutPage / Person Schema for leadership profiles
 */
export function buildAboutPageSchema(opts: {
  title: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: opts.title,
    description: opts.description,
    url: opts.url,
    mainEntity: {
      '@type': 'SportsOrganization',
      name: 'Federation Guineenne d\'Esport',
      alternateName: 'FEGESPORT',
      url: SITE_URL,
      foundingLocation: { '@type': 'Place', name: 'Conakry, Guinee' },
      areaServed: { '@type': 'Country', name: 'Guinee' },
      sport: ['Esports', 'Electronic Sports'],
    },
  };
}

/**
 * CollectionPage Schema for index/listing pages (news, events, etc.)
 */
export function buildCollectionSchema(opts: {
  name: string;
  description: string;
  url: string;
  itemCount?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    ...(opts.itemCount !== undefined
      ? {
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: opts.itemCount,
          },
        }
      : {}),
    publisher: PUBLISHER,
  };
}

/**
 * ContactPage Schema
 */
export function buildContactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact - FEGESPORT',
    url: `${SITE_URL}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: 'FEGESPORT',
      url: SITE_URL,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+224-625878764',
        email: 'contact@fegesport224.org',
        contactType: 'customer service',
        areaServed: 'GN',
        availableLanguage: ['French', 'English'],
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Conakry',
        addressRegion: 'Conakry',
        postalCode: 'BP 12345',
        addressCountry: 'GN',
      },
    },
  };
}

/**
 * Service Schema for membership / partnership pages
 */
export function buildServiceSchema(opts: {
  name: string;
  description: string;
  url: string;
  provider?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    provider: {
      '@type': 'Organization',
      name: opts.provider || 'FEGESPORT',
      url: SITE_URL,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Guinee',
    },
  };
}
