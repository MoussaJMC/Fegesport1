import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Trophy, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Components
import NewsCard from '../components/news/NewsCard';
import EventCard from '../components/events/EventCard';
import NewsletterSection from '../components/newsletter/NewsletterSection';

// Data (fallback)
import { latestNews } from '../data/newsData';
import { upcomingEvents } from '../data/eventsData';
import { useSiteSettings } from '../hooks/useSiteSettings';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { getSetting } = useSiteSettings();
  const [news, setNews] = useState(latestNews);
  const [events, setEvents] = useState(upcomingEvents);
  const [pageSections, setPageSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get settings from database
  const logoSettings = getSetting('site_logo', {
    main_logo: "https://images.pexels.com/photos/7915559/pexels-photo-7915559.jpeg",
    alt_text: "FEGESPORT Logo",
    width: 48,
    height: 48,
    link: "/"
  });

  useEffect(() => {
    fetchPageData();
    fetchLatestNews();
    fetchUpcomingEvents();
  }, []);

  const fetchPageData = async () => {
    try {
      // First, get the home page ID
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', 'home')
        .single();

      if (pageError) {
        console.error('Error fetching home page:', pageError);
        return;
      }

      if (pageData) {
        // Then fetch the page sections
        const { data: sections, error: sectionsError } = await supabase
          .from('page_sections')
          .select('*')
          .eq('page_id', pageData.id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (sectionsError) {
          console.error('Error fetching page sections:', sectionsError);
          return;
        }

        setPageSections(sections || []);
      }
    } catch (error) {
      console.error('Error in fetchPageData:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching news:', error);
        return;
      }

      if (data && data.length > 0) {
        // Map database fields to NewsItem format
        const mappedNews = data.map(item => ({
          id: item.id,
          title: item.title,
          excerpt: item.excerpt || '',
          content: item.content || '',
          date: new Date(item.created_at).toISOString().split('T')[0],
          image: item.image_url || 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
          category: item.category,
          author: {
            name: 'FEGESPORT',
          },
          tags: []
        }));
        setNews(mappedNews);
      }
    } catch (error) {
      console.error('Error in fetchLatestNews:', error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .order('date', { ascending: true })
        .limit(4);

      if (error) {
        console.error('Error fetching events:', error);
        return;
      }

      if (data && data.length > 0) {
        // Map database fields to EventItem format
        const mappedEvents = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          date: item.date,
          formattedDate: formatDate(item.date),
          time: item.time,
          location: item.location,
          image: item.image_url || 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
          category: item.category,
          type: item.type,
          maxParticipants: item.max_participants,
          currentParticipants: item.current_participants
        }));
        setEvents(mappedEvents);
      }
    } catch (error) {
      console.error('Error in fetchUpcomingEvents:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Find specific sections by key
  const getSection = (key: string) => {
    return pageSections.find(section => section.section_key === key);
  };

  const heroSection = getSection('hero');
  const aboutSection = getSection('about');
  const statsSection = getSection('stats');

  return (
    <>
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-secondary-900"
        style={{
          backgroundImage: `url("${heroSection?.image_url || "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg"}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900 via-secondary-900/90 to-secondary-900/80"></div>
        <div className="container-custom relative z-10 text-center pt-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <img 
              src={logoSettings.main_logo}
              alt={logoSettings.alt_text || "FEGESPORT Logo"}
              className="w-32 h-32 mx-auto rounded-full border-4 border-primary-500 shadow-lg mb-6"
            />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-4 text-white"
          >
            {heroSection?.title || t('home.hero.title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-300"
          >
            {heroSection?.content || t('home.hero.subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              to="/membership" 
              className="btn bg-primary-600 hover:bg-primary-700 text-white text-lg px-8 py-4 rounded-full"
            >
              {heroSection?.settings?.cta_text || t('home.hero.cta')}
            </Link>
            <Link 
              to="/about" 
              className="btn bg-secondary-800 hover:bg-secondary-700 text-white text-lg px-8 py-4 rounded-full"
            >
              En savoir plus
            </Link>
          </motion.div>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-white">
          <ChevronRight size={32} className="transform rotate-90" />
        </div>
      </section>

      {/* About Section */}
      <section className="section bg-secondary-900 text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{aboutSection?.title || "À PROPOS DE LA FEGESPORT"}</h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
            <p className="text-lg max-w-3xl mx-auto text-gray-300">
              {aboutSection?.content || "La Fédération Guinéenne d'Esport (FEGESPORT) est l'organisation nationale officielle pour l'esport en Guinée. Notre mission est de promouvoir, structurer et représenter l'esport guinéen au niveau national et international."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <motion.div 
              className="bg-secondary-800 p-6 rounded-lg text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-primary-600/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-primary-500" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Excellence</h3>
              <p className="text-gray-400">Promouvoir l'excellence et les standards professionnels dans toutes les compétitions d'esport.</p>
            </motion.div>

            <motion.div 
              className="bg-secondary-800 p-6 rounded-lg text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-primary-600/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="text-primary-500" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Communauté</h3>
              <p className="text-gray-400">Bâtir une communauté esport inclusive, diverse et respectueuse en Guinée.</p>
            </motion.div>

            <motion.div 
              className="bg-secondary-800 p-6 rounded-lg text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-primary-600/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-primary-500" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Développement</h3>
              <p className="text-gray-400">Investir dans le développement de l'écosystème esport guinéen à tous les niveaux.</p>
            </motion.div>
          </div>

          <div className="text-center mt-10">
            <Link to="/about" className="inline-flex items-center text-primary-500 hover:text-primary-400 font-medium">
              En savoir plus <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="section bg-secondary-800">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">{t('home.news.title')}</h2>
            <Link to="/news" className="text-primary-500 hover:text-primary-400 font-medium flex items-center">
              {t('home.news.viewAll')} <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.slice(0, 3).map((newsItem) => (
              <NewsCard key={newsItem.id} news={newsItem} />
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="section bg-secondary-900">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">{t('home.events.title')}</h2>
            <Link to="/events" className="text-primary-500 hover:text-primary-400 font-medium flex items-center">
              {t('home.events.viewAll')} <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.slice(0, 4).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {statsSection && (
        <section className="section bg-secondary-800">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-white">{statsSection.title || "Nos Chiffres"}</h2>
              <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
              {statsSection.content && (
                <p className="text-lg max-w-3xl mx-auto text-gray-300">{statsSection.content}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {statsSection.settings?.stats?.map((stat: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-secondary-700 p-6 rounded-lg text-center"
                >
                  <div className="text-4xl font-bold text-primary-500 mb-2">{stat.value}</div>
                  <div className="text-lg text-white">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Join Section */}
      <section 
        className="section relative bg-secondary-900 text-white"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900 via-secondary-900/90 to-secondary-900/80"></div>
        <div className="container-custom relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('home.join.title')}</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 text-gray-300">{t('home.join.description')}</p>
          <Link to="/membership" className="btn bg-primary-600 hover:bg-primary-700 text-white text-lg px-8 py-3 rounded-full">
            {t('home.join.cta')}
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePage;