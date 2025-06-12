import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, AlertCircle, RefreshCw, Wifi, WifiOff, ExternalLink } from 'lucide-react';

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
        toast.success('Service Supabase accessible');
      } else {
        toast.error('Service Supabase inaccessible');
      }
    } catch (error) {
      toast.error('Impossible de vérifier l\'état du service');
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
      
      // Enhanced form error handling
      if (error.message.includes('Email ou mot de passe incorrect')) {
        setError('email', { message: 'Vérifiez vos identifiants' });
        setError('password', { message: 'Vérifiez vos identifiants' });
      } else if (error.message.includes('temporairement indisponible') || 
                 error.message.includes('maintenance') ||
                 error.message.includes('Erreur serveur') ||
                 error.message.includes('Database error') ||
                 error.message.includes('unexpected_failure') ||
                 error.message.includes('Supabase')) {
        setError('root', { 
          message: error.message,
          type: 'server_error'
        });
      } else if (error.message.includes('Accès non autorisé')) {
        setError('root', { 
          message: error.message,
          type: 'access_denied'
        });
      } else if (error.message.includes('connexion') || error.message.includes('accessible')) {
        setError('root', { 
          message: error.message,
          type: 'connectivity_error'
        });
      } else {
        setError('root', { message: error.message });
      }
    }
  };

  const isServerError = errors.root?.type === 'server_error';
  const isAccessDenied = errors.root?.type === 'access_denied';
  const isConnectivityError = errors.root?.type === 'connectivity_error';

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
          <div className={`rounded-md p-4 ${
            isServerError || isConnectivityError ? 'bg-yellow-50' : 'bg-red-50'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {isServerError || isConnectivityError ? (
                  <RefreshCw className="h-5 w-5 text-yellow-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  isServerError || isConnectivityError ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  {isServerError ? 'Problème technique Supabase' : 
                   isConnectivityError ? 'Problème de connectivité' :
                   isAccessDenied ? 'Accès refusé' : 'Erreur de connexion'}
                </h3>
                <div className={`mt-2 text-sm ${
                  isServerError || isConnectivityError ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  <p>{errors.root.message}</p>
                  {(isServerError || isConnectivityError) && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium">Actions recommandées :</p>
                      <ul className="text-xs list-disc list-inside space-y-1">
                        <li>Vérifiez votre connexion internet</li>
                        <li>Attendez quelques minutes et réessayez</li>
                        <li>Vérifiez l'état du service Supabase</li>
                        <li>Si le problème persiste, contactez l'administrateur système</li>
                      </ul>
                      <div className="mt-3 flex space-x-2">
                        <button
                          type="button"
                          onClick={handleHealthCheck}
                          disabled={isCheckingHealth}
                          className="inline-flex items-center px-2 py-1 border border-yellow-300 text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                        >
                          {isCheckingHealth ? (
                            <>
                              <RefreshCw className="animate-spin h-3 w-3 mr-1" />
                              Test...
                            </>
                          ) : (
                            <>
                              <Wifi className="h-3 w-3 mr-1" />
                              Tester la connexion
                            </>
                          )}
                        </button>
                        <a
                          href="https://status.supabase.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2 py-1 border border-yellow-300 text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          État Supabase
                        </a>
                      </div>
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
            En cas de problème technique, contactez l'administrateur système
          </p>
          {import.meta.env.MODE === 'development' && (
            <div className="text-xs text-gray-400 space-y-1">
              <p>Mode développement - Vérifiez la console pour plus de détails</p>
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