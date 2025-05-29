import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { FormField, FormTextarea, FormSelect, FormSubmitButton } from '../ui/Form';

const contactSchema = z.object({
  subject: z.string().min(1, 'Veuillez sélectionner un sujet'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  message: z.string().min(50, 'Le message doit contenir au moins 50 caractères'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactForm: React.FC = () => {
  const methods = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const { handleSubmit, formState: { errors, isSubmitting } } = methods;

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(data);
      toast.success('Votre message a été envoyé avec succès !');
      methods.reset();
    } catch (error) {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSelect
          name="subject"
          label="Sujet"
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
            label="Prénom"
            required
            error={errors.firstName?.message}
          />
          <FormField
            name="lastName"
            label="Nom"
            required
            error={errors.lastName?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="email"
            label="Email"
            type="email"
            required
            error={errors.email?.message}
          />
          <FormField
            name="phone"
            label="Téléphone"
            type="tel"
            required
            error={errors.phone?.message}
          />
        </div>

        <FormTextarea
          name="message"
          label="Message"
          required
          error={errors.message?.message}
          placeholder="Votre message..."
        />

        <FormSubmitButton isLoading={isSubmitting} className="w-full">
          Envoyer le message
        </FormSubmitButton>
      </form>
    </FormProvider>
  );
};

export default ContactForm;