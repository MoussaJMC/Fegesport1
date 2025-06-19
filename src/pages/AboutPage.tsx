import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Award, Shield, Users, Globe } from 'lucide-react';

const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="bg-primary-700 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('about.title')}</h1>
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
              <h2 className="text-3xl font-bold mb-4">{t('about.mission.title')}</h2>
              <div className="w-20 h-1 bg-primary-600 mb-6"></div>
              <p className="text-lg text-gray-700 mb-4">
                {t('about.mission.description')}
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">{t('about.vision.title')}</h2>
              <div className="w-20 h-1 bg-primary-600 mb-6"></div>
              <p className="text-lg text-gray-700 mb-4">
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
            <h2 className="text-3xl font-bold mb-4">{t('about.values.title')}</h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
            <p className="text-lg max-w-3xl mx-auto">
              {t('about.values.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
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
            <h2 className="text-3xl font-bold mb-4">Notre Direction</h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
            <p className="text-lg max-w-3xl mx-auto">
              La FEGESPORT est dirigée par une équipe de professionnels passionnés et engagés, apportant expertise 
              et vision au développement de l'esport guinéen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            <div className="card overflow-hidden">
              <div className="h-72 bg-gray-200 relative">
                <img 
                  src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg" 
                  alt="Président" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Mamadou Diallo</h3>
                <p className="text-primary-600 font-medium mb-4">Président</p>
                <p className="text-gray-600">
                  Entrepreneur visionnaire et passionné d'esport, Mamadou dirige la FEGESPORT avec l'ambition 
                  de faire de la Guinée une référence de l'esport en Afrique.
                </p>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="h-72 bg-gray-200 relative">
                <img 
                  src="https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg" 
                  alt="Secrétaire Générale" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Aïssata Camara</h3>
                <p className="text-primary-600 font-medium mb-4">Secrétaire Générale</p>
                <p className="text-gray-600">
                  Forte d'une expérience de 15 ans dans l'administration sportive, Aïssata coordonne 
                  l'ensemble des activités de la fédération.
                </p>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="h-72 bg-gray-200 relative">
                <img 
                  src="https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg" 
                  alt="Directeur Technique" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Ibrahima Sow</h3>
                <p className="text-primary-600 font-medium mb-4">Directeur Technique</p>
                <p className="text-gray-600">
                  Ancien joueur professionnel et expert technique, Ibrahima supervise tous les aspects 
                  compétitifs et la formation des arbitres.
                </p>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="h-72 bg-gray-200 relative">
                <img 
                  src="https://images.pexels.com/photos/2381469/pexels-photo-2381469.jpeg" 
                  alt="Directrice Marketing" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Fatoumata Barry</h3>
                <p className="text-primary-600 font-medium mb-4">Directrice Marketing</p>
                <p className="text-gray-600">
                  Spécialiste en marketing digital, Fatoumata développe la stratégie de communication 
                  et les partenariats de la FEGESPORT.
                </p>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="h-72 bg-gray-200 relative">
                <img 
                  src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg" 
                  alt="Directeur des Compétitions" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Sékou Condé</h3>
                <p className="text-primary-600 font-medium mb-4">Directeur des Compétitions</p>
                <p className="text-gray-600">
                  Expert en organisation d'événements esport, Sékou coordonne l'ensemble des 
                  compétitions nationales et internationales.
                </p>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="h-72 bg-gray-200 relative">
                <img 
                  src="https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg" 
                  alt="Directrice du Développement" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Mariama Touré</h3>
                <p className="text-primary-600 font-medium mb-4">Directrice du Développement</p>
                <p className="text-gray-600">
                  Chargée du développement des programmes jeunesse et de l'expansion de 
                  l'esport dans toutes les régions de Guinée.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Notre Histoire</h2>
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