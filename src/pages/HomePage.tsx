import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Trophy, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { fetchCommunityStats, subscribeToCommunityStats } from '../lib/communityStats';

// Components
import NewsCard from '../components/news/NewsCard';
import EventCard from '../components/events/EventCard';
import NewsletterSection from '../components/newsletter/NewsletterSection';
import CardGrid from '../components/cards/CardGrid';
import Slideshow from '../components/slideshow/Slideshow';

// Data (fallback)
import { latestNews } from '../data/newsData';
import { upcomingEvents } from '../data/eventsData';
import { useSiteSettings } from '../hooks/useSiteSettings';

const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { getSetting, loading: settingsLoading } = useSiteSettings();
  const [news, setNews] = useState(latestNews);
  const [events, setEvents] = useState(upcomingEvents);
  const [pageSections, setPageSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    players: 0,
    clubs: 0,
    partners: 0
  });

  const defaultLogoSettings = {
    main_logo: "https://geozovninpeqsgtzwchu.supabase.co/storage/v1/object/public/static-files/uploads/d5b2ehmnrec.jpg",
    alt_text: "FEGESPORT Logo",
    width: 48,
    height: 48,
    link: "/"
  };

  const logoSettings = getSetting('site_logo', defaultLogoSettings);

  useEffect(() => {
    let isMounted = true;
    let channel: any = null;

    const initializeData = async () => {
      if (!isMounted) return;

      setLoading(true);
      setError(null);

      try {
        await Promise.allSettled([
          fetchPageData(),
          fetchLatestNews(),
          fetchUpcomingEvents(),
          fetchStats()
        ]);
      } catch (err) {
        console.error('Error initializing data:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeData();

    try {
      channel = subscribeToCommunityStats(() => {
        if (isMounted) {
          console.log('Community stats changed, refreshing...');
          fetchStats();
        }
      });
    } catch (err) {
      console.error('Error subscribing to community stats:', err);
    }

    return () => {
      isMounted = false;
      if (channel) {
        try {
          channel.unsubscribe();
        } catch (err) {
          console.error('Error unsubscribing:', err);
        }
      }
    };
  }, []);

  const fetchPageData = async () => {
    try {
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', 'home')
        .maybeSingle();

      if (pageError) {
        console.error('Error fetching home page:', pageError);
        return;
      }

      if (pageData) {
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
          tags: [],
          translations: item.translations
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

  const fetchStats = async () => {
    try {
      console.log('Fetching community stats...');
      const communityStats = await fetchCommunityStats();
      console.log('Community stats received:', communityStats);
      setStats(communityStats);
    } catch (error) {
      console.error('Error fetching community stats:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { 
      day: 'numeric', 
      month: i18n.language === 'fr' ? 'long' : 'short', 
      year: 'numeric' 
    });
  };

  // Find specific sections by key
  const getSection = (key: string) => {
    return pageSections.find(section => section.section_key === key);
  };

  const heroSection = getSection('hero');
  const aboutSection = getSection('about');
  const statsSection = getSection('stats');

  // Simple loading state for mobile
  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-900 px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-base">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-secondary-900 py-20 md:py-32 min-h-[80vh] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url("${heroSection?.image_url || "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg"}")`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary-900/90 via-secondary-900/95 to-secondary-900"></div>
        <div className="container-custom relative z-10 text-center px-4">
          <div className="mb-8">
            {logoSettings.main_logo ? (
              <img
                src={logoSettings.main_logo}
                alt={logoSettings.alt_text || "FEGESPORT Logo"}
                className="w-20 h-20 sm:w-28 sm:h-28 mx-auto rounded-full border-4 border-primary-500 shadow-lg mb-6 object-cover"
                onError={(e) => {
                  console.error('Hero logo failed to load:', logoSettings.main_logo);
                  e.currentTarget.style.display = 'none';
                }}
                loading="eager"
              />
            ) : (
              <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto rounded-full border-4 border-primary-500 shadow-lg mb-6 bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-2xl sm:text-3xl">FGE</span>
              </div>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">
            {t('home.hero.title')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-8 max-w-3xl mx-auto text-gray-300">
            {t('home.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/membership"
              className="btn bg-primary-600 hover:bg-primary-700 text-white text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 rounded-full"
            >
              {t('home.hero.cta')}
            </Link>
            <Link
              to="/about"
              className="btn bg-secondary-800 hover:bg-secondary-700 text-white text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 rounded-full"
            >
              {t('common.learnMore')}
            </Link>
          </div>
        </div>
      </section>

      {/* Slideshow Section */}
      <section className="section bg-secondary-800">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">NOS MEILLEURS MOMENTS</h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto"></div>
          </div>
          
          <Slideshow 
            autoplay={true} 
            interval={5000} 
            showArrows={true} 
            showDots={true}
            height="h-[500px]"
            className="mb-8"
          />
          
          <div className="text-center">
            <Link to="/direct" className="inline-flex items-center text-primary-500 hover:text-primary-400 font-medium">
              Regarder nos streams en direct <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section bg-secondary-900 text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('home.about.title')}</h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
            <p className="text-lg max-w-3xl mx-auto text-gray-300">{t('home.about.description')}</p>
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
              <h3 className="text-xl font-bold mb-3">{t('about.values.excellence')}</h3>
              <p className="text-gray-400">{t('about.values.excellence_desc')}</p>
            </motion.div>

            <motion.div 
              className="bg-secondary-800 p-6 rounded-lg text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-primary-600/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="text-primary-500" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('about.values.inclusivity')}</h3>
              <p className="text-gray-400">{t('about.values.inclusivity_desc')}</p>
            </motion.div>

            <motion.div 
              className="bg-secondary-800 p-6 rounded-lg text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-primary-600/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-primary-500" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('about.values.innovation')}</h3>
              <p className="text-gray-400">{t('about.values.innovation_desc')}</p>
            </motion.div>
          </div>

          <div className="text-center mt-10">
            <Link to="/about" className="inline-flex items-center text-primary-500 hover:text-primary-400 font-medium">
              {t('common.learnMore')} <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="section bg-secondary-800">
        <div className="container-custom">
          <CardGrid 
            title="ACTUALITÉS ET ÉVÉNEMENTS" 
            showViewAll={true} 
            viewAllLink="/news" 
            limit={6}
          />
        </div>
      </section>

      {/* Latest News Section */}
      <section className="section bg-secondary-800">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 sm:mb-0">{t('home.news.title')}</h2>
            <Link to="/news" className="text-primary-500 hover:text-primary-400 font-medium flex items-center">
              {t('home.news.viewAll')} <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          {news && news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.slice(0, 3).map((newsItem) => (
                <NewsCard key={newsItem.id} news={newsItem} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <p>Aucune actualité disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="section bg-secondary-900">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 sm:mb-0">{t('home.events.title')}</h2>
            <Link to="/events" className="text-primary-500 hover:text-primary-400 font-medium flex items-center">
              {t('home.events.viewAll')} <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {events.slice(0, 4).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <p>Aucun événement à venir pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="section bg-secondary-800">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">{t('home.stats.title')}</h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-secondary-700 p-6 rounded-lg text-center"
            >
              <div className="text-4xl font-bold text-primary-500 mb-2">{stats.players}+</div>
              <div className="text-lg text-white">{t('home.stats.players')}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-secondary-700 p-6 rounded-lg text-center"
            >
              <div className="text-4xl font-bold text-primary-500 mb-2">{stats.clubs}</div>
              <div className="text-lg text-white">{t('home.stats.clubs')}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-secondary-700 p-6 rounded-lg text-center"
            >
              <div className="text-4xl font-bold text-primary-500 mb-2">{stats.partners}</div>
              <div className="text-lg text-white">{t('home.stats.partners')}</div>
            </motion.div>
          </div>
        </div>
      </section>

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
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{t('home.join.title')}</h2>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 text-gray-300">{t('home.join.description')}</p>
          <Link to="/membership" className="btn bg-primary-600 hover:bg-primary-700 text-white text-lg px-8 py-3 rounded-full">
            {t('home.join.cta')}
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePage;