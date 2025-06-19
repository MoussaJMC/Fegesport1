import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { getSetting } = useSiteSettings();
  
  const currentYear = new Date().getFullYear();
  
  // Get contact info from database
  const contactInfo = getSetting('contact_info', {
    address: "Conakry, Guinée",
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

  // Get navigation settings for footer links
  const navigationSettings = getSetting('main_navigation', {
    brand_text: "FEGESPORT",
    items: []
  });
  
  // Get translated label for navigation items
  const getTranslatedLabel = (label: string): string => {
    // Convert label to lowercase and remove accents for matching with translation keys
    const key = label.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '');
    
    // Check if we have a translation for this key
    const translationKey = `navigation.${key}`;
    const hasTranslation = i18n.exists(translationKey);
    
    return hasTranslation ? t(translationKey) : label;
  };
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Federation Info */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4">{navigationSettings.brand_text || "FEGESPORT"}</h3>
            <p className="text-gray-300 mb-4">
              {i18n.language === 'fr' ? 'Fédération Guinéenne d\'Esport' : 'Guinean Esports Federation'}
            </p>
            <div className="flex space-x-4">
              {contactInfo.social_media?.facebook && (
                <a href={contactInfo.social_media.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                  <Facebook size={20} />
                </a>
              )}
              {contactInfo.social_media?.twitter && (
                <a href={contactInfo.social_media.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                  <Twitter size={20} />
                </a>
              )}
              {contactInfo.social_media?.instagram && (
                <a href={contactInfo.social_media.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                  <Instagram size={20} />
                </a>
              )}
              {contactInfo.social_media?.youtube && (
                <a href={contactInfo.social_media.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                  <Youtube size={20} />
                </a>
              )}
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">{t('navigation.home')}</h3>
            <ul className="space-y-2">
              {navigationSettings.items?.slice(0, 4).map((item: any) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-gray-300 hover:text-white transition-colors">
                    {getTranslatedLabel(item.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Resources */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">{t('navigation.resources')}</h3>
            <ul className="space-y-2">
              {navigationSettings.items?.slice(4).map((item: any) => (
                <li key={item.path}>
                  <Link to={item.path} className="text-gray-300 hover:text-white transition-colors">
                    {getTranslatedLabel(item.label)}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">{t('navigation.contact')}</h3>
            <address className="not-italic text-gray-300">
              <p className="mb-2">{contactInfo.address}</p>
              {contactInfo.postal_code && (
                <p className="mb-2">{contactInfo.postal_code}</p>
              )}
              {contactInfo.email && (
                <div className="flex items-center mb-2">
                  <Mail size={16} className="mr-2" />
                  <a href={`mailto:${contactInfo.email}`} className="hover:text-white transition-colors">
                    {contactInfo.email}
                  </a>
                </div>
              )}
              {contactInfo.phone && (
                <p className="mb-2">{contactInfo.phone}</p>
              )}
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            {t('footer.rights').replace('2025', currentYear.toString())}
          </p>
          <div className="flex space-x-4">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;