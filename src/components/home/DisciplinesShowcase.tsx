import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Trophy, Gamepad2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import SectionHeader from '../ui/SectionHeader';
import { useLanguage } from '../../hooks/useLanguage';

interface Discipline {
  id: string;
  name: string;
  games: string[];
  icon: string;
  color: string;
  image?: string; // URL — managed via /admin/leg
  is_active: boolean;
  sort_order: number;
}

// Static fallback inspired by IESF + Guinea esports scene
const FALLBACK_DISCIPLINES: Discipline[] = [
  { id: 'football', name: 'Football Sim', games: ['FIFA 25', 'eFootball'], icon: '⚽', color: '#10B981', is_active: true, sort_order: 1 },
  { id: 'moba', name: 'MOBA', games: ['Mobile Legends', 'League of Legends'], icon: '🛡️', color: '#3B82F6', is_active: true, sort_order: 2 },
  { id: 'fps', name: 'FPS / Battle Royale', games: ['Free Fire', 'Call of Duty', 'PUBG Mobile'], icon: '🎯', color: '#DC2626', is_active: true, sort_order: 3 },
  { id: 'fighting', name: 'Fighting', games: ['Tekken 8', 'Street Fighter 6'], icon: '🥊', color: '#F59E0B', is_active: true, sort_order: 4 },
  { id: 'racing', name: 'Racing', games: ['Forza', 'Gran Turismo'], icon: '🏎️', color: '#8B5CF6', is_active: true, sort_order: 5 },
  { id: 'strategy', name: 'Strategy', games: ['Clash Royale', 'Hearthstone'], icon: '♟️', color: '#06B6D4', is_active: true, sort_order: 6 },
];

/**
 * Render a discipline visual:
 * Priority order:
 *   1. image URL (uploaded via admin) — full image
 *   2. icon (emoji like ⚽) — large emoji
 *   3. fallback Lucide Gamepad2 icon
 */
const DisciplineVisual: React.FC<{ discipline: Discipline }> = ({ discipline }) => {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = discipline.image && !imageError && discipline.image.trim() !== '';

  // Image upload from admin → display image
  if (hasValidImage) {
    return (
      <div
        className="w-full h-32 md:h-36 rounded-xl overflow-hidden mb-3 transition-transform group-hover:scale-105 relative"
        style={{
          backgroundColor: `${discipline.color}10`,
          border: `1px solid ${discipline.color}25`,
        }}
      >
        <img
          src={discipline.image}
          alt={discipline.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImageError(true)}
        />
        {/* Subtle color overlay */}
        <div
          className="absolute inset-0 mix-blend-overlay opacity-30"
          style={{ background: `linear-gradient(180deg, transparent, ${discipline.color})` }}
        />
      </div>
    );
  }

  // Emoji icon (1-4 chars) → big emoji
  if (discipline.icon && discipline.icon.length <= 4) {
    return (
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
        style={{
          backgroundColor: `${discipline.color}15`,
          border: `1px solid ${discipline.color}30`,
        }}
      >
        <span className="text-3xl">{discipline.icon}</span>
      </div>
    );
  }

  // Fallback: generic gamepad icon
  return (
    <div
      className="w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
      style={{
        backgroundColor: `${discipline.color}15`,
        border: `1px solid ${discipline.color}30`,
        color: discipline.color,
      }}
    >
      <Gamepad2 size={28} />
    </div>
  );
};

const DisciplinesShowcase: React.FC = () => {
  const { i18n } = useTranslation();
  const { currentLanguage } = useLanguage();
  const lang = currentLanguage;
  const [disciplines, setDisciplines] = useState<Discipline[]>(FALLBACK_DISCIPLINES);

  useEffect(() => {
    fetchDisciplines();
  }, []);

  const fetchDisciplines = async () => {
    try {
      const { data, error } = await supabase
        .from('leg_disciplines')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (!error && data && data.length > 0) {
        setDisciplines(data);
      }
    } catch (err) {
      // Keep fallback
    }
  };

  // Detect if any discipline has an image — if yes, use larger card layout
  const hasAnyImage = disciplines.some(d => d.image && d.image.trim() !== '');

  return (
    <section className="section bg-section-alt relative overflow-hidden">
      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(245,158,11,0.5) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />
      {/* Top gold line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fed-gold-500/40 to-transparent" />

      <div className="container-custom relative z-10">
        <SectionHeader
          overline={lang === 'fr' ? 'TITRES OFFICIELS' : 'OFFICIAL TITLES'}
          title={lang === 'fr' ? 'Disciplines Officielles' : 'Official Game Titles'}
          description={
            lang === 'fr'
              ? 'Les disciplines esport reconnues et structurees par la FEGESPORT pour les competitions nationales et internationales.'
              : 'Esports disciplines recognized and structured by FEGESPORT for national and international competitions.'
          }
          dividerColor="gold"
        />

        <div className={`grid gap-4 md:gap-5 ${
          hasAnyImage
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
        }`}>
          {disciplines.map((discipline, index) => (
            <motion.div
              key={discipline.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.4) }}
              viewport={{ once: true }}
              className="group relative bg-dark-800 border border-dark-700 hover:border-fed-gold-500/40 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              style={{ borderTopColor: discipline.color, borderTopWidth: '3px' }}
            >
              {/* Glow effect on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl pointer-events-none"
                style={{ background: `radial-gradient(circle at top, ${discipline.color}, transparent 70%)` }}
              />

              <div className="relative">
                {/* Visual: image > emoji > icon fallback */}
                <DisciplineVisual discipline={discipline} />

                {/* Name */}
                <h3 className="text-sm md:text-base font-bold text-white font-heading mb-2 leading-tight">
                  {discipline.name}
                </h3>

                {/* Games list */}
                <ul className="space-y-1">
                  {(discipline.games || []).slice(0, hasAnyImage ? 4 : 2).map((game, i) => (
                    <li key={i} className="text-xs text-light-400 flex items-center gap-1.5">
                      <span
                        className="w-1 h-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: discipline.color }}
                      />
                      <span className="truncate">{game}</span>
                    </li>
                  ))}
                  {(discipline.games?.length || 0) > (hasAnyImage ? 4 : 2) && (
                    <li className="text-xs text-light-400/60">
                      +{discipline.games.length - (hasAnyImage ? 4 : 2)} {lang === 'fr' ? 'autres' : 'more'}
                    </li>
                  )}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-dark-800 border border-fed-gold-500/20 text-light-300 text-sm">
            <Trophy size={16} className="text-fed-gold-500" />
            <span>
              {lang === 'fr'
                ? `${disciplines.length} disciplines structurees`
                : `${disciplines.length} structured disciplines`}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DisciplinesShowcase;
