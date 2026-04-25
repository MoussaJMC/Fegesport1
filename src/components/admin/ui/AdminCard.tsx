import React from 'react';

interface AdminCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  variant?: 'default' | 'gold' | 'red' | 'blue';
}

/**
 * Standardized card component for admin pages.
 * Provides consistent dark styling with optional accent variants.
 */
const AdminCard: React.FC<AdminCardProps> = ({
  title,
  subtitle,
  icon,
  actions,
  children,
  className = '',
  noPadding = false,
  variant = 'default',
}) => {
  const variantClasses = {
    default: 'border-dark-700',
    gold: 'border-fed-gold-500/30 border-l-4 border-l-fed-gold-500',
    red: 'border-fed-red-500/30 border-l-4 border-l-fed-red-500',
    blue: 'border-accent-blue-500/30 border-l-4 border-l-accent-blue-500',
  };

  return (
    <div className={`bg-dark-800 border rounded-xl shadow-lg overflow-hidden ${variantClasses[variant]} ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-dark-700">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="w-9 h-9 rounded-lg bg-fed-red-500/10 border border-fed-red-500/20 flex items-center justify-center text-fed-red-500 flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {title && <h3 className="text-base font-bold text-white font-heading truncate">{title}</h3>}
              {subtitle && <p className="text-xs text-light-400 truncate">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
};

export default AdminCard;
