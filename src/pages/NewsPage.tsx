import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { latestNews } from '../data/newsData';
import NewsCard from '../components/news/NewsCard';
import { supabase } from '../lib/supabase';
import { NewsItem } from '../types/news';

const NewsPage: React.FC = () => {
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>(latestNews);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

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
      console.error('Error in fetchNews:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="bg-primary-700 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">{t('news.title')}</h1>
            <p className="text-xl">
              {t('news.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((newsItem) => (
                <motion.div
                  key={newsItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <NewsCard news={newsItem} />
                </motion.div>
              ))}
            </div>
          )}
          
          {!loading && news.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune actualité disponible</h3>
              <p className="text-gray-500">Revenez bientôt pour découvrir nos dernières actualités.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default NewsPage;