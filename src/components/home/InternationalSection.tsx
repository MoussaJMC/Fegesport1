import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Globe, ExternalLink } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import { INTERNATIONAL_AFFILIATIONS } from '../../styles/design-tokens';

const InternationalSection: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'fr' ? 'fr' : 'en';

  return (
    <section className="section bg-section-alt relative overflow-hidden">
      {/* Subtle gold gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fed-gold-500/40 to-transparent" />

      <div className="container-custom relative z-10">
        <SectionHeader
          overline={lang === 'fr' ? 'SUR LA SCENE MONDIALE' : 'ON THE WORLD STAGE'}
          title={lang === 'fr' ? 'Representation Internationale' : 'International Representation'}
          description={
            lang === 'fr'
              ? 'La FEGESPORT represente la Guinee au sein des instances internationales de l\'esport, contribuant au developpement du sport electronique a l\'echelle mondiale.'
              : 'FEGESPORT represents Guinea within international esports bodies, contributing to the development of electronic sports on a global scale.'
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {INTERNATIONAL_AFFILIATIONS.map((affiliation, index) => (
            <motion.div
              key={affiliation.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="card-featured p-6 md:p-8 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-fed-gold-500/10 border border-fed-gold-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-fed-gold-500/20 transition-colors">
                  {affiliation.logo ? (
                    <img
                      src={affiliation.logo}
                      alt={affiliation.shortName}
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('fallback-icon');
                      }}
                    />
                  ) : null}
                  <Globe className="text-fed-gold-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-heading mb-1">
                    {affiliation.shortName}
                  </h3>
                  <p className="text-light-400 text-sm">{affiliation.name}</p>
                </div>
              </div>

              <p className="text-light-300 text-sm leading-relaxed mb-4">
                {lang === 'fr' ? affiliation.description_fr : affiliation.description_en}
              </p>

              {affiliation.url !== '#' && (
                <a
                  href={affiliation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-fed-gold-500 hover:text-fed-gold-400 text-sm font-medium transition-colors"
                >
                  {lang === 'fr' ? 'Visiter le site officiel' : 'Visit official website'}
                  <ExternalLink size={14} className="ml-1.5" />
                </a>
              )}
            </motion.div>
          ))}
        </div>

        {/* Badge credibility */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-dark-800 border border-fed-gold-500/20 text-light-300 text-sm">
            <Globe size={16} className="text-fed-gold-500" />
            <span>
              {lang === 'fr'
                ? 'Membre de la communaute esport mondiale'
                : 'Member of the global esports community'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InternationalSection;
