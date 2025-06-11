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

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Supabase auth error:', error);
        
        // Handle specific error types with more detailed error handling
        if (error.message.includes('Database error querying schema')) {
          throw new Error('Le service d\'authentification est temporairement indisponible. Cela peut être dû à une maintenance de la base de données. Veuillez réessayer dans quelques minutes.');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Veuillez confirmer votre email avant de vous connecter');
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Trop de tentatives de connexion. Veuillez patienter avant de réessayer.');
        } else if (error.message.includes('unexpected_failure')) {
          throw new Error('Erreur serveur inattendue. Le service pourrait être en maintenance. Veuillez réessayer plus tard.');
        } else if (error.status === 500) {
          throw new Error('Erreur serveur (500). Le service d\'authentification pourrait être temporairement indisponible.');
        } else {
          // Generic error message for other cases
          throw new Error(`Erreur de connexion: ${error.message}`);
        }
      }

      if (!data.user) {
        throw new Error('Aucune donnée utilisateur retournée');
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
      
      // Only log debugging information in development
      if (import.meta.env.MODE === 'development') {
        console.error('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        console.error('Environment:', import.meta.env.MODE);
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