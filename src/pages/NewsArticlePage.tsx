import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';
import { latestNews } from '../data/newsData';

const NewsArticlePage: React.FC = () => {
  const { id } = useParams();
  const article = latestNews.find(news => news.id === id);

  if (!article) {
    return (
      <div className="pt-20 min-h-screen bg-secondary-900">
        <div className="container-custom py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Article non trouvé</h1>
          <p className="text-gray-300 mb-8">L'article que vous recherchez n'existe pas.</p>
          <Link 
            to="/news" 
            className="inline-flex items-center text-primary-500 hover:text-primary-400"
          >
            <ArrowLeft size={20} className="mr-2" />
            Retour aux actualités
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-secondary-900">
      {/* Hero Image */}
      <div className="relative h-[400px] w-full">
        <div className="absolute inset-0">
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-secondary-900/50 to-transparent" />
        </div>
      </div>

      {/* Article Content */}
      <div className="container-custom relative -mt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-secondary-800 rounded-lg shadow-xl p-8 mb-12"
        >
          {/* Category Badge */}
          {article.category && (
            <span className="inline-block bg-primary-600 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
              {article.category}
            </span>
          )}

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-6">{article.title}</h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8">
            {article.author && (
              <div className="flex items-center">
                <User size={18} className="mr-2" />
                <span>{article.author.name}</span>
              </div>
            )}
            <div className="flex items-center">
              <Calendar size={18} className="mr-2" />
              <time dateTime={article.date}>{article.date}</time>
            </div>
            {article.tags && (
              <div className="flex items-center flex-wrap gap-2">
                <Tag size={18} className="mr-1" />
                {article.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="text-sm bg-secondary-700 text-gray-300 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Article Content */}
          <div className="prose prose-lg prose-invert max-w-none">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              {article.excerpt}
            </p>
            <div className="text-gray-300 space-y-6">
              {article.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center py-8 border-t border-secondary-700">
          <Link 
            to="/news" 
            className="inline-flex items-center text-primary-500 hover:text-primary-400"
          >
            <ArrowLeft size={20} className="mr-2" />
            Retour aux actualités
          </Link>
          
          <div className="flex gap-4">
            {article.tags && article.tags.map((tag, index) => (
              <Link
                key={index}
                to={`/news/tag/${tag}`}
                className="text-sm bg-secondary-700 text-gray-300 px-3 py-1 rounded-full hover:bg-secondary-600 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsArticlePage;