import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, MessageCircle, Sparkles } from 'lucide-react';
import NewsletterForm from './NewsletterForm';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';

const NewsletterSection: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const lang = currentLanguage;

  return (
    <section className="relative py-20 md:py-24 overflow-hidden">
      {/* Layered background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />

      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(245,158,11,0.5) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Glow accents */}
      <div className="absolute top-0 -left-32 w-[400px] h-[400px] bg-fed-red-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-32 w-[400px] h-[400px] bg-fed-gold-500/8 rounded-full blur-3xl" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fed-gold-500/40 to-transparent" />

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12 items-center max-w-6xl mx-auto">
          {/* LEFT: Title + features (2/5) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            {/* Overline */}
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-fed-gold-500" />
              <span className="overline mb-0">
                {lang === 'fr' ? 'NEWSLETTER OFFICIELLE' : 'OFFICIAL NEWSLETTER'}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white font-heading mb-4 leading-tight">
              {t('newsletter.title')}
            </h2>

            <p className="text-light-300 text-base md:text-lg leading-relaxed mb-6">
              {t('newsletter.description')}
            </p>

            {/* Features list */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-fed-red-500/10 border border-fed-red-500/20 flex items-center justify-center text-fed-red-500 flex-shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {lang === 'fr' ? 'Email' : 'Email'}
                  </div>
                  <div className="text-xs text-light-400">
                    {lang === 'fr' ? 'Actualites et evenements' : 'News and events'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <MessageCircle size={16} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">WhatsApp</div>
                  <div className="text-xs text-light-400">
                    {lang === 'fr' ? 'Notifications instantanees' : 'Instant notifications'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-fed-gold-500/10 border border-fed-gold-500/20 flex items-center justify-center text-fed-gold-500 flex-shrink-0">
                  <Bell size={16} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {lang === 'fr' ? 'Alertes prioritaires' : 'Priority alerts'}
                  </div>
                  <div className="text-xs text-light-400">
                    {lang === 'fr' ? 'Tournois et appels a candidature' : 'Tournaments & calls for applications'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Form card (3/5) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="bg-dark-800/80 backdrop-blur-md border border-dark-700 rounded-2xl shadow-2xl shadow-dark-950/50 overflow-hidden">
              {/* Top accent bar */}
              <div className="h-1 bg-gradient-to-r from-fed-red-500 via-fed-gold-500 to-fed-red-500" />

              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-fed-red-500/15 border border-fed-red-500/30 flex items-center justify-center text-fed-red-500">
                    <Bell size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-heading">
                      {lang === 'fr' ? 'Inscription' : 'Subscribe'}
                    </h3>
                    <p className="text-xs text-light-400">
                      {lang === 'fr' ? 'Gratuit, sans engagement' : 'Free, no commitment'}
                    </p>
                  </div>
                </div>

                <NewsletterForm />

                {/* Privacy note */}
                <p className="text-[11px] text-light-400/70 text-center mt-5 leading-relaxed">
                  {lang === 'fr'
                    ? 'Vos donnees sont protegees. Aucun spam, desabonnement en un clic.'
                    : 'Your data is protected. No spam, one-click unsubscribe.'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fed-red-500/30 to-transparent" />
    </section>
  );
};

export default NewsletterSection;
