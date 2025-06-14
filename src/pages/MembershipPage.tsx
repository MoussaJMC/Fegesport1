import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, Users, Award, CheckCircle } from 'lucide-react';
import { Toaster } from 'sonner';
import { Link } from 'react-router-dom';
import MembershipForm from '../components/forms/MembershipForm';

const MembershipPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const membershipBenefits = [
    {
      icon: <Shield size={24} />,
      title: 'Reconnaissance Officielle',
      description: 'Statut officiel reconnu par la FEGESPORT et ses partenaires internationaux'
    },
    {
      icon: <Users size={24} />,
      title: 'Réseau Professionnel',
      description: 'Accès à un réseau d\'acteurs de l\'esport guinéen et international'
    },
    {
      icon: <Award size={24} />,
      title: 'Compétitions Officielles',
      description: 'Participation aux tournois et événements officiels de la FEGESPORT'
    }
  ];

  const membershipTypes = [
    {
      id: 'player',
      title: 'Joueur Individuel',
      price: '15,000',
      period: 'par an',
      features: [
        'Licence officielle de joueur',
        'Participation aux tournois officiels',
        'Accès aux formations',
        'Newsletter exclusive',
        'Badge digital officiel'
      ]
    },
    {
      id: 'club',
      title: 'Club Esport',
      price: '150,000',
      period: 'par an',
      features: [
        'Statut de club officiel',
        'Jusqu\'à 10 licences joueurs',
        'Organisation de tournois',
        'Support marketing',
        'Visibilité sur le site FEGESPORT'
      ]
    },
    {
      id: 'partner',
      title: 'Partenaire',
      price: 'Sur mesure',
      period: '',
      features: [
        'Statut de partenaire officiel',
        'Logo sur le site et événements',
        'Accès VIP aux événements',
        'Communication dédiée',
        'Programme personnalisé'
      ]
    }
  ];

  return (
    <div className="pt-20">
      <Toaster position="top-right" />
      
      {/* Hero Section */}
      <section className="bg-secondary-900 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Devenir Membre</h1>
            <p className="text-xl text-gray-300">
              Rejoignez la FEGESPORT et participez au développement de l'esport guinéen. 
              Découvrez nos différentes formules d'adhésion adaptées à vos besoins.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section bg-secondary-800">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Pourquoi Nous Rejoindre ?</h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {membershipBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-secondary-700 p-6 rounded-lg"
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-primary-600/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <div className="text-primary-500">{benefit.icon}</div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{benefit.title}</h3>
                <p className="text-gray-300">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Types Section */}
      <section className="section bg-secondary-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Types d'Adhésion</h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {membershipTypes.map((type, index) => (
              <motion.div
                key={index}
                className={`bg-secondary-800 p-6 rounded-lg border-2 ${
                  selectedPlan === type.id 
                    ? 'border-primary-500' 
                    : 'border-transparent'
                }`}
                whileHover={{ y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h3 className="text-2xl font-bold mb-2 text-white">{type.title}</h3>
                <div className="text-3xl font-bold text-primary-500 mb-1">
                  {type.price} <span className="text-sm font-normal text-gray-400">FCFA</span>
                </div>
                <p className="text-gray-400 mb-6">{type.period}</p>
                <ul className="space-y-3">
                  {type.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-gray-300">
                      <CheckCircle size={20} className="text-primary-500 mr-2 flex-shrink-0 mt-1" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  className={`btn w-full mt-6 ${
                    selectedPlan === type.id
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-secondary-700 hover:bg-secondary-600 text-white'
                  }`}
                  onClick={() => setSelectedPlan(type.id)}
                >
                  Sélectionner
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      {selectedPlan && (
        <section className="section bg-secondary-800">
          <div className="container-custom max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-white">Formulaire d'Adhésion</h2>
              <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
            </div>

            <div className="bg-secondary-700 p-8 rounded-lg">
              <MembershipForm />
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="section bg-secondary-900">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">Des Questions ?</h2>
            <p className="text-lg text-gray-300 mb-8">
              Notre équipe est à votre disposition pour répondre à toutes vos questions concernant l'adhésion à la FEGESPORT.
            </p>
            <Link to="/contact" className="btn bg-primary-600 hover:bg-primary-700 text-white">
              Contactez-nous
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MembershipPage;