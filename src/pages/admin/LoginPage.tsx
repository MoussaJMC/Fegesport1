import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Lock, AlertCircle, RefreshCw, Shield, Eye, EyeOff } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caracteres')
    .regex(/[A-Z]/, 'Au moins une majuscule requise')
    .regex(/[a-z]/, 'Au moins une minuscule requise')
    .regex(/[0-9]/, 'Au moins un chiffre requis')
    .regex(/[^A-Za-z0-9]/, 'Au moins un caractere special requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';
  const { getSetting } = useSiteSettings();

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);
  const [honeypotValue, setHoneypotValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const logoSettings = getSetting('site_logo', {
    main_logo: "https://geozovninpeqsgtzwchu.supabase.co/storage/v1/object/public/static-files/uploads/d5b2ehmnrec.jpg",
    alt_text: "FEGESPORT Logo",
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, clearErrors } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

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

  const onSubmit = async (data: LoginFormData) => {
    try {
      if (honeypotValue.trim() !== '') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return;
      }

      if (isLocked) {
        const remainingTime = lockoutTime ? Math.ceil((lockoutTime.getTime() - Date.now()) / 60000) : 0;
        setError('root', {
          message: `Compte temporairement bloque. Reessayez dans ${remainingTime} minute${remainingTime > 1 ? 's' : ''}.`,
          type: 'account_locked'
        });
        return;
      }

      clearErrors();
      await login(data.email, data.password);

      setFailedAttempts(0);
      setIsLocked(false);
      setLockoutTime(null);

      window.location.href = from || '/admin';
    } catch (error: any) {
      console.error('Login error:', error);

      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 5) {
        const lockTime = new Date(Date.now() + 15 * 60 * 1000);
        setLockoutTime(lockTime);
        setIsLocked(true);
        setError('root', {
          message: 'Compte temporairement bloque suite a trop de tentatives. Reessayez dans 15 minutes.',
          type: 'account_locked'
        });
        return;
      }

      setError('root', {
        message: 'Identifiants incorrects. Verifiez votre email et votre mot de passe.',
        type: 'auth_error'
      });

      const remainingAttempts = 5 - newAttempts;
      if (remainingAttempts <= 2) {
        toast.error(`Attention: ${remainingAttempts} tentative${remainingAttempts > 1 ? 's' : ''} restante${remainingAttempts > 1 ? 's' : ''}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-fed-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-fed-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fed-red-500/20 to-transparent" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {/* Logo + Branding */}
          <div className="text-center mb-10">
            {logoSettings.main_logo ? (
              <img
                src={logoSettings.main_logo}
                alt={logoSettings.alt_text || "FEGESPORT"}
                className="w-20 h-20 mx-auto rounded-full border-2 border-fed-gold-500/40 shadow-lg shadow-fed-gold-500/10 mb-6 object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="w-20 h-20 mx-auto rounded-full border-2 border-fed-gold-500/40 shadow-lg mb-6 bg-dark-800 flex items-center justify-center">
                <Shield className="h-8 w-8 text-fed-gold-500" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-white font-heading tracking-tight">
              Administration
            </h1>
            <p className="text-light-400 text-sm mt-1">
              Federation Guineenne d'Esport
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 shadow-2xl shadow-dark-950/50">
            {/* Error Alert */}
            {errors.root && (
              <div className="mb-6 p-4 rounded-xl bg-fed-red-500/10 border border-fed-red-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-fed-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-fed-red-400">
                      {errors.root.type === 'account_locked' ? 'Compte bloque' : 'Erreur de connexion'}
                    </p>
                    <p className="text-sm text-light-400 mt-1">{errors.root.message}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Honeypot */}
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

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-light-300 mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  disabled={isLocked}
                  className={`w-full px-4 py-3 rounded-xl bg-dark-900 border ${
                    errors.email ? 'border-fed-red-500/50' : 'border-dark-700'
                  } text-light-100 placeholder-light-400/50 focus:outline-none focus:border-fed-red-500 focus:ring-1 focus:ring-fed-red-500/30 transition-all disabled:opacity-50`}
                  placeholder="admin@fegesport.org"
                />
                {errors.email && (
                  <p className="mt-1.5 text-sm text-fed-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-light-300 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    disabled={isLocked}
                    className={`w-full px-4 py-3 pr-12 rounded-xl bg-dark-900 border ${
                      errors.password ? 'border-fed-red-500/50' : 'border-dark-700'
                    } text-light-100 placeholder-light-400/50 focus:outline-none focus:border-fed-red-500 focus:ring-1 focus:ring-fed-red-500/30 transition-all disabled:opacity-50`}
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-light-400 hover:text-light-100 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-fed-red-400">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || isLocked}
                className="w-full py-3.5 rounded-xl font-semibold text-white bg-fed-red-500 hover:bg-fed-red-600 focus:outline-none focus:ring-2 focus:ring-fed-red-500/50 focus:ring-offset-2 focus:ring-offset-dark-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-fed-red-500/20"
              >
                {isLocked ? (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="h-4 w-4" />
                    Compte bloque
                  </span>
                ) : isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </span>
                ) : 'Se connecter'}
              </button>

              {/* Failed attempts */}
              {failedAttempts > 0 && !isLocked && (
                <p className="text-center text-sm text-fed-gold-500">
                  {failedAttempts}/5 tentatives utilisees
                </p>
              )}
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-light-400/60 mt-8">
            Acces reserve aux administrateurs de la FEGESPORT
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
