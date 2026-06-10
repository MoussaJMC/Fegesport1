/**
 * CookieBanner — RGPD-compliant consent banner.
 *
 * Design principles:
 * - Non-intrusive: fixed bottom, dismissable, doesn't block content
 * - No layout shift on load (uses opacity + transform, no DOM injection)
 * - 3 explicit choices: Accept / Decline / Continue without
 * - Accessible: keyboard navigable, ARIA labels, focus trap on small screens
 * - Bilingual FR/EN via existing i18n
 * - Federation design system (dark, gold accents)
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Cookie, Check, X, Settings2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  shouldShowBanner,
  setConsent,
  resetConsent,
  onConsentChange,
  getConsent,
  isGA4Configured,
  isClarityConfigured,
} from '../../lib/analytics';

interface CookieBannerProps {
  /** Optional: control the banner visibility from outside (for settings link). */
  forceOpen?: boolean;
  /** Callback when banner is dismissed (used by settings trigger). */
  onClose?: () => void;
}

const CookieBanner: React.FC<CookieBannerProps> = ({ forceOpen = false, onClose }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'fr' ? 'fr' : 'en';
  const [visible, setVisible] = useState(false);

  // Only show if analytics are actually configured AND user hasn't decided yet
  const trackingAvailable = isGA4Configured() || isClarityConfigured();

  useEffect(() => {
    if (forceOpen) {
      setVisible(true);
      return;
    }
    if (!trackingAvailable) {
      // No analytics configured → no banner needed
      setVisible(false);
      return;
    }
    // Show only if user hasn't made a choice yet
    setVisible(shouldShowBanner());

    // Re-evaluate if consent changes (e.g. user clicks "Change my preferences")
    const unsubscribe = onConsentChange((status) => {
      setVisible(status === 'pending' && trackingAvailable);
    });

    return unsubscribe;
  }, [forceOpen, trackingAvailable]);

  const handleAccept = useCallback(() => {
    setConsent('accepted');
    setVisible(false);
    onClose?.();
  }, [onClose]);

  const handleDecline = useCallback(() => {
    setConsent('declined');
    setVisible(false);
    onClose?.();
  }, [onClose]);

  const handleSkip = useCallback(() => {
    setConsent('skipped');
    setVisible(false);
    onClose?.();
  }, [onClose]);

  if (!visible) return null;

  const text = {
    fr: {
      title: 'Respect de votre vie privée',
      body:
        'La FEGESPORT utilise des outils d\'analyse anonymisés (Google Analytics, Microsoft Clarity) pour améliorer le site et mieux comprendre les visites. Aucune donnée personnelle n\'est collectee sans votre accord.',
      accept: 'Accepter',
      decline: 'Refuser',
      skip: 'Continuer sans accepter',
      more: 'En savoir plus',
      privacy: 'Politique de confidentialité',
    },
    en: {
      title: 'Your privacy matters',
      body:
        'FEGESPORT uses anonymised analytics tools (Google Analytics, Microsoft Clarity) to improve the site and understand visitor behaviour. No personal data is collected without your consent.',
      accept: 'Accept',
      decline: 'Decline',
      skip: 'Continue without accepting',
      more: 'Learn more',
      privacy: 'Privacy policy',
    },
  }[lang];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        role="dialog"
        aria-label={text.title}
        aria-describedby="cookie-banner-body"
        className="fixed bottom-0 left-0 right-0 z-[100] p-3 sm:p-4 pointer-events-none"
      >
        <div className="pointer-events-auto mx-auto max-w-4xl">
          <div className="bg-dark-900/98 backdrop-blur-xl border border-dark-700 rounded-2xl shadow-2xl shadow-black/40 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-fed-gold-500/10 border border-fed-gold-500/30 flex items-center justify-center text-fed-gold-500">
                <Cookie size={20} aria-hidden="true" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold font-heading text-sm sm:text-base mb-1">
                  {text.title}
                </h2>
                <p id="cookie-banner-body" className="text-light-300 text-xs sm:text-sm leading-relaxed">
                  {text.body}{' '}
                  <a
                    href="/privacy"
                    className="text-fed-gold-500 hover:text-fed-gold-400 underline underline-offset-2"
                  >
                    {text.privacy}
                  </a>
                  .
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:flex-shrink-0">
                <button
                  type="button"
                  onClick={handleAccept}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-fed-red-500 hover:bg-fed-red-600 text-white text-sm font-semibold shadow-lg shadow-fed-red-500/20 transition-all whitespace-nowrap"
                >
                  <Check size={14} aria-hidden="true" />
                  {text.accept}
                </button>
                <button
                  type="button"
                  onClick={handleDecline}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-dark-700 text-light-300 hover:text-white text-sm font-semibold transition-all whitespace-nowrap"
                >
                  <X size={14} aria-hidden="true" />
                  {text.decline}
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-light-400 hover:text-light-100 text-xs font-medium underline underline-offset-2 transition-colors whitespace-nowrap px-2"
                >
                  {text.skip}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieBanner;

/**
 * Helper to expose a "Manage cookies" link anywhere on the site
 * (e.g. in the Footer). Just renders a button that resets consent
 * to "pending" so the banner reappears.
 */
export const ManageCookiesLink: React.FC<{ className?: string; label?: string }> = ({
  className = '',
  label,
}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'fr' ? 'fr' : 'en';
  const defaultLabel = lang === 'fr' ? 'Gerer les cookies' : 'Manage cookies';
  const currentStatus = getConsent();

  // Only render if analytics are configured
  if (!isGA4Configured() && !isClarityConfigured()) return null;

  return (
    <button
      type="button"
      onClick={() => {
        resetConsent();
        // Scroll to top so the banner is in view
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
          /* noop */
        }
      }}
      className={className}
      title={
        currentStatus === 'accepted'
          ? lang === 'fr' ? 'Tracking actif — cliquer pour modifier' : 'Tracking on — click to change'
          : currentStatus === 'declined'
          ? lang === 'fr' ? 'Tracking refuse — cliquer pour modifier' : 'Tracking declined — click to change'
          : undefined
      }
    >
      <Settings2 size={12} className="inline mr-1" aria-hidden="true" />
      {label || defaultLabel}
    </button>
  );
};
