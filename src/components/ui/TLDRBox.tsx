import React from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface TLDRBoxProps {
  /** Optional title — defaults to "L'essentiel a retenir" / "Key takeaways" */
  title?: string;
  /** One-line definition (rendered as <p>) */
  summary: string;
  /** Bullet points — 2 to 6 recommended */
  bullets: string[];
  /** Visual variant */
  variant?: 'default' | 'compact';
  className?: string;
}

/**
 * <TLDRBox /> — extractable summary box for SEO/LLM-SEO.
 *
 * Placed at the top of pillar pages, it gives:
 * - Crawlers a clean structured summary
 * - LLMs an easy-to-quote block
 * - Users an immediate value preview
 *
 * Design: federation dark theme + gold accent, no-emoji,
 * accessible (aria-labelled), responsive.
 */
const TLDRBox: React.FC<TLDRBoxProps> = ({
  title,
  summary,
  bullets,
  variant = 'default',
  className = '',
}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'fr' ? 'fr' : 'en';
  const defaultTitle =
    lang === 'fr' ? "L'essentiel à retenir" : 'Key takeaways';
  const headingId = React.useId();

  const paddingY = variant === 'compact' ? 'py-5' : 'py-7';
  const titleSize = variant === 'compact' ? 'text-lg' : 'text-xl';

  return (
    <aside
      role="complementary"
      aria-labelledby={headingId}
      className={`relative overflow-hidden rounded-2xl border border-fed-gold-500/30 bg-gradient-to-br from-dark-900 via-dark-900 to-dark-800 px-6 ${paddingY} shadow-lg shadow-fed-gold-500/5 ${className}`}
    >
      {/* gold accent strip */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-fed-gold-500 via-fed-gold-400 to-fed-red-500"
      />

      <div className="flex items-center gap-2.5 mb-3">
        <Sparkles
          size={18}
          className="text-fed-gold-500 flex-shrink-0"
          aria-hidden="true"
        />
        <h2
          id={headingId}
          className={`${titleSize} font-bold text-light-100 tracking-tight`}
        >
          {title || defaultTitle}
        </h2>
      </div>

      <p className="text-light-200 leading-relaxed mb-4">{summary}</p>

      <ul className="space-y-2 list-none">
        {bullets.map((bullet, i) => (
          <li
            key={i}
            className="flex gap-3 text-light-200 leading-relaxed text-[15px]"
          >
            <span
              aria-hidden="true"
              className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-fed-gold-500 flex-shrink-0"
            />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default TLDRBox;
