import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import SectionHeader from '../ui/SectionHeader';
import { getLeadershipTranslation } from '../../utils/translations';
import { useLanguage } from '../../hooks/useLanguage';

/**
 * GovernanceSection — Bureau Executif de la FEGESPORT
 *
 * Reads from `leadership_team` table (managed via Admin → Notre Direction)
 * Shows top 6 members sorted by `order` field
 */

interface LeadershipMember {
  id: string;
  name: string;
  position: string;
  bio?: string;
  image_url?: string;
  order: number;
  is_active: boolean;
  translations?: any;
}

const GovernanceSection: React.FC = () => {
  const { i18n } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [members, setMembers] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);
  const lang = currentLanguage;

  useEffect(() => {
    fetchLeadership();
  }, []);

  const fetchLeadership = async () => {
    try {
      const { data, error } = await supabase
        .from('leadership_team')
        .select('*')
        .eq('is_active', true)
        .order('order', { ascending: true })
        .limit(6);

      if (error) {
        console.error('Error fetching leadership:', error);
        setMembers([]);
        return;
      }

      setMembers(data || []);
    } catch (err) {
      console.error('Error in fetchLeadership:', err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const getMemberName = (member: LeadershipMember): string => {
    const translated = getLeadershipTranslation(member.translations, lang);
    return translated.name || member.name;
  };

  const getMemberPosition = (member: LeadershipMember): string => {
    const translated = getLeadershipTranslation(member.translations, lang);
    return translated.position || member.position;
  };

  const isPresident = (member: LeadershipMember): boolean => {
    const pos = member.position.toLowerCase().trim();
    // Exact match only — "Vice Président" should NOT match
    return pos === 'president' || pos === 'président' || pos === 'fondateur & president' || pos === 'fondateur & président';
  };

  if (loading) {
    return (
      <section className="section bg-section-alt">
        <div className="container-custom">
          <SectionHeader
            overline={lang === 'fr' ? 'GOUVERNANCE' : 'GOVERNANCE'}
            title={lang === 'fr' ? 'Bureau Executif' : 'Executive Board'}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="w-20 h-20 rounded-full bg-dark-700 mx-auto mb-4" />
                <div className="h-5 bg-dark-700 rounded w-3/4 mx-auto mb-2" />
                <div className="h-4 bg-dark-700 rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Fallback if no leadership data
  if (members.length === 0) {
    return (
      <section className="section bg-section-alt">
        <div className="container-custom">
          <SectionHeader
            overline={lang === 'fr' ? 'GOUVERNANCE' : 'GOVERNANCE'}
            title={lang === 'fr' ? 'Bureau Executif' : 'Executive Board'}
            description={
              lang === 'fr'
                ? 'La FEGESPORT est dirigee par un bureau executif elu, charge de structurer et developper l\'esport en Guinee.'
                : 'FEGESPORT is led by an elected executive board, responsible for structuring and developing esports in Guinea.'
            }
          />
          <div className="max-w-2xl mx-auto">
            <div className="card-featured p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-fed-gold-500/10 border border-fed-gold-500/30 flex items-center justify-center mx-auto mb-4">
                <Shield className="text-fed-gold-500" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-heading">
                {lang === 'fr' ? 'Organigramme en cours de publication' : 'Organization chart being published'}
              </h3>
              <p className="text-light-400">
                {lang === 'fr'
                  ? 'Les informations sur la gouvernance seront bientot disponibles.'
                  : 'Governance information will be available soon.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Separate president from other members
  const president = members.find(m => isPresident(m));
  const otherMembers = members.filter(m => !isPresident(m));

  return (
    <section className="section bg-section-alt relative overflow-hidden">
      {/* Top gold accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fed-gold-500/40 to-transparent" />

      <div className="container-custom relative z-10">
        <SectionHeader
          overline={lang === 'fr' ? 'GOUVERNANCE' : 'GOVERNANCE'}
          title={lang === 'fr' ? 'Bureau Executif' : 'Executive Board'}
          description={
            lang === 'fr'
              ? 'La FEGESPORT est dirigee par un bureau executif elu, charge de structurer et developper l\'esport en Guinee.'
              : 'FEGESPORT is led by an elected executive board, responsible for structuring and developing esports in Guinea.'
          }
        />

        {/* PRESIDENT — Featured Hero Card (IESF-style) */}
        {president && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-10 max-w-4xl mx-auto"
          >
            <div className="relative bg-gradient-to-br from-dark-800 via-dark-800 to-dark-900 border border-fed-gold-500/40 rounded-2xl overflow-hidden shadow-2xl shadow-fed-gold-500/10">
              {/* Top gold bar */}
              <div className="h-1 bg-gradient-to-r from-fed-gold-500 via-fed-red-500 to-fed-gold-500" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                {/* Photo - left */}
                <div className="relative h-64 md:h-auto md:min-h-[280px] bg-dark-700 overflow-hidden">
                  {president.image_url ? (
                    <img
                      src={president.image_url}
                      alt={getMemberName(president)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="text-light-400" size={64} />
                    </div>
                  )}
                  {/* Gradient overlay for image edge fade */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-dark-800/50 md:to-dark-800" />
                </div>

                {/* Info - right (2 cols) */}
                <div className="p-6 md:p-8 md:col-span-2 flex flex-col justify-center">
                  <span className="inline-flex items-center gap-2 self-start mb-4 text-xs font-bold uppercase tracking-[0.2em] text-fed-gold-500">
                    <span className="w-8 h-px bg-fed-gold-500" />
                    {getMemberPosition(president)}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white font-heading mb-3">
                    {getMemberName(president)}
                  </h3>
                  <p className="text-light-300 leading-relaxed text-sm md:text-base mb-6 max-w-xl">
                    {lang === 'fr'
                      ? 'Dirige strategiquement la federation, represente la FEGESPORT aupres des instances nationales et internationales, et oriente la vision de developpement de l\'esport guineen.'
                      : 'Strategically leads the federation, represents FEGESPORT before national and international bodies, and orients the development vision of Guinean esports.'}
                  </p>
                  <Link
                    to="/about"
                    className="inline-flex items-center self-start text-fed-gold-500 hover:text-fed-gold-400 font-medium text-sm transition-colors"
                  >
                    {lang === 'fr' ? 'Decouvrir la direction complete' : 'Discover full leadership'}
                    <ArrowRight size={14} className="ml-1.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* OTHER MEMBERS — Compact grid */}
        {otherMembers.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {otherMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
                viewport={{ once: true }}
                className="card p-4 text-center group hover:border-fed-red-500/30"
              >
                <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden border-2 border-dark-700 group-hover:border-fed-red-500/40 transition-colors">
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={getMemberName(member)}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full bg-dark-700 items-center justify-center ${
                    member.image_url ? 'hidden' : 'flex'
                  }`}>
                    <Users className="text-light-400" size={20} />
                  </div>
                </div>
                <h4 className="text-xs md:text-sm font-bold text-white mb-1 font-heading line-clamp-1">
                  {getMemberName(member)}
                </h4>
                <p className="text-[10px] md:text-xs text-fed-red-400 leading-tight line-clamp-2">
                  {getMemberPosition(member)}
                </p>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/about"
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-dark-800 border border-fed-gold-500/30 hover:bg-fed-gold-500/10 text-fed-gold-500 hover:text-fed-gold-400 font-medium text-sm transition-all"
          >
            {lang === 'fr' ? 'Voir l\'equipe complete' : 'View full team'}
            <ArrowRight size={14} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GovernanceSection;
