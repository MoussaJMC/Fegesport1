import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Star, Building } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

interface CommunityStats {
  players: number;
  clubs: number;
  partners: number;
}

const CommunityPage: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<CommunityStats>({
    players: 200,
    clubs: 15,
    partners: 8
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Try to get members count
      const { count: playersCount, error: playersError } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('member_type', 'player');
      
      // Try to get clubs count
      const { count: clubsCount, error: clubsError } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('member_type', 'club');
      
      // Try to get partners count
      const { count: partnersCount, error: partnersError } = await supabase
        .from('partners')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      // Update stats with real data if available
      setStats({
        players: playersCount || 200,
        clubs: clubsCount || 15,
        partners: partnersCount || 8
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Keep default stats on error
    } finally {
      setLoading(false);
    }
  };

  const members = {
    players: [
      {
        name: 'Mamadou Diallo',
        gamertag: 'MamaDiablo',
        type: 'Joueur',
        level: 'Professionnel',
        image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
        achievements: ['Champion National FIFA 2024', 'Top 3 PUBG Mobile']
      },
      {
        name: 'Aïssata Camara',
        gamertag: 'AissaGamer',
        type: 'Joueur',
        level: 'Semi-Pro',
        image: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg',
        achievements: ['Finaliste Valorant Open']
      }
    ],
    clubs: [
      {
        name: 'Conakry Gaming',
        type: 'Club',
        members: 25,
        image: 'https://images.pexels.com/photos/7862608/pexels-photo-7862608.jpeg',
        achievements: ['Meilleur Club 2024']
      },
      {
        name: 'Team Alpha',
        type: 'Club',
        members: 18,
        image: 'https://images.pexels.com/photos/7915487/pexels-photo-7915487.jpeg',
        achievements: ['Vice-Champion League of Legends']
      }
    ],
    partners: [
      {
        name: 'TotalEnergies Guinée',
        type: 'Partenaire',
        category: 'Sponsor Principal',
        image: 'https://images.pexels.com/photos/2381465/pexels-photo-2381465.jpeg',
        contribution: 'Support des compétitions nationales'
      },
      {
        name: 'Orange Guinée',
        type: 'Partenaire',
        category: 'Partenaire Technique',
        image: 'https://images.pexels.com/photos/2381466/pexels-photo-2381466.jpeg',
        contribution: 'Infrastructure réseau'
      }
    ]
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.players.map((player, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-secondary-700 rounded-lg overflow-hidden"
              >
                <div className="h-48 relative">
                  <img
                    src={player.image}
                    alt={player.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Photo+non+disponible';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {player.level}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-1 card-title">{player.name}</h3>
                  <p className="text-primary-500 font-medium mb-4">{player.gamertag}</p>
                  <div className="space-y-2">
                    {player.achievements.map((achievement, i) => (
                      <div key={i} className="flex items-center text-gray-300">
                        <Star className="text-primary-500 mr-2 flex-shrink-0" size={16} />
                        <span className="card-description">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Clubs Section */}
      <section className="section bg-secondary-900">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">{t('community.sections.clubs')}</h2>
            <Building className="text-primary-500" size={32} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {members.clubs.map((club, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-secondary-800 rounded-lg overflow-hidden"
              >
                <div className="h-48 relative">
                  <img
                    src={club.image}
                    alt={club.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Photo+non+disponible';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {club.members} membres
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4 card-title">{club.name}</h3>
                  <div className="space-y-2">
                    {club.achievements.map((achievement, i) => (
                      <div key={i} className="flex items-center text-gray-300">
                        <Trophy className="text-primary-500 mr-2 flex-shrink-0" size={16} />
                        <span className="card-description">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="section bg-secondary-800">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">{t('community.sections.partners')}</h2>
            <Star className="text-primary-500" size={32} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {members.partners.map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-secondary-700 rounded-lg overflow-hidden"
              >
                <div className="h-48 relative">
                  <img
                    src={partner.image}
                    alt={partner.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Photo+non+disponible';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {partner.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 card-title">{partner.name}</h3>
                  <p className="text-gray-300 card-description">{partner.contribution}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CommunityPage;