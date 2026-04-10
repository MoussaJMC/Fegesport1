import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import {
  Users, Calendar, Building, Mail, Newspaper, Activity,
  Plus, AlertTriangle, RefreshCw, FileText, UserCheck,
  Award, Layers, Image, Video, Download, FileArchive,
  TrendingUp, ArrowRight, Clock, Shield, Gamepad2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface DashboardStats {
  members: number;
  events: number;
  partners: number;
  messages: number;
  news: number;
  newsletter: number;
  registrations: number;
  resources: number;
  leadership: number;
  cards: number;
  slideshow: number;
  streams: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    members: 0, events: 0, partners: 0, messages: 0,
    news: 0, newsletter: 0, registrations: 0, resources: 0,
    leadership: 0, cards: 0, slideshow: 0, streams: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const checkSupabaseConnection = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      return !error;
    } catch { return false; }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setConnectionError(null);

      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        throw new Error('Impossible de se connecter a la base de donnees.');
      }

      const fetchSafe = async (query: any, name: string) => {
        try {
          const result = await Promise.race([
            query,
            new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout ${name}`)), 10000))
          ]);
          return result;
        } catch { return { count: 0, error: true }; }
      };

      const [
        membersR, eventsR, partnersR, messagesR,
        newsR, newsletterR, registrationsR, resourcesR,
        leadershipR, cardsR, slideshowR, streamsR
      ] = await Promise.all([
        fetchSafe(supabase.from('members').select('id', { count: 'exact', head: true }), 'members'),
        fetchSafe(supabase.from('events').select('id', { count: 'exact', head: true }), 'events'),
        fetchSafe(supabase.from('partners').select('id', { count: 'exact', head: true }), 'partners'),
        fetchSafe(supabase.from('contact_messages').select('id', { count: 'exact', head: true }), 'messages'),
        fetchSafe(supabase.from('news').select('id', { count: 'exact', head: true }), 'news'),
        fetchSafe(supabase.from('newsletter_subscriptions').select('id', { count: 'exact', head: true }), 'newsletter'),
        fetchSafe(supabase.from('event_registrations').select('id', { count: 'exact', head: true }), 'registrations'),
        fetchSafe(supabase.from('static_files').select('id', { count: 'exact', head: true }), 'resources'),
        fetchSafe(supabase.from('leadership_team').select('id', { count: 'exact', head: true }), 'leadership'),
        fetchSafe(supabase.from('cards').select('id', { count: 'exact', head: true }), 'cards'),
        fetchSafe(supabase.from('slideshow_images').select('id', { count: 'exact', head: true }), 'slideshow'),
        fetchSafe(supabase.from('streams').select('id', { count: 'exact', head: true }), 'streams')
      ]);

      const recentActivity: Array<{ id: string; type: string; description: string; timestamp: string; }> = [];

      try {
        const { data: recentMembers } = await supabase
          .from('members').select('id, first_name, last_name, created_at')
          .order('created_at', { ascending: false }).limit(3);

        recentMembers?.forEach(m => {
          recentActivity.push({
            id: m.id, type: 'member',
            description: `Nouveau membre: ${m.first_name} ${m.last_name}`,
            timestamp: m.created_at
          });
        });

        const { data: recentMessages } = await supabase
          .from('contact_messages').select('id, name, subject, created_at')
          .order('created_at', { ascending: false }).limit(2);

        recentMessages?.forEach(m => {
          recentActivity.push({
            id: m.id, type: 'message',
            description: `Message de ${m.name}: ${m.subject}`,
            timestamp: m.created_at
          });
        });
      } catch {}

      recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setStats({
        members: membersR.count || 0, events: eventsR.count || 0,
        partners: partnersR.count || 0, messages: messagesR.count || 0,
        news: newsR.count || 0, newsletter: newsletterR.count || 0,
        registrations: registrationsR.count || 0, resources: resourcesR.count || 0,
        leadership: leadershipR.count || 0, cards: cardsR.count || 0,
        slideshow: slideshowR.count || 0, streams: streamsR.count || 0,
        recentActivity: recentActivity.slice(0, 5)
      });
      setRetryCount(0);
    } catch (error: any) {
      setConnectionError(error.message || 'Erreur de chargement');
      toast.error('Erreur de connexion au tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => { setRetryCount(prev => prev + 1); fetchDashboardStats(); };

  const primaryStats = [
    { title: 'Membres', icon: Users, count: stats.members, color: 'bg-accent-blue-500', path: '/admin/members' },
    { title: 'Evenements', icon: Calendar, count: stats.events, color: 'bg-emerald-500', path: '/admin/events' },
    { title: 'Messages', icon: Mail, count: stats.messages, color: 'bg-fed-gold-500', path: '/admin/messages' },
    { title: 'Actualites', icon: Newspaper, count: stats.news, color: 'bg-fed-red-500', path: '/admin/news' },
  ];

  const secondaryStats = [
    { title: 'Inscriptions', icon: UserCheck, count: stats.registrations, path: '/admin/registrations' },
    { title: 'Partenaires', icon: Building, count: stats.partners, path: '/admin/partners' },
    { title: 'Direction', icon: Award, count: stats.leadership, path: '/admin/leadership' },
    { title: 'Newsletter', icon: Mail, count: stats.newsletter, path: '/admin/newsletter' },
    { title: 'Fichiers', icon: FileText, count: stats.resources, path: '/admin/files' },
    { title: 'Cartes', icon: Layers, count: stats.cards, path: '/admin/cards' },
    { title: 'Diaporama', icon: Image, count: stats.slideshow, path: '/admin/slideshow' },
    { title: 'Streams', icon: Video, count: stats.streams, path: '/admin/streams' },
  ];

  const quickActions = [
    { title: 'Nouveau Membre', icon: Users, path: '/admin/members', accent: 'text-accent-blue-500' },
    { title: 'Nouvel Evenement', icon: Calendar, path: '/admin/events', accent: 'text-emerald-500' },
    { title: 'Nouvelle Actualite', icon: Newspaper, path: '/admin/news', accent: 'text-fed-red-500' },
    { title: 'Nouveau Partenaire', icon: Building, path: '/admin/partners', accent: 'text-fed-gold-500' },
  ];

  const getActivityIcon = (type: string) => {
    if (type === 'member') return <Users className="h-4 w-4 text-accent-blue-400" />;
    return <Mail className="h-4 w-4 text-fed-gold-500" />;
  };

  // === LOADING STATE ===
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-3 border-dark-700 border-t-fed-red-500 rounded-full animate-spin" />
        <p className="text-light-400 text-sm">Chargement du tableau de bord...</p>
      </div>
    );
  }

  // === ERROR STATE ===
  if (connectionError) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="bg-dark-800 border border-fed-red-500/20 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-fed-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-7 w-7 text-fed-red-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 font-heading">Erreur de connexion</h3>
          <p className="text-light-400 text-sm mb-6">{connectionError}</p>
          <div className="flex justify-center gap-3">
            <button onClick={handleRetry} className="btn btn-primary px-6">
              <RefreshCw className="h-4 w-4 mr-2" /> Reessayer
            </button>
            <Link to="/admin/diagnostic" className="btn btn-ghost px-6">
              <Activity className="h-4 w-4 mr-2" /> Diagnostic
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // === MAIN DASHBOARD ===
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">
            Bienvenue{user?.email ? `, ${user.email.split('@')[0]}` : ''}
          </h1>
          <p className="text-light-400 mt-0.5 text-sm">
            Tableau de bord FEGESPORT &mdash; {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-3 py-2 text-sm text-light-300 bg-dark-800 border border-dark-700 rounded-lg hover:bg-dark-700 hover:text-white transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" /> Actualiser
          </button>
          <Link
            to="/"
            className="inline-flex items-center px-3 py-2 text-sm text-fed-gold-500 bg-dark-800 border border-dark-700 rounded-lg hover:bg-dark-700 transition-colors"
          >
            Voir le site <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Link>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryStats.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <Link
              to={item.path}
              className="block bg-dark-800 rounded-xl border border-dark-700 hover:border-fed-red-500/30 transition-all duration-200 overflow-hidden group"
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${item.color}`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-dark-700 group-hover:text-light-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-white font-heading">{item.count}</p>
                  <p className="text-sm text-light-400 mt-0.5">{item.title}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Secondary Stats */}
        <div className="lg:col-span-2 bg-dark-800 rounded-xl border border-dark-700">
          <div className="p-5 border-b border-dark-700">
            <h3 className="text-sm font-semibold text-white flex items-center font-heading">
              <TrendingUp className="h-4 w-4 mr-2 text-fed-gold-500" />
              Apercu des sections
            </h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {secondaryStats.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center p-3 rounded-xl border border-dark-700 hover:border-fed-gold-500/30 hover:bg-dark-700/50 transition-all group"
                >
                  <div className="p-2 rounded-lg bg-dark-700 mb-2 group-hover:bg-dark-900 transition-colors">
                    <item.icon className="h-4 w-4 text-light-400 group-hover:text-fed-gold-500 transition-colors" />
                  </div>
                  <span className="text-xl font-bold text-white font-heading">{item.count}</span>
                  <span className="text-xs text-light-400 mt-0.5 text-center">{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-dark-800 rounded-xl border border-dark-700">
          <div className="p-5 border-b border-dark-700">
            <h3 className="text-sm font-semibold text-white flex items-center font-heading">
              <Plus className="h-4 w-4 mr-2 text-fed-red-500" />
              Actions rapides
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="flex items-center px-4 py-3 rounded-xl border border-dark-700 hover:border-fed-red-500/30 hover:bg-dark-700/50 transition-all group"
              >
                <action.icon className={`h-4 w-4 mr-3 ${action.accent}`} />
                <span className="text-sm font-medium text-light-300 group-hover:text-white transition-colors">{action.title}</span>
                <Plus className="h-3.5 w-3.5 ml-auto text-dark-700 group-hover:text-light-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity + System */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-dark-800 rounded-xl border border-dark-700">
          <div className="p-5 border-b border-dark-700">
            <h3 className="text-sm font-semibold text-white flex items-center font-heading">
              <Clock className="h-4 w-4 mr-2 text-accent-blue-400" />
              Activite recente
            </h3>
          </div>
          <div className="p-5">
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-light-100">{activity.description}</p>
                      <p className="text-xs text-light-400 mt-0.5">
                        {new Date(activity.timestamp).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-8 w-8 text-dark-700" />
                <p className="text-sm text-light-400 mt-2">Aucune activite recente</p>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="space-y-4">
          <div className="bg-dark-800 rounded-xl border border-dark-700 p-5">
            <h3 className="text-sm font-semibold text-white mb-4 font-heading">Etat du systeme</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm text-light-300">Operationnel</span>
              </div>
              <Link to="/admin/diagnostic" className="text-xs text-fed-gold-500 hover:text-fed-gold-400 font-medium transition-colors">
                Details
              </Link>
            </div>
            <div className="space-y-2.5 text-xs text-light-400">
              <div className="flex justify-between"><span>Base de donnees</span><span className="text-emerald-400">OK</span></div>
              <div className="flex justify-between"><span>Authentification</span><span className="text-emerald-400">OK</span></div>
              <div className="flex justify-between"><span>Stockage fichiers</span><span className="text-emerald-400">OK</span></div>
            </div>
          </div>

          {/* Federation badge */}
          <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl border border-fed-gold-500/20 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-fed-gold-500/10 rounded-lg border border-fed-gold-500/20">
                <Gamepad2 className="h-5 w-5 text-fed-gold-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-heading">FEGESPORT</h3>
                <p className="text-xs text-fed-gold-500">Federation Guineenne d'Esport</p>
              </div>
            </div>
            <p className="text-xs text-light-400 leading-relaxed">
              Panneau d'administration de la plateforme institutionnelle. Gerez les contenus, membres et evenements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
