import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Globe, ExternalLink, CheckCircle } from 'lucide-react';
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

        {/* Big number stat */}
        <div className="text-center mb-10">
          <div className="inline-flex items-baseline gap-3">
            <span className="text-5xl md:text-6xl font-bold text-gradient-gold font-heading">
              {affiliations.length}
            </span>
            <span className="text-light-400 text-sm md:text-base uppercase tracking-wider font-semibold">
              {lang === 'fr' ? 'Affiliations Actives' : 'Active Affiliations'}
            </span>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${affiliations.length >= 2 ? 'md:grid-cols-2' : ''} ${affiliations.length >= 3 ? 'lg:grid-cols-3' : ''} ${affiliations.length >= 4 ? 'xl:grid-cols-4' : ''} gap-6 max-w-7xl mx-auto`}>
          {affiliations.map((affiliation, index) => (
            <motion.div
              key={affiliation.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card-featured overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
            >
              {/* Logo area — full width, white bg */}
              <div className="bg-white flex items-center justify-center p-4 h-28 relative">
                {affiliation.logo ? (
                  <img
                    src={affiliation.logo}
                    alt={affiliation.shortName}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className={`items-center justify-center gap-2 ${affiliation.logo ? 'hidden' : 'flex'}`}>
                  <Globe className="text-fed-gold-600" size={32} />
                  <span className="text-2xl font-bold text-dark-900 font-heading">{affiliation.shortName}</span>
                </div>

                {/* "Member" label badge */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-fed-gold-500 text-dark-950 text-[9px] font-bold uppercase tracking-wider">
                  {lang === 'fr' ? 'Membre' : 'Member'}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white font-heading">
                    {affiliation.shortName}
                  </h3>
                  <CheckCircle size={16} className="text-fed-gold-500 flex-shrink-0 mt-1" />
                </div>
                <p className="text-light-400 text-xs mb-3 line-clamp-2">{affiliation.name}</p>
                <p className="text-light-300 text-sm leading-relaxed mb-4 line-clamp-3">
                  {lang === 'fr' ? affiliation.description_fr : affiliation.description_en}
                </p>

                {affiliation.url && affiliation.url !== '#' && (
                  <a
                    href={affiliation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-fed-gold-500 hover:text-fed-gold-400 text-sm font-medium transition-colors group/link"
                  >
                    {lang === 'fr' ? 'Site officiel' : 'Official site'}
                    <ExternalLink size={14} className="ml-1.5 group-hover/link:translate-x-0.5 transition-transform" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Badge credibility */}
        <div className="mt-12 flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-dark-800 border border-fed-gold-500/20 text-light-300 text-sm">
            <Globe size={16} className="text-fed-gold-500" />
            <span>
              {lang === 'fr'
                ? 'Membre de la communaute esport mondiale'
                : 'Member of the global esports community'}
            </span>
          </div>
          <p className="text-xs text-light-400/60 italic">
            {lang === 'fr'
              ? 'La FEGESPORT participe aux competitions et evenements internationaux sous les couleurs de la Republique de Guinee.'
              : 'FEGESPORT participates in international competitions and events under the colors of the Republic of Guinea.'}
          </p>
        </div>
      </div>
    </section>
  );
};

export default InternationalSection;
