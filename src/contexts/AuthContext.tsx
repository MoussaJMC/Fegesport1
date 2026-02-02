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
    supabase.auth.getSession().then(({ data: { session } }) => {
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
        // Enhanced error handling with more specific messages
        if (error.message.includes('Database error querying schema')) {
          throw new Error('Problème technique détecté. Le service d\'authentification rencontre des difficultés. Veuillez réessayer dans quelques minutes.');
        } else if (error.message.includes('unexpected_failure')) {
          throw new Error('Erreur serveur inattendue. Le service pourrait être temporairement indisponible. Veuillez réessayer dans quelques minutes.');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Veuillez confirmer votre email avant de vous connecter');
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Trop de tentatives de connexion. Veuillez patienter avant de réessayer.');
        } else if (error.status === 500) {
          throw new Error('Erreur serveur. Le service d\'authentification rencontre des problèmes techniques. Veuillez réessayer dans quelques minutes.');
        } else if (error.status === 503) {
          throw new Error('Service temporairement indisponible. Maintenance en cours. Veuillez réessayer dans quelques minutes.');
        } else if (error.status === 502 || error.status === 504) {
          throw new Error('Problème de connectivité. Veuillez réessayer dans quelques instants.');
        } else {
          // Generic error message for other cases
          throw new Error('Erreur de connexion. Veuillez réessayer.');
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
      const errorMessage = error.message || 'Une erreur est survenue lors de la connexion';
      toast.error(errorMessage);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast.success('Déconnexion réussie');
    } catch (error: any) {
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