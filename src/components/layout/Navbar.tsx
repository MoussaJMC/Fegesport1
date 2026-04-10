import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, ChevronDown, User, Video, Shield } from 'lucide-react';
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
  enabled?: boolean;
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

  const logoSettings = getSetting('site_logo', {
    main_logo: "https://geozovninpeqsgtzwchu.supabase.co/storage/v1/object/public/static-files/uploads/d5b2ehmnrec.jpg",
    alt_text: "FEGESPORT Logo",
    width: 44,
    height: 44,
    link: "/"
  });

  const navigationSettings = getSetting('main_navigation', {
    brand_text: "FEGESPORT",
    items: [
      { label: "Accueil", path: "/", order: 1 },
      { label: "A propos", path: "/about", order: 2 },
      { label: "Actualites", path: "/news", order: 3 },
      { label: "Adhesion", path: "/membership", order: 4, submenu: [
        { label: "Adhesion", path: "/membership" },
        { label: "Communaute", path: "/membership/community" }
      ]},
      { label: "eLeague", path: "/leg", order: 4.5 },
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
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setMembershipMenuOpen(false);
    setLangMenuOpen(false);
  }, [location]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = () => {
      setLangMenuOpen(false);
      setMembershipMenuOpen(false);
    };
    if (langMenuOpen || membershipMenuOpen) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [langMenuOpen, membershipMenuOpen]);

  const navItems = React.useMemo(() => {
    const items = [...(navigationSettings.items || [])];

    if (!items.find(item => item.path === '/direct')) {
      items.push({ label: 'DIRECT', path: '/direct', order: items.length + 1 });
    }
    if (!items.find(item => item.path === '/leg')) {
      items.push({ label: 'eLeague', path: '/leg', order: items.length + 1 });
    }

    const enabledItems = items.filter(item => item.enabled !== false);
    enabledItems.sort((a, b) => (a.order || 0) - (b.order || 0));

    return enabledItems;
  }, [navigationSettings.items]);

  const getTranslatedLabel = (label: string): string => {
    if (label === 'DIRECT') return 'DIRECT';
    if (label === 'LEG') return 'LEG';
    if (label === 'eLeague') return 'eLeague';

    const key = label.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '');

    const translationKey = `navigation.${key}`;
    return i18n.exists(translationKey) ? t(translationKey) : label;
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/');
  };

  const isActive = (path: string): boolean => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Separate DIRECT from main nav items
  const mainNavItems = navItems.filter(item => item.path !== '/direct');
  const directItem = navItems.find(item => item.path === '/direct');

  // Loading skeleton
  if (settingsLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark-950 py-3">
        <nav className="container-custom">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-dark-800 rounded-lg animate-pulse" />
              <div className="h-5 w-28 bg-dark-800 rounded animate-pulse" />
            </div>
            <div className="hidden md:flex space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 w-16 bg-dark-800 rounded animate-pulse" />
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
          ? 'bg-dark-950/95 backdrop-blur-xl border-b border-dark-700/50 py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <nav className="container-custom">
        <div className="flex items-center justify-between h-14">
          {/* ============ LOGO ============ */}
          <Link
            to={logoSettings.link || "/"}
            className="flex items-center gap-3 group"
            onClick={handleLogoClick}
          >
            {logoSettings.main_logo ? (
              <img
                src={logoSettings.main_logo}
                alt={logoSettings.alt_text || "Logo"}
                className={`rounded-lg object-cover transition-all duration-300 ${
                  scrolled ? 'w-9 h-9' : 'w-10 h-10'
                } border border-fed-gold-500/30 group-hover:border-fed-gold-500/60`}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className={`bg-fed-red-500 rounded-lg flex items-center justify-center ${
                scrolled ? 'w-9 h-9' : 'w-10 h-10'
              }`}>
                <span className="text-white font-bold text-sm font-heading">FGE</span>
              </div>
            )}
            <span className={`font-bold font-heading tracking-tight transition-all duration-300 ${
              scrolled ? 'text-lg text-fed-gold-500' : 'text-xl text-white'
            }`}>
              {navigationSettings.brand_text || "FEGESPORT"}
            </span>
          </Link>

          {/* ============ DESKTOP NAVIGATION ============ */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            {/* Main Nav Links */}
            {mainNavItems.map((item) => (
              <div key={item.path} className="relative" onClick={(e) => e.stopPropagation()}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => setMembershipMenuOpen(!membershipMenuOpen)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1 ${
                        isActive(item.path)
                          ? 'text-fed-red-500'
                          : 'text-light-300 hover:text-white hover:bg-dark-800/50'
                      }`}
                    >
                      {getTranslatedLabel(item.label)}
                      <ChevronDown size={13} className={`transition-transform duration-200 ${membershipMenuOpen ? 'rotate-180' : ''}`} />
                      {isActive(item.path) && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-fed-red-500 rounded-full" />
                      )}
                    </button>
                    <AnimatePresence>
                      {membershipMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 mt-1 w-52 bg-dark-800 border border-dark-700 rounded-xl shadow-xl shadow-dark-950/50 py-1.5 z-50 overflow-hidden"
                        >
                          {item.submenu.map((subItem: SubNavItem) => (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              className={`block px-4 py-2.5 text-sm transition-colors ${
                                location.pathname === subItem.path
                                  ? 'text-fed-red-500 bg-fed-red-500/5'
                                  : 'text-light-300 hover:text-white hover:bg-dark-700'
                              }`}
                            >
                              {getTranslatedLabel(subItem.label)}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'text-fed-red-500'
                        : 'text-light-300 hover:text-white hover:bg-dark-800/50'
                    }`}
                  >
                    {getTranslatedLabel(item.label)}
                    {isActive(item.path) && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-fed-red-500 rounded-full" />
                    )}
                  </Link>
                )}
              </div>
            ))}

            {/* Separator */}
            <div className="w-px h-5 bg-dark-700 mx-1" />

            {/* DIRECT Badge */}
            {directItem && (
              <Link
                to="/direct"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 ${
                  isActive('/direct')
                    ? 'bg-fed-red-500 text-white'
                    : 'bg-fed-red-500/15 text-fed-red-400 hover:bg-fed-red-500/25'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fed-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-fed-red-500" />
                </span>
                DIRECT
              </Link>
            )}

            {/* Language Selector */}
            <div className="relative ml-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium rounded-full bg-dark-800/50 border border-dark-700/50 text-light-300 hover:text-white hover:border-dark-700 transition-all"
              >
                <Globe size={14} />
                <span className="uppercase text-xs">{i18n.language}</span>
              </button>

              <AnimatePresence>
                {langMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-1 w-36 bg-dark-800 border border-dark-700 rounded-xl shadow-xl shadow-dark-950/50 py-1.5 z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => changeLanguage('fr')}
                      className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        i18n.language === 'fr' ? 'text-fed-gold-500 bg-fed-gold-500/5' : 'text-light-300 hover:text-white hover:bg-dark-700'
                      }`}
                    >
                      Francais
                    </button>
                    <button
                      onClick={() => changeLanguage('en')}
                      className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        i18n.language === 'en' ? 'text-fed-gold-500 bg-fed-gold-500/5' : 'text-light-300 hover:text-white hover:bg-dark-700'
                      }`}
                    >
                      English
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Admin Icon */}
            {isAuthenticated && (
              <Link
                to="/admin"
                className="ml-1 p-2 rounded-lg text-light-400 hover:text-fed-gold-500 hover:bg-dark-800/50 transition-all"
                title="Administration"
              >
                <Shield size={18} />
              </Link>
            )}
          </div>

          {/* ============ MOBILE MENU BUTTON ============ */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Mobile DIRECT badge */}
            {directItem && (
              <Link
                to="/direct"
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-fed-red-500/15 text-fed-red-400"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fed-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-fed-red-500" />
                </span>
                LIVE
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-light-300 hover:text-white hover:bg-dark-800/50 transition-colors"
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ============ MOBILE NAVIGATION ============ */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden mt-2 bg-dark-950 border border-dark-700 rounded-2xl shadow-2xl shadow-dark-950/50 mobile-nav-container overflow-hidden"
            >
              <div className="px-3 py-4 space-y-1">
                {navItems.map((item) => (
                  <div key={item.path}>
                    {item.submenu ? (
                      <>
                        <button
                          onClick={() => setMembershipMenuOpen(!membershipMenuOpen)}
                          className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium flex items-center justify-between transition-colors ${
                            isActive(item.path)
                              ? 'bg-fed-red-500/10 text-fed-red-500'
                              : 'text-light-300 hover:bg-dark-800 hover:text-white'
                          }`}
                        >
                          {getTranslatedLabel(item.label)}
                          <ChevronDown size={14} className={`transition-transform duration-200 ${membershipMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {membershipMenuOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 space-y-0.5 py-1">
                                {item.submenu.map((subItem: SubNavItem) => (
                                  <Link
                                    key={subItem.path}
                                    to={subItem.path}
                                    className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                      location.pathname === subItem.path
                                        ? 'bg-fed-red-500/10 text-fed-red-500'
                                        : 'text-light-400 hover:bg-dark-800 hover:text-white'
                                    }`}
                                  >
                                    {getTranslatedLabel(subItem.label)}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : item.path === '/direct' ? (
                      <Link
                        to={item.path}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                          isActive(item.path)
                            ? 'bg-fed-red-500 text-white'
                            : 'bg-fed-red-500/10 text-fed-red-400 hover:bg-fed-red-500/20'
                        }`}
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fed-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-fed-red-500" />
                        </span>
                        {getTranslatedLabel(item.label)}
                      </Link>
                    ) : (
                      <Link
                        to={item.path}
                        className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                          isActive(item.path)
                            ? 'bg-fed-red-500/10 text-fed-red-500'
                            : 'text-light-300 hover:bg-dark-800 hover:text-white'
                        }`}
                      >
                        {getTranslatedLabel(item.label)}
                      </Link>
                    )}
                  </div>
                ))}

                {/* Admin link mobile */}
                {isAuthenticated && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-fed-gold-500 hover:bg-dark-800 transition-colors"
                  >
                    <Shield size={18} />
                    Administration
                  </Link>
                )}

                {/* Divider */}
                <div className="divider-full my-3" />

                {/* Mobile Language Selector */}
                <div className="flex items-center gap-2 px-3">
                  <Globe size={14} className="text-light-400" />
                  <span className="text-xs text-light-400 uppercase tracking-wider font-semibold">
                    {i18n.language === 'fr' ? 'Langue' : 'Language'}
                  </span>
                </div>
                <div className="flex gap-2 px-3">
                  <button
                    onClick={() => changeLanguage('fr')}
                    className={`flex-1 text-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      i18n.language === 'fr'
                        ? 'bg-fed-gold-500/10 text-fed-gold-500 border border-fed-gold-500/20'
                        : 'bg-dark-800 text-light-400 hover:text-white'
                    }`}
                  >
                    Francais
                  </button>
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`flex-1 text-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      i18n.language === 'en'
                        ? 'bg-fed-gold-500/10 text-fed-gold-500 border border-fed-gold-500/20'
                        : 'bg-dark-800 text-light-400 hover:text-white'
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
