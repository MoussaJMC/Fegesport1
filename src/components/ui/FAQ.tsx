import React, { useEffect, useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface FAQItem {
  question: string;
  /** Plain text or JSX. Plain text recommended for best LLM extraction. */
  answer: React.ReactNode;
  /** Plain text version (used in Schema.org if `answer` is JSX) */
  answerText?: string;
}

export interface FAQProps {
  items: FAQItem[];
  title?: string;
  /** When true, injects an FAQPage JSON-LD script in the document head */
  injectSchema?: boolean;
  /** Unique id used for the schema script tag (allows multiple FAQs per page) */
  schemaId?: string;
  /** Allow multiple open at once */
  multiOpen?: boolean;
  className?: string;
}

/**
 * Strip React nodes / HTML to plain text for Schema.org payload.
 */
function nodeToText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join(' ');
  if (React.isValidElement(node)) {
    return nodeToText((node.props as { children?: React.ReactNode }).children);
  }
  return '';
}

/**
 * <FAQ /> — accessible, LLM-friendly FAQ component.
 *
 * Features:
 * - Schema.org FAQPage auto-injected (configurable)
 * - Accessible accordion (aria-expanded, aria-controls, keyboard navigable)
 * - Federation dark theme + gold accents
 * - Supports plain-text or JSX answers (with optional `answerText` for schema)
 * - Multiple FAQs per page supported via unique `schemaId`
 */
const FAQ: React.FC<FAQProps> = ({
  items,
  title,
  injectSchema = true,
  schemaId = 'faq-schema',
  multiOpen = false,
  className = '',
}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'fr' ? 'fr' : 'en';
  const defaultTitle =
    lang === 'fr'
      ? 'Questions fréquentes'
      : 'Frequently asked questions';

  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setOpenIndexes((prev) => {
      const next = new Set(multiOpen ? prev : []);
      if (prev.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // ============================================================
  // Schema.org FAQPage injection
  // ============================================================
  useEffect(() => {
    if (!injectSchema || items.length === 0) return;

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answerText || nodeToText(item.answer),
        },
      })),
    };

    let scriptEl = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = schemaId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(schema);

    return () => {
      const el = document.getElementById(schemaId);
      if (el) el.remove();
    };
  }, [items, injectSchema, schemaId]);

  if (!items || items.length === 0) return null;

  return (
    <section className={className} aria-labelledby={`${schemaId}-title`}>
      <div className="flex items-center gap-2.5 mb-6">
        <HelpCircle
          size={22}
          className="text-fed-gold-500 flex-shrink-0"
          aria-hidden="true"
        />
        <h2
          id={`${schemaId}-title`}
          className="text-2xl md:text-3xl font-bold text-light-100"
        >
          {title || defaultTitle}
        </h2>
      </div>

      <ul className="space-y-3 list-none">
        {items.map((item, index) => {
          const isOpen = openIndexes.has(index);
          const panelId = `${schemaId}-panel-${index}`;
          const buttonId = `${schemaId}-button-${index}`;
          return (
            <li
              key={index}
              className={`overflow-hidden rounded-xl border transition-colors ${
                isOpen
                  ? 'border-fed-gold-500/40 bg-dark-900'
                  : 'border-dark-700/70 bg-dark-900/60 hover:border-dark-700'
              }`}
            >
              <h3 className="m-0">
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 text-light-100 font-semibold hover:text-fed-gold-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fed-gold-500/60 focus-visible:ring-offset-0"
                >
                  <span className="text-base md:text-lg leading-snug">
                    {item.question}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`flex-shrink-0 text-fed-gold-500 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </h3>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
                className="px-5 pb-5 text-light-200 leading-relaxed text-[15px]"
              >
                {item.answer}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default FAQ;
