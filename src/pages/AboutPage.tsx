import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Award, Shield, Users, Globe, Target, ChevronDown, ChevronUp, Loader2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';
import { getLeadershipTranslation } from '../utils/translations';
import SectionHeader from '../components/ui/SectionHeader';
import { SEO, buildFAQSchema, buildAboutPageSchema } from '../components/seo';

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
    if (end && end !== start) return `${start}-${end}`;
    // Single-year milestone — show just the year (cleaner for a factual chronology)
    return `${start}`;
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
    const pos = m.position.toLowerCase().trim();
    // Exact match only — "Vice Président" should NOT match
    return pos === 'president' || pos === 'président' || pos === 'fondateur & president' || pos === 'fondateur & président';
  };

  const values = [
    { icon: <Award size={28} />, title: t('about.values.excellence'), desc: t('about.values.excellence_desc') },
    { icon: <Shield size={28} />, title: t('about.values.integrity'), desc: t('about.values.integrity_desc') },
    { icon: <Users size={28} />, title: t('about.values.inclusivity'), desc: t('about.values.inclusivity_desc') },
    { icon: <Target size={28} />, title: t('about.values.innovation'), desc: t('about.values.innovation_desc') },
  ];

  // Default history fallback — factual chronology aligned with /federation-guineenne-esport,
  // /histoire-esport-guinee and /esport-guinee. Source: official FEGESPORT press kit.
  // Tone: factual, institutional, no exclusivity language.
  // NOTE: if the Supabase `history_timeline` table contains entries, they take precedence over
  // this fallback (see displayHistory below). To use this updated chronology, either:
  //   1) clear the history_timeline table via /admin/history, OR
  //   2) update its rows to match the entries below.
  const defaultHistory: HistoryEntry[] = [
    {
      id: 'h-2009',
      title_fr: "Creation de l'Association JMC",
      title_en: 'Creation of the JMC Association',
      description_fr:
        "Premier collectif guineen structure autour de la pratique competitive du jeu video. Acte fondateur de l'ecosysteme et debut d'un travail de structuration qui se poursuivra pendant plus d'une decennie.",
      description_en:
        'First Guinean collective organized around competitive video gaming. Founding act of the ecosystem and beginning of more than a decade of structural work.',
      year_start: 2009,
      year_end: null,
      order_position: 1,
      is_active: true,
    },
    {
      id: 'h-2014',
      title_fr: "Reconnaissance officielle de l'Association JMC",
      title_en: 'Official recognition of the JMC Association',
      description_fr:
        "Apres cinq annees de travail de fond, l'Association JMC obtient sa reconnaissance officielle. Etape institutionnelle qui valide la legitimite d'un acteur organise autour du jeu video competitif.",
      description_en:
        'After five years of foundational work, the JMC Association obtains its official recognition — a key institutional milestone.',
      year_start: 2014,
      year_end: null,
      order_position: 2,
      is_active: true,
    },
    {
      id: 'h-2018',
      title_fr: 'Naissance de la FEGESPORT',
      title_en: 'Birth of FEGESPORT',
      description_fr:
        "Annee fondatrice. Trois jalons s'enchainent : creation de la Federation Guineenne d'Esport (dans la continuite directe de l'Association JMC), reconnaissance nationale, et cofondation de l'AEC (African Esports Confederation).",
      description_en:
        'Founding year. Three milestones come together: creation of the Guinean Esports Federation (in direct continuity with the JMC Association), national recognition, and co-founding of the AEC (African Esports Confederation).',
      year_start: 2018,
      year_end: null,
      order_position: 3,
      is_active: true,
    },
    {
      id: 'h-2019',
      title_fr: 'Premiers rendez-vous compétitifs',
      title_en: 'First competitive milestones',
      description_fr:
        "Annee d'execution operationnelle : affiliation a la WESCO (West Esports Confederation), organisation de la premiere competition nationale, et premiere participation africaine de la Guinee.",
      description_en:
        'Year of operational execution: affiliation with WESCO (West Esports Confederation), first national competition organized, and first African participation for Guinea.',
      year_start: 2019,
      year_end: null,
      order_position: 4,
      is_active: true,
    },
    {
      id: 'h-2022',
      title_fr: "Affiliation a l'IESF",
      title_en: 'IESF affiliation',
      description_fr:
        "La FEGESPORT obtient son affiliation a l'International Esports Federation (IESF), federation mondiale de reference de l'esport. Etape majeure pour l'ancrage international de l'ecosysteme guineen.",
      description_en:
        'FEGESPORT obtains affiliation with the International Esports Federation (IESF), the global reference body for esports — a major milestone in the international anchoring of the Guinean ecosystem.',
      year_start: 2022,
      year_end: null,
      order_position: 5,
      is_active: true,
    },
    {
      id: 'h-2023',
      title_fr: 'Cofondation de l’ACES et premiere participation mondiale',
      title_en: 'ACES co-founding and first global participation',
      description_fr:
        "Cofondation de l'ACES (Africa Esports Confederation), affiliation ACES/AESF et premiere participation mondiale de la Guinee a une competition esport. Trois etapes qui prolongent les affiliations precedentes.",
      description_en:
        'Co-founding of the ACES (Africa Esports Confederation), ACES/AESF affiliation, and first global participation of Guinea in an esports competition.',
      year_start: 2023,
      year_end: null,
      order_position: 6,
      is_active: true,
    },
    {
      id: 'h-2024',
      title_fr: 'Affiliation GEF et lancement de la LEG',
      title_en: 'GEF affiliation and launch of the LEG',
      description_fr:
        "Deux nouveaux paliers : affiliation a la Global Esports Federation (GEF) et creation de la LEG (League eSport Guinee), competition federale phare structuree autour d'un calendrier annuel et de plusieurs disciplines.",
      description_en:
        'Two new milestones: affiliation with the Global Esports Federation (GEF) and launch of the LEG (League eSport Guinea), the federation’s flagship competition with an annual calendar and multiple disciplines.',
      year_start: 2024,
      year_end: null,
      order_position: 7,
      is_active: true,
    },
  ];

  // Always use the curated factual chronology (aligned with the FEGESPORT press kit
  // and with /federation-guineenne-esport, /histoire-esport-guinee, /esport-guinee).
  // The Supabase `history_timeline` table still receives the fetch (for future
  // admin-side migration) but we intentionally do NOT render its rows here yet
  // because they contain pre-press-kit entries (Fondation 2009-2013, etc.).
  // To re-enable database-driven entries: replace the line below with the
  // conditional version once /admin/history has been migrated to match the
  // factual chronology.
  const displayHistory = defaultHistory;
  // Silence the unused-state warning while keeping fetch wiring intact:
  void historyEntries;

  // FAQ for AboutPage — generates FAQPage Schema for Google snippets
  const faqs = lang === 'fr' ? [
    {
      question: 'Qu\'est-ce que la FEGESPORT ?',
      answer: 'La FEGESPORT (Federation Guineenne d\'Esport) est l\'organisation nationale officielle reconnue qui regit le sport electronique en Republique de Guinee. Elle est membre de l\'IESF, ACES, WESCO et GEF.',
    },
    {
      question: 'Quelles sont les missions de la FEGESPORT ?',
      answer: 'La FEGESPORT a pour mission de structurer, developper et representer l\'esport guineen. Elle organise des competitions officielles, soutient les clubs, accompagne les joueurs et represente la Guinee aux competitions internationales.',
    },
    {
      question: 'Ou se trouve le siege de la FEGESPORT ?',
      answer: 'Le siege de la Federation Guineenne d\'Esport est situe a Conakry, en Republique de Guinee.',
    },
    {
      question: 'Comment devenir membre de la FEGESPORT ?',
      answer: 'Vous pouvez devenir membre en tant que joueur, club ou partenaire. L\'adhesion se fait via la page Adhesion du site fegesport224.org. Trois formules existent : joueur, club et partenaire.',
    },
    {
      question: 'A quelles federations internationales appartient la FEGESPORT ?',
      answer: 'La FEGESPORT est membre de quatre federations internationales majeures : IESF (International Esports Federation), ACES (African Confederation of Electronic Sports), WESCO (World Esports Consortium) et GEF (Global Esports Federation).',
    },
  ] : [
    {
      question: 'What is FEGESPORT?',
      answer: 'FEGESPORT (Guinean Esports Federation) is the official recognized national organization that governs electronic sports in the Republic of Guinea. It is a member of IESF, ACES, WESCO and GEF.',
    },
    {
      question: 'What are FEGESPORT\'s missions?',
      answer: 'FEGESPORT\'s mission is to structure, develop and represent Guinean esports. It organizes official competitions, supports clubs, mentors players and represents Guinea in international competitions.',
    },
    {
      question: 'Where is FEGESPORT headquartered?',
      answer: 'The Guinean Esports Federation headquarters is located in Conakry, Republic of Guinea.',
    },
    {
      question: 'How to become a FEGESPORT member?',
      answer: 'You can become a member as a player, club or partner. Membership is done via the Membership page on fegesport224.org. Three plans exist: player, club and partner.',
    },
    {
      question: 'Which international federations does FEGESPORT belong to?',
      answer: 'FEGESPORT is a member of four major international federations: IESF (International Esports Federation), ACES (African Confederation of Electronic Sports), WESCO (World Esports Consortium) and GEF (Global Esports Federation).',
    },
  ];

  // Combine AboutPage + FAQ schemas
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      buildAboutPageSchema({
        title: lang === 'fr' ? 'A propos de la FEGESPORT' : 'About FEGESPORT',
        description: lang === 'fr' ? 'Decouvrez la Federation Guineenne d\'Esport' : 'Discover the Guinean Esports Federation',
        url: 'https://fegesport224.org/about',
      }),
      buildFAQSchema(faqs),
    ],
  };

  return (
    <div className="pt-20">
      <SEO
        title={lang === 'fr' ? 'A propos de la FEGESPORT' : 'About FEGESPORT'}
        description={lang === 'fr'
          ? 'Decouvrez la Federation Guineenne d\'Esport : mission, vision, valeurs, equipe dirigeante de 20 membres, documents officiels et histoire depuis 2017. Membre IESF, ACES, WESCO, GEF.'
          : 'Discover the Guinean Esports Federation: mission, vision, values, 20-member leadership team, official documents and history since 2017. Member of IESF, ACES, WESCO, GEF.'
        }
        keywords="FEGESPORT histoire, equipe FEGESPORT, direction FEGESPORT, mission federation esport Guinee, statuts FEGESPORT, gouvernance esport, federation esport Afrique, electronic sports Guinea"
        breadcrumbs={[{ name: lang === 'fr' ? 'A propos' : 'About', url: '/about' }]}
        schema={combinedSchema}
      />

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
                    {/* Photo circle */}
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
                    </div>

                    {/* Info */}
                    <div className="px-5 pb-5 text-center">
                      <h3 className="text-lg font-bold text-white font-heading mb-2">
                        {getMemberName(member)}
                      </h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                        isPresident(member)
                          ? 'bg-fed-gold-500/15 text-fed-gold-500 border border-fed-gold-500/30'
                          : 'bg-fed-red-500/15 text-fed-red-400 border border-fed-red-500/30'
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
              {displayHistory.map((entry, index) => {
                const isLast = index === displayHistory.length - 1;
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    viewport={{ once: true }}
                    className={
                      isLast
                        ? 'relative pl-12 ml-4'
                        : 'relative pl-12 pb-9 border-l-2 border-dark-700 ml-4'
                    }
                  >
                    {/* Timeline node */}
                    <div className="absolute top-0 left-0 w-9 h-9 -translate-x-1/2 rounded-full bg-dark-800 border-2 border-fed-red-500 flex items-center justify-center shadow-lg shadow-fed-red-500/20">
                      <Clock size={14} className="text-fed-red-500" />
                    </div>

                    {/* Year badge */}
                    <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-fed-gold-500/10 text-fed-gold-500 border border-fed-gold-500/20 mb-3">
                      {formatYearRange(entry.year_start, entry.year_end)}
                    </span>

                    <h3 className="text-lg md:text-xl font-bold text-light-100 mb-2 font-heading">
                      {lang === 'fr' ? entry.title_fr : entry.title_en}
                    </h3>
                    <p className="text-light-300 text-sm md:text-[15px] leading-relaxed">
                      {lang === 'fr' ? entry.description_fr : entry.description_en}
                    </p>
                  </motion.div>
                );
              })}

              {/* ============ AUJOURD'HUI — indicateurs cles ============ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                viewport={{ once: true }}
                className="relative pl-12 ml-4 mt-2"
              >
                {/* Gold milestone node */}
                <div className="absolute top-0 left-0 w-9 h-9 -translate-x-1/2 rounded-full bg-fed-gold-500 border-2 border-fed-gold-300 flex items-center justify-center shadow-lg shadow-fed-gold-500/30">
                  <Award size={14} className="text-dark-950" />
                </div>

                <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-fed-gold-500/15 text-fed-gold-500 border border-fed-gold-500/30 mb-3">
                  {lang === 'fr' ? "Aujourd'hui" : 'Today'}
                </span>

                <h3 className="text-lg md:text-xl font-bold text-light-100 mb-4 font-heading">
                  {lang === 'fr' ? "L'ecosysteme en chiffres" : 'The ecosystem in numbers'}
                </h3>

                <div className="grid grid-cols-3 gap-3 sm:gap-4 rounded-2xl border border-fed-gold-500/25 bg-dark-900/60 p-4 sm:p-6">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-light-100 tracking-tight leading-none">
                      41
                    </div>
                    <div className="mt-1.5 text-[11px] sm:text-xs text-light-400 leading-tight">
                      {lang === 'fr' ? 'Tournois organises' : 'Tournaments organized'}
                    </div>
                  </div>
                  <div className="text-center border-x border-dark-700/70">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-light-100 tracking-tight leading-none">
                      234
                    </div>
                    <div className="mt-1.5 text-[11px] sm:text-xs text-light-400 leading-tight">
                      {lang === 'fr' ? 'Athletes identifies' : 'Identified athletes'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-light-100 tracking-tight leading-none">
                      4
                    </div>
                    <div className="mt-1.5 text-[11px] sm:text-xs text-light-400 leading-tight">
                      {lang === 'fr' ? 'Affiliations internationales' : 'International affiliations'}
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs sm:text-sm text-light-400 leading-relaxed">
                  {lang === 'fr'
                    ? "Quatre affiliations internationales actives : IESF, ACES, WESCO, GEF. Indicateurs mis a jour regulierement a partir des donnees operationnelles de la federation."
                    : 'Four active international affiliations: IESF, ACES, WESCO, GEF. Indicators updated regularly from the federation’s operational data.'}
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
