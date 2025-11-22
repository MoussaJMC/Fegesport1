import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { NewsItem } from '../../types/news';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';
import { getNewsTranslation, NewsTranslations } from '../../utils/translations';

interface NewsCardProps {
  news: NewsItem & { translations?: NewsTranslations };
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  // Get translated content
  const translated = news.translations
    ? getNewsTranslation(news.translations, currentLanguage)
    : { title: news.title, excerpt: news.excerpt, content: '' };
  
  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-600';
    
    switch (category) {
      case 'Communiqué': return 'bg-blue-600';
      case 'Compétition': return 'bg-green-600';
      case 'Formation': return 'bg-yellow-600';
      case 'Partenariat': return 'bg-purple-600';
      case 'International': return 'bg-orange-600';
      default: return 'bg-primary-600';
    }
  };
  
  return (
    <motion.article 
      className="card h-full flex flex-col"
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={news.image} 
          alt={news.title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg";
          }}
        />
        {news.category && (
          <span className={`absolute top-4 right-4 ${getCategoryColor(news.category)} text-white text-xs font-bold px-3 py-1 rounded-full`}>
            {news.category}
          </span>
        )}
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <Calendar size={14} className="mr-1" />
          <time dateTime={news.date}>{news.date}</time>
        </div>
        <h3 className="text-xl font-bold mb-2 line-clamp-2 card-title">
          <Link to={`/news/${news.id}`} className="hover:text-primary-600 transition-colors">
            {translated.title || news.title}
          </Link>
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3 flex-grow card-description">
          {translated.excerpt || news.excerpt}
        </p>
        <Link 
          to={`/news/${news.id}`} 
          className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
        >
          {t('news.readMore')}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </motion.article>
  );
};

export default NewsCard;