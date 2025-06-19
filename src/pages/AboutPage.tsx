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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('about.title', 'À Propos de la FEGESPORT')}</h1>
            <p className="text-xl">
              {t('about.subtitle', 'La Fédération Guinéenne d\'Esport (FEGESPORT) est l\'organisation nationale officielle pour l\'esport en Guinée, dédiée à la promotion, la structuration et la représentation de l\'esport guinéen au niveau national et international.')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">{t('about.mission')}</h2>
              <div className="w-20 h-1 bg-primary-600 mb-6"></div>
              <p className="text-lg text-gray-700 mb-4">
                {t('about.missionText1', 'La FEGESPORT a pour mission de développer et promouvoir l\'esport en Guinée en créant un environnement structuré, inclusif et professionnel pour tous les acteurs de l\'écosystème.')}
              </p>
              <p className="text-lg text-gray-700">
                {t('about.missionText2', 'Nous travaillons à l\'élaboration de cadres réglementaires, à l\'organisation de compétitions officielles, et à la représentation des intérêts de la communauté esport guinéenne auprès des instances nationales et internationales.')}
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">{t('about.vision')}</h2>
              <div className="w-20 h-1 bg-primary-600 mb-6"></div>
              <p className="text-lg text-gray-700 mb-4">
                {t('about.visionText1', 'Notre vision est de positionner la Guinée comme un acteur majeur de l\'esport en Afrique, en construisant un écosystème esport durable, équitable et innovant qui crée des opportunités pour tous.')}
              </p>
              <p className="text-lg text-gray-700">
                {t('about.visionText2', 'Nous aspirons à une reconnaissance complète de l\'esport comme discipline sportive légitime et à l\'établissement de standards professionnels pour tous les aspects du secteur.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('about.values')}</h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
            <p className="text-lg max-w-3xl mx-auto">
              {t('about.valuesIntro', 'Nos actions sont guidées par un ensemble de valeurs fondamentales qui reflètent notre engagement envers l\'excellence, l\'intégrité et l\'inclusivité dans l\'esport.')}
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
              <h3 className="text-xl font-bold mb-3">{t('about.value1Title', 'Excellence')}</h3>
              <p className="text-gray-600">
                {t('about.value1Text', 'Nous promouvons et poursuivons l\'excellence dans tous les aspects de notre travail et de nos compétitions.')}
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
              <h3 className="text-xl font-bold mb-3">{t('about.value2Title', 'Intégrité')}</h3>
              <p className="text-gray-600">
                {t('about.value2Text', 'Nous agissons avec honnêteté, transparence et responsabilité dans toutes nos activités et décisions.')}
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
              <h3 className="text-xl font-bold mb-3">{t('about.value3Title', 'Inclusivité')}</h3>
              <p className="text-gray-600">
                {t('about.value3Text', 'Nous valorisons la diversité et nous nous engageons à créer un environnement esport inclusif et accessible à tous.')}
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
              <h3 className="text-xl font-bold mb-3">{t('about.value4Title', 'Innovation')}</h3>
              <p className="text-gray-600">
                {t('about.value4Text', 'Nous embrassons l\'innovation et cherchons constamment à améliorer et à faire évoluer l\'écosystème esport guinéen.')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('about.leadership')}</h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
            <p className="text-lg max-w-3xl mx-auto">
              {t('about.leadershipIntro', 'La FEGESPORT est dirigée par une équipe de professionnels passionnés et engagés, apportant expertise et vision au développement de l\'esport guinéen.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            <div className="card overflow-hidden">
              <div className="h-72 bg-gray-200 relative">
                <img 
                  src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg" 
                  alt={t('about.leader1Name', 'Mamadou Diallo')} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{t('about.leader1Name', 'Mamadou Diallo')}</h3>
                <p className="text-primary-600 font-medium mb-4">{t('about.leader1Title', 'Président')}</p>
                <p className="text-gray-600">
                  {t('about.leader1Bio', 'Entrepreneur visionnaire et passionné d\'esport, Mamadou dirige la FEGESPORT avec l\'ambition de faire de la Guinée une référence de l\'esport en Afrique.')}
                </p>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="h-72 bg-gray-200 relative">
                <img 
                  src="https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg" 
                  alt={t('about.leader2Name', 'Aïssata Camara')} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{t('about.leader2Name', 'Aïssata Camara')}</h3>
                <p className="text-primary-600 font-medium mb-4">{t('about.leader2Title', 'Secrétaire Générale')}</p>
                <p className="text-gray-600">
                  {t('about.leader2Bio', 'Forte d\'une expérience de 15 ans dans l\'administration sportive, Aïssata coordonne l\'ensemble des activités de la fédération.')}
                </p>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="h-72 bg-gray-200 relative">
                <img 
                  src="https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg" 
                  alt={t('about.leader3Name', 'Ibrahima Sow')} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{t('about.leader3Name', 'Ibrahima Sow')}</h3>
                <p className="text-primary-600 font-medium mb-4">{t('about.leader3Title', 'Directeur Technique')}</p>
                <p className="text-gray-600">
                  {t('about.leader3Bio', 'Ancien joueur professionnel et expert technique, Ibrahima supervise tous les aspects compétitifs et la formation des arbitres.')}
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
            <h2 className="text-3xl font-bold mb-4">{t('about.history')}</h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative pl-8 pb-12 border-l-2 border-primary-300">
              <div className="absolute top-0 left-0 w-8 h-8 bg-primary-600 rounded-full -translate-x-1/2 flex items-center justify-center text-white font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">{t('about.history1Title', 'Fondation (2009-2013)')}</h3>
              <p className="text-gray-600 mb-4">
                {t('about.history1Text', 'Création de la FEGESPORT par un groupe de passionnés d\'esport guinéens avec la vision de structurer et développer l\'écosystème esport national.')}
              </p>
            </div>

            <div className="relative pl-8 pb-12 border-l-2 border-primary-300">
              <div className="absolute top-0 left-0 w-8 h-8 bg-primary-600 rounded-full -translate-x-1/2 flex items-center justify-center text-white font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">{t('about.history2Title', 'Reconnaissance Officielle (2017)')}</h3>
              <p className="text-gray-600 mb-4">
                {t('about.history2Text', 'Obtention de la reconnaissance officielle par l\'Administration du territoir (la ville de Conakry) puis le Ministère de la Jeunesse et des Sports, faisant de la FEGESPORT l\'organe officiel de gouvernance de l\'esport en Guinée.')}
              </p>
            </div>

            <div className="relative pl-8 pb-12 border-l-2 border-primary-300">
              <div className="absolute top-0 left-0 w-8 h-8 bg-primary-600 rounded-full -translate-x-1/2 flex items-center justify-center text-white font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">{t('about.history3Title', 'Premiers Championnats Nationaux (2018-Nos jours)')}</h3>
              <p className="text-gray-600 mb-4">
                {t('about.history3Text', 'Organisation des premiers championnats nationaux officiels dans plusieurs disciplines esport, établissant les standards de compétition pour le pays.')}
              </p>
            </div>

            <div className="relative pl-8">
              <div className="absolute top-0 left-0 w-8 h-8 bg-primary-600 rounded-full -translate-x-1/2 flex items-center justify-center text-white font-bold">
                4
              </div>
              <h3 className="text-xl font-bold mb-2">{t('about.history4Title', 'Affiliation Internationale (2019 - Nos jours)')}</h3>
              <p className="text-gray-600 mb-4">
                {t('about.history4Text', 'Affiliation aux principales fédérations internationales d\'esport ACDS, WESCO, IESF & GEF, permettant aux équipes guinéennes de participer aux compétitions internationales sous les couleurs nationales.')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;