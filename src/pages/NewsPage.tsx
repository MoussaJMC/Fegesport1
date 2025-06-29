import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { latestNews } from '../data/newsData';
import NewsCard from '../components/news/NewsCard';
import { supabase } from '../lib/supabase';
import { NewsItem } from '../types/news';
import { Search, Filter, Tag } from 'lucide-react';

const NewsPage: React.FC = () => {
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>(latestNews);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

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
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
        // Map database fields to NewsItem format
        const mappedNews = data.map(item => ({
          id: item.id,
          title: item.title,
          excerpt: item.excerpt || '',
          content: item.content || '',
          date: new Date(item.created_at).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
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

  // Filter news based on search term and category
  const filteredNews = news.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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

      {/* Filters Section */}
      <section className="bg-white border-b py-4">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-auto md:flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher des actualités..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedCategory === '' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Toutes
              </button>
              
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-sm rounded-full flex items-center ${
                    selectedCategory === category 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Tag size={14} className="mr-1" />
                  {category}
                </button>
              ))}
            </div>
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
          ) : filteredNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNews.map((newsItem) => (
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
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune actualité trouvée</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory 
                  ? 'Aucune actualité ne correspond à vos critères de recherche.' 
                  : 'Revenez bientôt pour découvrir nos dernières actualités.'}
              </p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default NewsPage;