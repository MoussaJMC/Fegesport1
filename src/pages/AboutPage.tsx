import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Award, Shield, Users, Globe, Target, ChevronDown, ChevronUp, Loader2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';
import { getLeadershipTranslation } from '../utils/translations';
import SectionHeader from '../components/ui/SectionHeader';

const OfficialDocumentsSection = lazy(() => import('../components/documents/OfficialDocumentsSection'));

class ErrorBoundarySimple extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error) { console.error('Documents section error:', error.message); }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

interface LeadershipMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  image_url: string;
  order: number;
  is_active: boolean;
  translations?: any;
}

interface HistoryEntry {
  id: string;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  year_start: number;
  year_end: number | null;
  order_position: number;
  is_active: boolean;
}

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const lang = currentLanguage;
  const [leadershipTeam, setLeadershipTeam] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBios, setExpandedBios] = useState<Record<string, boolean>>({});
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    fetchLeadershipTeam();
    fetchHistoryEntries();
  }, []);

  const fetchLeadershipTeam = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leadership_team')
        .select('*')
        .eq('is_active', true)
        .order('order', { ascending: true });

      if (error || !data || data.length === 0) {
        setLeadershipTeam([]);
      } else {
        setLeadershipTeam(data);
      }
    } catch (error) {
      console.error('Error fetching leadership:', error);
      setLeadershipTeam([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryEntries = async () => {
    try {
      setHistoryLoading(true);
      const { data, error } = await supabase
        .from('history_timeline')
        .select('*')
        .eq('is_active', true)
        .order('order_position', { ascending: true });

      if (error) throw error;
      setHistoryEntries(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistoryEntries([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatYearRange = (start: number, end: number | null): string => {
    if (end) return `${start}-${end}`;
    return lang === 'fr' ? `${start} - Aujourd'hui` : `${start} - Present`;
  };

  const toggleBio = (id: string) => {
    setExpandedBios(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getMemberName = (m: LeadershipMember): string => {
    const translated = getLeadershipTranslation(m.translations, lang);
    return translated.name || m.name;
  };

  const getMemberPosition = (m: LeadershipMember): string => {
    const translated = getLeadershipTranslation(m.translations, lang);
    return translated.position || m.position;
  };

  const getMemberBio = (m: LeadershipMember): string => {
    const translated = getLeadershipTranslation(m.translations, lang);
    return translated.bio || m.bio;
  };

  const isPresident = (m: LeadershipMember): boolean => {
    const pos = m.position.toLowerCase();
    return pos.includes('president') || pos.includes('président') || m.order === 1;
  };

  const values = [
    { icon: <Award size={28} />, title: t('about.values.excellence'), desc: t('about.values.excellence_desc') },
    { icon: <Shield size={28} />, title: t('about.values.integrity'), desc: t('about.values.integrity_desc') },
    { icon: <Users size={28} />, title: t('about.values.inclusivity'), desc: t('about.values.inclusivity_desc') },
    { icon: <Target size={28} />, title: t('about.values.innovation'), desc: t('about.values.innovation_desc') },
  ];

  // Default history fallback
  const defaultHistory: HistoryEntry[] = [
    { id: '1', title_fr: 'Fondation', title_en: 'Foundation', description_fr: 'Creation de la FEGESPORT par un groupe de passionnes d\'esport guineens avec la vision de structurer et developper l\'ecosysteme esport national.', description_en: 'Creation of FEGESPORT by a group of passionate Guinean esports enthusiasts with the vision of structuring and developing the national esports ecosystem.', year_start: 2009, year_end: 2013, order_position: 1, is_active: true },
    { id: '2', title_fr: 'Reconnaissance Officielle', title_en: 'Official Recognition', description_fr: 'Obtention de la reconnaissance officielle par le Ministere de la Jeunesse et des Sports, faisant de la FEGESPORT l\'organe officiel de gouvernance de l\'esport en Guinee.', description_en: 'Obtaining official recognition from the Ministry of Youth and Sports, making FEGESPORT the official esports governance body in Guinea.', year_start: 2017, year_end: null, order_position: 2, is_active: true },
    { id: '3', title_fr: 'Premiers Championnats Nationaux', title_en: 'First National Championships', description_fr: 'Organisation des premiers championnats nationaux officiels dans plusieurs disciplines esport.', description_en: 'Organization of the first official national championships in multiple esports disciplines.', year_start: 2018, year_end: null, order_position: 3, is_active: true },
    { id: '4', title_fr: 'Affiliation Internationale', title_en: 'International Affiliation', description_fr: 'Affiliation aux principales federations internationales d\'esport IESF & GEF, permettant aux equipes guineennes de participer aux competitions internationales.', description_en: 'Affiliation with major international esports federations IESF & GEF, enabling Guinean teams to compete internationally.', year_start: 2019, year_end: null, order_position: 4, is_active: true },
  ];

  const displayHistory = historyEntries.length > 0 ? historyEntries : defaultHistory;

  return (
    <div className="pt-20">
      {/* ============ HERO ============ */}
      <section className="relative bg-dark-950 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 -left-32 w-96 h-96 bg-fed-red-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-fed-gold-500/5 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <span className="overline block mb-4">
              {lang === 'fr' ? 'QUI SOMMES-NOUS' : 'WHO WE ARE'}
            </span>
            <h1 className="text-hero font-heading text-white mb-6">{t('about.title')}</h1>
            <p className="text-lg md:text-xl text-light-300">{t('about.subtitle')}</p>
          </div>
        </div>
      </section>

      {/* ============ MISSION & VISION ============ */}
      <section className="section bg-section-alt">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="card p-6 md:p-8 border-l-4 border-l-fed-red-500"
            >
              <h2 className="text-2xl font-bold mb-4 text-white font-heading">{t('about.mission.title')}</h2>
              <div className="divider-red mb-6" />
              <p className="text-light-300 leading-relaxed">{t('about.mission.description')}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="card p-6 md:p-8 border-l-4 border-l-fed-gold-500"
            >
              <h2 className="text-2xl font-bold mb-4 text-white font-heading">{t('about.vision.title')}</h2>
              <div className="divider-gold mb-6" />
              <p className="text-light-300 leading-relaxed">{t('about.vision.description')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ VALUES ============ */}
      <section className="section bg-section-dark">
        <div className="container-custom">
          <SectionHeader
            overline={lang === 'fr' ? 'NOS VALEURS' : 'OUR VALUES'}
            title={t('about.values.title')}
            description={t('about.values.description')}
            dividerColor="gold"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-6 text-center group hover:border-fed-gold-500/30"
              >
                <div className="w-16 h-16 rounded-xl bg-fed-red-500/10 border border-fed-red-500/20 flex items-center justify-center mx-auto mb-5 text-fed-red-500 group-hover:bg-fed-red-500/20 transition-colors">
                  {val.icon}
                </div>
                <h3 className="text-lg font-bold mb-3 text-white font-heading">{val.title}</h3>
                <p className="text-light-400 text-sm leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DOCUMENTS ============ */}
      <Suspense fallback={
        <div className="section bg-section-alt text-center">
          <div className="container-custom">
            <Loader2 className="w-8 h-8 animate-spin text-fed-red-500 mx-auto" />
          </div>
        </div>
      }>
        <ErrorBoundarySimple>
          <OfficialDocumentsSection />
        </ErrorBoundarySimple>
      </Suspense>

      {/* ============ LEADERSHIP ============ */}
      <section className="section bg-section-alt">
        <div className="container-custom">
          <SectionHeader
            overline={lang === 'fr' ? 'NOTRE EQUIPE' : 'OUR TEAM'}
            title={lang === 'fr' ? 'Notre Direction' : 'Our Leadership'}
            description={
              lang === 'fr'
                ? 'La FEGESPORT est dirigee par une equipe de professionnels passionnes et engages.'
                : 'FEGESPORT is led by a team of passionate and committed professionals.'
            }
            dividerColor="red"
          />

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-fed-red-500" />
            </div>
          ) : leadershipTeam.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {leadershipTeam.map((member, index) => {
                const bio = getMemberBio(member);
                const isLong = bio.length > 200;
                const isExpanded = expandedBios[member.id];

                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.08, 0.4) }}
                    viewport={{ once: true }}
                    className={`card overflow-hidden ${isPresident(member) ? 'border-fed-gold-500/50' : ''}`}
                  >
                    {/* Photo circle + Content */}
                    <div className="p-6 pt-8 text-center">
                      <div className={`w-28 h-28 rounded-full mx-auto mb-4 overflow-hidden border-3 ${
                        isPresident(member) ? 'border-fed-gold-500' : 'border-dark-700'
                      } shadow-lg`}>
                        {member.image_url ? (
                          <img
                            src={member.image_url}
                            alt={getMemberName(member)}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full bg-dark-700 flex items-center justify-center">
                            <Users className="text-light-400" size={36} />
                          </div>
                        )}
                      </div>
                      {isPresident(member) && (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-fed-gold-500/15 text-fed-gold-500 text-xs font-bold border border-fed-gold-500/30 mb-2">
                          {lang === 'fr' ? 'President' : 'President'}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="px-5 pb-5 text-center">
                      <h3 className="text-lg font-bold text-white font-heading mb-1">
                        {getMemberName(member)}
                      </h3>
                      <span className={`inline-block text-sm font-medium mb-3 ${
                        isPresident(member) ? 'text-fed-gold-500' : 'text-fed-red-400'
                      }`}>
                        {getMemberPosition(member)}
                      </span>
                      <p className="text-light-400 text-sm leading-relaxed">
                        {isLong && !isExpanded ? bio.substring(0, 200) + '...' : bio}
                      </p>
                      {isLong && (
                        <button
                          onClick={() => toggleBio(member.id)}
                          className="mt-2 text-fed-gold-500 hover:text-fed-gold-400 text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                          {isExpanded ? (
                            <><ChevronUp size={14} /> {lang === 'fr' ? 'Moins' : 'Less'}</>
                          ) : (
                            <><ChevronDown size={14} /> {lang === 'fr' ? 'Plus' : 'More'}</>
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 card p-8 max-w-md mx-auto">
              <Users className="w-14 h-14 text-dark-700 mx-auto mb-4" />
              <p className="text-light-400">
                {lang === 'fr' ? 'Equipe de direction en cours de publication.' : 'Leadership team being published.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============ HISTORY TIMELINE ============ */}
      <section className="section bg-section-dark">
        <div className="container-custom">
          <SectionHeader
            overline={lang === 'fr' ? 'NOTRE PARCOURS' : 'OUR JOURNEY'}
            title={lang === 'fr' ? 'Notre Histoire' : 'Our History'}
            dividerColor="gold"
          />

          {historyLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-fed-red-500" />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {displayHistory.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`relative pl-12 ${index < displayHistory.length - 1 ? 'pb-10 border-l-2 border-dark-700 ml-4' : 'ml-4'}`}
                >
                  {/* Timeline node */}
                  <div className="absolute top-0 left-0 w-9 h-9 -translate-x-1/2 rounded-full bg-dark-800 border-2 border-fed-red-500 flex items-center justify-center">
                    <Clock size={14} className="text-fed-red-500" />
                  </div>

                  {/* Year badge */}
                  <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-fed-gold-500/10 text-fed-gold-500 border border-fed-gold-500/20 mb-3">
                    {formatYearRange(entry.year_start, entry.year_end)}
                  </span>

                  <h3 className="text-lg font-bold text-white mb-2 font-heading">
                    {lang === 'fr' ? entry.title_fr : entry.title_en}
                  </h3>
                  <p className="text-light-400 text-sm leading-relaxed">
                    {lang === 'fr' ? entry.description_fr : entry.description_en}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
