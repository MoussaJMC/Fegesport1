import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, ChevronDown, User, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';

interface SubNavItem {
  label: string;
  path: string;
}

interface NavItem {
  label: string;
  path: string;
  order: number;
  submenu?: SubNavItem[];
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [membershipMenuOpen, setMembershipMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { getSetting, loading: settingsLoading } = useSiteSettings();

  // Get settings from database
  const logoSettings = getSetting('site_logo', {
    main_logo: "https://geozovninpeqsgtzwchu.supabase.co/storage/v1/object/public/static-files/uploads/d5b2ehmnrec.jpg",
    alt_text: "FEGESPORT Logo",
    width: 48,
    height: 48,
    link: "/"
  });

  // Debug logo loading
  useEffect(() => {
    if (!settingsLoading && logoSettings) {
      console.log('Logo settings loaded:', logoSettings);
    }
  }, [settingsLoading, logoSettings]);

  const navigationSettings = getSetting('main_navigation', {
    brand_text: "FEGESPORT",
    items: [
      { label: "Accueil", path: "/", order: 1 },
      { label: "À propos", path: "/about", order: 2 },
      { label: "Actualités", path: "/news", order: 3 },
      { label: "Adhésion", path: "/membership", order: 4, submenu: [
        { label: "Adhésion", path: "/membership" },
        { label: "Communauté", path: "/membership/community" }
      ]},
      { label: "Ressources", path: "/resources", order: 5 },
      { label: "Partenaires", path: "/partners", order: 6 },
      { label: "Contact", path: "/contact", order: 7 },
      { label: "DIRECT", path: "/direct", order: 8 }
    ] as NavItem[]
  });

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLangMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setMembershipMenuOpen(false);
  }, [location]);

  // Build navigation items from database settings
  const navItems = React.useMemo(() => {
    const items = [...(navigationSettings.items || [])];

    // Add DIRECT link if it doesn't exist
    if (!items.find(item => item.path === '/direct')) {
      items.push({
        label: 'DIRECT',
        path: '/direct',
        order: items.length + 1
      });
    }

    // Add LEG link if it doesn't exist
    if (!items.find(item => item.path === '/leg')) {
      items.push({
        label: 'LEG',
        path: '/leg',
        order: items.length + 1
      });
    }

    // Sort by order
    items.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Add admin link if authenticated
    if (isAuthenticated) {
      items.push({
        label: 'Administration',
        path: '/admin',
        order: 999
      });
    }

    return items;
  }, [navigationSettings.items, isAuthenticated]);

  // Get translated label for navigation items
  const getTranslatedLabel = (label: string): string => {
    // Special case for DIRECT and LEG which should always be uppercase
    if (label === 'DIRECT') return 'DIRECT';
    if (label === 'LEG') return 'LEG';

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

  // Handle logo click to always scroll to top and navigate to home
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/');
  };

  // Show loading state or fallback if settings are loading
  if (settingsLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-secondary-900 shadow-md py-2">
        <nav className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="h-12 w-12 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <div className="hidden md:flex space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-secondary-900 shadow-md py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={logoSettings.link || "/"}
            className="flex items-center space-x-2"
            onClick={handleLogoClick}
          >
            {logoSettings.main_logo ? (
              <img
                src={logoSettings.main_logo}
                alt={logoSettings.alt_text || "Logo"}
                className="rounded object-cover cursor-pointer"
                style={{
                  width: logoSettings.width || 48,
                  height: logoSettings.height || 48
                }}
                onError={(e) => {
                  console.error('Logo failed to load:', logoSettings.main_logo);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div
                className="bg-primary-600 rounded flex items-center justify-center cursor-pointer"
                style={{
                  width: logoSettings.width || 48,
                  height: logoSettings.height || 48
                }}
              >
                <span className="text-white font-bold text-xl">FGE</span>
              </div>
            )}
            <span className={`text-xl md:text-2xl font-bold cursor-pointer ${scrolled ? 'text-primary-500' : 'text-white'}`}>
              {navigationSettings.brand_text || "FEGESPORT"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center">
            <div className="flex space-x-6">
              {navItems.map((item) => (
                <div key={item.path} className="relative group">
                  {item.submenu ? (
                    <button
                      onClick={() => setMembershipMenuOpen(!membershipMenuOpen)}
                      className={`
                        px-2 py-1 text-sm font-medium rounded-md transition-colors flex items-center
                        ${location.pathname.startsWith(item.path)
                          ? 'text-primary-500 border-b-2 border-primary-500' 
                          : scrolled 
                            ? 'text-gray-300 hover:text-primary-500' 
                            : 'text-white hover:text-primary-300'
                        }
                      `}
                    >
                      {getTranslatedLabel(item.label)}
                      <ChevronDown size={14} className="ml-1" />
                    </button>
                  ) : item.path === '/direct' ? (
                    <Link
                      to={item.path}
                      className={`
                        px-2 py-1 text-sm font-medium rounded-md transition-colors flex items-center
                        ${location.pathname === item.path 
                          ? 'text-primary-500 border-b-2 border-primary-500' 
                          : scrolled 
                            ? 'text-gray-300 hover:text-primary-500' 
                            : 'text-white hover:text-primary-300'
                        }
                      `}
                    >
                      <Video size={16} className="mr-1" />
                      {getTranslatedLabel(item.label)}
                    </Link>
                  ) : (
                    <Link
                      to={item.path}
                      className={`
                        px-2 py-1 text-sm font-medium rounded-md transition-colors
                        ${location.pathname === item.path 
                          ? 'text-primary-500 border-b-2 border-primary-500' 
                          : scrolled 
                            ? 'text-gray-300 hover:text-primary-500' 
                            : 'text-white hover:text-primary-300'
                        }
                      `}
                    >
                      {getTranslatedLabel(item.label)}
                    </Link>
                  )}
                  {item.submenu && membershipMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 mt-2 w-48 bg-secondary-800 rounded-md shadow-lg py-1 z-50"
                    >
                      {item.submenu.map((subItem: SubNavItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-secondary-700 hover:text-primary-500"
                        >
                          {getTranslatedLabel(subItem.label)}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* Language Selector */}
            <div className="relative ml-6">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  scrolled ? 'text-gray-300 hover:text-primary-500' : 'text-white hover:text-primary-300'
                }`}
              >
                <Globe size={18} className="mr-1" />
                <span className="uppercase mr-1">{i18n.language}</span>
                <ChevronDown size={14} />
              </button>

              {langMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-40 bg-secondary-800 rounded-md shadow-lg py-1 z-50"
                >
                  <button
                    onClick={() => changeLanguage('fr')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-secondary-700 hover:text-primary-500"
                  >
                    Français
                  </button>
                  <button
                    onClick={() => changeLanguage('en')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-secondary-700 hover:text-primary-500"
                  >
                    English
                  </button>
                </motion.div>
              )}
            </div>

            {/* Admin Icon */}
            {isAuthenticated && (
              <Link
                to="/admin"
                className={`ml-4 p-2 rounded-full transition-colors ${
                  scrolled ? 'text-gray-300 hover:text-primary-500' : 'text-white hover:text-primary-300'
                }`}
              >
                <User size={20} />
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md transition-colors ${
                scrolled ? 'text-gray-300 hover:text-primary-500' : 'text-white hover:text-primary-300'
              }`}
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-secondary-900 rounded-b-lg shadow-lg mobile-nav-container"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <div key={item.path}>
                    {item.submenu ? (
                      <>
                        <button
                          onClick={() => setMembershipMenuOpen(!membershipMenuOpen)}
                          className={`
                            w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center justify-between
                            ${location.pathname.startsWith(item.path)
                              ? 'bg-secondary-800 text-primary-500'
                              : 'text-gray-300 hover:bg-secondary-800 hover:text-primary-500'
                            }
                          `}
                        >
                          {getTranslatedLabel(item.label)}
                          <ChevronDown size={14} className={`transform transition-transform ${membershipMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {membershipMenuOpen && (
                          <div className="pl-4 space-y-1">
                            {item.submenu.map((subItem: SubNavItem) => (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                className={`
                                  block px-3 py-2 rounded-md text-sm font-medium
                                  ${location.pathname === subItem.path
                                    ? 'bg-secondary-800 text-primary-500'
                                    : 'text-gray-300 hover:bg-secondary-800 hover:text-primary-500'
                                  }
                                `}
                              >
                                {getTranslatedLabel(subItem.label)}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : item.path === '/direct' ? (
                      <Link
                        to={item.path}
                        className={`
                          block px-3 py-2 rounded-md text-base font-medium flex items-center
                          ${location.pathname === item.path
                            ? 'bg-secondary-800 text-primary-500'
                            : 'text-gray-300 hover:bg-secondary-800 hover:text-primary-500'
                          }
                        `}
                      >
                        <Video size={18} className="mr-2" />
                        {getTranslatedLabel(item.label)}
                      </Link>
                    ) : (
                      <Link
                        to={item.path}
                        className={`
                          block px-3 py-2 rounded-md text-base font-medium
                          ${location.pathname === item.path
                            ? 'bg-secondary-800 text-primary-500'
                            : 'text-gray-300 hover:bg-secondary-800 hover:text-primary-500'
                          }
                        `}
                      >
                        {getTranslatedLabel(item.label)}
                      </Link>
                    )}
                  </div>
                ))}
                
                {/* Mobile Language Selector */}
                <div className="pt-2 pb-1">
                  <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {i18n.language === 'fr' ? 'Langue' : 'Language'}
                  </p>
                  <button
                    onClick={() => changeLanguage('fr')}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      i18n.language === 'fr' 
                        ? 'bg-secondary-800 text-primary-500' 
                        : 'text-gray-300 hover:bg-secondary-800'
                    }`}
                  >
                    Français
                  </button>
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      i18n.language === 'en' 
                        ? 'bg-secondary-800 text-primary-500' 
                        : 'text-gray-300 hover:bg-secondary-800'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar;