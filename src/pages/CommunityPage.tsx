import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Star, Building, Gamepad2, Award, ArrowRight, Handshake } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { fetchCommunityStats, subscribeToCommunityStats } from '../lib/communityStats';
import { supabase } from '../lib/supabase';
import SectionHeader from '../components/ui/SectionHeader';
import AnimatedCounter from '../components/ui/AnimatedCounter';

interface CommunityStats {
  players: number;
  clubs: number;
  partners: number;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  member_type: 'player' | 'club' | 'partner';
  status: string;
  age_category?: string;
  city?: string;
  created_at: string;
}

interface Partner {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  website_url?: string;
  status: string;
}

const CommunityPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'fr' ? 'fr' : 'en';
  const [stats, setStats] = useState<CommunityStats>({ players: 0, clubs: 0, partners: 0 });
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Member[]>([]);
  const [clubs, setClubs] = useState<Member[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    fetchAllData();

    let channel: any = null;
    try {
      channel = subscribeToCommunityStats(() => {
        fetchAllData();
      });
    } catch (err) {
      console.error('Error subscribing to community stats:', err);
    }

    return () => {
      if (channel) {
        try { channel.unsubscribe(); } catch (e) { /* silent */ }
      }
    };
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.allSettled([fetchStats(), fetchMembers(), fetchPartners()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const communityStats = await fetchCommunityStats();
      setStats(communityStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data: playersData } = await supabase
        .from('members')
        .select('id, first_name, last_name, member_type, status, age_category, city, created_at')
        .eq('member_type', 'player')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(12);

      const { data: clubsData } = await supabase
        .from('members')
        .select('id, first_name, last_name, member_type, status, city, created_at')
        .eq('member_type', 'club')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);

      setPlayers(playersData || []);
      setClubs(clubsData || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchPartners = async () => {
    try {
      const { data } = await supabase
        .from('partners')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);

      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
  };

  const getInitials = (first: string, last: string): string => {
    return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
  };

  return (
    <div className="pt-20">
      {/* ============ HERO ============ */}
      <section className="relative bg-dark-950 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 -left-32 w-96 h-96 bg-fed-red-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-fed-gold-500/5 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <span className="overline block mb-4">
              {lang === 'fr' ? 'ECOSYSTEME ESPORT GUINEEN' : 'GUINEAN ESPORTS ECOSYSTEM'}
            </span>
            <h1 className="text-hero font-heading text-white mb-6">
              {t('community.title')}
            </h1>
            <p className="text-lg md:text-xl text-light-300">
              {t('community.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="section bg-section-alt relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fed-gold-500/30 to-transparent" />
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <AnimatedCounter
              end={stats.players}
              suffix="+"
              label={lang === 'fr' ? 'Joueurs Inscrits' : 'Registered Players'}
              icon={<Gamepad2 size={24} />}
            />
            <AnimatedCounter
              end={stats.clubs}
              label={lang === 'fr' ? 'Clubs Officiels' : 'Official Clubs'}
              icon={<Building size={24} />}
            />
            <AnimatedCounter
              end={stats.partners}
              label={lang === 'fr' ? 'Partenaires' : 'Partners'}
              icon={<Handshake size={24} />}
            />
          </div>
        </div>
      </section>

      {/* ============ JOUEURS ============ */}
      <section className="section bg-section-dark">
        <div className="container-custom">
          <SectionHeader
            overline={lang === 'fr' ? 'JOUEURS PRO' : 'PRO PLAYERS'}
            title={lang === 'fr' ? 'Nos Joueurs' : 'Our Players'}
            description={
              lang === 'fr'
                ? 'Les joueurs actifs de la communaute esport guineenne.'
                : 'Active players in the Guinean esports community.'
            }
            dividerColor="red"
          />

          {players.length === 0 ? (
            <div className="text-center py-12 card p-8">
              <Users className="w-14 h-14 text-dark-700 mx-auto mb-4" />
              <p className="text-light-400">
                {lang === 'fr' ? 'Aucun joueur inscrit pour le moment' : 'No registered players yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="card p-4 text-center group hover:border-fed-red-500/30"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-fed-red-500/20 to-fed-red-600/10 border border-fed-red-500/20 flex items-center justify-center mx-auto mb-3 group-hover:border-fed-red-500/40 transition-colors">
                    <span className="text-fed-red-400 font-bold text-sm font-heading">
                      {getInitials(player.first_name, player.last_name)}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white truncate">
                    {player.first_name} {player.last_name}
                  </h3>
                  {player.age_category && (
                    <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-fed-red-500/10 text-fed-red-400 border border-fed-red-500/20">
                      {player.age_category}
                    </span>
                  )}
                  {player.city && (
                    <p className="text-xs text-light-400 mt-1 truncate">{player.city}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {players.length > 0 && (
            <div className="text-center mt-8">
              <Link to="/membership" className="inline-flex items-center text-fed-gold-500 hover:text-fed-gold-400 font-medium transition-colors">
                {lang === 'fr' ? 'Devenir membre' : 'Become a member'}
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ============ CLUBS ============ */}
      <section className="section bg-section-alt">
        <div className="container-custom">
          <SectionHeader
            overline={lang === 'fr' ? 'CLUBS AFFILIES' : 'AFFILIATED CLUBS'}
            title={lang === 'fr' ? 'Nos Clubs' : 'Our Clubs'}
            dividerColor="gold"
          />

          {clubs.length === 0 ? (
            <div className="text-center py-12 card p-8">
              <Building className="w-14 h-14 text-dark-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2 font-heading">
                {lang === 'fr' ? 'Clubs en cours d\'affiliation' : 'Clubs being affiliated'}
              </h3>
              <p className="text-light-400 max-w-md mx-auto">
                {lang === 'fr'
                  ? 'Les clubs esport guineens pourront bientot s\'affilier a la FEGESPORT et rejoindre la communaute officielle.'
                  : 'Guinean esports clubs will soon be able to affiliate with FEGESPORT and join the official community.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubs.map((club, index) => (
                <motion.div
                  key={club.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card p-6 group hover:border-fed-gold-500/30"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-fed-gold-500/10 border border-fed-gold-500/20 flex items-center justify-center group-hover:bg-fed-gold-500/20 transition-colors">
                      <Building className="text-fed-gold-500" size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-heading">{club.first_name}</h3>
                      {club.city && (
                        <p className="text-sm text-light-400">{club.city}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      {lang === 'fr' ? 'Club actif' : 'Active club'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ PARTENAIRES ============ */}
      <section className="section bg-section-dark">
        <div className="container-custom">
          <SectionHeader
            overline={lang === 'fr' ? 'ILS NOUS SOUTIENNENT' : 'THEY SUPPORT US'}
            title={lang === 'fr' ? 'Nos Partenaires' : 'Our Partners'}
            dividerColor="gold"
          />

          {partners.length === 0 ? (
            <div className="text-center py-12 card p-8">
              <Handshake className="w-14 h-14 text-dark-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2 font-heading">
                {lang === 'fr' ? 'Partenariats en developpement' : 'Partnerships in development'}
              </h3>
              <p className="text-light-400 max-w-md mx-auto mb-6">
                {lang === 'fr'
                  ? 'La FEGESPORT recherche des partenaires institutionnels et prives pour developper l\'esport en Guinee.'
                  : 'FEGESPORT is looking for institutional and private partners to develop esports in Guinea.'}
              </p>
              <Link to="/contact" className="btn btn-secondary">
                {lang === 'fr' ? 'Devenir partenaire' : 'Become a partner'}
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {partners.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card overflow-hidden group hover:border-fed-gold-500/30"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Logo */}
                    <div className="sm:w-40 h-32 sm:h-auto bg-dark-700 flex items-center justify-center p-4 flex-shrink-0">
                      {partner.logo_url ? (
                        <img
                          src={partner.logo_url}
                          alt={partner.name}
                          className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <Handshake className="text-light-400" size={32} />
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-5 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-white font-heading">{partner.name}</h3>
                        <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-fed-gold-500/10 text-fed-gold-500 border border-fed-gold-500/20 flex-shrink-0 ml-2">
                          Partenaire
                        </span>
                      </div>
                      <p className="text-light-400 text-sm line-clamp-2 mb-3">{partner.description}</p>
                      {partner.website_url && (
                        <a
                          href={partner.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-fed-gold-500 hover:text-fed-gold-400 text-sm font-medium transition-colors"
                        >
                          {lang === 'fr' ? 'Visiter le site' : 'Visit website'}
                          <ArrowRight size={14} className="ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ CTA REJOINDRE ============ */}
      <section className="section bg-section-alt relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fed-red-500/30 to-transparent" />
        <div className="container-custom text-center">
          <span className="overline block mb-4">
            {lang === 'fr' ? 'REJOIGNEZ LE MOUVEMENT' : 'JOIN THE MOVEMENT'}
          </span>
          <h2 className="section-title mb-4">
            {lang === 'fr' ? 'Faites Partie de la Communaute' : 'Be Part of the Community'}
          </h2>
          <p className="text-light-400 text-lg max-w-2xl mx-auto mb-8">
            {lang === 'fr'
              ? 'Joueur, club ou partenaire — rejoignez la FEGESPORT et contribuez au developpement de l\'esport en Guinee.'
              : 'Player, club or partner — join FEGESPORT and contribute to the development of esports in Guinea.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/membership" className="btn btn-primary px-8 py-3 shadow-lg shadow-fed-red-500/20">
              {lang === 'fr' ? 'Devenir membre' : 'Become a member'}
            </Link>
            <Link to="/contact" className="btn btn-secondary px-8 py-3">
              {lang === 'fr' ? 'Nous contacter' : 'Contact us'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CommunityPage;
