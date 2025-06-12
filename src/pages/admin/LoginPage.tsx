import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, AlertCircle, RefreshCw, Wifi, WifiOff, ExternalLink, Server, Database } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login, checkServiceHealth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, clearErrors } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleHealthCheck = async () => {
    setIsCheckingHealth(true);
    try {
      const isHealthy = await checkServiceHealth();
      if (isHealthy) {
        toast.success('✅ Service Supabase accessible et fonctionnel');
      } else {
        toast.error('❌ Service Supabase inaccessible ou en panne');
      }
    } catch (error) {
      toast.error('⚠️ Impossible de vérifier l\'état du service');
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearErrors();
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Enhanced form error handling with better categorization
      if (error.message.includes('Email ou mot de passe incorrect')) {
        setError('email', { message: 'Vérifiez vos identifiants' });
        setError('password', { message: 'Vérifiez vos identifiants' });
      } else if (error.message.includes('🔧 Problème technique Supabase') || 
                 error.message.includes('Database error querying schema') ||
                 error.message.includes('🚨 Erreur serveur Supabase') ||
                 error.message.includes('🔧 Service Supabase temporairement indisponible')) {
        setError('root', { 
          message: error.message,
          type: 'supabase_server_error'
        });
      } else if (error.message.includes('⚠️ Erreur serveur Supabase inattendue') ||
                 error.message.includes('unexpected_failure')) {
        setError('root', { 
          message: error.message,
          type: 'supabase_unexpected_error'
        });
      } else if (error.message.includes('🌐 Problème de connectivité') ||
                 error.message.includes('connexion') || 
                 error.message.includes('accessible')) {
        setError('root', { 
          message: error.message,
          type: 'connectivity_error'
        });
      } else if (error.message.includes('Accès non autorisé')) {
        setError('root', { 
          message: error.message,
          type: 'access_denied'
        });
      } else {
        setError('root', { message: error.message });
      }
    }
  };

  const isSupabaseServerError = errors.root?.type === 'supabase_server_error';
  const isSupabaseUnexpectedError = errors.root?.type === 'supabase_unexpected_error';
  const isConnectivityError = errors.root?.type === 'connectivity_error';
  const isAccessDenied = errors.root?.type === 'access_denied';
  const isSupabaseError = isSupabaseServerError || isSupabaseUnexpectedError;

  const getErrorIcon = () => {
    if (isSupabaseServerError) return <Database className="h-5 w-5 text-orange-400" />;
    if (isSupabaseUnexpectedError) return <Server className="h-5 w-5 text-red-400" />;
    if (isConnectivityError) return <WifiOff className="h-5 w-5 text-yellow-400" />;
    return <AlertCircle className="h-5 w-5 text-red-400" />;
  };

  const getErrorTitle = () => {
    if (isSupabaseServerError) return 'Problème de base de données Supabase';
    if (isSupabaseUnexpectedError) return 'Erreur serveur Supabase inattendue';
    if (isConnectivityError) return 'Problème de connectivité';
    if (isAccessDenied) return 'Accès refusé';
    return 'Erreur de connexion';
  };

  const getErrorBgColor = () => {
    if (isSupabaseError || isConnectivityError) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const getErrorTextColor = () => {
    if (isSupabaseError || isConnectivityError) return 'text-orange-800';
    return 'text-red-800';
  };

  const getErrorDescColor = () => {
    if (isSupabaseError || isConnectivityError) return 'text-orange-700';
    return 'text-red-700';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <Lock className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Administration FEGUIESPORT
          </h2>
        </div>
        
        {errors.root && (
          <div className={`rounded-md p-4 ${getErrorBgColor()}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {getErrorIcon()}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${getErrorTextColor()}`}>
                  {getErrorTitle()}
                </h3>
                <div className={`mt-2 text-sm ${getErrorDescColor()}`}>
                  <div className="whitespace-pre-line">{errors.root.message}</div>
                  {(isSupabaseError || isConnectivityError) && (
                    <div className="mt-4 space-y-3">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={handleHealthCheck}
                          disabled={isCheckingHealth}
                          className="inline-flex items-center px-3 py-1.5 border border-orange-300 text-xs font-medium rounded text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors"
                        >
                          {isCheckingHealth ? (
                            <>
                              <RefreshCw className="animate-spin h-3 w-3 mr-1.5" />
                              Test en cours...
                            </>
                          ) : (
                            <>
                              <Wifi className="h-3 w-3 mr-1.5" />
                              Tester la connexion
                            </>
                          )}
                        </button>
                        <a
                          href="https://status.supabase.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-orange-300 text-xs font-medium rounded text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3 mr-1.5" />
                          État Supabase
                        </a>
                      </div>
                      {isSupabaseServerError && (
                        <div className="text-xs bg-orange-100 p-2 rounded border border-orange-200">
                          <p className="font-medium mb-1">💡 Information technique :</p>
                          <p>Cette erreur provient directement des serveurs Supabase et ne peut pas être résolue côté application. Elle est généralement temporaire.</p>
                        </div>
                      )}
                    </div>
                  )}
                  {isAccessDenied && (
                    <p className="mt-2 text-xs">
                      Seuls les administrateurs peuvent accéder à cette section.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Mot de passe</label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Mot de passe"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Connexion en cours...
                </div>
              ) : 'Se connecter'}
            </button>
          </div>
        </form>
        
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            En cas de problème technique persistant, contactez l'administrateur système
          </p>
          {import.meta.env.MODE === 'development' && (
            <div className="text-xs text-gray-400 space-y-1 bg-gray-50 p-2 rounded">
              <p className="font-medium">Mode développement</p>
              <p>Vérifiez la console pour plus de détails techniques</p>
              <p className="font-mono text-xs">
                Supabase: {import.meta.env.VITE_SUPABASE_URL?.substring(8, 28)}...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;