import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Trophy, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Components
import NewsCard from '../components/news/NewsCard';
import EventCard from '../components/events/EventCard';
import NewsletterSection from '../components/newsletter/NewsletterSection';

// Data
import { latestNews } from '../data/newsData';
import { upcomingEvents } from '../data/eventsData';

const HomePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-secondary-900"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg")',
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
              src="https://images.pexels.com/photos/7915559/pexels-photo-7915559.jpeg"
              alt="FEGUIESPORT Logo"
              className="w-32 h-32 mx-auto rounded-full border-4 border-primary-500 shadow-lg mb-6"
            />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-4 text-white"
          >
            {t('home.hero.title')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-300"
          >
            {t('home.hero.subtitle')}
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
              {t('home.hero.cta')}
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
            {latestNews.slice(0, 3).map((news) => (
              <NewsCard key={news.id} news={news} />
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
            {upcomingEvents.slice(0, 4).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
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