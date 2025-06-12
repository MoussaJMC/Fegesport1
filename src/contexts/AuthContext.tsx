import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkServiceHealth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
      }
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkServiceHealth = async (): Promise<boolean> => {
    try {
      // Try a simple query to check if Supabase is accessible
      const { error } = await supabase.from('profiles').select('count').limit(1);
      return !error;
    } catch (error) {
      console.error('Service health check failed:', error);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // First check if the service is accessible
      const isHealthy = await checkServiceHealth();
      if (!isHealthy) {
        throw new Error('Le service d\'authentification n\'est pas accessible. Veuillez vérifier votre connexion internet et réessayer.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Supabase auth error:', error);
        
        // Enhanced error handling with more specific messages
        if (error.message.includes('Database error querying schema')) {
          throw new Error('🔧 Problème technique Supabase détecté\n\nLe service d\'authentification rencontre des difficultés avec sa base de données. Ceci est généralement temporaire et peut être causé par :\n\n• Maintenance programmée de Supabase\n• Surcharge temporaire du serveur\n• Problème de connectivité réseau\n\nActions recommandées :\n✓ Attendez 2-3 minutes et réessayez\n✓ Vérifiez status.supabase.com\n✓ Contactez l\'administrateur si le problème persiste');
        } else if (error.message.includes('unexpected_failure')) {
          throw new Error('⚠️ Erreur serveur Supabase inattendue\n\nLe service pourrait être temporairement indisponible ou en maintenance. Cette erreur est généralement résolue automatiquement.\n\nVeuillez réessayer dans quelques minutes.');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Veuillez confirmer votre email avant de vous connecter');
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Trop de tentatives de connexion. Veuillez patienter avant de réessayer.');
        } else if (error.status === 500) {
          throw new Error('🚨 Erreur serveur Supabase (500)\n\nLe service d\'authentification rencontre des problèmes techniques internes. Ceci indique généralement :\n\n• Problème de base de données Supabase\n• Maintenance en cours\n• Surcharge du service\n\nVeuillez réessayer dans quelques minutes ou vérifier status.supabase.com');
        } else if (error.status === 503) {
          throw new Error('🔧 Service Supabase temporairement indisponible (503)\n\nMaintenance programmée ou surcharge du service en cours.\n\nVeuillez réessayer dans quelques minutes.');
        } else if (error.status === 502 || error.status === 504) {
          throw new Error('🌐 Problème de connectivité Supabase\n\nProblème de passerelle ou timeout du serveur.\n\nVeuillez réessayer dans quelques instants.');
        } else {
          // Generic error message for other cases
          throw new Error(`Erreur de connexion Supabase: ${error.message}\n\nCode d'erreur: ${error.status || 'N/A'}`);
        }
      }

      if (!data.user) {
        throw new Error('Aucune donnée utilisateur retournée par Supabase');
      }

      // Check if user has admin role in user_metadata
      const isAdmin = data.user.user_metadata?.role === 'admin';
      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error('Accès non autorisé - Rôle administrateur requis');
      }

      toast.success('Connexion réussie');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Enhanced debugging information in development
      if (import.meta.env.MODE === 'development') {
        console.group('🔍 Diagnostic Information');
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('Environment:', import.meta.env.MODE);
        console.log('Error details:', {
          message: error.message,
          status: error.status,
          code: error.code,
          timestamp: new Date().toISOString()
        });
        console.groupEnd();
      }
      
      const errorMessage = error.message || 'Une erreur est survenue lors de la connexion';
      toast.error(errorMessage);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      toast.success('Déconnexion réussie');
    } catch (error: any) {
      console.error('Logout error:', error);
      const errorMessage = error.message || 'Erreur lors de la déconnexion';
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signOut,
        checkServiceHealth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};