import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Award, Shield, Users, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeadershipMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  image_url: string;
  order: number;
  is_active: boolean;
}

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const [leadershipTeam, setLeadershipTeam] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeadershipTeam();
  }, []);

  const fetchLeadershipTeam = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('leadership_team')
        .select('*')
        .eq('is_active', true)
        .order('order', { ascending: true });

      if (error) {
        console.error('Error fetching leadership team:', error);
        // If table doesn't exist or other error, use default data
        setLeadershipTeam(getDefaultLeadershipTeam());
      } else if (data && data.length > 0) {
        setLeadershipTeam(data);
      } else {
        // No data found, use default data
        setLeadershipTeam(getDefaultLeadershipTeam());
      }
    } catch (error) {
      console.error('Error in fetchLeadershipTeam:', error);
      setLeadershipTeam(getDefaultLeadershipTeam());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultLeadershipTeam = (): LeadershipMember[] => {
    return [
      {
        id: '1',
        name: 'Mamadou Diallo',
        position: 'Président',
        bio: 'Entrepreneur visionnaire et passionné d\'esport, Mamadou dirige la FEGESPORT avec l\'ambition de faire de la Guinée une référence de l\'esport en Afrique.',
        image_url: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
        order: 1,
        is_active: true
      },
      {
        id: '2',
        name: 'Aïssata Camara',
        position: 'Secrétaire Générale',
        bio: 'Forte d\'une expérience de 15 ans dans l\'administration sportive, Aïssata coordonne l\'ensemble des activités de la fédération.',
        image_url: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg',
        order: 2,
        is_active: true
      },
      {
        id: '3',
        name: 'Ibrahima Sow',
        position: 'Directeur Technique',
        bio: 'Ancien joueur professionnel et expert technique, Ibrahima supervise tous les aspects compétitifs et la formation des arbitres.',
        image_url: 'https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg',
        order: 3,
        is_active: true
      },
      {
        id: '4',
        name: 'Fatoumata Barry',
        position: 'Directrice Marketing',
        bio: 'Spécialiste en marketing digital, Fatoumata développe la stratégie de communication et les partenariats de la FEGESPORT.',
        image_url: 'https://images.pexels.com/photos/2381469/pexels-photo-2381469.jpeg',
        order: 4,
        is_active: true
      },
      {
        id: '5',
        name: 'Sékou Condé',
        position: 'Directeur des Compétitions',
        bio: 'Expert en organisation d\'événements esport, Sékou coordonne l\'ensemble des compétitions nationales et internationales.',
        image_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
        order: 5,
        is_active: true
      },
      {
        id: '6',
        name: 'Mariama Touré',
        position: 'Directrice du Développement',
        bio: 'Chargée du développement des programmes jeunesse et de l\'expansion de l\'esport dans toutes les régions de Guinée.',
        image_url: 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg',
        order: 6,
        is_active: true
      }
    ];
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="bg-primary-700 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">{t('about.title')}</h1>
            <p className="text-xl">
              {t('about.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('about.mission.title')}</h2>
              <div className="w-20 h-1 bg-primary-600 mb-6"></div>
              <p className="text-base md:text-lg text-gray-700 mb-4">
                {t('about.mission.description')}
              </p>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('about.vision.title')}</h2>
              <div className="w-20 h-1 bg-primary-600 mb-6"></div>
              <p className="text-base md:text-lg text-gray-700 mb-4">
                {t('about.vision.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('about.values.title')}</h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              {t('about.values.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
            <motion.div 
              className="card p-6"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Award className="text-primary-600" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('about.values.excellence')}</h3>
              <p className="text-gray-600">
                {t('about.values.excellence_desc')}
              </p>
            </motion.div>

            <motion.div 
              className="card p-6"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Shield className="text-primary-600" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('about.values.integrity')}</h3>
              <p className="text-gray-600">
                {t('about.values.integrity_desc')}
              </p>
            </motion.div>

            <motion.div 
              className="card p-6"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Users className="text-primary-600" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('about.values.inclusivity')}</h3>
              <p className="text-gray-600">
                {t('about.values.inclusivity_desc')}
              </p>
            </motion.div>

            <motion.div 
              className="card p-6"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Globe className="text-primary-600" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{t('about.values.innovation')}</h3>
              <p className="text-gray-600">
                {t('about.values.innovation_desc')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Notre Direction</h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
            <p className="text-base md:text-lg max-w-3xl mx-auto">
              La FEGESPORT est dirigée par une équipe de professionnels passionnés et engagés, apportant expertise 
              et vision au développement de l'esport guinéen.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {leadershipTeam.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card overflow-hidden text-center"
                >
                  <div className="pt-8 pb-4 px-6 bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/150?text=Photo';
                        }}
                      />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1 card-title">{member.name}</h3>
                    <p className="text-primary-600 font-medium mb-4">{member.position}</p>
                    <p className="text-gray-600 card-description text-sm">
                      {member.bio}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* History */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Notre Histoire</h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative pl-8 pb-12 border-l-2 border-primary-300">
              <div className="absolute top-0 left-0 w-8 h-8 bg-primary-600 rounded-full -translate-x-1/2 flex items-center justify-center text-white font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Fondation (2009-2013)</h3>
              <p className="text-gray-600 mb-4">
                Création de la FEGESPORT par un groupe de passionnés d'esport guinéens avec la vision de structurer 
                et développer l'écosystème esport national.
              </p>
            </div>

            <div className="relative pl-8 pb-12 border-l-2 border-primary-300">
              <div className="absolute top-0 left-0 w-8 h-8 bg-primary-600 rounded-full -translate-x-1/2 flex items-center justify-center text-white font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Reconnaissance Officielle (2017)</h3>
              <p className="text-gray-600 mb-4">
                Obtention de la reconnaissance officielle par l'Administration du territoir (la ville de Conakry) puis le Ministère de la Jeunesse et des Sports, faisant de 
                la FEGESPORT l'organe officiel de gouvernance de l'esport en Guinée.
              </p>
            </div>

            <div className="relative pl-8 pb-12 border-l-2 border-primary-300">
              <div className="absolute top-0 left-0 w-8 h-8 bg-primary-600 rounded-full -translate-x-1/2 flex items-center justify-center text-white font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Premiers Championnats Nationaux (2018-Nos jours)</h3>
              <p className="text-gray-600 mb-4">
                Organisation des premiers championnats nationaux officiels dans plusieurs disciplines esport, 
                établissant les standards de compétition pour le pays.
              </p>
            </div>

            <div className="relative pl-8">
              <div className="absolute top-0 left-0 w-8 h-8 bg-primary-600 rounded-full -translate-x-1/2 flex items-center justify-center text-white font-bold">
                4
              </div>
              <h3 className="text-xl font-bold mb-2">Affiliation Internationale (2019 - Nos jours)</h3>
              <p className="text-gray-600 mb-4">
                Affiliation aux principales fédérations internationales d'esport ACDS, WESCO, IESF & GEF, permettant aux équipes guinéennes 
                de participer aux compétitions internationales sous les couleurs nationales.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;