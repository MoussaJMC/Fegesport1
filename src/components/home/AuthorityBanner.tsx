import React from 'react';
import { motion } from 'framer-motion';
import { Award, Globe, Users, Calendar } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

interface AuthorityBannerProps {
  affiliations?: number;
  leadership?: number;
  yearsActive?: number;
}

/**
 * Authority Banner — IESF-inspired credibility strip
 * Displays institutional credentials below the hero section
 * Shows: Recognition status + key institutional numbers
 */
const AuthorityBanner: React.FC<AuthorityBannerProps> = ({
  affiliations = 4,
  leadership = 20,
  yearsActive = 9,
}) => {
  const { currentLanguage } = useLanguage();
  const lang = currentLanguage;

  const items = [
    {
      icon: <Award size={18} />,
      label: lang === 'fr' ? 'FEDERATION RECONNUE' : 'RECOGNIZED FEDERATION',
      value: lang === 'fr' ? 'Officielle' : 'Official',
      accent: 'fed-gold',
    },
    {
      icon: <Globe size={18} />,
      label: lang === 'fr' ? 'AFFILIATIONS INTERNATIONALES' : 'INTERNATIONAL AFFILIATIONS',
      value: `${affiliations}`,
      accent: 'fed-red',
    },
    {
      icon: <Users size={18} />,
      label: lang === 'fr' ? 'MEMBRES DIRIGEANTS' : 'BOARD MEMBERS',
      value: `${leadership}`,
      accent: 'accent-blue',
    },
    {
      icon: <Calendar size={18} />,
      label: lang === 'fr' ? "ANNEES D'ENGAGEMENT" : 'YEARS OF COMMITMENT',
      value: `${yearsActive}+`,
      accent: 'fed-gold',
    },
  ];

  return (
    <div className="relative bg-dark-900 border-y border-dark-700">
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(45deg, rgba(245,158,11,0.4) 25%, transparent 25%, transparent 50%, rgba(245,158,11,0.4) 50%, rgba(245,158,11,0.4) 75%, transparent 75%, transparent)`,
          backgroundSize: '8px 8px',
        }}
      />

      <div className="container-custom relative z-10 py-6 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 md:gap-4 group"
            >
              {/* Icon */}
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-${item.accent}-500/10 border border-${item.accent}-500/20 flex items-center justify-center text-${item.accent}-500 flex-shrink-0 group-hover:bg-${item.accent}-500/20 transition-colors`}>
                {item.icon}
              </div>

              {/* Text */}
              <div className="min-w-0">
                <div className="text-2xl md:text-3xl font-bold text-white font-heading leading-tight">
                  {item.value}
                </div>
                <div className={`text-[10px] md:text-xs font-semibold uppercase tracking-wider text-light-400 leading-tight mt-0.5 truncate`}>
                  {item.label}
                </div>
              </div>

              {/* Vertical separator (except last) */}
              {index < items.length - 1 && (
                <div className="hidden md:block ml-auto w-px h-10 bg-dark-700" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthorityBanner;
