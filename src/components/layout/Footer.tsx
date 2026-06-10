import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone, Globe } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { ManageCookiesLink } from '../cookie/CookieBanner';

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { getSetting } = useSiteSettings();
  const lang = i18n.language === 'fr' ? 'fr' : 'en';
  const currentYear = new Date().getFullYear();

  const contactInfo = getSetting('contact_info', {
    address: "Conakry, Guinee",
    postal_code: "BP 12345",
    email: "contact@fegesport224.org",
    phone: "+224 625878764",
    social_media: {
      facebook: "https://facebook.com/fegesport",
      twitter: "https://twitter.com/fegesport",
      instagram: "https://instagram.com/fegesport",
      youtube: "https://youtube.com/fegesport"
    }
  });

  const navigationSettings = getSetting('main_navigation', {
    brand_text: "FEGESPORT",
    items: []
  });

  const getTranslatedLabel = (label: string): string => {
    const key = label.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '');
    const translationKey = `navigation.${key}`;
    return i18n.exists(translationKey) ? t(translationKey) : label;
  };

  const socialLinks = [
    { url: contactInfo.social_media?.facebook, icon: Facebook, label: 'Facebook' },
    { url: contactInfo.social_media?.twitter, icon: Twitter, label: 'Twitter' },
    { url: contactInfo.social_media?.instagram, icon: Instagram, label: 'Instagram' },
    { url: contactInfo.social_media?.youtube, icon: Youtube, label: 'YouTube' },
  ].filter(link => link.url);

  return (
    <footer className="bg-dark-950 text-light-100 border-t border-dark-700">
      {/* Main footer content */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Column 1 — Federation Identity */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-fed-red-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm font-heading">FGE</span>
              </div>
              <span className="text-xl font-bold font-heading text-white">
                {navigationSettings.brand_text || "FEGESPORT"}
              </span>
            </div>
            <p className="text-light-400 text-sm leading-relaxed mb-6">
              {lang === 'fr'
                ? 'Federation Guineenne d\'Esport. Structurer, developper et representer l\'esport en Republique de Guinee.'
                : 'Guinean Esports Federation. Structuring, developing and representing esports in the Republic of Guinea.'}
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-dark-800 border border-dark-700 flex items-center justify-center text-light-400 hover:text-fed-red-500 hover:border-fed-red-500/30 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Navigation (primary internal links — SEO critical) */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-light-300 mb-4 font-heading">
              {lang === 'fr' ? 'Navigation' : 'Navigation'}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/"
                  className="text-light-400 hover:text-fed-gold-500 text-sm transition-colors duration-200"
                  title={lang === 'fr' ? 'Page d\'accueil FEGESPORT' : 'FEGESPORT homepage'}
                >
                  {lang === 'fr' ? 'Accueil' : 'Home'}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-light-400 hover:text-fed-gold-500 text-sm transition-colors duration-200"
                  title={lang === 'fr' ? 'A propos de la Federation Guineenne d\'Esport' : 'About the Guinean Esports Federation'}
                >
                  {lang === 'fr' ? 'A propos' : 'About'}
                </Link>
              </li>
              <li>
                <Link
                  to="/news"
                  className="text-light-400 hover:text-fed-gold-500 text-sm transition-colors duration-200"
                  title={lang === 'fr' ? 'Actualites de la FEGESPORT' : 'FEGESPORT news'}
                >
                  {lang === 'fr' ? 'Actualites' : 'News'}
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="text-light-400 hover:text-fed-gold-500 text-sm transition-colors duration-200"
                  title={lang === 'fr' ? 'Evenements et competitions' : 'Events and competitions'}
                >
                  {lang === 'fr' ? 'Evenements' : 'Events'}
                </Link>
              </li>
              <li>
                <Link
                  to="/leg"
                  className="text-light-400 hover:text-fed-gold-500 text-sm transition-colors duration-200"
                  title={lang === 'fr' ? 'League eSport de Guinee (LEG)' : 'Guinea eSports League (LEG)'}
                >
                  {lang === 'fr' ? 'eLeague (LEG)' : 'eLeague (LEG)'}
                </Link>
              </li>
              <li>
                <Link
                  to="/membership"
                  className="text-light-400 hover:text-fed-gold-500 text-sm transition-colors duration-200"
                  title={lang === 'fr' ? 'Adhesion FEGESPORT' : 'FEGESPORT membership'}
                >
                  {lang === 'fr' ? 'Adhesion' : 'Membership'}
                </Link>
              </li>
              <li>
                <Link
                  to="/membership/community"
                  className="text-light-400 hover:text-fed-gold-500 text-sm transition-colors duration-200"
                >
                  {lang === 'fr' ? 'Communaute' : 'Community'}
                </Link>
              </li>
              <li>
                <Link
                  to="/partners"
                  className="text-light-400 hover:text-fed-gold-500 text-sm transition-colors duration-200"
                  title={lang === 'fr' ? 'Partenaires officiels' : 'Official partners'}
                >
                  {lang === 'fr' ? 'Partenaires' : 'Partners'}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-light-400 hover:text-fed-gold-500 text-sm transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 — Resources (institutional + legal) */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-light-300 mb-4 font-heading">
              {lang === 'fr' ? 'Ressources' : 'Resources'}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/press-kit"
                  className="text-light-400 hover:text-fed-gold-500 text-sm transition-colors duration-200"
                  title={lang === 'fr' ? 'Kit de presse officiel FEGESPORT' : 'Official FEGESPORT press kit'}
                >
                  {lang === 'fr' ? 'Kit de presse' : 'Press kit'}
                </Link>
              </li>
              <li>
                <Link
                  to="/resources"
                  className="text-light-400 hover:text-fed-gold-500 text-sm transition-colors duration-200"
                >
                  {lang === 'fr' ? 'Documents officiels' : 'Official Documents'}
                </Link>
              </li>
              <li>
                <Link
                  to="/direct"
                  className="text-light-400 hover:text-fed-gold-500 text-sm transition-colors duration-200"
                >
                  {lang === 'fr' ? 'DIRECT (Streams)' : 'LIVE (Streams)'}
                </Link>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  className="text-light-400 hover:text-fed-gold-500 text-sm transition-colors duration-200"
                  title="Sitemap XML"
                >
                  Sitemap
                </a>
              </li>
              <li>
                <Link to="/privacy" className="text-light-400 hover:text-fed-gold-500 text-sm transition-colors duration-200">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-light-400 hover:text-fed-gold-500 text-sm transition-colors duration-200">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-light-300 mb-4 font-heading">
              {lang === 'fr' ? 'Contact' : 'Contact'}
            </h4>
            <address className="not-italic space-y-3">
              {contactInfo.address && (
                <div className="flex items-start gap-2.5 text-light-400 text-sm">
                  <MapPin size={15} className="mt-0.5 flex-shrink-0 text-fed-red-500" />
                  <span>{contactInfo.address}</span>
                </div>
              )}
              {contactInfo.email && (
                <div className="flex items-start gap-2.5 text-light-400 text-sm">
                  <Mail size={15} className="mt-0.5 flex-shrink-0 text-fed-red-500" />
                  <a href={`mailto:${contactInfo.email}`} className="hover:text-fed-gold-500 transition-colors break-all">
                    {contactInfo.email}
                  </a>
                </div>
              )}
              {contactInfo.phone && (
                <div className="flex items-start gap-2.5 text-light-400 text-sm">
                  <Phone size={15} className="mt-0.5 flex-shrink-0 text-fed-red-500" />
                  <a href={`tel:${contactInfo.phone}`} className="hover:text-fed-gold-500 transition-colors">
                    {contactInfo.phone}
                  </a>
                </div>
              )}
              <div className="flex items-start gap-2.5 text-light-400 text-sm">
                <Globe size={15} className="mt-0.5 flex-shrink-0 text-fed-red-500" />
                <span>fegesport224.org</span>
              </div>
            </address>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-800">
        <div className="container-custom py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-light-400 text-xs text-center md:text-left">
            &copy; {currentYear} FEGESPORT — {lang === 'fr' ? 'Federation Guineenne d\'Esport. Tous droits reserves.' : 'Guinean Esports Federation. All rights reserved.'}
          </p>
          <div className="flex items-center gap-6 flex-wrap">
            <Link to="/privacy" className="text-light-400 hover:text-fed-gold-500 text-xs transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link to="/terms" className="text-light-400 hover:text-fed-gold-500 text-xs transition-colors">
              {t('footer.terms')}
            </Link>
            {/* Re-show cookie banner — only rendered if analytics are configured */}
            <ManageCookiesLink className="text-light-400 hover:text-fed-gold-500 text-xs transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
