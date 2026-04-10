import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Award, CheckCircle, ArrowLeft, Trophy, Gamepad2, Star, ArrowRight, Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';
import { Link } from 'react-router-dom';
import MembershipForm from '../components/forms/MembershipForm';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';
import { getMembershipTypeTranslation } from '../utils/translations';
import SectionHeader from '../components/ui/SectionHeader';

interface MembershipType {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  features: string[];
  is_active: boolean;
  translations?: any;
}

const MembershipPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const lang = currentLanguage;
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembershipTypes();
  }, []);

  const fetchMembershipTypes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('membership_types')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching membership types:', error);
        setMembershipTypes(getDefaultMembershipTypes());
      } else if (data && data.length > 0) {
        setMembershipTypes(data);
      } else {
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
        description: lang === 'fr' ? 'Inscription avec contribution volontaire' : 'Registration with voluntary contribution',
        price: 15000,
        period: t('membership.types.player_period'),
        features: [
          lang === 'fr' ? 'Licence officielle de joueur' : 'Official player license',
          lang === 'fr' ? 'Participation aux tournois officiels' : 'Participation in official tournaments',
          lang === 'fr' ? 'Acces aux formations' : 'Access to training',
          lang === 'fr' ? 'Newsletter exclusive' : 'Exclusive newsletter',
          lang === 'fr' ? 'Badge digital officiel' : 'Official digital badge',
        ],
        is_active: true
      },
      {
        id: 'club',
        name: t('membership.types.club'),
        description: lang === 'fr' ? 'Adhesion pour les clubs esport' : 'Membership for esports clubs',
        price: 150000,
        period: t('membership.types.club_period'),
        features: [
          lang === 'fr' ? 'Statut de club officiel' : 'Official club status',
          lang === 'fr' ? 'Jusqu\'a 10 licences joueurs' : 'Up to 10 player licenses',
          lang === 'fr' ? 'Organisation de tournois' : 'Tournament organization',
          lang === 'fr' ? 'Support marketing' : 'Marketing support',
          lang === 'fr' ? 'Visibilite sur le site FEGESPORT' : 'Visibility on FEGESPORT website',
        ],
        is_active: true
      },
      {
        id: 'partner',
        name: t('membership.types.partner'),
        description: lang === 'fr' ? 'Adhesion pour les partenaires' : 'Membership for partners',
        price: 0,
        period: t('membership.types.partner_period'),
        features: [
          lang === 'fr' ? 'Statut de partenaire officiel' : 'Official partner status',
          lang === 'fr' ? 'Logo sur le site et evenements' : 'Logo on website and events',
          lang === 'fr' ? 'Acces VIP aux evenements' : 'VIP access to events',
          lang === 'fr' ? 'Communication dediee' : 'Dedicated communication',
          lang === 'fr' ? 'Programme personnalise' : 'Personalized program',
        ],
        is_active: true
      }
    ];
  };

  const getTypeName = (type: MembershipType): string => {
    const translated = getMembershipTypeTranslation(type.translations, lang);
    return translated.name || type.name;
  };

  const getTypeFeatures = (type: MembershipType): string[] => {
    const translated = getMembershipTypeTranslation(type.translations, lang);
    return (translated.features && translated.features.length > 0) ? translated.features : type.features;
  };

  const getPlanIcon = (id: string) => {
    switch (id) {
      case 'player': return <Gamepad2 size={28} />;
      case 'club': return <Users size={28} />;
      case 'partner': return <Star size={28} />;
      default: return <Shield size={28} />;
    }
  };

  const getPlanAccent = (index: number): string => {
    const accents = ['fed-red', 'fed-gold', 'accent-blue'];
    return accents[index % accents.length];
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

      {/* ============ HERO ============ */}
      <section className="relative bg-dark-950 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 -left-32 w-96 h-96 bg-fed-red-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-fed-gold-500/5 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <span className="overline block mb-4">
              {lang === 'fr' ? 'REJOIGNEZ LA FEDERATION' : 'JOIN THE FEDERATION'}
            </span>
            <h1 className="text-hero font-heading text-white mb-6">
              {t('membership.title')}
            </h1>
            <p className="text-lg md:text-xl text-light-300">
              {t('membership.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* ============ BENEFITS ============ */}
      <section className="section bg-section-alt">
        <div className="container-custom">
          <SectionHeader
            overline={lang === 'fr' ? 'AVANTAGES' : 'BENEFITS'}
            title={t('membership.why_join.title')}
            dividerColor="red"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {membershipBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-6 md:p-8 text-center group hover:border-fed-gold-500/30"
              >
                <div className="w-16 h-16 rounded-xl bg-fed-red-500/10 border border-fed-red-500/20 flex items-center justify-center mx-auto mb-5 text-fed-red-500 group-hover:bg-fed-red-500/20 transition-colors">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white font-heading">{benefit.title}</h3>
                <p className="text-light-400 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MEMBERSHIP TYPES ============ */}
      <section className="section bg-section-dark">
        <div className="container-custom">
          <AnimatePresence mode="wait">
            {!selectedPlan ? (
              <motion.div
                key="membership-cards"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SectionHeader
                  overline={lang === 'fr' ? 'FORMULES' : 'PLANS'}
                  title={t('membership.types.title')}
                  dividerColor="gold"
                />

                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-10 h-10 animate-spin text-fed-red-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {membershipTypes.map((type, index) => {
                      const accent = getPlanAccent(index);
                      return (
                        <motion.div
                          key={type.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`bg-dark-800 rounded-2xl border border-dark-700 hover:border-${accent}-500/50 transition-all duration-300 overflow-hidden group relative`}
                        >
                          {/* Top accent bar */}
                          <div className={`h-1 bg-${accent}-500`} />

                          <div className="p-6 md:p-8">
                            {/* Icon + Name */}
                            <div className="flex items-center gap-4 mb-6">
                              <div className={`w-14 h-14 rounded-xl bg-${accent}-500/10 border border-${accent}-500/20 flex items-center justify-center text-${accent}-500`}>
                                {getPlanIcon(type.id)}
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-white font-heading">
                                  {getTypeName(type)}
                                </h3>
                                <p className="text-light-400 text-sm">{type.description}</p>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="mb-6 pb-6 border-b border-dark-700">
                              <div className={`text-3xl font-bold text-${accent}-500 font-heading`}>
                                {type.id === 'player' ? (
                                  <span>{t('membership.types.player_price')}</span>
                                ) : type.price === 0 ? (
                                  <span>{t('membership.types.partner_price')}</span>
                                ) : (
                                  <>
                                    {type.price.toLocaleString()} <span className="text-base font-normal text-light-400">GNF</span>
                                  </>
                                )}
                              </div>
                              <p className="text-light-400 text-sm mt-1">{type.period}</p>
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-8">
                              {getTypeFeatures(type).map((feature, featureIndex) => (
                                <li key={featureIndex} className="flex items-start gap-2.5">
                                  <CheckCircle size={18} className={`text-${accent}-500 flex-shrink-0 mt-0.5`} />
                                  <span className="text-light-300 text-sm">{feature}</span>
                                </li>
                              ))}
                            </ul>

                            {/* CTA */}
                            <button
                              className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                                index === 0
                                  ? 'bg-fed-red-500 hover:bg-fed-red-600 text-white shadow-lg shadow-fed-red-500/20'
                                  : index === 1
                                  ? 'border-2 border-fed-gold-500 text-fed-gold-500 hover:bg-fed-gold-500 hover:text-dark-950'
                                  : 'bg-dark-700 hover:bg-dark-900 text-light-100 border border-dark-700'
                              }`}
                              onClick={() => setSelectedPlan(type.id)}
                            >
                              {t('membership.types.select')}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="membership-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-3xl mx-auto"
              >
                <div className="mb-8">
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="flex items-center text-fed-gold-500 hover:text-fed-gold-400 transition-colors mb-6 font-medium"
                  >
                    <ArrowLeft size={18} className="mr-2" />
                    <span>{lang === 'fr' ? 'Retour aux formules' : 'Back to plans'}</span>
                  </button>

                  <div className="text-center">
                    <span className="overline block mb-3">{lang === 'fr' ? 'INSCRIPTION' : 'REGISTRATION'}</span>
                    <h2 className="section-title mb-4">{t('membership.form.title')}</h2>
                    <div className="divider-gold mx-auto mb-6" />
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-dark-800 border border-fed-red-500/20 text-light-300 text-sm mb-6">
                      <CheckCircle size={16} className="text-fed-red-500" />
                      <span>
                        {lang === 'fr' ? 'Formule selectionnee' : 'Selected plan'}: <strong className="text-fed-red-500">
                          {membershipTypes.find(t => t.id === selectedPlan)?.name}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-dark-800 border border-dark-700 p-6 sm:p-8 rounded-2xl">
                  <MembershipForm selectedType={selectedPlan} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ============ CTA CONTACT ============ */}
      <section className="section bg-section-alt relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fed-red-500/30 to-transparent" />
        <div className="container-custom text-center">
          <span className="overline block mb-4">{lang === 'fr' ? 'BESOIN D\'AIDE ?' : 'NEED HELP?'}</span>
          <h2 className="section-title mb-4">{t('membership.questions.title')}</h2>
          <p className="text-light-400 text-lg max-w-2xl mx-auto mb-8">
            {t('membership.questions.description')}
          </p>
          <Link to="/contact" className="btn btn-primary px-8 py-3 shadow-lg shadow-fed-red-500/20">
            {t('membership.questions.contact')}
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default MembershipPage;
