import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { latestNews } from '../data/newsData';
import NewsCard from '../components/news/NewsCard';
import { supabase } from '../lib/supabase';
import { NewsItem } from '../types/news';
import { Search, Tag, Newspaper, X, Loader2 } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

const NewsPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const lang = currentLanguage;
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
        const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))];
        setCategories(uniqueCategories);

        const mappedNews = data.map(item => ({
          id: item.id,
          title: item.title,
          excerpt: item.excerpt || '',
          content: item.content || '',
          date: new Date(item.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          image: item.image_url || 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
          category: item.category,
          author: { name: 'FEGESPORT' },
          tags: [],
          translations: item.translations
        }));
        setNews(mappedNews);
      }
    } catch (error) {
      console.error('Error in fetchNews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Communique': case 'Communiqué': return 'bg-accent-blue-500';
      case 'Competition': case 'Compétition': return 'bg-emerald-500';
      case 'Formation': return 'bg-fed-gold-500';
      case 'Partenariat': return 'bg-purple-500';
      case 'International': return 'bg-orange-500';
      default: return 'bg-fed-red-500';
    }
  };

  return (
    <div className="pt-20">
      {/* ============ HERO ============ */}
      <section className="relative bg-dark-950 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 -left-32 w-96 h-96 bg-fed-red-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-fed-gold-500/5 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <span className="overline block mb-4">
              {lang === 'fr' ? 'ACTUALITES' : 'NEWS'}
            </span>
            <h1 className="text-hero font-heading text-white mb-6">
              {t('news.title')}
            </h1>
            <p className="text-lg md:text-xl text-light-300">
              {t('news.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* ============ FILTERS ============ */}
      <section className="bg-dark-900 border-b border-dark-700 py-5 sticky top-[72px] z-30 backdrop-blur-xl bg-dark-900/95">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-auto md:flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-light-400" size={18} />
              <input
                type="text"
                placeholder={lang === 'fr' ? 'Rechercher des actualites...' : 'Search news...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-light-100 placeholder-light-400/50 focus:outline-none focus:border-fed-red-500 focus:ring-1 focus:ring-fed-red-500/30 transition-all text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-light-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3.5 py-1.5 text-sm rounded-full font-medium transition-all ${
                  selectedCategory === ''
                    ? 'bg-fed-red-500 text-white shadow-lg shadow-fed-red-500/20'
                    : 'bg-dark-800 text-light-400 hover:text-white border border-dark-700 hover:border-dark-700'
                }`}
              >
                {lang === 'fr' ? 'Toutes' : 'All'}
              </button>

              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-1.5 text-sm rounded-full font-medium transition-all flex items-center gap-1.5 ${
                    selectedCategory === category
                      ? 'bg-fed-red-500 text-white shadow-lg shadow-fed-red-500/20'
                      : 'bg-dark-800 text-light-400 hover:text-white border border-dark-700 hover:border-dark-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${getCategoryColor(category)}`} />
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ NEWS GRID ============ */}
      <section className="section bg-section-dark">
        <div className="container-custom">
          {/* Results count */}
          {!loading && (
            <div className="flex items-center justify-between mb-8">
              <p className="text-light-400 text-sm">
                {filteredNews.length} {lang === 'fr' ? 'article' : 'article'}{filteredNews.length > 1 ? 's' : ''}
                {selectedCategory && (
                  <span className="ml-1">
                    {lang === 'fr' ? 'dans' : 'in'} <strong className="text-fed-red-400">{selectedCategory}</strong>
                  </span>
                )}
                {searchTerm && (
                  <span className="ml-1">
                    {lang === 'fr' ? 'pour' : 'for'} "<strong className="text-fed-gold-500">{searchTerm}</strong>"
                  </span>
                )}
              </p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}
                  className="text-xs text-light-400 hover:text-fed-red-400 transition-colors flex items-center gap-1"
                >
                  <X size={14} />
                  {lang === 'fr' ? 'Reinitialiser' : 'Reset'}
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-fed-red-500 mb-4" />
              <p className="text-light-400 text-sm">
                {lang === 'fr' ? 'Chargement des actualites...' : 'Loading news...'}
              </p>
            </div>
          ) : filteredNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredNews.map((newsItem, index) => (
                <motion.div
                  key={newsItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
                >
                  <NewsCard news={newsItem} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 card p-10 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-5">
                <Newspaper className="text-light-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-heading">
                {lang === 'fr' ? 'Aucune actualite trouvee' : 'No news found'}
              </h3>
              <p className="text-light-400 mb-6">
                {searchTerm || selectedCategory
                  ? (lang === 'fr'
                    ? 'Aucune actualite ne correspond a vos criteres de recherche.'
                    : 'No news matches your search criteria.')
                  : (lang === 'fr'
                    ? 'Revenez bientot pour decouvrir nos dernieres actualites.'
                    : 'Come back soon to discover our latest news.')}
              </p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}
                  className="btn btn-primary"
                >
                  {lang === 'fr' ? 'Reinitialiser les filtres' : 'Reset filters'}
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
