import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Star, Building } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchCommunityStats, subscribeToCommunityStats } from '../lib/communityStats';
import { supabase } from '../lib/supabase';

interface CommunityStats {
  players: number;
  clubs: number;
  partners: number;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  member_type: 'player' | 'club' | 'partner';
  status: string;
  age_category?: string;
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
  const { t } = useTranslation();
  const [stats, setStats] = useState<CommunityStats>({
    players: 0,
    clubs: 0,
    partners: 0
  });
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Member[]>([]);
  const [clubs, setClubs] = useState<Member[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    fetchStats();
    fetchMembers();
    fetchPartners();

    // Subscribe to real-time updates for community stats
    const channel = subscribeToCommunityStats(() => {
      console.log('Community stats changed, refreshing...');
      fetchStats();
      fetchMembers();
      fetchPartners();
    });

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const communityStats = await fetchCommunityStats();
      setStats(communityStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data: playersData } = await supabase
        .from('members')
        .select('*')
        .eq('member_type', 'player')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6);

      const { data: clubsData } = await supabase
        .from('members')
        .select('*')
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


  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="bg-primary-700 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">{t('community.title')}</h1>
            <p className="text-xl">
              {t('community.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-secondary-900">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-secondary-800 p-6 rounded-lg text-center"
            >
              <Users className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <div className="text-4xl font-bold text-white mb-2">
                {loading ? (
                  <div className="animate-pulse h-10 w-20 bg-secondary-700 rounded mx-auto" />
                ) : (
                  `${stats.players}+`
                )}
              </div>
              <div className="text-gray-400">{t('community.stats.players')}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-secondary-800 p-6 rounded-lg text-center"
            >
              <Building className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <div className="text-4xl font-bold text-white mb-2">
                {loading ? (
                  <div className="animate-pulse h-10 w-20 bg-secondary-700 rounded mx-auto" />
                ) : (
                  stats.clubs
                )}
              </div>
              <div className="text-gray-400">{t('community.stats.clubs')}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-secondary-800 p-6 rounded-lg text-center"
            >
              <Star className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <div className="text-4xl font-bold text-white mb-2">
                {loading ? (
                  <div className="animate-pulse h-10 w-20 bg-secondary-700 rounded mx-auto" />
                ) : (
                  stats.partners
                )}
              </div>
              <div className="text-gray-400">{t('community.stats.partners')}</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Players Section */}
      <section className="section bg-secondary-800">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">{t('community.sections.players')}</h2>
            <Trophy className="text-primary-500" size={32} />
          </div>

          {players.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Aucun joueur inscrit pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-secondary-700 rounded-lg overflow-hidden"
                >
                  <div className="h-48 relative bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                    <Users className="w-20 h-20 text-white opacity-50" />
                    {player.age_category && (
                      <div className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {player.age_category}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-1 card-title">
                      {player.first_name} {player.last_name}
                    </h3>
                    <p className="text-primary-500 font-medium mb-4">{player.email}</p>
                    <div className="flex items-center text-gray-300">
                      <Trophy className="text-primary-500 mr-2 flex-shrink-0" size={16} />
                      <span className="card-description">Joueur actif</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Clubs Section */}
      <section className="section bg-secondary-900">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">{t('community.sections.clubs')}</h2>
            <Building className="text-primary-500" size={32} />
          </div>

          {clubs.length === 0 ? (
            <div className="text-center py-12">
              <Building className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Aucun club inscrit pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {clubs.map((club, index) => (
                <motion.div
                  key={club.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-secondary-800 rounded-lg overflow-hidden"
                >
                  <div className="h-48 relative bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                    <Building className="w-20 h-20 text-white opacity-50" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4 card-title">
                      {club.first_name}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-300">
                        <Trophy className="text-primary-500 mr-2 flex-shrink-0" size={16} />
                        <span className="card-description">Club actif</span>
                      </div>
                      {club.email && (
                        <div className="flex items-center text-gray-300">
                          <Star className="text-primary-500 mr-2 flex-shrink-0" size={16} />
                          <span className="card-description text-sm">{club.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Partners Section */}
      <section className="section bg-secondary-800">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">{t('community.sections.partners')}</h2>
            <Star className="text-primary-500" size={32} />
          </div>

          {partners.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Aucun partenaire inscrit pour le moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {partners.map((partner, index) => (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-secondary-700 rounded-lg overflow-hidden"
                >
                  <div className="h-48 relative bg-white flex items-center justify-center p-6">
                    {partner.logo_url ? (
                      <img
                        src={partner.logo_url}
                        alt={partner.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Star className="w-20 h-20 text-primary-600 opacity-50" />
                    )}
                    <div className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Partenaire
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 card-title">{partner.name}</h3>
                    <p className="text-gray-300 card-description">{partner.description}</p>
                    {partner.website_url && (
                      <a
                        href={partner.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary-500 hover:text-primary-400 mt-3 text-sm"
                      >
                        Visiter le site web
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CommunityPage;