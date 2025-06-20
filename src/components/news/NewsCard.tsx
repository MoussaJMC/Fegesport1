import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { NewsItem } from '../../types/news';
import { useTranslation } from 'react-i18next';

interface NewsCardProps {
  news: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  const { t } = useTranslation();
  
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
          <span className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
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
            {news.title}
          </Link>
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3 flex-grow card-description">
          {news.excerpt}
        </p>
        <Link 
          to={`/news/${news.id}`} 
          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          {t('news.readMore')}
        </Link>
      </div>
    </motion.article>
  );
};

export default NewsCard;