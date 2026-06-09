import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, User, Loader } from 'lucide-react';
import { latestNews } from '../data/newsData';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { SEO, buildArticleSchema } from '../components/seo';
import { useLanguage } from '../hooks/useLanguage';

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category?: string;
  image_url?: string;
  author_id?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const NewsArticlePage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const lang = currentLanguage;
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to fetch from Supabase
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching article from Supabase:', error);
          
          // Fallback to local data
          const localArticle = latestNews.find(news => news.id === id);
          if (localArticle) {
            setArticle({
              id: localArticle.id,
              title: localArticle.title,
              excerpt: localArticle.excerpt,
              content: localArticle.content,
              category: localArticle.category,
              image_url: localArticle.image,
              published: true,
              created_at: localArticle.date,
              updated_at: localArticle.date
            });
          } else {
            setError('Article non trouvé');
          }
        } else if (data) {
          // Check if article is published or user is authenticated
          if (!data.published) {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
              setError('Cet article n\'est pas encore publié');
              return;
            }
          }
          
          setArticle(data);
        } else {
          setError('Article non trouvé');
        }
      } catch (error) {
        console.error('Error in fetchArticle:', error);
        setError('Une erreur est survenue lors du chargement de l\'article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-secondary-900 flex items-center justify-center">
        <Loader className="animate-spin h-12 w-12 text-primary-600" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="pt-20 min-h-screen bg-secondary-900">
        <div className="container-custom py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">{error || t('common.notFound')}</h1>
          <p className="text-gray-300 mb-8">{t('common.notFoundMessage')}</p>
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
      <SEO
        title={article.title}
        description={article.excerpt || article.content.substring(0, 160)}
        keywords={`${article.category || 'esport'}, FEGESPORT, ${article.title}, actualites esport Guinee`}
        image={article.image_url}
        type="article"
        publishedTime={article.created_at}
        modifiedTime={article.updated_at}
        author="FEGESPORT"
        section={article.category}
        breadcrumbs={[
          { name: lang === 'fr' ? 'Actualites' : 'News', url: '/news' },
          { name: article.title, url: `/news/${article.id}` },
        ]}
        schema={buildArticleSchema({
          title: article.title,
          description: article.excerpt || article.content.substring(0, 200),
          image: article.image_url || 'https://geozovninpeqsgtzwchu.supabase.co/storage/v1/object/public/static-files/uploads/d5b2ehmnrec.jpg',
          url: `https://fegesport224.org/news/${article.id}`,
          datePublished: article.created_at,
          dateModified: article.updated_at,
          author: 'FEGESPORT',
          category: article.category,
        })}
      />

      {/* Hero Image */}
      <div className="relative h-[400px] w-full">
        <div className="absolute inset-0">
          <img 
            src={article.image_url || 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg'} 
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg';
            }}
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
            <div className="flex items-center">
              <User size={18} className="mr-2" />
              <span>FEGESPORT</span>
            </div>
            <div className="flex items-center">
              <Calendar size={18} className="mr-2" />
              <time dateTime={article.created_at}>
                {new Date(article.created_at).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
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
        </div>
      </div>
    </div>
  );
};

export default NewsArticlePage;