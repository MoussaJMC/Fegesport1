import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Handshake } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import SectionHeader from '../ui/SectionHeader';

interface Partner {
  id: string;
  name: string;
  logo_url?: string;
  website_url?: string;
  type?: string;
}

const PartnersShowcase: React.FC = () => {
  const { i18n } = useTranslation();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const lang = i18n.language === 'fr' ? 'fr' : 'en';

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .limit(12);

      if (error) {
        console.error('Error fetching partners:', error);
        setPartners([]);
        return;
      }

      setPartners(data || []);
    } catch (err) {
      console.error('Error in fetchPartners:', err);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  // Hide section entirely if no partners (clean fallback)
  if (!loading && partners.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className="section bg-section-dark">
        <div className="container-custom">
          <SectionHeader
            overline={lang === 'fr' ? 'ILS NOUS FONT CONFIANCE' : 'THEY TRUST US'}
            title={lang === 'fr' ? 'Nos Partenaires' : 'Our Partners'}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[3/2] bg-dark-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section bg-section-dark">
      <div className="container-custom">
        <SectionHeader
          overline={lang === 'fr' ? 'ILS NOUS FONT CONFIANCE' : 'THEY TRUST US'}
          title={lang === 'fr' ? 'Nos Partenaires' : 'Our Partners'}
          description={
            lang === 'fr'
              ? 'Des institutions et entreprises qui soutiennent le developpement de l\'esport en Guinee.'
              : 'Institutions and companies supporting the development of esports in Guinea.'
          }
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="aspect-[3/2] rounded-xl bg-dark-800 border border-dark-700 hover:border-fed-gold-500/30 flex items-center justify-center p-4 transition-all duration-300 group-hover:bg-dark-800/80">
                {partner.logo_url ? (
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`flex-col items-center justify-center gap-1 ${partner.logo_url ? 'hidden' : 'flex'}`}
                >
                  <Handshake size={20} className="text-light-400 group-hover:text-fed-gold-500 transition-colors" />
                  <span className="text-xs text-light-400 text-center font-medium leading-tight">
                    {partner.name}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/partners"
            className="btn btn-secondary"
          >
            {lang === 'fr' ? 'Devenir partenaire' : 'Become a partner'}
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PartnersShowcase;
