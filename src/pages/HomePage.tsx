import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Trophy, Users, ChevronRight, Gamepad2, Award, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { fetchCommunityStats, subscribeToCommunityStats } from '../lib/communityStats';

// Components
import NewsCard from '../components/news/NewsCard';
import EventCard from '../components/events/EventCard';
import NewsletterSection from '../components/newsletter/NewsletterSection';
import CardGrid from '../components/cards/CardGrid';
import Slideshow from '../components/slideshow/Slideshow';
import SectionHeader from '../components/ui/SectionHeader';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import GovernanceSection from '../components/home/GovernanceSection';
import InternationalSection from '../components/home/InternationalSection';
import PartnersShowcase from '../components/home/PartnersShowcase';

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

  const lang = i18n.language === 'fr' ? 'fr' : 'en';

  const defaultLogoSettings = {
    main_logo: "https://geozovninpeqsgtzwchu.supabase.co/storage/v1/object/public/static-files/uploads/d5b2ehmnrec.jpg",
    alt_text: "FEGESPORT Logo",
    width: 48,
    height: 48,
    link: "/"
  };

  const logoSettings = getSetting('site_logo', defaultLogoSettings);

  // === DATA FETCHING (preserved from original) ===
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
        if (isMounted) setLoading(false);
      }
    };

    initializeData();

    try {
      channel = subscribeToCommunityStats(() => {
        if (isMounted) fetchStats();
      });
    } catch (err) {
      console.error('Error subscribing to community stats:', err);
    }

    return () => {
      isMounted = false;
      if (channel) {
        try { channel.unsubscribe(); } catch (err) { /* silent */ }
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

      if (pageError) { console.error('Error fetching home page:', pageError); return; }

      if (pageData) {
        const { data: sections, error: sectionsError } = await supabase
          .from('page_sections')
          .select('*')
          .eq('page_id', pageData.id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (sectionsError) { console.error('Error fetching page sections:', sectionsError); return; }
        setPageSections(sections || []);
      }
    } catch (error) { console.error('Error in fetchPageData:', error); }
  };

  const fetchLatestNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) { console.error('Error fetching news:', error); return; }

      if (data && data.length > 0) {
        const mappedNews = data.map(item => ({
          id: item.id,
          title: item.title,
          excerpt: item.excerpt || '',
          content: item.content || '',
          date: new Date(item.created_at).toISOString().split('T')[0],
          image: item.image_url || 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
          category: item.category,
          author: { name: 'FEGESPORT' },
          tags: [],
          translations: item.translations
        }));
        setNews(mappedNews);
      }
    } catch (error) { console.error('Error in fetchLatestNews:', error); }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', today)
        .not('status', 'eq', 'completed')
        .not('status', 'eq', 'cancelled')
        .order('date', { ascending: true })
        .limit(4);

      if (error) { console.error('Error fetching events:', error); setEvents([]); return; }

      if (data && data.length > 0) {
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
      } else {
        setEvents([]);
      }
    } catch (error) { console.error('Error in fetchUpcomingEvents:', error); setEvents([]); }
  };

  const fetchStats = async () => {
    try {
      const communityStats = await fetchCommunityStats();
      setStats(communityStats);
    } catch (error) { console.error('Error fetching community stats:', error); }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: lang === 'fr' ? 'long' : 'short',
      year: 'numeric'
    });
  };

  const getSection = (key: string) => pageSections.find(section => section.section_key === key);
  const heroSection = getSection('hero');

  // === LOADING STATE ===
  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-fed-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-light-300 text-base">
            {lang === 'fr' ? 'Chargement...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // === RENDER ===
  return (
    <>
      {/* ============================================================
          SECTION 1 — HERO INSTITUTIONNEL
          Objective: First impression of national authority
          ============================================================ */}
      <section className="relative bg-dark-950 min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{
            backgroundImage: `url("${heroSection?.image_url || "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg"}")`,
          }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-950/80 via-dark-950/90 to-dark-950" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark-950 to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-fed-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-fed-gold-500/5 rounded-full blur-3xl" />

        <div className="container-custom relative z-10 text-center px-4 py-20 md:py-32">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            {logoSettings.main_logo ? (
              <img
                src={logoSettings.main_logo}
                alt={logoSettings.alt_text || "FEGESPORT Logo"}
                className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full border-4 border-fed-gold-500/60 shadow-2xl shadow-fed-gold-500/10 mb-6 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                loading="eager"
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full border-4 border-fed-gold-500/60 shadow-2xl mb-6 bg-dark-800 flex items-center justify-center">
                <span className="text-fed-gold-500 font-bold text-2xl sm:text-3xl font-heading">FGE</span>
              </div>
            )}
          </motion.div>

          {/* Overline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="overline block mb-4">
              {lang === 'fr' ? 'FEDERATION GUINEENNE D\'ESPORT' : 'GUINEAN ESPORTS FEDERATION'}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-hero font-heading text-white mb-6"
          >
            {t('home.hero.title')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-lg md:text-xl mb-10 max-w-3xl mx-auto text-light-300"
          >
            {t('home.hero.subtitle')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/membership" className="btn btn-primary text-lg px-8 py-4 shadow-lg shadow-fed-red-500/20">
              {t('home.hero.cta')}
            </Link>
            <Link to="/about" className="btn btn-secondary text-lg px-8 py-4">
              {t('common.learnMore')}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2 — SLIDESHOW MOMENTS
          Objective: Visual proof of activity
          ============================================================ */}
      <section className="section bg-section-alt">
        <div className="container-custom">
          <SectionHeader
            overline={lang === 'fr' ? 'NOS ACTIVITES' : 'OUR ACTIVITIES'}
            title={lang === 'fr' ? 'Moments Forts' : 'Highlights'}
            dividerColor="red"
          />

          <Slideshow
            autoplay={true}
            interval={5000}
            showArrows={true}
            showDots={true}
            height="h-[500px]"
            className="mb-8 rounded-xl overflow-hidden"
          />

          <div className="text-center">
            <Link to="/direct" className="inline-flex items-center text-fed-red-500 hover:text-fed-red-400 font-medium transition-colors">
              {lang === 'fr' ? 'Regarder nos streams en direct' : 'Watch our live streams'}
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3 — MISSION & VALEURS
          Objective: Who we are
          ============================================================ */}
      <section className="section bg-section-dark">
        <div className="container-custom">
          <SectionHeader
            overline={lang === 'fr' ? 'NOTRE MISSION' : 'OUR MISSION'}
            title={t('home.about.title')}
            description={t('home.about.description')}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: <Trophy size={28} />,
                title: t('about.values.excellence'),
                description: t('about.values.excellence_desc'),
              },
              {
                icon: <Users size={28} />,
                title: t('about.values.inclusivity'),
                description: t('about.values.inclusivity_desc'),
              },
              {
                icon: <Target size={28} />,
                title: t('about.values.innovation'),
                description: t('about.values.innovation_desc'),
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-6 md:p-8 text-center group hover:border-fed-gold-500/30"
              >
                <div className="w-16 h-16 rounded-xl bg-fed-red-500/10 border border-fed-red-500/20 flex items-center justify-center mx-auto mb-5 text-fed-red-500 group-hover:bg-fed-red-500/20 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white font-heading">{item.title}</h3>
                <p className="text-light-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/about" className="inline-flex items-center text-fed-gold-500 hover:text-fed-gold-400 font-medium transition-colors">
              {t('common.learnMore')} <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 4 — GOUVERNANCE
          Objective: Who leads the federation
          ============================================================ */}
      <GovernanceSection />

      {/* ============================================================
          SECTION 5 — CHIFFRES CLES (Ecosysteme national)
          Objective: Prove national structure
          ============================================================ */}
      <section className="section bg-section-dark relative overflow-hidden">
        {/* Top gold line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fed-gold-500/40 to-transparent" />

        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-fed-red-900/5 via-transparent to-fed-gold-700/5" />

        <div className="container-custom relative z-10">
          <SectionHeader
            overline={lang === 'fr' ? 'L\'ESPORT EN GUINEE' : 'ESPORTS IN GUINEA'}
            title={lang === 'fr' ? 'Notre Ecosysteme' : 'Our Ecosystem'}
            description={
              lang === 'fr'
                ? 'Un ecosysteme esport national en pleine croissance, structure autour de clubs, joueurs et competitions.'
                : 'A growing national esports ecosystem, structured around clubs, players and competitions.'
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <AnimatedCounter
              end={stats.players}
              suffix="+"
              label={t('home.stats.players')}
              icon={<Gamepad2 size={24} />}
            />
            <AnimatedCounter
              end={stats.clubs}
              label={t('home.stats.clubs')}
              icon={<Award size={24} />}
            />
            <AnimatedCounter
              end={stats.partners}
              suffix="+"
              label={t('home.stats.partners')}
              icon={<Users size={24} />}
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 6 — ACTUALITES
          Objective: Recent activity proof
          ============================================================ */}
      <section className="section bg-section-alt">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
            <div>
              <span className="overline block">{lang === 'fr' ? 'ACTUALITES' : 'NEWS'}</span>
              <h2 className="section-title mb-0">{t('home.news.title')}</h2>
            </div>
            <Link to="/news" className="text-fed-gold-500 hover:text-fed-gold-400 font-medium flex items-center mt-4 sm:mt-0 transition-colors">
              {t('home.news.viewAll')} <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          {news && news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {news.slice(0, 3).map((newsItem) => (
                <NewsCard key={newsItem.id} news={newsItem} />
              ))}
            </div>
          ) : (
            <div className="text-center text-light-400 py-12 card p-8">
              <p>{lang === 'fr' ? 'Aucune actualite disponible pour le moment.' : 'No news available at this time.'}</p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          SECTION 7 — EVENEMENTS A VENIR
          Objective: Active calendar
          ============================================================ */}
      <section className="section bg-section-dark">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12">
            <div>
              <span className="overline block">{lang === 'fr' ? 'CALENDRIER' : 'CALENDAR'}</span>
              <h2 className="section-title mb-0">{t('home.events.title')}</h2>
            </div>
            <Link to="/events" className="text-fed-gold-500 hover:text-fed-gold-400 font-medium flex items-center mt-4 sm:mt-0 transition-colors">
              {t('home.events.viewAll')} <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {events.slice(0, 4).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 card p-8">
              <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-light-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-heading">
                {lang === 'fr' ? 'Aucun evenement programme' : 'No upcoming events'}
              </h3>
              <p className="text-light-400 max-w-md mx-auto">
                {lang === 'fr'
                  ? 'Le calendrier des prochains evenements sera bientot disponible. Restez connectes !'
                  : 'The upcoming events calendar will be available soon. Stay tuned!'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          SECTION 8 — REPRESENTATION INTERNATIONALE
          Objective: International recognition
          ============================================================ */}
      <InternationalSection />

      {/* ============================================================
          SECTION 9 — PARTENAIRES
          Objective: Institutional support proof
          ============================================================ */}
      <PartnersShowcase />

      {/* ============================================================
          SECTION 10 — NEWSLETTER
          ============================================================ */}
      <NewsletterSection />

      {/* ============================================================
          SECTION 11 — REJOINDRE LA FEDERATION (CTA FINAL)
          Objective: Conversion
          ============================================================ */}
      <section
        className="section relative overflow-hidden"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/95 to-dark-950/90" />
        <div className="container-custom relative z-10 text-center">
          <span className="overline block mb-4">{lang === 'fr' ? 'REJOIGNEZ-NOUS' : 'JOIN US'}</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white font-heading">
            {t('home.join.title')}
          </h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-light-300">
            {t('home.join.description')}
          </p>
          <Link to="/membership" className="btn btn-primary text-lg px-10 py-4 shadow-lg shadow-fed-red-500/20">
            {t('home.join.cta')}
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePage;
