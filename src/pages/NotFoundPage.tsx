import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HomeIcon } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 pt-20">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-3xl font-semibold mt-4 mb-6">{t('common.notFound')}</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {t('common.notFoundMessage')}
        </p>
        <Link 
          to="/" 
          className="btn btn-primary inline-flex items-center"
        >
          <HomeIcon size={18} className="mr-2" />
          {t('common.backHome')}
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;