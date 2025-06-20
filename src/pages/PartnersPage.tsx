import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Handshake, Trophy, Users, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const PartnersPage: React.FC = () => {
  const { t } = useTranslation();

  const partners = [
    {
      category: t('partners.title'),
      items: [
        {
          name: 'Ministère de la Jeunesse et des Sports',
          logo: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg',
          description: 'Soutien officiel du gouvernement guinéen pour le développement de l\'esport'
        },
        {
          name: 'Comité National Olympique',
          logo: 'https://images.pexels.com/photos/2381463/pexels-photo-2381463.jpeg',
          description: 'Partenaire pour la reconnaissance de l\'esport comme discipline sportive'
        }
      ]
    },
    {
      category: 'Partenaires Techniques',
      items: [
        {
          name: 'Gaming Academy',
          logo: 'https://images.pexels.com/photos/7915487/pexels-photo-7915487.jpeg',
          description: 'Formation et développement des talents esport'
        },
        {
          name: 'ESL Gaming Africa',
          logo: 'https://images.pexels.com/photos/7862608/pexels-photo-7862608.jpeg',
          description: 'Organisation de tournois et événements internationaux'
        }
      ]
    },
    {
      category: 'Sponsors Officiels',
      items: [
        {
          name: 'TotalEnergies Guinée',
          logo: 'https://images.pexels.com/photos/2381465/pexels-photo-2381465.jpeg',
          description: 'Sponsor principal des championnats nationaux'
        },
        {
          name: 'Orange Guinée',
          logo: 'https://images.pexels.com/photos/2381466/pexels-photo-2381466.jpeg',
          description: 'Partenaire connectivité pour les compétitions en ligne'
        }
      ]
    }
  ];

  const benefits = [
    {
      icon: <Trophy size={24} />,
      title: t('partners.benefits.visibility'),
      description: t('partners.benefits.visibility_desc')
    },
    {
      icon: <Users size={24} />,
      title: t('partners.benefits.network'),
      description: t('partners.benefits.network_desc')
    },
    {
      icon: <Globe size={24} />,
      title: t('partners.benefits.international'),
      description: t('partners.benefits.international_desc')
    }
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="bg-primary-700 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">{t('partners.title')}</h1>
            <p className="text-xl">
              {t('partners.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="section bg-white">
        <div className="container-custom">
          {partners.map((category, index) => (
            <div key={index} className="mb-16 last:mb-0">
              <h2 className="text-2xl font-bold mb-8">{category.category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {category.items.map((partner, partnerIndex) => (
                  <motion.div
                    key={partnerIndex}
                    className="card overflow-hidden"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="h-48 bg-gray-100">
                      <img 
                        src={partner.logo} 
                        alt={partner.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Logo+non+disponible';
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 card-title">{partner.name}</h3>
                      <p className="text-gray-600 card-description">{partner.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('partners.become')}</h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
            <p className="text-lg max-w-2xl mx-auto">
              Rejoignez-nous dans notre mission de développer l'esport en Guinée et 
              bénéficiez d'une visibilité unique auprès d'une audience engagée.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="card p-6"
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <div className="text-primary-600">{benefit.icon}</div>
                </div>
                <h3 className="text-xl font-bold mb-3 card-title">{benefit.title}</h3>
                <p className="text-gray-600 card-description">{benefit.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/contact" className="btn bg-primary-600 hover:bg-primary-700 text-white text-lg px-8">
              {t('contact.title')}
            </Link>
          </div>
        </div>
      </section>

      {/* Partnership Process */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('partners.process.title')}</h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative pl-8 pb-12 border-l-2 border-primary-300">
              <div className="absolute top-0 left-0 w-8 h-8 bg-primary-600 rounded-full -translate-x-1/2 flex items-center justify-center text-white font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">{t('partners.process.contact')}</h3>
              <p className="text-gray-600">
                {t('partners.process.contact_desc')}
              </p>
            </div>

            <div className="relative pl-8 pb-12 border-l-2 border-primary-300">
              <div className="absolute top-0 left-0 w-8 h-8 bg-primary-600 rounded-full -translate-x-1/2 flex items-center justify-center text-white font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">{t('partners.process.proposal')}</h3>
              <p className="text-gray-600">
                {t('partners.process.proposal_desc')}
              </p>
            </div>

            <div className="relative pl-8 pb-12 border-l-2 border-primary-300">
              <div className="absolute top-0 left-0 w-8 h-8 bg-primary-600 rounded-full -translate-x-1/2 flex items-center justify-center text-white font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">{t('partners.process.finalization')}</h3>
              <p className="text-gray-600">
                {t('partners.process.finalization_desc')}
              </p>
            </div>

            <div className="relative pl-8">
              <div className="absolute top-0 left-0 w-8 h-8 bg-primary-600 rounded-full -translate-x-1/2 flex items-center justify-center text-white font-bold">
                4
              </div>
              <h3 className="text-xl font-bold mb-2">{t('partners.process.activation')}</h3>
              <p className="text-gray-600">
                {t('partners.process.activation_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartnersPage;