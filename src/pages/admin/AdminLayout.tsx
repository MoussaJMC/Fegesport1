import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AdminGuard from '../../components/admin/AdminGuard';
import {
  Loader2, Home, Newspaper, Calendar, Users, Building2,
  MessageSquare, LogOut, Menu, X, Bell, Activity, FolderOpen,
  Globe, Database, Book, Tag, Award, Layers, Image, Video,
  Mail, UserCheck, Settings, Gamepad2, Navigation,
  LayoutGrid as Layout, Clock, Target, Share2, BarChart3,
  FileText, ChevronDown, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  type: 'member' | 'message' | 'event' | 'partner';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface MenuGroup {
  label: string;
  items: { icon: any; label: string; path: string }[];
}

const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading, signOut } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [hasLoadedNotifications, setHasLoadedNotifications] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isAuthenticated && !hasLoadedNotifications) {
      fetchNotifications();
      setHasLoadedNotifications(true);
    }
  }, [isAuthenticated, hasLoadedNotifications]);

  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);
      const notifications: Notification[] = [];

      const { data: recentMembers } = await supabase
        .from('members')
        .select('id, first_name, last_name, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentMembers) {
        recentMembers.forEach(member => {
          notifications.push({
            id: `member-${member.id}`,
            type: 'member',
            title: 'Nouveau membre',
            message: `${member.first_name} ${member.last_name} s'est inscrit`,
            time: getRelativeTime(member.created_at),
            read: false
          });
        });
      }

      const { data: recentMessages } = await supabase
        .from('contact_messages')
        .select('id, name, subject, created_at, status')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentMessages) {
        recentMessages.forEach(message => {
          notifications.push({
            id: `message-${message.id}`,
            type: 'message',
            title: 'Nouveau message',
            message: `${message.name}: ${message.subject}`,
            time: getRelativeTime(message.created_at),
            read: message.status !== 'unread'
          });
        });
      }

      const { data: upcomingEvents } = await supabase
        .from('events')
        .select('id, title, date, created_at')
        .gte('date', new Date().toISOString().split('T')[0])
        .lte('date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(3);

      if (upcomingEvents) {
        upcomingEvents.forEach(event => {
          notifications.push({
            id: `event-${event.id}`,
            type: 'event',
            title: 'Evenement a venir',
            message: `${event.title} - ${new Date(event.date).toLocaleDateString('fr-FR')}`,
            time: getRelativeTime(event.created_at),
            read: true
          });
        });
      }

      notifications.sort((a, b) => {
        const timeA = parseRelativeTime(a.time);
        const timeB = parseRelativeTime(b.time);
        return timeA - timeB;
      });

      setNotifications(notifications.slice(0, 10));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([
        {
          id: 'fallback-1',
          type: 'message',
          title: 'Systeme',
          message: 'Impossible de charger les notifications',
          time: 'maintenant',
          read: false
        }
      ]);
    } finally {
      setNotificationLoading(false);
    }
  };

  const getRelativeTime = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'maintenant';
    if (diffInMinutes < 60) return `il y a ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `il y a ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `il y a ${diffInDays}j`;

    return date.toLocaleDateString('fr-FR');
  };

  const parseRelativeTime = (timeString: string): number => {
    if (timeString === 'maintenant') return 0;
    if (timeString.includes('min')) return parseInt(timeString.match(/\d+/)?.[0] || '0');
    if (timeString.includes('h')) return parseInt(timeString.match(/\d+/)?.[0] || '0') * 60;
    if (timeString.includes('j')) return parseInt(timeString.match(/\d+/)?.[0] || '0') * 24 * 60;
    return 999999;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'member': return <Users size={16} className="text-accent-blue-400" />;
      case 'message': return <MessageSquare size={16} className="text-emerald-400" />;
      case 'event': return <Calendar size={16} className="text-purple-400" />;
      case 'partner': return <Building2 size={16} className="text-fed-gold-500" />;
      default: return <Bell size={16} className="text-light-400" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const menuGroups: MenuGroup[] = [
    {
      label: 'Tableau de bord',
      items: [
        { icon: Home, label: 'Dashboard', path: '/admin' },
        { icon: BarChart3, label: 'Statistiques Web', path: '/admin/analytics' },
        { icon: Activity, label: 'Diagnostic', path: '/admin/diagnostic' },
        { icon: Database, label: 'Test DB', path: '/admin/test-database' },
      ]
    },
    {
      label: 'Contenu',
      items: [
        { icon: Newspaper, label: 'Actualites', path: '/admin/news' },
        { icon: Globe, label: 'Pages', path: '/admin/pages' },
        { icon: Image, label: 'Diaporama', path: '/admin/slideshow' },
        { icon: Layers, label: 'Cartes', path: '/admin/cards' },
        { icon: Video, label: 'Streams', path: '/admin/streams' },
        { icon: FileText, label: 'Documents Officiels', path: '/admin/documents' },
        { icon: Book, label: 'Ressources', path: '/admin/resources' },
        { icon: FolderOpen, label: 'Fichiers', path: '/admin/files' },
      ]
    },
    {
      label: 'Evenements',
      items: [
        { icon: Calendar, label: 'Evenements', path: '/admin/events' },
        { icon: Clock, label: 'Evenements a Venir', path: '/admin/upcoming-events' },
        { icon: UserCheck, label: 'Inscriptions', path: '/admin/registrations' },
      ]
    },
    {
      label: 'eLeague',
      items: [
        { icon: Gamepad2, label: 'eLeague', path: '/admin/leg' },
        { icon: Target, label: 'Sponsors LEG', path: '/admin/sponsors' },
      ]
    },
    {
      label: 'Communaute',
      items: [
        { icon: Users, label: 'Membres', path: '/admin/members' },
        { icon: Tag, label: 'Types d\'Adhesion', path: '/admin/membership-types' },
        { icon: Award, label: 'Notre Direction', path: '/admin/leadership' },
        { icon: Clock, label: 'Notre Histoire', path: '/admin/history' },
        { icon: Building2, label: 'Partenaires', path: '/admin/partners' },
      ]
    },
    {
      label: 'Communication',
      items: [
        { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
        { icon: Mail, label: 'Newsletter', path: '/admin/newsletter' },
        { icon: Mail, label: 'Emails', path: '/admin/emails' },
        { icon: Mail, label: 'Test Email', path: '/admin/email-test' },
      ]
    },
    {
      label: 'Configuration',
      items: [
        { icon: Settings, label: 'Parametres Site', path: '/admin/settings' },
        { icon: Share2, label: 'Reseaux Sociaux', path: '/admin/social-media' },
        { icon: Navigation, label: 'Gestion du Menu', path: '/admin/menu' },
        { icon: Layout, label: 'Gestion du Footer', path: '/admin/footer' },
      ]
    },
  ];

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <Loader2 className="w-8 h-8 animate-spin text-fed-red-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-dark-950 flex admin-dark">
        {/* ================================================
            SIDEBAR — Dark federation theme
            ================================================ */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-72 bg-dark-950 border-r border-dark-700 fixed h-full z-20 lg:relative flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="p-5 flex items-center justify-between border-b border-dark-700">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-fed-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-fed-red-500/20">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-white leading-tight font-heading">FEGESPORT</h1>
                    <p className="text-xs text-fed-gold-500 font-medium">Administration</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden text-light-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sidebar Navigation */}
              <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1 scrollbar-thin">
                {menuGroups.map((group) => {
                  const isCollapsed = collapsedGroups[group.label];
                  const hasActiveItem = group.items.some(item => location.pathname === item.path);

                  return (
                    <div key={group.label} className="mb-1">
                      <button
                        onClick={() => toggleGroup(group.label)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${
                          hasActiveItem ? 'text-fed-gold-500' : 'text-light-400 hover:text-light-100'
                        }`}
                      >
                        {group.label}
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            {group.items.map((item) => {
                              const isActive = location.pathname === item.path;
                              return (
                                <Link
                                  key={item.path}
                                  to={item.path}
                                  className={`flex items-center px-3 py-2 my-0.5 rounded-lg text-sm transition-all duration-200 ${
                                    isActive
                                      ? 'bg-fed-red-500/15 text-fed-red-400 font-medium border border-fed-red-500/20'
                                      : 'text-light-300 hover:bg-dark-800 hover:text-white'
                                  }`}
                                >
                                  <item.icon className={`w-4 h-4 mr-3 flex-shrink-0 ${isActive ? 'text-fed-red-400' : 'text-light-400'}`} />
                                  <span className="truncate">{item.label}</span>
                                  {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 bg-fed-red-500 rounded-full" />
                                  )}
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>

              {/* Sidebar Footer */}
              <div className="p-3 border-t border-dark-700">
                <Link
                  to="/"
                  className="flex items-center w-full px-3 py-2 text-light-400 hover:bg-dark-800 hover:text-fed-gold-500 rounded-lg transition-colors text-sm mb-1"
                >
                  <Globe className="w-4 h-4 mr-3" />
                  Voir le site
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-3 py-2.5 text-light-400 hover:bg-fed-red-500/10 hover:text-fed-red-400 rounded-lg transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Deconnexion
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ================================================
            MAIN CONTENT
            ================================================ */}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Top Bar */}
          <header className="bg-dark-900 border-b border-dark-700 h-16 flex items-center px-4 lg:px-6 sticky top-0 z-10">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-light-400 hover:text-white mr-4 p-1.5 rounded-lg hover:bg-dark-800 transition-colors"
            >
              <Menu size={22} />
            </button>

            {/* Current page indicator */}
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-light-100">
                {menuGroups
                  .flatMap(g => g.items)
                  .find(item => item.path === location.pathname)?.label || 'Administration'}
              </p>
            </div>

            <div className="flex-1" />

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) {
                    fetchNotifications();
                  }
                }}
                className="p-2 text-light-400 hover:text-white hover:bg-dark-800 rounded-lg relative transition-colors"
                disabled={notificationLoading}
              >
                {notificationLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Bell size={20} />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-fed-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold ring-2 ring-dark-900">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 bg-dark-800 rounded-xl shadow-xl border border-dark-700 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-dark-700">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="text-light-400 hover:text-white p-0.5 rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {unreadCount > 0 && (
                        <p className="text-xs text-fed-gold-500 mt-1">
                          {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 border-b border-dark-700/50 hover:bg-dark-700/50 transition-colors ${
                              !notification.read ? 'bg-fed-red-500/5' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-white truncate">
                                    {notification.title}
                                  </p>
                                  <p className="text-[11px] text-light-400 flex-shrink-0 ml-2">
                                    {notification.time}
                                  </p>
                                </div>
                                <p className="text-xs text-light-400 mt-0.5 line-clamp-2">
                                  {notification.message}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="flex-shrink-0 mt-1.5">
                                  <div className="w-2 h-2 bg-fed-red-500 rounded-full" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="mx-auto h-10 w-10 text-dark-700" />
                          <p className="mt-2 text-sm text-light-400">Aucune notification</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-2.5 border-t border-dark-700">
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="w-full text-center text-xs text-fed-gold-500 hover:text-fed-gold-400 font-medium py-1 rounded hover:bg-dark-700 transition-colors"
                        >
                          Fermer les notifications
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-dark-900 p-4 lg:p-6">
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                  <Loader2 className="w-8 h-8 animate-spin text-fed-red-500" />
                </div>
              }
            >
              <Outlet />
            </React.Suspense>
          </main>
        </div>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </AdminGuard>
  );
};

export default AdminLayout;
