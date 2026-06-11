import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { SEO, Breadcrumb } from '../seo';
import type { BreadcrumbItem } from '../seo';
import TLDRBox from '../ui/TLDRBox';
import FAQ from '../ui/FAQ';
import type { FAQItem } from '../ui/FAQ';

// ============================================================
// Types
// ============================================================

export interface PillarSection {
  /** Anchor id (kebab-case). Used for TOC + URL hash. */
  id: string;
  /** H2 heading rendered visibly */
  heading: string;
  /** Optional eyebrow / kicker above the heading */
  eyebrow?: string;
  /** Section content (React node). Use rich text/components. */
  content: React.ReactNode;
}

export interface PillarRelatedLink {
  to: string;
  label: string;
  description?: string;
  /** Optional Lucide icon */
  icon?: React.ReactNode;
}

export interface PillarPageLayoutProps {
  // ---------- SEO ----------
  /** Page title (without "| FEGESPORT" suffix — appended automatically) */
  seoTitle: string;
  /** Meta description (150-160 chars recommended) */
  seoDescription: string;
  /** Comma-separated keywords */
  seoKeywords?: string;
  /** Optional OG image URL */
  seoImage?: string;
  /** Schema.org JSON-LD object for this page (Article, AboutPage, etc.) */
  schema?: Record<string, any>;

  // ---------- Breadcrumbs ----------
  breadcrumbs: BreadcrumbItem[];

  // ---------- Hero ----------
  /** Optional eyebrow above the H1 */
  heroEyebrow?: string;
  /** Main H1 — primary keyword should appear here */
  heroTitle: string;
  /** Subtitle / lead paragraph below H1 */
  heroSubtitle?: string;

  // ---------- TLDR ----------
  /** Optional TLDR block displayed right after the hero */
  tldr?: {
    summary: string;
    bullets: string[];
    title?: string;
  };

  // ---------- Sections (TOC + content) ----------
  sections: PillarSection[];

  // ---------- FAQ ----------
  /** Optional FAQ block rendered at the end (with FAQPage schema) */
  faq?: FAQItem[];
  faqTitle?: string;

  // ---------- Related (internal linking) ----------
  /** Related links rendered as a grid at the bottom */
  relatedLinks?: PillarRelatedLink[];
  relatedTitle?: string;

  // ---------- CTA ----------
  /** Optional CTA bar above the footer */
  cta?: {
    title: string;
    description?: string;
    primary?: { label: string; to: string };
    secondary?: { label: string; to: string };
  };

  // ---------- Meta ----------
  /** Last factual review date — displayed in the page (build trust) */
  lastReviewedISO?: string;
  /** Author / institution */
  authorLabel?: string;
}

// ============================================================
// Table of contents (sticky on desktop)
// ============================================================

