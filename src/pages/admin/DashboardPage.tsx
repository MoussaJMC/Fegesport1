import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import {
  Users, Calendar, Building, Mail, Newspaper, Activity,
  Plus, AlertTriangle, RefreshCw, FileText, UserCheck,
  Award, Layers, Image, Video, Download, FileArchive,
  TrendingUp, ArrowRight, Clock
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
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    members: 0,
    events: 0,
    partners: 0,
    messages: 0,
    news: 0,
    newsletter: 0,
    registrations: 0,
    resources: 0,
    leadership: 0,
    cards: 0,
    slideshow: 0,
    streams: 0,
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
      if (error) {
        console.error('Supabase connection test failed:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setConnectionError(null);

      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        throw new Error('Unable to connect to Supabase. Please check your connection and CORS settings.');
      }

      const fetchWithTimeout = async (query: any, tableName: string) => {
        try {
          const result = await Promise.race([
            query,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout fetching ${tableName}`)), 10000)
            )
          ]);
          return result;
        } catch (error) {
          console.error(`Error fetching ${tableName}:`, error);
          return { count: 0, error };
        }
      };

      const [
        membersResult, eventsResult, partnersResult, messagesResult,
        newsResult, newsletterResult, registrationsResult, resourcesResult,
        leadershipResult, cardsResult, slideshowResult, streamsResult
      ] = await Promise.all([
        fetchWithTimeout(supabase.from('members').select('id', { count: 'exact', head: true }), 'members'),
        fetchWithTimeout(supabase.from('events').select('id', { count: 'exact', head: true }), 'events'),
        fetchWithTimeout(supabase.from('partners').select('id', { count: 'exact', head: true }), 'partners'),
        fetchWithTimeout(supabase.from('contact_messages').select('id', { count: 'exact', head: true }), 'messages'),
        fetchWithTimeout(supabase.from('news').select('id', { count: 'exact', head: true }), 'news'),
        fetchWithTimeout(supabase.from('newsletter_subscriptions').select('id', { count: 'exact', head: true }), 'newsletter'),
        fetchWithTimeout(supabase.from('event_registrations').select('id', { count: 'exact', head: true }), 'registrations'),
        fetchWithTimeout(supabase.from('static_files').select('id', { count: 'exact', head: true }), 'resources'),
        fetchWithTimeout(supabase.from('leadership_team').select('id', { count: 'exact', head: true }), 'leadership'),
        fetchWithTimeout(supabase.from('cards').select('id', { count: 'exact', head: true }), 'cards'),
        fetchWithTimeout(supabase.from('slideshow_images').select('id', { count: 'exact', head: true }), 'slideshow'),
        fetchWithTimeout(supabase.from('streams').select('id', { count: 'exact', head: true }), 'streams')
      ]);

      const recentActivity: Array<{
        id: string;
        type: string;
        description: string;
        timestamp: string;
      }> = [];

      try {
        const { data: recentMembers, error: membersError } = await supabase
          .from('members')
          .select('id, first_name, last_name, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        if (!membersError && recentMembers) {
          recentMembers.forEach(member => {
            recentActivity.push({
              id: member.id,
              type: 'member',
              description: `Nouveau membre: ${member.first_name} ${member.last_name}`,
              timestamp: member.created_at
            });
          });
        }

        const { data: recentMessages, error: messagesError } = await supabase
          .from('contact_messages')
          .select('id, name, subject, created_at')
          .order('created_at', { ascending: false })
          .limit(2);

        if (!messagesError && recentMessages) {
          recentMessages.forEach(message => {
            recentActivity.push({
              id: message.id,
              type: 'message',
              description: `Nouveau message de ${message.name}: ${message.subject}`,
              timestamp: message.created_at
            });
          });
        }
      } catch (activityError) {
        console.error('Error fetching recent activity:', activityError);
      }

      recentActivity.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setStats({
        members: membersResult.count || 0,
        events: eventsResult.count || 0,
        partners: partnersResult.count || 0,
        messages: messagesResult.count || 0,
        news: newsResult.count || 0,
        newsletter: newsletterResult.count || 0,
        registrations: registrationsResult.count || 0,
        resources: resourcesResult.count || 0,
        leadership: leadershipResult.count || 0,
        cards: cardsResult.count || 0,
        slideshow: slideshowResult.count || 0,
        streams: streamsResult.count || 0,
        recentActivity: recentActivity.slice(0, 5)
      });

      setRetryCount(0);
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      let errorMessage = 'Erreur lors du chargement des statistiques';

      if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Impossible de se connecter Ã  la base de donnÃ©es. VÃ©rifiez votre connexion internet et les paramÃ¨tres CORS de Supabase.';
      } else if (error.message?.includes('Timeout')) {
        errorMessage = 'DÃ©lai d\'attente dÃ©passÃ© lors de la connexion Ã  la base de donnÃ©es.';
      } else if (error.message?.includes('CORS')) {
        errorMessage = 'Erreur CORS: Ajoutez votre URL de dÃ©veloppement aux origines CORS autorisÃ©es dans Supabase.';
      }

      setConnectionError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchDashboardStats();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('DÃ©connexion rÃ©ussie');
      navigate('/admin/login');
    } catch (error) {
      toast.error('Erreur lors de la dÃ©connexion');
    }
  };

  const handleDownloadBackup = () => {
    const link = document.createElement('a');
    link.href = '/fegesport-backup.tar.gz';
    link.download = 'fegesport-backup.tar.gz';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('TÃ©lÃ©chargement de la sauvegarde lancÃ©');
  };

  // === STATS PRINCIPALES (les plus importantes en haut) ===
  const primaryStats = [
    { title: 'Membres', icon: Users, count: stats.members, color: 'from-blue-500 to-blue-600', path: '/admin/members' },
    { title: 'ÃvÃ©nements', icon: Calendar, count: stats.events, color: 'from-emerald-500 to-emerald-600', path: '/admin/events' },
    { title: 'Messages', icon: Mail, count: stats.messages, color: 'from-orange-500 to-orange-600', path: '/admin/messages' },
    { title: 'ActualitÃ©s', icon: Newspaper, count: stats.news, color: 'from-rose-500 to-rose-600', path: '/admin/news' },
  ];

  // === STATS SECONDAIRES ===
  const secondaryStats = [
    { title: 'Inscriptions', icon: UserCheck, count: stats.registrations, path: '/admin/registrations', color: 'text-teal-600 bg-teal-50' },
    { title: 'Partenaires', icon: Building, count: stats.partners, path: '/admin/partners', color: 'text-purple-600 bg-purple-50' },
    { title: 'Direction', icon: Award, count: stats.leadership, path: '/admin/leadership', color: 'text-amber-600 bg-amber-50' },
    { title: 'Newsletter', icon: Mail, count: stats.newsletter, path: '/admin/newsletter', color: 'text-cyan-600 bg-cyan-50' },
    { title: 'Fichiers', icon: FileText, count: stats.resources, path: '/admin/files', color: 'text-indigo-600 bg-indigo-50' },
    { title: 'Cartes', icon: Layers, count: stats.cards, path: '/admin/cards', color: 'text-pink-600 bg-pink-50' },
    { title: 'Diaporama', icon: Image, count: stats.slideshow, path: '/admin/slideshow', color: 'text-violet-600 bg-violet-50' },
    { title: 'Streams', icon: Video, count: stats.streams, path: '/admin/streams', color: 'text-rose-600 bg-rose-50' },
  ];

  const quickActions = [
    { title: 'Nouveau Membre', icon: Users, path: '/admin/members', color: 'text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100' },
    { title: 'Nouvel ÃvÃ©nement', icon: Calendar, path: '/admin/events', color: 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100' },
    { title: 'Nouvelle ActualitÃ©', icon: Newspaper, path: '/admin/news', color: 'text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100' },
    { title: 'Nouveau Partenaire', icon: Building, path: '/admin/partners', color: 'text-purple-600 bg-purple-50 border-purple-100 hover:bg-purple-100' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-600 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-gray-500 text-sm">Chargement du tableau de bord...</p>
        {retryCount > 0 && (
          <p className="text-xs text-gray-400">Tentative {retryCount + 1}</p>
        )}
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto mt-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble de l'administration FEGESPORT</p>
        </div>

        <div className="bg-white border border-red-200 rounded-xl p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Erreur de connexion
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              {connectionError}
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-700 font-medium">
                Solutions possibles :
              </p>
              <ul className="text-sm text-gray-600 space-y-2 text-left max-w-sm mx-auto">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                  VÃ©rifiez votre connexion internet
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                  Assurez-vous que votre projet Supabase est actif
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                  VÃ©rifiez les origines CORS dans les paramÃ¨tres Supabase
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                  VÃ©rifiez vos variables d'environnement
                </li>
              </ul>
            </div>
            <div className="mt-6 flex justify-center space-x-3">
              <button
                onClick={handleRetry}
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                RÃ©essayer
              </button>
              <Link
                to="/admin/diagnostic"
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Activity className="h-4 w-4 mr-2" />
                Diagnostic
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenue sur le Dashboard
          </h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            Vue d'ensemble de l'administration FEGESPORT &mdash; {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Actualiser
          </button>
          <Link
            to="/admin/diagnostic"
            className="inline-flex items-center px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Activity className="h-4 w-4 mr-1.5" />
            Diagnostic
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
              className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color}`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-gray-900">{item.count}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{item.title}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats + Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Secondary Stats */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-gray-400" />
              AperÃ§u des sections
            </h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {secondaryStats.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                >
                  <div className={`p-2 rounded-lg ${item.color} mb-2`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">{item.count}</span>
                  <span className="text-xs text-gray-500 mt-0.5 text-center">{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <Plus className="h-4 w-4 mr-2 text-gray-400" />
              Actions rapides
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className={`flex items-center px-4 py-3 rounded-lg border transition-all ${action.color}`}
              >
                <action.icon className="h-4 w-4 mr-3" />
                <span className="text-sm font-medium">{action.title}</span>
                <Plus className="h-3.5 w-3.5 ml-auto opacity-50" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity + System Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              ActivitÃ© rÃ©cente
            </h3>
          </div>
          <div className="p-5">
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'member' ? 'bg-blue-100' : 'bg-orange-100'
                    }`}>
                      {activity.type === 'member' ? (
                        <Users className={`h-4 w-4 ${activity.type === 'member' ? 'text-blue-600' : 'text-orange-600'}`} />
                      ) : (
                        <Mail className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(activity.timestamp).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {index < stats.recentActivity.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-100" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Clock className="mx-auto h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-500 mt-2">Aucune activitÃ© rÃ©cente</p>
              </div>
            )}
          </div>
        </div>

        {/* System Status + Backup */}
        <div className="space-y-4">
          {/* System Status */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Ãtat du systÃ¨me</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600">OpÃ©rationnel</span>
              </div>
              <Link
                to="/admin/diagnostic"
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                DÃ©tails
              </Link>
            </div>
          </div>

          {/* Backup Download */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-sm p-5 text-white">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <FileArchive className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Sauvegarde</h3>
                <p className="text-xs text-gray-400">Archive complÃ¨te du site</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-4">
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span>264 fichiers</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span>87 migrations</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span>327 KB</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span>43 correctifs</span>
              </div>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              TÃ©lÃ©charger
            </button>
            <p className="text-[11px] text-gray-500 mt-3 flex items-start">
              <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0 text-amber-400" />
              Contient des clÃ©s API sensibles. Stockez en lieu sÃ»r.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
