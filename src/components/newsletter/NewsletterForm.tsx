import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Send, MessageSquare } from 'lucide-react';

const newsletterSchema = z.object({
  email: z.string().email('Email invalide'),
  whatsapp: z.string()
    .min(8, 'Numéro WhatsApp invalide')
    .regex(/^\+?[0-9]+$/, 'Format de numéro invalide'),
  acceptNotifications: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter de recevoir les notifications' }),
  }),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

const NewsletterForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterFormData) => {
    try {
      // TODO: Replace with actual API call to your backend service
      // Example:
      // const response = await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });
      // if (!response.ok) throw new Error('Failed to subscribe');

      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Inscription réussie à la newsletter !');
      reset();
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
          Email
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
          Numéro WhatsApp
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
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register('acceptNotifications')}
            className="w-4 h-4 text-primary-500 border-secondary-600 rounded focus:ring-primary-500 bg-secondary-800"
          />
          <span className="text-sm text-gray-300">
            J'accepte de recevoir les notifications par email et WhatsApp
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
            Inscription en cours...
          </div>
        ) : (
          <>
            <Send size={20} className="mr-2" />
            S'inscrire à la newsletter
          </>
        )}
      </button>
    </form>
  );
};

export default NewsletterForm;