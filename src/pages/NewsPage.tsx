import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { latestNews } from '../data/newsData';
import NewsCard from '../components/news/NewsCard';

const NewsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="bg-primary-700 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('news.title')}</h1>
            <p className="text-xl">
              {t('news.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestNews.map((news) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <NewsCard news={news} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsPage;