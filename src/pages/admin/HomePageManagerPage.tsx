import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Home, Image, Layers, Users, Trophy, Newspaper, Calendar,
  Globe, Building, Mail, Settings, Navigation, BarChart3,
  ArrowRight, ExternalLink, Edit3, Eye, AlertCircle, CheckCircle,
  Gamepad2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdminPageHeader } from '../../components/admin/ui';

interface SectionInfo {
  id: string;
  emoji: string;
  number: number;
  title: string;
  description: string;
  source: string;
  adminPath: string;
  icon: React.ReactNode;
  count?: number;
  status?: 'configured' | 'partial' | 'empty';
  external?: boolean;
}

const HomePageManagerPage: React.FC = () => {
  const [stats, setStats] = useState({
    slideshow: 0,
    leadership: 0,
    disciplines: 0,
    members: 0,
    partners: 0,
    news: 0,
    events: 0,
    pageSections: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get home page id first
      const { data: page } = await supabase.from('pages').select('id').eq('slug', 'home').single();
      const pageId = page?.id;

      const [
        slideshow, leadership, disciplines, members, partners,
        news, events, pageSections
      ] = await Promise.all([
        supabase.from('slideshow_images').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('leadership_team').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('leg_disciplines').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('partners').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('news').select('id', { count: 'exact', head: true }).eq('published', true),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        pageId ? supabase.from('page_sections').select('id', { count: 'exact', head: true }).eq('page_id', pageId).eq('is_active', true) : Promise.resolve({ count: 0 }),
      ]);

      setStats({
        slideshow: slideshow.count || 0,
        leadership: leadership.count || 0,
        disciplines: disciplines.count || 0,
        members: members.count || 0,
        partners: partners.count || 0,
        news: news.count || 0,
        events: events.count || 0,
        pageSections: pageSections.count || 0,
      });
    } catch (e) {
      console.error('Error fetching stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (count: number, threshold = 1): 'configured' | 'partial' | 'empty' => {
    if (count === 0) return 'empty';
    if (count < threshold) return 'partial';
    return 'configured';
  };

  const sections: SectionInfo[] = [
    {
      id: 'hero',
      emoji: '🎯',
      number: 1,
      title: 'Hero (Banniere principale)',
      description: 'Logo, titre, tagline, image de fond, CTAs',
      source: 'page_sections (key=hero)',
      adminPath: '/admin/pages',
      icon: <Home className="w-5 h-5" />,
      count: stats.pageSections,
      status: getStatus(stats.pageSections),
    },
    {
      id: 'slideshow',
      emoji: '🎬',
      number: 2,
      title: 'Slideshow Moments Forts',
      description: 'Diaporama d\'images avec titres et descriptions',
      source: 'slideshow_images',
      adminPath: '/admin/slideshow',
      icon: <Image className="w-5 h-5" />,
      count: stats.slideshow,
      status: getStatus(stats.slideshow, 3),
    },
    {
      id: 'mission',
      emoji: '⭐',
      number: 3,
      title: 'Mission & Valeurs',
      description: 'Excellence, Inclusivite, Innovation (textes traduits)',
      source: 'fichiers locales (fr.json / en.json)',
      adminPath: '/admin',
      icon: <Trophy className="w-5 h-5" />,
      status: 'configured',
    },
    {
      id: 'governance',
      emoji: '👑',
      number: 4,
      title: 'Bureau Executif (Gouvernance)',
      description: 'President + membres dirigeants avec photos',
      source: 'leadership_team',
      adminPath: '/admin/leadership',
      icon: <Users className="w-5 h-5" />,
      count: stats.leadership,
      status: getStatus(stats.leadership, 6),
    },
    {
      id: 'disciplines',
      emoji: '🎮',
      number: 5,
      title: 'Disciplines Officielles',
      description: '6 disciplines esport (FIFA, MLBB, Free Fire...)',
      source: 'leg_disciplines',
      adminPath: '/admin/leg',
      icon: <Gamepad2 className="w-5 h-5" />,
      count: stats.disciplines,
      status: stats.disciplines > 0 ? 'configured' : 'partial',
    },
    {
      id: 'stats',
      emoji: '📊',
      number: 6,
      title: 'Notre Ecosysteme (Compteurs)',
      description: 'Joueurs, clubs, partenaires (compteurs animes)',
      source: 'members + partners (calcul auto)',
      adminPath: '/admin/members',
      icon: <BarChart3 className="w-5 h-5" />,
      count: stats.members + stats.partners,
      status: getStatus(stats.members + stats.partners, 5),
    },
    {
      id: 'news',
      emoji: '📰',
      number: 7,
      title: 'Actualites',
      description: '3 dernieres actualites publiees (categories, images)',
      source: 'news',
      adminPath: '/admin/news',
      icon: <Newspaper className="w-5 h-5" />,
      count: stats.news,
      status: getStatus(stats.news, 3),
    },
    {
      id: 'events',
      emoji: '📅',
      number: 8,
      title: 'Evenements a venir',
      description: '4 prochains evenements (date, lieu, inscription)',
      source: 'events',
      adminPath: '/admin/upcoming-events',
      icon: <Calendar className="w-5 h-5" />,
      count: stats.events,
      status: getStatus(stats.events, 1),
    },
    {
      id: 'international',
      emoji: '🌍',
      number: 9,
      title: 'Representation Internationale',
      description: 'IESF, ACES, WESCO, GEF (logos + descriptions)',
      source: 'page_sections (key=international, JSON)',
      adminPath: '/admin/pages',
      icon: <Globe className="w-5 h-5" />,
      status: 'configured',
    },
    {
      id: 'partners',
      emoji: '🤝',
      number: 10,
      title: 'Partenaires',
      description: 'Logos des partenaires officiels',
      source: 'partners',
      adminPath: '/admin/partners',
      icon: <Building className="w-5 h-5" />,
      count: stats.partners,
      status: stats.partners > 0 ? 'configured' : 'partial',
    },
    {
      id: 'newsletter',
      emoji: '📧',
      number: 11,
      title: 'Newsletter',
      description: 'Section d\'inscription a la newsletter (formulaire)',
      source: 'newsletter_subscriptions',
      adminPath: '/admin/newsletter',
      icon: <Mail className="w-5 h-5" />,
      status: 'configured',
    },
    {
      id: 'cta',
      emoji: '🚀',
      number: 12,
      title: 'CTA Rejoindre',
      description: 'Bouton final "Devenir membre" + image de fond',
      source: 'fichiers locales (fr.json / en.json)',
      adminPath: '/admin',
      icon: <ArrowRight className="w-5 h-5" />,
      status: 'configured',
    },
    {
      id: 'navbar',
      emoji: '🧭',
      number: 13,
      title: 'Navigation (en haut)',
      description: 'Menu items, logo, langues',
      source: 'site_settings (main_navigation, site_logo)',
      adminPath: '/admin/menu',
      icon: <Navigation className="w-5 h-5" />,
      status: 'configured',
    },
    {
      id: 'footer',
      emoji: '⬇️',
      number: 14,
      title: 'Footer (Pied de page)',
      description: 'Contact, reseaux sociaux, liens rapides',
      source: 'site_settings (contact_info)',
      adminPath: '/admin/footer',
      icon: <Settings className="w-5 h-5" />,
      status: 'configured',
    },
  ];

  const StatusBadge: React.FC<{ status?: 'configured' | 'partial' | 'empty' }> = ({ status }) => {
    if (!status || status === 'configured') {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
          <CheckCircle size={12} /> OK
        </span>
      );
    }
    if (status === 'partial') {
      return (
        <span className="inline-flex items-center gap-1 text-fed-gold-500 text-xs font-semibold">
          <AlertCircle size={12} /> Partiel
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-fed-red-400 text-xs font-semibold">
        <AlertCircle size={12} /> Vide
      </span>
    );
  };

  return (
    <div>
      <AdminPageHeader
        icon={<Home size={20} />}
        title="Gestion de la page d'Accueil"
        subtitle="Toutes les sections de la homepage avec leur source et le lien direct vers l'admin"
        publicLink="https://fegesport224.org"
        publicLinkLabel="Voir la page d'accueil"
      />

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
          <div className="text-xs text-light-400 uppercase tracking-wider mb-1">Total sections</div>
          <div className="text-2xl font-bold text-white font-heading">14</div>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
          <div className="text-xs text-light-400 uppercase tracking-wider mb-1">Configurees</div>
          <div className="text-2xl font-bold text-emerald-400 font-heading">
            {sections.filter(s => s.status === 'configured').length}
          </div>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
          <div className="text-xs text-light-400 uppercase tracking-wider mb-1">Partielles</div>
          <div className="text-2xl font-bold text-fed-gold-500 font-heading">
            {sections.filter(s => s.status === 'partial').length}
          </div>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
          <div className="text-xs text-light-400 uppercase tracking-wider mb-1">Vides</div>
          <div className="text-2xl font-bold text-fed-red-400 font-heading">
            {sections.filter(s => s.status === 'empty').length}
          </div>
        </div>
      </div>

      {/* Section list */}
      <div className="space-y-3">
        {sections.map((section) => (
          <Link
            key={section.id}
            to={section.adminPath}
            className="block bg-dark-800 border border-dark-700 hover:border-fed-gold-500/40 rounded-xl p-4 md:p-5 transition-all group"
          >
            <div className="flex items-center gap-4">
              {/* Number circle */}
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-fed-red-500/10 border border-fed-red-500/30 flex items-center justify-center text-fed-red-500 flex-shrink-0 font-bold font-heading text-sm md:text-base">
                {section.number}
              </div>

              {/* Icon */}
              <div className="hidden md:flex w-10 h-10 rounded-lg bg-dark-700 items-center justify-center text-fed-gold-500 flex-shrink-0">
                {section.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-bold text-sm md:text-base font-heading truncate">
                    {section.emoji} {section.title}
                  </h3>
                  {!loading && <StatusBadge status={section.status} />}
                </div>
                <p className="text-light-400 text-xs md:text-sm mb-1 line-clamp-1">
                  {section.description}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-light-400/70">
                  <span className="font-mono bg-dark-900 px-1.5 py-0.5 rounded">
                    {section.source}
                  </span>
                  {section.count !== undefined && (
                    <span className="text-fed-gold-500/80">
                      {section.count} {section.count > 1 ? 'elements' : 'element'}
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="hidden md:inline text-xs text-fed-gold-500 font-semibold">
                  Gerer
                </span>
                <Edit3 size={14} className="text-light-400 group-hover:text-fed-gold-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Help info */}
      <div className="mt-8 p-5 rounded-xl bg-fed-gold-500/5 border border-fed-gold-500/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-fed-gold-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-white font-bold mb-2 text-sm">A savoir</h4>
            <ul className="text-light-300 text-xs md:text-sm space-y-1.5 list-disc list-inside">
              <li>Cliquez sur une section pour aller directement a la page admin qui la gere.</li>
              <li>Les sections marquees <strong className="text-fed-gold-500">"Partiel"</strong> peuvent etre enrichies (peu de donnees actuelles).</li>
              <li>Les sections marquees <strong className="text-fed-red-400">"Vide"</strong> n'apparaissent pas sur le site (fallback automatique).</li>
              <li>Pour les sections statiques (Mission, CTA Rejoindre), une modification developpeur est necessaire.</li>
              <li>La section "Hero" et "Representation Internationale" se gerent dans <Link to="/admin/pages" className="text-fed-gold-500 hover:underline">/admin/pages</Link> &rarr; page "Home" &rarr; sections.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageManagerPage;
