import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';
import { getCardTranslation, CardTranslations } from '../utils/translations';

const CardPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { currentLanguage } = useLanguage();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCard = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching card:', error);
          setCard(null);
        } else if (data) {
          setCard(data);
        } else {
          setCard(null);
        }
      } catch (error) {
        console.error('Error in fetchCard:', error);
        setCard(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [id]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'communiqué': return 'bg-blue-600';
      case 'compétition': return 'bg-green-600';
      case 'partenariat': return 'bg-purple-600';
      default: return 'bg-primary-600';
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, { fr: string; en: string }> = {
      'communiqué': { fr: 'Communiqué', en: 'Announcement' },
      'compétition': { fr: 'Compétition', en: 'Competition' },
      'partenariat': { fr: 'Partenariat', en: 'Partnership' },
    };
    return labels[category]?.[currentLanguage] || category;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLanguage === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-secondary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="pt-20 min-h-screen bg-secondary-900">
        <div className="container-custom py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">{t('common.notFound')}</h1>
          <p className="text-gray-300 mb-8">{t('common.notFoundMessage')}</p>
          <Link
            to="/"
            className="inline-flex items-center text-primary-500 hover:text-primary-400"
          >
            <ArrowLeft size={20} className="mr-2" />
            {t('common.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  const translated = card.translations
    ? getCardTranslation(card.translations as CardTranslations, currentLanguage)
    : { title: card.title, content: card.content };

  return (
    <div className="pt-20 min-h-screen bg-secondary-900">
      <div className="relative h-[400px] w-full">
        <div className="absolute inset-0">
          <img
            src={card.image_url || "https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg"}
            alt={translated.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-secondary-900/50 to-transparent" />
        </div>
      </div>

      <div className="container-custom relative -mt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-secondary-800 rounded-lg shadow-xl p-8 mb-12"
        >
          <span className={`inline-block ${getCategoryColor(card.category)} text-white text-sm font-semibold px-3 py-1 rounded-full mb-4`}>
            {getCategoryLabel(card.category)}
          </span>

          <h1 className="text-4xl font-bold text-white mb-6">{translated.title}</h1>

          <div className="flex items-center text-gray-300 mb-8">
            <Calendar size={20} className="mr-2 text-primary-500" />
            <div>
              <div className="font-semibold">{t('news.publishedOn')}</div>
              <div>{formatDate(card.created_at)}</div>
            </div>
          </div>

          <div className="prose prose-lg prose-invert max-w-none mb-8">
            <p className="text-gray-300 whitespace-pre-wrap">{translated.content}</p>
          </div>
        </motion.div>

        <div className="flex justify-between items-center py-8 border-t border-secondary-700">
          <Link
            to="/"
            className="inline-flex items-center text-primary-500 hover:text-primary-400"
          >
            <ArrowLeft size={20} className="mr-2" />
            {t('common.backHome')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CardPage;
