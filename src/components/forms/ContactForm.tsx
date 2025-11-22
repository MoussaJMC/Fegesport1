import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { FormField, FormTextarea, FormSelect, FormSubmitButton } from '../ui/Form';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { contactFormLimiter, sanitizeInput, validate, secureSubmit } from '../../lib/security';

const contactSchema = z.object({
  subject: z.string().min(1, 'Veuillez sélectionner un sujet'),
  firstName: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom est trop long')
    .refine(val => validate.noXSS(val), 'Caractères invalides détectés')
    .refine(val => validate.noSqlInjection(val), 'Caractères invalides détectés'),
  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom est trop long')
    .refine(val => validate.noXSS(val), 'Caractères invalides détectés')
    .refine(val => validate.noSqlInjection(val), 'Caractères invalides détectés'),
  email: z.string()
    .email('Email invalide')
    .refine(val => validate.email(val), 'Format d\'email invalide'),
  phone: z.string()
    .min(8, 'Numéro de téléphone invalide')
    .refine(val => validate.phone(val), 'Format de téléphone invalide'),
  message: z.string()
    .min(50, 'Le message doit contenir au moins 50 caractères')
    .max(2000, 'Le message est trop long')
    .refine(val => validate.noXSS(val), 'Contenu invalide détecté')
    .refine(val => validate.noSqlInjection(val), 'Contenu invalide détecté'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactForm: React.FC = () => {
  const { t } = useTranslation();
  const [formStartTime] = useState(Date.now());
  const methods = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const { handleSubmit, formState: { errors, isSubmitting } } = methods;

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Sanitize inputs
      const sanitizedData = {
        firstName: sanitizeInput.text(data.firstName),
        lastName: sanitizeInput.text(data.lastName),
        email: sanitizeInput.email(data.email),
        phone: sanitizeInput.phone(data.phone),
        subject: sanitizeInput.text(data.subject),
        message: sanitizeInput.multiline(data.message),
      };

      // Use secure submit with rate limiting
      await secureSubmit(
        sanitizedData,
        async (secureData) => {
          const { error } = await supabase
            .from('contact_messages')
            .insert([{
              name: `${secureData.firstName} ${secureData.lastName}`,
              email: secureData.email,
              subject: secureData.subject,
              message: secureData.message,
              status: 'unread'
            }]);

          if (error) throw error;
        },
        {
          rateLimiter: contactFormLimiter,
          sanitize: true,
          validateTiming: true,
        }
      );

      toast.success('Message envoyé avec succès!');
      methods.reset();
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      toast.error(error.message || t('common.error'));
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSelect
          name="subject"
          label={t('contact.form.subject')}
          required
          error={errors.subject?.message}
          options={[
            { value: 'general', label: 'Renseignements généraux' },
            { value: 'membership', label: 'Adhésion' },
            { value: 'competition', label: 'Compétitions' },
            { value: 'partnership', label: 'Partenariat' },
            { value: 'press', label: 'Presse et médias' },
            { value: 'other', label: 'Autre' },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="firstName"
            label={t('contact.form.name').split(' ')[0]} // Get "Prénom" from "Nom complet"
            required
            error={errors.firstName?.message}
          />
          <FormField
            name="lastName"
            label={t('contact.form.name').split(' ')[1] || "Nom"} // Get "Nom" from "Nom complet"
            required
            error={errors.lastName?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="email"
            label={t('contact.form.email')}
            type="email"
            required
            error={errors.email?.message}
          />
          <FormField
            name="phone"
            label={t('contact.info.phone')}
            type="tel"
            required
            error={errors.phone?.message}
          />
        </div>

        <FormTextarea
          name="message"
          label={t('contact.form.message')}
          required
          error={errors.message?.message}
          placeholder="Votre message..."
        />

        <FormSubmitButton isLoading={isSubmitting} className="w-full">
          {t('contact.form.send')}
        </FormSubmitButton>
      </form>
    </FormProvider>
  );
};

export default ContactForm;