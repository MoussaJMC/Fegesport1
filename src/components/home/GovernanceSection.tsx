import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import SectionHeader from '../ui/SectionHeader';

/**
 * GovernanceSection — Bureau Executif de la FEGESPORT
 *
 * Strategy:
 * 1. Try to fetch board members from Supabase (member_type in board roles)
 * 2. If no board members found, show static known governance data
 * 3. Static data ensures production NEVER shows an empty fallback
 */

interface BoardMember {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  name?: string;
  member_type: string;
  role?: string;
  title?: string;
  photo_url?: string;
  image_url?: string;
}

// Static governance data — real FEGESPORT leadership
// This ensures the section is NEVER empty in production
const STATIC_BOARD: BoardMember[] = [
  {
    id: 'static-president',
    first_name: 'Moussa',
    last_name: 'CAMARA',
    member_type: 'president',
    title: 'Fondateur & President',
  },
  {
    id: 'static-sg',
    first_name: '',
    last_name: '',
    member_type: 'secretary_general',
    title: 'Secretaire General',
  },
  {
    id: 'static-treasurer',
    first_name: '',
    last_name: '',
    member_type: 'treasurer',
    title: 'Tresorier',
  },
];

const BOARD_ROLES = ['president', 'vice_president', 'secretary_general', 'treasurer', 'board_member'];

const GovernanceSection: React.FC = () => {
  const { i18n } = useTranslation();
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [usedStatic, setUsedStatic] = useState(false);
  const lang = i18n.language === 'fr' ? 'fr' : 'en';

  useEffect(() => {
    fetchBoardMembers();
  }, []);

  const fetchBoardMembers = async () => {
    try {
      // Try fetching board members by member_type
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .in('member_type', BOARD_ROLES)
        .limit(8);

      if (error) {
        console.error('Error fetching board members:', error);
        setMembers(STATIC_BOARD.filter(m => m.first_name || m.last_name));
        setUsedStatic(true);
        return;
      }

      if (data && data.length > 0) {
        setMembers(data);
        setUsedStatic(false);
      } else {
        // No board members in DB — use static data
        setMembers(STATIC_BOARD.filter(m => m.first_name || m.last_name));
        setUsedStatic(true);
      }
    } catch (err) {
      console.error('Error in fetchBoardMembers:', err);
      setMembers(STATIC_BOARD.filter(m => m.first_name || m.last_name));
      setUsedStatic(true);
    } finally {
      setLoading(false);
    }
  };

  const getMemberName = (member: BoardMember): string => {
    if (member.full_name) return member.full_name;
    if (member.name) return member.name;
    const parts = [member.first_name, member.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : (lang === 'fr' ? 'Membre' : 'Member');
  };

  const getRoleLabel = (member: BoardMember): string => {
    // Use title if available (for static data)
    if (member.title) return member.title;

    const role = member.member_type || member.role || '';
    const labels: Record<string, { fr: string; en: string }> = {
      president: { fr: 'President', en: 'President' },
      vice_president: { fr: 'Vice-President', en: 'Vice-President' },
      secretary_general: { fr: 'Secretaire General', en: 'Secretary General' },
      treasurer: { fr: 'Tresorier', en: 'Treasurer' },
      board_member: { fr: 'Membre du Bureau', en: 'Board Member' },
    };
    return labels[role]?.[lang] || role;
  };

  const getRolePriority = (member: BoardMember): number => {
    const role = member.member_type || member.role || '';
    const priorities: Record<string, number> = {
      president: 1,
      vice_president: 2,
      secretary_general: 3,
      treasurer: 4,
      board_member: 5,
    };
    return priorities[role] || 99;
  };

  const isPresident = (member: BoardMember): boolean => {
    return (member.member_type || member.role) === 'president';
  };

  const sortedMembers = [...members].sort(
    (a, b) => getRolePriority(a) - getRolePriority(b)
  );

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

        {sortedMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`card p-6 text-center ${
                  isPresident(member) ? 'border-fed-gold-500/50 sm:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-4 overflow-hidden border-2 ${
                  isPresident(member) ? 'border-fed-gold-500' : 'border-dark-700'
                }`}>
                  {(member.photo_url || member.image_url) ? (
                    <img
                      src={member.photo_url || member.image_url}
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
                  <div className={`w-full h-full bg-dark-700 flex items-center justify-center ${
                    (member.photo_url || member.image_url) ? 'hidden' : ''
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
                  {getRoleLabel(member)}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="card-featured p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-fed-gold-500/10 border border-fed-gold-500/30 flex items-center justify-center mx-auto mb-4">
                <Shield className="text-fed-gold-500" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-heading">
                {lang === 'fr'
                  ? 'Organigramme en cours de publication'
                  : 'Organization chart being published'}
              </h3>
              <p className="text-light-400 mb-6">
                {lang === 'fr'
                  ? 'Les informations detaillees sur la gouvernance de la federation seront bientot disponibles.'
                  : 'Detailed governance information will be available soon.'}
              </p>
            </div>
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/about"
            className="inline-flex items-center text-fed-gold-500 hover:text-fed-gold-400 font-medium transition-colors"
          >
            {lang === 'fr' ? 'Voir l\'organigramme complet' : 'View full organization chart'}
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GovernanceSection;
