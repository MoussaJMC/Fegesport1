import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  Loader2, Home, Newspaper, Calendar, Users, Building2, 
  MessageSquare, LogOut, Menu, X, Bell, Activity, FolderOpen 
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

const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading, signOut } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      setNotificationLoading(true);
      const notifications: Notification[] = [];

      // Fetch recent members (last 7 days)
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

      // Fetch recent messages (last 7 days)
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

      // Fetch recent events (upcoming in next 7 days)
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
            title: 'Événement à venir',
            message: `${event.title} - ${new Date(event.date).toLocaleDateString('fr-FR')}`,
            time: getRelativeTime(event.created_at),
            read: true
          });
        });
      }

      // Sort notifications by time (most recent first)
      notifications.sort((a, b) => {
        const timeA = parseRelativeTime(a.time);
        const timeB = parseRelativeTime(b.time);
        return timeA - timeB;
      });

      setNotifications(notifications.slice(0, 10)); // Limit to 10 notifications
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set fallback notifications if there's an error
      setNotifications([
        {
          id: 'fallback-1',
          type: 'message',
          title: 'Système',
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
    return 999999; // For dates, put them last
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'member': return <Users size={16} className="text-blue-500" />;
      case 'message': return <MessageSquare size={16} className="text-green-500" />;
      case 'event': return <Calendar size={16} className="text-purple-500" />;
      case 'partner': return <Building2 size={16} className="text-orange-500" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: Activity, label: 'Diagnostic', path: '/admin/diagnostic' },
    { icon: Newspaper, label: 'Actualités', path: '/admin/news' },
    { icon: Calendar, label: 'Événements', path: '/admin/events' },
    { icon: Users, label: 'Membres', path: '/admin/members' },
    { icon: Building2, label: 'Partenaires', path: '/admin/partners' },
    { icon: MessageSquare, label: 'Messages', path: '/admin/messages' },
    { icon: FolderOpen, label: 'Fichiers', path: '/admin/files' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-64 bg-white shadow-lg fixed h-full z-20 lg:relative"
          >
            <div className="h-full flex flex-col">
              <div className="p-6 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">Administration</h1>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-4 space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-lg transition-all transform hover:scale-105 ${
                        isActive
                          ? 'bg-primary-50 text-primary-600 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t">
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Déconnexion
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm h-16 flex items-center px-4 sticky top-0 z-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 hover:text-gray-700 mr-4"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1"></div>

          {/* Notifications */}
          <div className="relative mr-4">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) {
                  fetchNotifications();
                }
              }}
              className="p-2 text-gray-500 hover:text-gray-700 relative transition-colors"
              disabled={notificationLoading}
            >
              {notificationLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Bell size={20} />
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto"
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''} notification{unreadCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                {notification.time}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Aucune notification
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Vous êtes à jour !
                      </p>
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        // You could navigate to a full notifications page here
                      }}
                      className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Voir toutes les notifications
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;