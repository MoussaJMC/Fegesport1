import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { ManageCookiesLink } from '../cookie/CookieBanner';

/**
 * Premium federation footer — institutional grade.
 *
 * Inspired by FIFA, UEFA, Riot Games, ESL, IESF.
 * 4 columns max, compact height, refined hover states, no aggressive animations.
 */
const Footer: React.FC = () => {
  const { i18n } = useTranslation();
  const { getSetting } = useSiteSettings();
  const lang = i18n.language === 'fr' ? 'fr' : 'en';
  const currentYear = new Date().getFullYear();

  const contactInfo = getSetting('contact_info', {
    address: 'Conakry, Guinee',
    email: 'contact@fegesport224.org',
    phone: '+224 625 87 87 64',
    social_media: {
      facebook: 'https://facebook.com/fegesport',
      twitter: 'https://twitter.com/fegesport',
      instagram: 'https://instagram.com/fegesport',
      youtube: 'https://youtube.com/fegesport',
    },
  });

  const navigationSettings = getSetting('main_navigation', {
    brand_text: 'FEGESPORT',
    items: [],
  });

  const socialLinks = [
    { url: contactInfo.social_media?.facebook, icon: Facebook, label: 'Facebook' },
    { url: contactInfo.social_media?.twitter, icon: Twitter, label: 'Twitter' },
    { url: contactInfo.social_media?.instagram, icon: Instagram, label: 'Instagram' },
    { url: contactInfo.social_media?.youtube, icon: Youtube, label: 'YouTube' },
  ].filter((link) => link.url);

  // Reusable link class for the 3 navigation columns — premium hover state
  const navLinkClass =
    'group inline-flex items-center text-light-400 hover:text-light-100 text-[13.5px] leading-tight transition-colors duration-200 relative';

  const navLinkUnderline = (
    <span
      aria-hidden="true"
      className="absolute left-0 -bottom-0.5 h-px w-0 bg-fed-gold-500 transition-all duration-200 group-hover:w-full"
    />
  );

  return (
    <footer className="bg-dark-950 text-light-100 border-t border-dark-800/80">
      {/* gold thin accent line at the top of the footer — premium signal */}
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-transparent via-fed-gold-500/40 to-transparent"
      />

      {/* ================= Main grid ================= */}
      <div className="container-custom pt-10 pb-7 md:pt-12 md:pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

          {/* ---------------- Column 1 — Brand + tagline ---------------- */}
          <div className="lg:pr-4">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
              <div className="w-9 h-9 rounded-md bg-fed-red-500 flex items-center justify-center shadow-sm shadow-fed-red-500/20 group-hover:shadow-fed-red-500/40 transition-shadow">
                <span className="text-white font-bold text-[11px] font-heading tracking-wider">FGE</span>
              </div>
              <span className="text-lg font-bold font-heading text-light-100 tracking-tight">
                {navigationSettings.brand_text || 'FEGESPORT'}
              </span>
            </Link>
            <p className="text-light-400 text-[13.5px] leading-relaxed mb-5 max-w-xs">
              {lang === 'fr'
                ? "Federation Guineenne d'Esport. Promouvoir, structurer et representer l'esport en Republique de Guinee."
                : "Guinean Esports Federation. Promoting, structuring and representing esports in the Republic of Guinea."}
            </p>

            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-md border border-dark-800 bg-dark-900/60 flex items-center justify-center text-light-400 hover:text-fed-gold-500 hover:border-fed-gold-500/40 hover:bg-dark-900 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* ---------------- Column 2 — Federation ---------------- */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fed-gold-500 mb-4 font-heading">
              {lang === 'fr' ? 'Federation' : 'Federation'}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/about" className={navLinkClass}>
                  <span>{lang === 'fr' ? 'A propos' : 'About'}</span>
                  {navLinkUnderline}
                </Link>
              </li>
              <li>
                <Link to="/federation-guineenne-esport" className={navLinkClass}>
                  <span>{lang === 'fr' ? 'La Federation' : 'The Federation'}</span>
                  {navLinkUnderline}
                </Link>
              </li>
              <li>
                <Link to="/partners" className={navLinkClass}>
                  <span>{lang === 'fr' ? 'Partenaires' : 'Partners'}</span>
                  {navLinkUnderline}
                </Link>
              </li>
              <li>
                <Link to="/contact" className={navLinkClass}>
                  <span>Contact</span>
                  {navLinkUnderline}
                </Link>
              </li>
            </ul>
          </div>

          {/* ---------------- Column 3 — Compétitions ---------------- */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fed-gold-500 mb-4 font-heading">
              {lang === 'fr' ? 'Competitions' : 'Competitions'}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/leg" className={navLinkClass}>
                  <span>{lang === 'fr' ? 'eLeague (LEG)' : 'eLeague (LEG)'}</span>
                  {navLinkUnderline}
                </Link>
              </li>
              <li>
                <Link to="/events" className={navLinkClass}>
                  <span>{lang === 'fr' ? 'Evenements' : 'Events'}</span>
                  {navLinkUnderline}
                </Link>
              </li>
              <li>
                <Link to="/news" className={navLinkClass}>
                  <span>{lang === 'fr' ? 'Actualites' : 'News'}</span>
                  {navLinkUnderline}
                </Link>
              </li>
              <li>
                <Link to="/direct" className={navLinkClass}>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-fed-red-500 animate-pulse" />
                    DIRECT
                  </span>
                  {navLinkUnderline}
                </Link>
              </li>
            </ul>
          </div>

          {/* ---------------- Column 4 — Informations ---------------- */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fed-gold-500 mb-4 font-heading">
              {lang === 'fr' ? 'Informations' : 'Information'}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/privacy" className={navLinkClass}>
                  <span>{lang === 'fr' ? 'Confidentialite' : 'Privacy'}</span>
                  {navLinkUnderline}
                </Link>
              </li>
              <li>
                <Link to="/terms" className={navLinkClass}>
                  <span>{lang === 'fr' ? "Conditions d'utilisation" : 'Terms of use'}</span>
                  {navLinkUnderline}
                </Link>
              </li>
              <li>
                <a href="/sitemap.xml" className={navLinkClass}>
                  <span>Sitemap</span>
                  {navLinkUnderline}
                </a>
              </li>
              <li>
                <Link to="/press-kit" className={navLinkClass}>
                  <span>{lang === 'fr' ? 'Kit de presse' : 'Press kit'}</span>
                  {navLinkUnderline}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ---------------- Compact contact strip ---------------- */}
        <div className="mt-9 pt-6 border-t border-dark-800/70 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 text-[12.5px] text-light-400">
          {contactInfo.address && (
            <div className="flex items-center gap-2">
              <MapPin size={13} className="flex-shrink-0 text-fed-red-500" />
              <span>{contactInfo.address}</span>
            </div>
          )}
          {contactInfo.email && (
            <div className="flex items-center gap-2">
              <Mail size={13} className="flex-shrink-0 text-fed-red-500" />
              <a
                href={`mailto:${contactInfo.email}`}
                className="hover:text-fed-gold-500 transition-colors truncate"
              >
                {contactInfo.email}
              </a>
            </div>
          )}
          {contactInfo.phone && (
            <div className="flex items-center gap-2">
              <Phone size={13} className="flex-shrink-0 text-fed-red-500" />
              <a href={`tel:${contactInfo.phone}`} className="hover:text-fed-gold-500 transition-colors">
                {contactInfo.phone}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ================= Bottom bar ================= */}
      <div className="border-t border-dark-800/80 bg-dark-950">
        <div className="container-custom py-4 flex flex-col sm:flex-row justify-between items-center gap-2.5">
          <p className="text-light-400 text-[11.5px] tracking-wide text-center sm:text-left">
            &copy; {currentYear} FEGESPORT —{' '}
            {lang === 'fr'
              ? "Federation Guineenne d'Esport. Tous droits reserves."
              : 'Guinean Esports Federation. All rights reserved.'}
          </p>
          <div className="flex items-center gap-5 text-[11.5px]">
            <ManageCookiesLink className="text-light-400 hover:text-fed-gold-500 transition-colors" />
            <span className="text-light-400/50 select-none">·</span>
            <span className="text-light-400 inline-flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-fed-gold-500" />
              {lang === 'fr' ? 'Membre IESF, ACES, WESCO, GEF' : 'Member of IESF, ACES, WESCO, GEF'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
