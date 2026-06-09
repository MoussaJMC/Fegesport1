import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Visible breadcrumb component.
 *
 * Renders:
 * - Home > Section > Sub-section
 *
 * Accessible (nav role, aria-label, current page marked).
 * Pairs with <SEO breadcrumbs={items} /> for Schema.org BreadcrumbList JSON-LD.
 */
const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'fr' ? 'fr' : 'en';
  const homeLabel = lang === 'fr' ? 'Accueil' : 'Home';

  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label={lang === 'fr' ? 'Fil d\'Ariane' : 'Breadcrumb'}
      className={`text-sm ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-1.5">
        {/* Home */}
        <li className="flex items-center gap-1.5">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-light-400 hover:text-fed-gold-500 transition-colors"
          >
            <Home size={13} />
            <span>{homeLabel}</span>
          </Link>
        </li>

        {/* Items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight size={13} className="text-dark-700 flex-shrink-0" />
              {isLast ? (
                <span
                  className="text-light-100 font-medium"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.url}
                  className="text-light-400 hover:text-fed-gold-500 transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
