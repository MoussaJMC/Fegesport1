import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, Users, Award, CheckCircle } from 'lucide-react';
import { Toaster } from 'sonner';
import { Link } from 'react-router-dom';
import MembershipForm from '../components/forms/MembershipForm';
import { supabase } from '../lib/supabase';

interface MembershipType {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  features: string[];
  is_active: boolean;
}

const MembershipPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembershipTypes();
  }, []);

  const fetchMembershipTypes = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('membership_types')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching membership types:', error);
        // If table doesn't exist or other error, use default types
        setMembershipTypes(getDefaultMembershipTypes());
      } else if (data && data.length > 0) {
        setMembershipTypes(data);
      } else {
        // No data found, use default types
        setMembershipTypes(getDefaultMembershipTypes());
      }
    } catch (error) {
      console.error('Error in fetchMembershipTypes:', error);
      setMembershipTypes(getDefaultMembershipTypes());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultMembershipTypes = (): MembershipType[] => {
    return [
      {
        id: 'player',
        name: t('membership.types.player'),
        description: 'Adhésion pour les joueurs individuels',
        price: 15000,
        period: t('membership.types.player_period'),
        features: [
          'Licence officielle de joueur',
          'Participation aux tournois officiels',
          'Accès aux formations',
          'Newsletter exclusive',
          'Badge digital officiel'
        ],
        is_active: true
      },
      {
        id: 'club',
        name: t('membership.types.club'),
        description: 'Adhésion pour les clubs esport',
        price: 150000,
        period: t('membership.types.club_period'),
        features: [
          'Statut de club officiel',
          'Jusqu\'à 10 licences joueurs',
          'Organisation de tournois',
          'Support marketing',
          'Visibilité sur le site FEGESPORT'
        ],
        is_active: true
      },
      {
        id: 'partner',
        name: t('membership.types.partner'),
        description: 'Adhésion pour les partenaires',
        price: 0,
        period: t('membership.types.partner_period'),
        features: [
          'Statut de partenaire officiel',
          'Logo sur le site et événements',
          'Accès VIP aux événements',
          'Communication dédiée',
          'Programme personnalisé'
        ],
        is_active: true
      }
    ];
  };

  const membershipBenefits = [
    {
      icon: <Shield size={24} />,
      title: t('membership.why_join.recognition'),
      description: t('membership.why_join.recognition_desc')
    },
    {
      icon: <Users size={24} />,
      title: t('membership.why_join.network'),
      description: t('membership.why_join.network_desc')
    },
    {
      icon: <Award size={24} />,
      title: t('membership.why_join.competitions'),
      description: t('membership.why_join.competitions_desc')
    }
  ];

  return (
    <div className="pt-20">
      <Toaster position="top-right" />
      
      {/* Hero Section */}
      <section className="bg-secondary-900 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('membership.title')}</h1>
            <p className="text-xl text-gray-300">
              {t('membership.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section bg-secondary-800">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">{t('membership.why_join.title')}</h2>
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
            <h2 className="text-3xl font-bold mb-4 text-white">{t('membership.types.title')}</h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {membershipTypes.map((type, index) => (
                <motion.div
                  key={type.id}
                  className={`bg-secondary-800 p-6 rounded-lg border-2 ${
                    selectedPlan === type.id 
                      ? 'border-primary-500' 
                      : 'border-transparent'
                  }`}
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="text-2xl font-bold mb-2 text-white">{type.name}</h3>
                  <div className="text-3xl font-bold text-primary-500 mb-1">
                    {type.price === 0 ? t('membership.types.partner_price') : 
                      `${type.price.toLocaleString()} `}
                    <span className="text-sm font-normal text-gray-400">GNF</span>
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
                    {t('membership.types.select')}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Registration Form Section */}
      {selectedPlan && (
        <section className="section bg-secondary-800">
          <div className="container-custom max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-white">{t('membership.form.title')}</h2>
              <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
            </div>

            <div className="bg-secondary-700 p-8 rounded-lg">
              <MembershipForm selectedType={selectedPlan} />
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="section bg-secondary-900">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">{t('membership.questions.title')}</h2>
            <p className="text-lg text-gray-300 mb-8">
              {t('membership.questions.description')}
            </p>
            <Link to="/contact" className="btn bg-primary-600 hover:bg-primary-700 text-white">
              {t('membership.questions.contact')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MembershipPage;