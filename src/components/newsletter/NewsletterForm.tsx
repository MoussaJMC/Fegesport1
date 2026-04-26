import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Send, MessageCircle, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { newsletterLimiter, sanitizeInput, validate, secureSubmit } from '../../lib/security';
import { useLanguage } from '../../hooks/useLanguage';

const newsletterSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .refine(val => validate.email(val), 'Format d\'email invalide'),
  whatsapp: z.string()
    .min(8, 'Numero WhatsApp invalide')
    .regex(/^\+?[0-9\s]+$/, 'Format de numero invalide')
    .refine(val => validate.phone(val), 'Format de telephone invalide'),
  acceptNotifications: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter de recevoir les notifications' }),
  }),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

const NewsletterForm: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const lang = currentLanguage;
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    try {
      const sanitizedData = {
        email: sanitizeInput.email(data.email),
        whatsapp: sanitizeInput.phone(data.whatsapp),
      };

      await secureSubmit(
        sanitizedData,
        async (secureData) => {
          const { error } = await supabase
            .from('newsletter_subscriptions')
            .insert([{
              email: secureData.email,
              whatsapp: secureData.whatsapp,
              status: 'active'
            }]);

          if (error) {
            if (error.code === '23505') {
              throw new Error(
                lang === 'fr'
                  ? 'Cette adresse email est deja inscrite a la newsletter'
                  : 'This email is already subscribed to the newsletter'
              );
            }
            throw error;
          }
        },
        {
          rateLimiter: newsletterLimiter,
          sanitize: true,
          validateTiming: true,
        }
      );

      toast.success(t('newsletter.success'));
      reset();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast.error(error.message || t('common.error'));
    }
  };

  // Success state
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-emerald-400" size={28} />
        </div>
        <h4 className="text-lg font-bold text-white font-heading mb-2">
          {lang === 'fr' ? 'Inscription confirmee !' : 'Subscription confirmed!'}
        </h4>
        <p className="text-light-300 text-sm">
          {lang === 'fr'
            ? 'Vous recevrez nos actualites par email et WhatsApp.'
            : 'You will receive our news by email and WhatsApp.'}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email */}
      <div>
        <label htmlFor="newsletter-email" className="block text-sm font-medium text-light-300 mb-1.5">
          {t('newsletter.email')}
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-light-400 pointer-events-none" size={16} />
          <input
            type="email"
            id="newsletter-email"
            {...register('email')}
            className={`w-full pl-10 pr-4 py-3 bg-dark-900 border rounded-xl text-light-100 placeholder-light-400/50 focus:outline-none focus:ring-1 focus:ring-fed-red-500/30 transition-all text-sm ${
              errors.email ? 'border-fed-red-500/50' : 'border-dark-700 focus:border-fed-red-500'
            }`}
            placeholder="votre@email.com"
            autoComplete="email"
          />
        </div>
        {errors.email && (
          <p className="mt-1.5 text-xs text-fed-red-400 flex items-center gap-1">
            <AlertCircle size={11} /> {errors.email.message}
          </p>
        )}
      </div>

      {/* WhatsApp */}
      <div>
        <label htmlFor="newsletter-whatsapp" className="block text-sm font-medium text-light-300 mb-1.5">
          {t('newsletter.whatsapp')}
        </label>
        <div className="relative">
          <MessageCircle className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-light-400 pointer-events-none" size={16} />
          <input
            type="tel"
            id="newsletter-whatsapp"
            {...register('whatsapp')}
            className={`w-full pl-10 pr-4 py-3 bg-dark-900 border rounded-xl text-light-100 placeholder-light-400/50 focus:outline-none focus:ring-1 focus:ring-fed-red-500/30 transition-all text-sm ${
              errors.whatsapp ? 'border-fed-red-500/50' : 'border-dark-700 focus:border-fed-red-500'
            }`}
            placeholder="+224 6XX XX XX XX"
            autoComplete="tel"
          />
        </div>
        {errors.whatsapp && (
          <p className="mt-1.5 text-xs text-fed-red-400 flex items-center gap-1">
            <AlertCircle size={11} /> {errors.whatsapp.message}
          </p>
        )}
      </div>

      {/* Consent checkbox */}
      <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl bg-dark-900/50 border border-dark-700 hover:border-dark-700/80 transition-colors">
        <input
          type="checkbox"
          {...register('acceptNotifications')}
          className="w-4 h-4 mt-0.5 accent-fed-red-500 cursor-pointer flex-shrink-0"
        />
        <span className="text-xs text-light-300 leading-relaxed">
          {t('newsletter.accept')}
        </span>
      </label>
      {errors.acceptNotifications && (
        <p className="text-xs text-fed-red-400 flex items-center gap-1 -mt-2">
          <AlertCircle size={11} /> {errors.acceptNotifications.message}
        </p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-fed-red-500 hover:bg-fed-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-fed-red-500/20 transition-all text-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {lang === 'fr' ? 'Envoi en cours...' : 'Submitting...'}
          </>
        ) : (
          <>
            <Send size={16} />
            {t('newsletter.subscribe')}
          </>
        )}
      </button>
    </form>
  );
};

export default NewsletterForm;
