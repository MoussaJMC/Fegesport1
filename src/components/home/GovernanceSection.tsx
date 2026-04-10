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
    const pos = member.position.toLowerCase();
    return pos.includes('president') || pos.includes('président') || member.order === 1;
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`card p-6 text-center ${
                isPresident(member) ? 'border-fed-gold-500/50' : ''
              }`}
            >
              <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-4 overflow-hidden border-2 ${
                isPresident(member) ? 'border-fed-gold-500' : 'border-dark-700'
              }`}>
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
                  <Users className="text-light-400" size={32} />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 font-heading">
                {getMemberName(member)}
              </h3>
              <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${
                isPresident(member)
                  ? 'bg-fed-gold-500/10 text-fed-gold-500 border border-fed-gold-500/30'
                  : 'bg-fed-red-500/10 text-fed-red-400 border border-fed-red-500/20'
              }`}>
                {getMemberPosition(member)}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/about"
            className="inline-flex items-center text-fed-gold-500 hover:text-fed-gold-400 font-medium transition-colors"
          >
            {lang === 'fr' ? 'Voir l\'equipe complete' : 'View full team'}
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GovernanceSection;