const TableOfContents: React.FC<{ sections: PillarSection[] }> = ({
  sections,
}) => {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-30% 0px -55% 0px',
        threshold: 0,
      }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Sommaire de la page"
      className="lg:sticky lg:top-24 space-y-1 text-sm"
    >
      <p className="text-xs uppercase tracking-widest text-fed-gold-500 font-semibold mb-3">
        Sommaire
      </p>
      <ul className="space-y-1 list-none border-l border-dark-700">
        {sections.map((s) => {
          const isActive = activeId === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={`block pl-4 py-1.5 -ml-px border-l-2 transition-colors leading-snug ${
                  isActive
                    ? 'border-fed-gold-500 text-fed-gold-500 font-medium'
                    : 'border-transparent text-light-400 hover:text-light-100'
                }`}
              >
                {s.heading}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

// ============================================================
// Main component
// ============================================================

const PillarPageLayout: React.FC<PillarPageLayoutProps> = ({
  seoTitle,
  seoDescription,
  seoKeywords,
  seoImage,
  schema,
  breadcrumbs,
  heroEyebrow,
  heroTitle,
  heroSubtitle,
  tldr,
  sections,
  faq,
  faqTitle,
  relatedLinks,
  relatedTitle,
  cta,
  lastReviewedISO,
  authorLabel,
}) => {
  const lastReviewedDate = lastReviewedISO
    ? new Date(lastReviewedISO).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="min-h-screen bg-dark-950 text-light-100">
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        image={seoImage}
        type="article"
        breadcrumbs={breadcrumbs}
        schema={schema}
        modifiedTime={lastReviewedISO}
        publishedTime={lastReviewedISO}
        author={authorLabel || 'FEGESPORT'}
        section="Institutional"
      />

      {/* ====================== HERO ====================== */}
      <header className="relative overflow-hidden bg-gradient-to-b from-dark-900 via-dark-950 to-dark-950 border-b border-dark-800">
        {/* subtle background grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #F59E0B 1px, transparent 0)',
            backgroundSize: '38px 38px',
          }}
        />
        {/* red glow */}
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-fed-red-500/10 blur-3xl"
        />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 md:pt-8 md:pb-20">
          <Breadcrumb items={breadcrumbs} className="mb-8" />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl"
          >
            {heroEyebrow && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-fed-gold-500/30 bg-fed-gold-500/5 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-fed-gold-500 animate-pulse" />
                <span className="text-xs uppercase tracking-widest font-semibold text-fed-gold-500">
                  {heroEyebrow}
                </span>
              </div>
            )}

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-light-100 mb-6">
              {heroTitle}
            </h1>

            {heroSubtitle && (
              <p className="text-lg md:text-xl text-light-200 leading-relaxed max-w-3xl">
                {heroSubtitle}
              </p>
            )}

            {(lastReviewedDate || authorLabel) && (
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-light-400">
                {authorLabel && <span>{authorLabel}</span>}
                {lastReviewedDate && (
                  <>
                    <span className="hidden sm:inline text-dark-700">•</span>
                    <span>
                      Dernière mise à jour factuelle :{' '}
                      <time dateTime={lastReviewedISO}>{lastReviewedDate}</time>
                    </span>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </header>

      {/* ====================== BODY ====================== */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10 lg:gap-14">
          {/* TOC (left rail on desktop) */}
          <aside className="hidden lg:block">
            <TableOfContents sections={sections} />
          </aside>

          {/* Main content */}
          <article className="min-w-0">
            {tldr && (
              <TLDRBox
                title={tldr.title}
                summary={tldr.summary}
                bullets={tldr.bullets}
                className="mb-12"
              />
            )}

            <div className="space-y-14">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24"
                >
                  {section.eyebrow && (
                    <p className="text-xs uppercase tracking-widest font-semibold text-fed-gold-500 mb-2">
                      {section.eyebrow}
                    </p>
                  )}
                  <h2 className="text-2xl md:text-3xl font-bold text-light-100 mb-5 tracking-tight">
                    {section.heading}
                  </h2>
                  <div className="prose-pillar text-light-200 leading-relaxed text-[16px] md:text-[17px] space-y-4">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>

            {faq && faq.length > 0 && (
              <div className="mt-16 pt-12 border-t border-dark-800">
                <FAQ items={faq} title={faqTitle} schemaId="pillar-faq-schema" />
              </div>
            )}

            {relatedLinks && relatedLinks.length > 0 && (
              <section
                aria-labelledby="related-title"
                className="mt-16 pt-12 border-t border-dark-800"
              >
                <h2
                  id="related-title"
                  className="text-2xl md:text-3xl font-bold text-light-100 mb-6 tracking-tight"
                >
                  {relatedTitle ||
                    (typeof navigator !== 'undefined' && /fr/.test(navigator.language)
                      ? 'Pour aller plus loin'
                      : 'Related resources')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedLinks.map((link, i) => (
                    <Link
                      key={i}
                      to={link.to}
                      className="group p-5 rounded-xl border border-dark-700/70 bg-dark-900/60 hover:border-fed-gold-500/40 hover:bg-dark-900 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {link.icon && (
                          <span className="text-fed-gold-500 mt-0.5">
                            {link.icon}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-light-100 font-semibold group-hover:text-fed-gold-500 transition-colors">
                            <span>{link.label}</span>
                            <ChevronRight
                              size={16}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </div>
                          {link.description && (
                            <p className="mt-1 text-sm text-light-400 leading-snug">
                              {link.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
        </div>
      </div>

      {/* ====================== CTA ====================== */}
      {cta && (
        <section className="border-t border-dark-800 bg-gradient-to-br from-dark-900 to-dark-950">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-4xl font-bold text-light-100 mb-4 tracking-tight">
                {cta.title}
              </h2>
              {cta.description && (
                <p className="text-light-200 text-lg leading-relaxed mb-8">
                  {cta.description}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {cta.primary && (
                  <Link
                    to={cta.primary.to}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-fed-red-500 hover:bg-fed-red-600 text-white font-semibold transition-colors"
                  >
                    {cta.primary.label}
                    <ArrowRight size={18} />
                  </Link>
                )}
                {cta.secondary && (
                  <Link
                    to={cta.secondary.to}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-dark-700 hover:border-fed-gold-500/40 text-light-100 font-semibold transition-colors"
                  >
                    {cta.secondary.label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default PillarPageLayout;
