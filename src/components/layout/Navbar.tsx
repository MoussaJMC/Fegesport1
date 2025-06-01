import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, ChevronDown, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [membershipMenuOpen, setMembershipMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

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

  const navItems = [
    { name: t('navigation.home'), path: '/' },
    { name: t('navigation.about'), path: '/about' },
    { name: t('navigation.news'), path: '/news' },
    {
      name: t('navigation.membership'),
      path: '/membership',
      submenu: [
        { name: 'Adhésion', path: '/membership' },
        { name: 'Communauté', path: '/membership/community' },
      ]
    },
    { name: t('navigation.resources'), path: '/resources' },
    { name: t('navigation.partners'), path: '/partners' },
    { name: t('navigation.contact'), path: '/contact' },
  ];

  if (isAuthenticated) {
    navItems.push({ name: 'Administration', path: '/admin' });
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
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="https://images.pexels.com/photos/7915559/pexels-photo-7915559.jpeg"
              alt="FEGESPORT Logo"
              className="h-12 w-12 rounded"
            />
            <span className={`text-2xl font-bold ${scrolled ? 'text-primary-500' : 'text-white'}`}>
              FEGESPORT
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
                      {item.name}
                      <ChevronDown size={14} className="ml-1" />
                    </button>
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
                      {item.name}
                    </Link>
                  )}
                  {item.submenu && membershipMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 mt-2 w-48 bg-secondary-800 rounded-md shadow-lg py-1 z-50"
                    >
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-secondary-700 hover:text-primary-500"
                        >
                          {subItem.name}
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
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-secondary-900 rounded-b-lg shadow-lg"
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
                        {item.name}
                        <ChevronDown size={14} className={`transform transition-transform ${membershipMenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {membershipMenuOpen && (
                        <div className="pl-4 space-y-1">
                          {item.submenu.map((subItem) => (
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
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
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
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              
              {/* Mobile Language Selector */}
              <div className="pt-2 pb-1">
                <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Language
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
      </nav>
    </header>
  );
};

export default Navbar;