import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Lock, AlertCircle, RefreshCw, Wifi, WifiOff, ExternalLink, Server, Database, CheckCircle, XCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface ConnectionTest {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

const LoginPage: React.FC = () => {
  const { login, checkServiceHealth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [connectionTests, setConnectionTests] = useState<ConnectionTest[]>([]);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Security: Rate limiting
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);

  // Security: Honeypot field (bot trap)
  const [honeypotValue, setHoneypotValue] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, clearErrors } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Check if account is still locked
  useEffect(() => {
    if (lockoutTime) {
      const now = new Date();
      if (now < lockoutTime) {
        setIsLocked(true);
        const timer = setTimeout(() => {
          setIsLocked(false);
          setFailedAttempts(0);
          setLockoutTime(null);
        }, lockoutTime.getTime() - now.getTime());
        return () => clearTimeout(timer);
      } else {
        setIsLocked(false);
        setFailedAttempts(0);
        setLockoutTime(null);
      }
    }
  }, [lockoutTime]);

  // Run connection tests on component mount
  useEffect(() => {
    runConnectionTests();
  }, []);

  const runConnectionTests = async () => {
    setIsCheckingHealth(true);
    const tests: ConnectionTest[] = [
      { name: 'Configuration Supabase', status: 'pending', message: 'Vérification...' },
      { name: 'Connexion Base de Données', status: 'pending', message: 'Vérification...' },
      { name: 'Service Auth', status: 'pending', message: 'Vérification...' },
      { name: 'Fonction is_admin()', status: 'pending', message: 'Vérification...' },
    ];

    setConnectionTests([...tests]);

    // Test 1: Configuration
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        tests[0] = {
          name: 'Configuration',
          status: 'error',
          message: 'Configuration manquante'
        };
      } else {
        tests[0] = {
          name: 'Configuration',
          status: 'success',
          message: 'Configuration OK'
        };
      }
      setConnectionTests([...tests]);
    } catch (error) {
      tests[0] = {
        name: 'Configuration',
        status: 'error',
        message: 'Erreur de configuration'
      };
      setConnectionTests([...tests]);
    }

    // Test 2: Database Connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        tests[1] = {
          name: 'Connexion Base de Données',
          status: 'error',
          message: `Erreur DB: ${error.message}`,
          details: error
        };
      } else {
        tests[1] = {
          name: 'Connexion Base de Données',
          status: 'success',
          message: 'Connexion établie',
          details: data
        };
      }
      setConnectionTests([...tests]);
    } catch (error: any) {
      tests[1] = {
        name: 'Connexion Base de Données',
        status: 'error',
        message: `Erreur: ${error.message}`,
        details: error
      };
      setConnectionTests([...tests]);
    }

    // Test 3: Auth Service
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        tests[2] = {
          name: 'Service Auth',
          status: 'error',
          message: `Erreur Auth: ${error.message}`,
          details: error
        };
      } else {
        tests[2] = {
          name: 'Service Auth',
          status: 'success',
          message: 'Service Auth accessible',
          details: { hasSession: !!data.session }
        };
      }
      setConnectionTests([...tests]);
    } catch (error: any) {
      tests[2] = {
        name: 'Service Auth',
        status: 'error',
        message: `Erreur: ${error.message}`,
        details: error
      };
      setConnectionTests([...tests]);
    }

    // Test 4: is_admin function
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) {
        tests[3] = {
          name: 'Fonction is_admin()',
          status: 'error',
          message: `Fonction non disponible: ${error.message}`,
          details: error
        };
      } else {
        tests[3] = {
          name: 'Fonction is_admin()',
          status: 'success',
          message: `Fonction accessible (retourne: ${data})`,
          details: { result: data }
        };
      }
      setConnectionTests([...tests]);
    } catch (error: any) {
      tests[3] = {
        name: 'Fonction is_admin()',
        status: 'error',
        message: `Erreur: ${error.message}`,
        details: error
      };
      setConnectionTests([...tests]);
    }

    setIsCheckingHealth(false);
  };

  const handleHealthCheck = async () => {
    await runConnectionTests();
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Security: Check honeypot (if filled, it's a bot)
      if (honeypotValue.trim() !== '') {
        console.warn('Bot detected: honeypot field filled');
        // Silently reject without error message
        await new Promise(resolve => setTimeout(resolve, 2000));
        return;
      }

      // Security: Check if account is locked
      if (isLocked) {
        const remainingTime = lockoutTime ? Math.ceil((lockoutTime.getTime() - Date.now()) / 60000) : 0;
        setError('root', {
          message: `Compte temporairement bloqué. Réessayez dans ${remainingTime} minute${remainingTime > 1 ? 's' : ''}.`,
          type: 'account_locked'
        });
        return;
      }

      clearErrors();
      await login(data.email, data.password);

      // Success: reset failed attempts
      setFailedAttempts(0);
      setIsLocked(false);
      setLockoutTime(null);

      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);

      // Security: Increment failed attempts
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      // Security: Lock account after 5 failed attempts for 15 minutes
      if (newAttempts >= 5) {
        const lockTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        setLockoutTime(lockTime);
        setIsLocked(true);
        setError('root', {
          message: 'Compte temporairement bloqué suite à trop de tentatives échouées. Réessayez dans 15 minutes.',
          type: 'account_locked'
        });
        return;
      }

      // Security: Generic error message to not leak information
      // Never say "user not found" or "wrong password" separately
      setError('root', {
        message: 'Identifiants incorrects. Vérifiez votre email et votre mot de passe.',
        type: 'auth_error'
      });

      // Log remaining attempts for user awareness
      const remainingAttempts = 5 - newAttempts;
      if (remainingAttempts <= 2) {
        toast.error(`Attention: ${remainingAttempts} tentative${remainingAttempts > 1 ? 's' : ''} restante${remainingAttempts > 1 ? 's' : ''} avant blocage temporaire`);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'error':
        return <XCircle className="text-red-500" size={16} />;
      case 'pending':
        return <RefreshCw className="text-gray-400 animate-spin" size={16} />;
      default:
        return <AlertCircle className="text-gray-400" size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-fed-red-500/20 border border-fed-red-500/30">
            <Lock className="h-6 w-6 text-fed-red-500" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white font-heading">
            Administration FEGESPORT
          </h2>
          <p className="mt-2 text-center text-sm text-light-400">
            Panneau d'administration de la federation
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">État de la Connexion</h3>
            <button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              {showDiagnostics ? 'Masquer' : 'Détails'}
            </button>
          </div>
          
          <div className="space-y-2">
            {connectionTests.slice(0, showDiagnostics ? connectionTests.length : 2).map((test, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{test.name}</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(test.status)}
                  <span className={`text-xs ${
                    test.status === 'success' ? 'text-green-600' : 
                    test.status === 'error' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {test.status === 'success' ? 'OK' : 
                     test.status === 'error' ? 'Erreur' : 'Test...'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {showDiagnostics && (
            <div className="mt-4 space-y-2">
              {connectionTests.map((test, index) => (
                <details key={index} className="text-xs">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                    {test.name}: {test.message}
                  </summary>
                  {test.details && (
                    <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  )}
                </details>
              ))}
            </div>
          )}

          <button
            onClick={handleHealthCheck}
            disabled={isCheckingHealth}
            className="mt-3 w-full text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded transition-colors disabled:opacity-50"
          >
            {isCheckingHealth ? 'Test en cours...' : 'Retester la connexion'}
          </button>
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
          {/* Honeypot field - hidden from users, bots will fill it */}
          <input
            type="text"
            name="website"
            value={honeypotValue}
            onChange={(e) => setHoneypotValue(e.target.value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                type="email"
                {...register('email')}
                disabled={isLocked}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
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
                disabled={isLocked}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
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
              disabled={isSubmitting || isLocked}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLocked ? (
                <div className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Compte bloqué
                </div>
              ) : isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Connexion en cours...
                </div>
              ) : 'Se connecter'}
            </button>
          </div>

          {failedAttempts > 0 && !isLocked && (
            <div className="text-center">
              <p className="text-sm text-orange-600">
                Tentatives échouées: {failedAttempts}/5
              </p>
            </div>
          )}
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