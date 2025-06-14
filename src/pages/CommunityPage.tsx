import React from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Star, Building } from 'lucide-react';
import { useCommunityStats } from '../hooks/useCommunityStats';

const CommunityPage: React.FC = () => {
  const { stats, isLoading } = useCommunityStats();

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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Notre Communauté</h1>
            <p className="text-xl">
              Découvrez les membres actifs de la FEGESPORT : joueurs, clubs et partenaires 
              qui font vivre l'esport guinéen.
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
                {isLoading ? (
                  <div className="animate-pulse h-10 w-20 bg-secondary-700 rounded mx-auto" />
                ) : (
                  `${stats?.players || 0}+`
                )}
              </div>
              <div className="text-gray-400">Joueurs Inscrits</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-secondary-800 p-6 rounded-lg text-center"
            >
              <Building className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <div className="text-4xl font-bold text-white mb-2">
                {isLoading ? (
                  <div className="animate-pulse h-10 w-20 bg-secondary-700 rounded mx-auto" />
                ) : (
                  stats?.clubs || 0
                )}
              </div>
              <div className="text-gray-400">Clubs Officiels</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-secondary-800 p-6 rounded-lg text-center"
            >
              <Star className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <div className="text-4xl font-bold text-white mb-2">
                {isLoading ? (
                  <div className="animate-pulse h-10 w-20 bg-secondary-700 rounded mx-auto" />
                ) : (
                  stats?.partners || 0
                )}
              </div>
              <div className="text-gray-400">Partenaires</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Players Section */}
      <section className="section bg-secondary-800">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Joueurs Pro</h2>
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
                  />
                  <div className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {player.level}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{player.name}</h3>
                  <p className="text-primary-500 font-medium mb-4">{player.gamertag}</p>
                  <div className="space-y-2">
                    {player.achievements.map((achievement, i) => (
                      <div key={i} className="flex items-center text-gray-300">
                        <Star className="text-primary-500 mr-2" size={16} />
                        {achievement}
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
            <h2 className="text-3xl font-bold text-white">Clubs</h2>
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
                  />
                  <div className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {club.members} membres
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">{club.name}</h3>
                  <div className="space-y-2">
                    {club.achievements.map((achievement, i) => (
                      <div key={i} className="flex items-center text-gray-300">
                        <Trophy className="text-primary-500 mr-2" size={16} />
                        {achievement}
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
            <h2 className="text-3xl font-bold text-white">Partenaires</h2>
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
                  />
                  <div className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {partner.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{partner.name}</h3>
                  <p className="text-gray-300">{partner.contribution}</p>
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