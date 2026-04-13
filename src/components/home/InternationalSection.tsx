import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Globe, ExternalLink } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import { supabase } from '../../lib/supabase';
import { INTERNATIONAL_AFFILIATIONS } from '../../styles/design-tokens';
import { useLanguage } from '../../hooks/useLanguage';

interface Affiliation {
  id: string;
  name: string;
  shortName: string;
  description_fr: string;
  description_en: string;
  logo?: string;
  url: string;
}

const InternationalSection: React.FC = () => {
  const { i18n } = useTranslation();
  const { currentLanguage } = useLanguage();
  const lang = currentLanguage;
  const [affiliations, setAffiliations] = useState<Affiliation[]>([...INTERNATIONAL_AFFILIATIONS]);
  const [sectionTitle, setSectionTitle] = useState({
    fr: 'Representation Internationale',
    en: 'International Representation',
  });
  const [sectionDescription, setSectionDescription] = useState({
    fr: 'La FEGESPORT represente la Guinee au sein des instances internationales de l\'esport, contribuant au developpement du sport electronique a l\'echelle mondiale.',
    en: 'FEGESPORT represents Guinea within international esports bodies, contributing to the development of electronic sports on a global scale.',
  });

  useEffect(() => {
    fetchInternationalData();
  }, []);

  const fetchInternationalData = async () => {
    try {
      // Look for "international" section in page_sections (linked to home page)
      const { data: pageData } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', 'home')
        .maybeSingle();

      if (!pageData) return;

      const { data: section } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', pageData.id)
        .eq('section_key', 'international')
        .eq('is_active', true)
        .maybeSingle();

      if (!section) return; // Keep hardcoded fallback

      // Update title from section
      if (section.title) {
        setSectionTitle(prev => ({
          ...prev,
          fr: section.title,
          ...(section.translations?.en?.title ? { en: section.translations.en.title } : {}),
        }));
      }

      // Update description from section content
      if (section.content) {
        setSectionDescription(prev => ({
          ...prev,
          fr: section.content,
          ...(section.translations?.en?.content ? { en: section.translations.en.content } : {}),
        }));
      }

      // Update affiliations from settings JSON
      // Expected format in settings: { affiliations: [ { id, name, shortName, description_fr, description_en, logo, url } ] }
      if (section.settings?.affiliations && Array.isArray(section.settings.affiliations) && section.settings.affiliations.length > 0) {
        setAffiliations(section.settings.affiliations);
      }
    } catch (error) {
      console.error('Error fetching international section:', error);
      // Keep hardcoded fallback on error
    }
  };

  return (
    <section className="section bg-section-alt relative overflow-hidden">
      {/* Subtle gold gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fed-gold-500/40 to-transparent" />

      <div className="container-custom relative z-10">
        <SectionHeader
          overline={lang === 'fr' ? 'SUR LA SCENE MONDIALE' : 'ON THE WORLD STAGE'}
          title={lang === 'fr' ? sectionTitle.fr : sectionTitle.en}
          description={lang === 'fr' ? sectionDescription.fr : sectionDescription.en}
        />

        <div className={`grid grid-cols-1 ${affiliations.length >= 2 ? 'md:grid-cols-2' : ''} ${affiliations.length >= 3 ? 'lg:grid-cols-3' : ''} gap-8 max-w-5xl mx-auto`}>
          {affiliations.map((affiliation, index) => (
            <motion.div
              key={affiliation.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="card-featured p-6 md:p-8 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`rounded-xl border flex items-center justify-center flex-shrink-0 transition-colors overflow-hidden ${
                  affiliation.logo
                    ? 'w-20 h-14 bg-white border-light-200 p-1'
                    : 'w-14 h-14 bg-fed-gold-500/10 border-fed-gold-500/20 group-hover:bg-fed-gold-500/20'
                }`}>
                  {affiliation.logo ? (
                    <img
                      src={affiliation.logo}
                      alt={affiliation.shortName}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          e.currentTarget.parentElement.classList.remove('bg-white', 'border-light-200', 'p-1.5');
                          e.currentTarget.parentElement.classList.add('bg-fed-gold-500/10', 'border-fed-gold-500/20');
                        }
                      }}
                    />
                  ) : (
                    <Globe className="text-fed-gold-500" size={24} />
                  )}
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

              {affiliation.url && affiliation.url !== '#' && (
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
