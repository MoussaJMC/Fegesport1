import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import NewsletterForm from './NewsletterForm';
import { useTranslation } from 'react-i18next';

const NewsletterSection: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section className="bg-secondary-800 py-16">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-primary-600/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Bell className="text-primary-500" size={28} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('newsletter.title')}
            </h2>
            <p className="text-gray-300 mb-8">
              {t('newsletter.description')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-secondary-700 p-6 rounded-lg"
          >
            <NewsletterForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;