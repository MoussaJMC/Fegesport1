import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { LogOut, Users, Calendar, Building, Mail, Newspaper, Activity, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface DashboardStats {
  members: number;
  events: number;
  partners: number;
  messages: number;
  news: number;
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
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch counts from all tables
      const [membersResult, eventsResult, partnersResult, messagesResult, newsResult] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('partners').select('id', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
        supabase.from('news').select('id', { count: 'exact', head: true })
      ]);

      // Fetch recent activity (latest entries from different tables)
      const recentActivity: Array<{
        id: string;
        type: string;
        description: string;
        timestamp: string;
      }> = [];
      
      // Recent members
      const { data: recentMembers } = await supabase
        .from('members')
        .select('id, first_name, last_name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentMembers) {
        recentMembers.forEach(member => {
          recentActivity.push({
            id: member.id,
            type: 'member',
            description: `Nouveau membre: ${member.first_name} ${member.last_name}`,
            timestamp: member.created_at
          });
        });
      }

      // Recent messages
      const { data: recentMessages } = await supabase
        .from('contact_messages')
        .select('id, name, subject, created_at')
        .order('created_at', { ascending: false })
        .limit(2);

      if (recentMessages) {
        recentMessages.forEach(message => {
          recentActivity.push({
            id: message.id,
            type: 'message',
            description: `Nouveau message de ${message.name}: ${message.subject}`,
            timestamp: message.created_at
          });
        });
      }

      // Sort activity by timestamp
      recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setStats({
        members: membersResult.count || 0,
        events: eventsResult.count || 0,
        partners: partnersResult.count || 0,
        messages: messagesResult.count || 0,
        news: newsResult.count || 0,
        recentActivity: recentActivity.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
      navigate('/admin/login');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const menuItems = [
    { 
      title: 'Membres', 
      icon: Users, 
      path: '/admin/members', 
      count: stats.members,
      color: 'bg-blue-500',
      description: 'Gérer les membres'
    },
    { 
      title: 'Événements', 
      icon: Calendar, 
      path: '/admin/events', 
      count: stats.events,
      color: 'bg-green-500',
      description: 'Organiser les événements'
    },
    { 
      title: 'Partenaires', 
      icon: Building, 
      path: '/admin/partners', 
      count: stats.partners,
      color: 'bg-purple-500',
      description: 'Gérer les partenariats'
    },
    { 
      title: 'Messages', 
      icon: Mail, 
      path: '/admin/messages', 
      count: stats.messages,
      color: 'bg-orange-500',
      description: 'Messages de contact'
    },
    { 
      title: 'Actualités', 
      icon: Newspaper, 
      path: '/admin/news', 
      count: stats.news,
      color: 'bg-red-500',
      description: 'Publier des actualités'
    },
    { 
      title: 'Diagnostic', 
      icon: Activity, 
      path: '/admin/diagnostic', 
      count: '✓',
      color: 'bg-gray-500',
      description: 'Diagnostic système'
    }
  ];

  const quickActions = [
    { title: 'Nouveau Membre', icon: Users, path: '/admin/members', action: 'create' },
    { title: 'Nouvel Événement', icon: Calendar, path: '/admin/events', action: 'create' },
    { title: 'Nouvelle Actualité', icon: Newspaper, path: '/admin/news', action: 'create' },
    { title: 'Nouveau Partenaire', icon: Building, path: '/admin/partners', action: 'create' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Vue d'ensemble de l'administration FEGESPORT</p>
        </div>
        <div className="flex space-x-4">
          <Link
            to="/admin/diagnostic"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Activity className="h-4 w-4 mr-2" />
            Diagnostic
          </Link>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link
              to={item.path}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${item.color} p-3 rounded-md`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {item.title}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {item.count}
                        </div>
                      </dd>
                      <dd className="text-sm text-gray-600">
                        {item.description}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="font-medium text-primary-600 hover:text-primary-500">
                    Voir tout <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Actions Rapides
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-primary-50 text-primary-600 group-hover:bg-primary-100">
                    <action.icon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {action.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Créer un nouveau {action.title.toLowerCase()}
                  </p>
                </div>
                <span
                  className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                  aria-hidden="true"
                >
                  <Plus className="h-6 w-6" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Activité Récente
          </h3>
          {stats.recentActivity.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {stats.recentActivity.map((activity, index) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {index !== stats.recentActivity.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            activity.type === 'member' ? 'bg-blue-500' : 'bg-orange-500'
                          }`}>
                            {activity.type === 'member' ? (
                              <Users className="h-4 w-4 text-white" />
                            ) : (
                              <Mail className="h-4 w-4 text-white" />
                            )}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {activity.description}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {new Date(activity.timestamp).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                État du Système
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Statut des services et de la base de données
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-500">Opérationnel</span>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/admin/diagnostic"
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              Voir le diagnostic complet <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;