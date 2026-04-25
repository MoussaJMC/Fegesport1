import React from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  publicLink?: string;
  publicLinkLabel?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
}

/**
 * Standardized header for all admin pages.
 * Provides title, subtitle, back link, public preview link, and action buttons.
 */
const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  subtitle,
  backTo,
  backLabel = 'Retour',
  publicLink,
  publicLinkLabel = 'Voir sur le site',
  actions,
  icon,
}) => {
  return (
    <div className="mb-6 pb-5 border-b border-dark-700">
      {/* Back link */}
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-light-400 hover:text-fed-gold-500 text-sm font-medium mb-3 transition-colors"
        >
          <ArrowLeft size={14} />
          {backLabel}
        </Link>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="w-12 h-12 rounded-xl bg-fed-red-500/10 border border-fed-red-500/20 flex items-center justify-center text-fed-red-500 flex-shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white font-heading mb-1">
              {title}
            </h1>
            {subtitle && (
              <p className="text-light-400 text-sm">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {publicLink && (
            <a
              href={publicLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-dark-800 border border-dark-700 hover:border-fed-gold-500/40 text-light-300 hover:text-fed-gold-500 text-sm font-medium transition-all"
            >
              <ExternalLink size={14} />
              {publicLinkLabel}
            </a>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
};

export default AdminPageHeader;
