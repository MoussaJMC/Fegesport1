import React, { useState } from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Loader2, Home, Newspaper, Calendar, Users, Building2, 
  MessageSquare, LogOut, Menu, X, Bell, Activity, FolderOpen 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading, signOut } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications] = useState([
    { id: 1, message: "Nouveau message de contact", time: "Il y a 5 min" },
    { id: 2, message: "Nouvelle inscription membre", time: "Il y a 15 min" },
  ]);

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
            <button className="p-2 text-gray-500 hover:text-gray-700 relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-4 w-4 bg-primary-600 rounded-full text-xs text-white flex items-center justify-center">
                {notifications.length}
              </span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;