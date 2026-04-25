import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Award, Building, Calendar, Globe, Mail, Phone, MapPin,
  Download, Copy, CheckCircle, Users, FileText, Trophy,
  Newspaper, ExternalLink
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';
import SEO from '../components/seo/SEO';
import SectionHeader from '../components/ui/SectionHeader';

interface FactSheetItem {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
}

const PressKitPage: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const lang = currentLanguage;
  const [memberCount, setMemberCount] = useState(0);
  const [leadershipCount, setLeadershipCount] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [members, leadership] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('leadership_team').select('id', { count: 'exact', head: true }).eq('is_active', true),
      ]);
      setMemberCount(members.count || 0);
      setLeadershipCount(leadership.count || 0);
    } catch (e) {
      // Silent
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  // === STRUCTURED DATA FOR WIKIPEDIA / PRESS ===
  const factSheet: FactSheetItem[] = [
    {
      label: lang === 'fr' ? 'Nom officiel' : 'Official name',
      value: 'Federation Guineenne d\'Esport',
      icon: <Building size={16} />,
    },
    {
      label: lang === 'fr' ? 'Sigle' : 'Acronym',
      value: 'FEGESPORT',
      icon: <Award size={16} />,
    },
    {
      label: lang === 'fr' ? 'Type' : 'Type',
      value: lang === 'fr' ? 'Federation sportive nationale' : 'National sports federation',
      icon: <Trophy size={16} />,
    },
    {
      label: lang === 'fr' ? 'Sport' : 'Sport',
      value: lang === 'fr' ? 'Esport (Sport electronique)' : 'Esports (Electronic sports)',
      icon: <Award size={16} />,
    },
    {
      label: lang === 'fr' ? 'Pays' : 'Country',
      value: lang === 'fr' ? 'Republique de Guinee' : 'Republic of Guinea',
      icon: <Globe size={16} />,
    },
    {
      label: lang === 'fr' ? 'Siege social' : 'Headquarters',
      value: 'Conakry, Guinee',
      icon: <MapPin size={16} />,
    },
    {
      label: lang === 'fr' ? 'Site officiel' : 'Official website',
      value: 'fegesport224.org',
      icon: <Globe size={16} />,
    },
    {
      label: lang === 'fr' ? 'Email officiel' : 'Official email',
      value: 'contact@fegesport224.org',
      icon: <Mail size={16} />,
    },
    {
      label: lang === 'fr' ? 'Telephone' : 'Phone',
      value: '+224 625 87 87 64',
      icon: <Phone size={16} />,
    },
  ];

  const internationalAffiliations = [
    {
      name: 'International Esports Federation (IESF)',
      url: 'https://iesf.org',
      desc: lang === 'fr' ? 'Federation mondiale d\'esport' : 'World esports federation',
    },
    {
      name: 'African Confederation of Electronic Sports (ACES)',
      url: 'https://www.africaesports.org',
      desc: lang === 'fr' ? 'Confederation africaine d\'esport' : 'African esports confederation',
    },
    {
      name: 'World Esports Consortium (WESCO)',
      url: 'https://wesco.gg',
      desc: lang === 'fr' ? 'Consortium mondial pour l\'esport' : 'Global esports consortium',
    },
    {
      name: 'Global Esports Federation (GEF)',
      url: 'https://globalesports.org',
      desc: lang === 'fr' ? 'Federation mondiale d\'esport (mouvement olympique)' : 'Global esports federation (Olympic movement)',
    },
  ];

  const wikipediaIntroFR = `La **Federation Guineenne d'Esport** (en abrege **FEGESPORT**) est l'organisation nationale officielle qui regit le sport electronique (esport) en Republique de Guinee. Basee a Conakry, elle est reconnue par les autorites guineennes et est membre de plusieurs federations internationales d'esport, dont l'International Esports Federation (IESF), l'African Confederation of Electronic Sports (ACES), le World Esports Consortium (WESCO) et la Global Esports Federation (GEF).

La FEGESPORT a pour mission de structurer, developper et representer l'esport guineen au niveau national et international. Elle organise des competitions officielles, soutient les clubs esport, accompagne les joueurs et represente la Guinee aux competitions internationales d'esport.`;

  const wikipediaIntroEN = `The **Guinean Esports Federation** (in French: *Federation Guineenne d'Esport*, abbreviated **FEGESPORT**) is the official national organization governing electronic sports (esports) in the Republic of Guinea. Based in Conakry, it is recognized by Guinean authorities and is a member of several international esports federations, including the International Esports Federation (IESF), the African Confederation of Electronic Sports (ACES), the World Esports Consortium (WESCO), and the Global Esports Federation (GEF).

FEGESPORT's mission is to structure, develop, and represent Guinean esports at national and international levels. It organizes official competitions, supports esports clubs, mentors players, and represents Guinea in international esports competitions.`;

  const introText = lang === 'fr' ? wikipediaIntroFR : wikipediaIntroEN;

  // Schema for press kit page
  const pressKitSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'name': lang === 'fr' ? 'Kit de presse - FEGESPORT' : 'Press Kit - FEGESPORT',
    'description': lang === 'fr'
      ? 'Kit de presse officiel de la Federation Guineenne d\'Esport. Informations institutionnelles, faits cles, citations.'
      : 'Official press kit of the Guinean Esports Federation. Institutional information, key facts, citations.',
    'mainEntity': {
      '@type': 'SportsOrganization',
      'name': 'Federation Guineenne d\'Esport',
      'alternateName': 'FEGESPORT',
      'url': 'https://fegesport224.org',
      'foundingLocation': { '@type': 'Place', 'name': 'Conakry, Guinee' },
      'areaServed': { '@type': 'Country', 'name': 'Guinee' },
    },
  };

  return (
    <>
      <SEO
        title={lang === 'fr' ? 'Kit de Presse' : 'Press Kit'}
        description={
          lang === 'fr'
            ? 'Kit de presse officiel de la FEGESPORT. Informations factuelles, citations, faits cles pour journalistes, partenaires et editeurs Wikipedia.'
            : 'Official FEGESPORT press kit. Factual information, citations, key facts for journalists, partners and Wikipedia editors.'
        }
        keywords="FEGESPORT press kit, presse Guinee esport, journalistes esport, Wikipedia FEGESPORT, communique presse"
        schema={pressKitSchema}
      />

      <div className="pt-20">
        {/* HERO */}
        <section className="relative bg-dark-950 py-20 md:py-24 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/3 -left-32 w-96 h-96 bg-fed-red-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-fed-gold-500/5 rounded-full blur-3xl" />
          </div>
          <div className="container-custom relative z-10">
            <div className="max-w-3xl">
              <span className="overline block mb-4">
                {lang === 'fr' ? 'KIT DE PRESSE OFFICIEL' : 'OFFICIAL PRESS KIT'}
              </span>
              <h1 className="text-hero font-heading text-white mb-6">
                {lang === 'fr' ? 'Kit de Presse' : 'Press Kit'}
              </h1>
              <p className="text-lg md:text-xl text-light-300">
                {lang === 'fr'
                  ? 'Informations factuelles, citations et donnees institutionnelles pour journalistes, partenaires, ecrivains et editeurs Wikipedia.'
                  : 'Factual information, citations and institutional data for journalists, partners, writers and Wikipedia editors.'}
              </p>
            </div>
          </div>
        </section>

        {/* WIKIPEDIA-READY INTRO */}
        <section className="section bg-section-alt">
          <div className="container-custom max-w-4xl">
            <SectionHeader
              overline={lang === 'fr' ? 'PARAGRAPHE D\'INTRODUCTION' : 'INTRODUCTION PARAGRAPH'}
              title={lang === 'fr' ? 'Texte pret pour Wikipedia' : 'Wikipedia-ready text'}
              description={
                lang === 'fr'
                  ? 'Texte verifie et neutre, conforme aux standards encyclopediques.'
                  : 'Verified, neutral text matching encyclopedic standards.'
              }
              dividerColor="gold"
              align="left"
            />

            <div className="card p-6 md:p-8 relative">
              <button
                onClick={() => copyToClipboard(introText, 'intro')}
                className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-fed-gold-500 hover:text-dark-950 text-light-300 text-xs font-semibold transition-all"
              >
                {copiedField === 'intro' ? (
                  <><CheckCircle size={14} /> {lang === 'fr' ? 'Copie !' : 'Copied!'}</>
                ) : (
                  <><Copy size={14} /> {lang === 'fr' ? 'Copier' : 'Copy'}</>
                )}
              </button>
              <div className="text-light-200 text-sm md:text-base leading-relaxed whitespace-pre-line pr-24">
                {introText}
              </div>
            </div>
          </div>
        </section>

        {/* FACT SHEET */}
        <section className="section bg-section-dark">
          <div className="container-custom max-w-4xl">
            <SectionHeader
              overline={lang === 'fr' ? 'FICHE D\'IDENTITE' : 'FACT SHEET'}
              title={lang === 'fr' ? 'Faits Cles' : 'Key Facts'}
              dividerColor="red"
              align="left"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {factSheet.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="card p-4 flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-fed-red-500/10 border border-fed-red-500/20 flex items-center justify-center text-fed-red-500 flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs uppercase tracking-wider text-light-400 font-semibold mb-0.5">
                      {item.label}
                    </div>
                    <div className="text-white font-medium text-sm md:text-base break-words">
                      {item.value}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(typeof item.value === 'string' ? item.value : '', item.label)}
                    className="text-light-400 hover:text-fed-gold-500 p-1"
                    title={lang === 'fr' ? 'Copier' : 'Copy'}
                  >
                    {copiedField === item.label ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </motion.div>
              ))}

              {/* Dynamic stats from Supabase */}
              <div className="card p-4 flex items-start gap-3 border-fed-gold-500/20">
                <div className="w-8 h-8 rounded-lg bg-fed-gold-500/10 border border-fed-gold-500/20 flex items-center justify-center text-fed-gold-500 flex-shrink-0">
                  <Users size={16} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-light-400 font-semibold mb-0.5">
                    {lang === 'fr' ? 'Membres dirigeants' : 'Board members'}
                  </div>
                  <div className="text-white font-medium text-sm md:text-base">
                    {leadershipCount} {lang === 'fr' ? 'membres actifs' : 'active members'}
                  </div>
                </div>
              </div>

              <div className="card p-4 flex items-start gap-3 border-fed-gold-500/20">
                <div className="w-8 h-8 rounded-lg bg-fed-gold-500/10 border border-fed-gold-500/20 flex items-center justify-center text-fed-gold-500 flex-shrink-0">
                  <Trophy size={16} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-light-400 font-semibold mb-0.5">
                    {lang === 'fr' ? 'Joueurs licencies' : 'Licensed players'}
                  </div>
                  <div className="text-white font-medium text-sm md:text-base">
                    {memberCount}+ {lang === 'fr' ? 'joueurs actifs' : 'active players'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERNATIONAL AFFILIATIONS */}
        <section className="section bg-section-alt">
          <div className="container-custom max-w-4xl">
            <SectionHeader
              overline={lang === 'fr' ? 'AFFILIATIONS' : 'AFFILIATIONS'}
              title={lang === 'fr' ? 'Affiliations Internationales' : 'International Affiliations'}
              dividerColor="gold"
              align="left"
            />

            <div className="space-y-3">
              {internationalAffiliations.map((aff, index) => (
                <motion.a
                  key={index}
                  href={aff.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="card p-4 flex items-center gap-4 hover:border-fed-gold-500/30 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-fed-gold-500/10 border border-fed-gold-500/20 flex items-center justify-center text-fed-gold-500 flex-shrink-0">
                    <Globe size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold group-hover:text-fed-gold-500 transition-colors">
                      {aff.name}
                    </div>
                    <div className="text-light-400 text-sm">{aff.desc}</div>
                  </div>
                  <ExternalLink size={16} className="text-light-400 group-hover:text-fed-gold-500 transition-colors flex-shrink-0" />
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* MEDIA ASSETS */}
        <section className="section bg-section-dark">
          <div className="container-custom max-w-4xl">
            <SectionHeader
              overline={lang === 'fr' ? 'RESSOURCES MEDIA' : 'MEDIA ASSETS'}
              title={lang === 'fr' ? 'Logos et visuels' : 'Logos & Visuals'}
              dividerColor="red"
              align="left"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-fed-gold-500/40 bg-white p-2">
                  <img
                    src="https://geozovninpeqsgtzwchu.supabase.co/storage/v1/object/public/static-files/uploads/d5b2ehmnrec.jpg"
                    alt="Logo officiel FEGESPORT"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-white font-bold mb-1 font-heading">
                  {lang === 'fr' ? 'Logo officiel' : 'Official logo'}
                </h3>
                <p className="text-light-400 text-xs mb-4">PNG / JPG haute resolution</p>
                <a
                  href="https://geozovninpeqsgtzwchu.supabase.co/storage/v1/object/public/static-files/uploads/d5b2ehmnrec.jpg"
                  download="fegesport-logo.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-fed-gold-500 hover:bg-fed-gold-600 text-dark-950 text-sm font-semibold transition-all"
                >
                  <Download size={14} /> {lang === 'fr' ? 'Telecharger' : 'Download'}
                </a>
              </div>

              <div className="card p-6">
                <h3 className="text-white font-bold mb-3 font-heading flex items-center gap-2">
                  <FileText size={18} className="text-fed-red-500" />
                  {lang === 'fr' ? 'Ressources supplementaires' : 'Additional resources'}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/about" className="flex items-center gap-2 text-light-300 hover:text-fed-gold-500 text-sm transition-colors">
                      <ExternalLink size={12} />
                      {lang === 'fr' ? 'A propos de la FEGESPORT' : 'About FEGESPORT'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/news" className="flex items-center gap-2 text-light-300 hover:text-fed-gold-500 text-sm transition-colors">
                      <Newspaper size={12} />
                      {lang === 'fr' ? 'Actualites officielles' : 'Official news'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/resources" className="flex items-center gap-2 text-light-300 hover:text-fed-gold-500 text-sm transition-colors">
                      <FileText size={12} />
                      {lang === 'fr' ? 'Documents officiels' : 'Official documents'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="flex items-center gap-2 text-light-300 hover:text-fed-gold-500 text-sm transition-colors">
                      <Mail size={12} />
                      {lang === 'fr' ? 'Contact presse' : 'Press contact'}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT FOR PRESS */}
        <section className="section bg-section-alt">
          <div className="container-custom max-w-3xl text-center">
            <SectionHeader
              overline={lang === 'fr' ? 'CONTACT MEDIA' : 'MEDIA CONTACT'}
              title={lang === 'fr' ? 'Demandes presse & journalistes' : 'Press & journalist inquiries'}
              dividerColor="gold"
            />

            <div className="card p-6 md:p-8">
              <p className="text-light-300 mb-6">
                {lang === 'fr'
                  ? 'Pour toute demande d\'interview, de citation officielle ou de complement d\'information, contactez-nous directement.'
                  : 'For interview requests, official quotes or additional information, contact us directly.'}
              </p>

              <div className="space-y-3 max-w-md mx-auto">
                <a
                  href="mailto:contact@fegesport224.org"
                  className="card p-4 flex items-center gap-3 hover:border-fed-red-500/30 group"
                >
                  <Mail size={18} className="text-fed-red-500" />
                  <span className="text-white font-medium group-hover:text-fed-red-400 transition-colors">contact@fegesport224.org</span>
                </a>
                <a
                  href="tel:+224625878764"
                  className="card p-4 flex items-center gap-3 hover:border-fed-red-500/30 group"
                >
                  <Phone size={18} className="text-fed-red-500" />
                  <span className="text-white font-medium group-hover:text-fed-red-400 transition-colors">+224 625 87 87 64</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PressKitPage;
