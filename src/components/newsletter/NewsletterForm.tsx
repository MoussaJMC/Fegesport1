import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Send, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { newsletterLimiter, sanitizeInput, validate, secureSubmit } from '../../lib/security';

const newsletterSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .refine(val => validate.email(val), 'Format d\'email invalide'),
  whatsapp: z.string()
    .min(8, 'Numéro WhatsApp invalide')
    .regex(/^\+?[0-9]+$/, 'Format de numéro invalide')
    .refine(val => validate.phone(val), 'Format de téléphone invalide'),
  acceptNotifications: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter de recevoir les notifications' }),
  }),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

const NewsletterForm: React.FC = () => {
  const { t } = useTranslation();
  const [formStartTime] = useState(Date.now());
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    try {
      // Sanitize inputs
      const sanitizedData = {
        email: sanitizeInput.email(data.email),
        whatsapp: sanitizeInput.phone(data.whatsapp),
      };

      // Use secure submit with rate limiting
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
              throw new Error('Cette adresse email est déjà inscrite à la newsletter');
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
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast.error(error.message || t('common.error'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
          {t('newsletter.email')}
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="email"
            id="email"
            {...register('email')}
            className="w-full pl-10 pr-4 py-2 bg-secondary-800 border border-secondary-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white placeholder-gray-400"
            placeholder="votre@email.com"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-primary-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-300 mb-1">
          {t('newsletter.whatsapp')}
        </label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="tel"
            id="whatsapp"
            {...register('whatsapp')}
            className="w-full pl-10 pr-4 py-2 bg-secondary-800 border border-secondary-600 rounded-md focus:ring-primary-500 focus:border-primary-500 text-white placeholder-gray-400"
            placeholder="+224 XX XX XX XX"
          />
        </div>
        {errors.whatsapp && (
          <p className="mt-1 text-sm text-primary-500">{errors.whatsapp.message}</p>
        )}
      </div>

      <div>
        <label className="flex items-start space-x-2">
          <input
            type="checkbox"
            {...register('acceptNotifications')}
            className="w-4 h-4 mt-1 text-primary-500 border-secondary-600 rounded focus:ring-primary-500 bg-secondary-800"
          />
          <span className="text-sm text-gray-300">
            {t('newsletter.accept')}
          </span>
        </label>
        {errors.acceptNotifications && (
          <p className="mt-1 text-sm text-primary-500">{errors.acceptNotifications.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            {t('common.loading')}
          </div>
        ) : (
          <>
            <Send size={20} className="mr-2" />
            {t('newsletter.subscribe')}
          </>
        )}
      </button>
    </form>
  );
};

export default NewsletterForm;