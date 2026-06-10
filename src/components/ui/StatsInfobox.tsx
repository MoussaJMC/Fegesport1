import React from 'react';
import { motion } from 'framer-motion';

export interface StatItem {
  /** Numeric or short text value to display (large) */
  value: string | number;
  /** Label below the value */
  label: string;
  /** Optional suffix appended to the value (e.g. "+", "/an") */
  suffix?: string;
  /** Optional icon rendered next to the label */
  icon?: React.ReactNode;
}

export interface StatsInfoboxProps {
  /** Optional title rendered above the stats grid */
  title?: string;
  /** Optional subtitle / short description */
  subtitle?: string;
  /** 2 to 6 stats recommended */
  stats: StatItem[];
  /** Visual variant */
  variant?: 'default' | 'compact';
  /** Number of columns at md breakpoint (auto if not set) */
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

/**
 * <StatsInfobox /> — reusable stat / key-figures block.
 *
 * Federation dark theme, gold accent. Accessible (semantic <dl>).
 * Designed for institutional pages: chiffres cles, indicateurs,
 * impact, realisations.
 */
const StatsInfobox: React.FC<StatsInfoboxProps> = ({
  title,
  subtitle,
  stats,
  variant = 'default',
  columns,
  className = '',
}) => {
  const headingId = React.useId();

  // Compute responsive column class
  const colCount = columns || (stats.length <= 3 ? stats.length : Math.ceil(stats.length / 2));
  const colClass =
    colCount === 2
      ? 'grid-cols-2'
      : colCount === 3
      ? 'grid-cols-2 md:grid-cols-3'
      : colCount === 4
      ? 'grid-cols-2 md:grid-cols-4'
      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';

  const padding = variant === 'compact' ? 'p-5' : 'p-6 md:p-8';
  const valueSize =
    variant === 'compact' ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl';

  return (
    <aside
      role="complementary"
      aria-labelledby={title ? headingId : undefined}
      className={`relative overflow-hidden rounded-2xl border border-fed-gold-500/30 bg-gradient-to-br from-dark-900 via-dark-900 to-dark-800 ${padding} shadow-lg shadow-fed-gold-500/5 not-prose ${className}`}
    >
      {/* gold accent strip */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-fed-gold-500 via-fed-gold-400 to-fed-red-500"
      />

      {(title || subtitle) && (
        <div className="mb-5">
          {title && (
            <h2
              id={headingId}
              className="text-xl md:text-2xl font-bold text-light-100 tracking-tight"
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-1.5 text-sm text-light-400 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <dl className={`grid ${colClass} gap-4 md:gap-6`}>
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="flex flex-col items-start"
          >
            <dt className="order-2 mt-1 text-xs md:text-sm text-light-400 leading-snug">
              <span className="inline-flex items-center gap-1.5">
                {stat.icon && (
                  <span className="text-fed-gold-500 flex-shrink-0">
                    {stat.icon}
                  </span>
                )}
                <span>{stat.label}</span>
              </span>
            </dt>
            <dd
              className={`order-1 m-0 ${valueSize} font-bold text-light-100 tracking-tight leading-none`}
            >
              <span>{stat.value}</span>
              {stat.suffix && (
                <span className="ml-0.5 text-fed-gold-500">{stat.suffix}</span>
              )}
            </dd>
          </motion.div>
        ))}
      </dl>
    </aside>
  );
};

export default StatsInfobox;
