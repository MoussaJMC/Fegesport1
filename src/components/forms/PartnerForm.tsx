import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { FormField, FormTextarea, FormSelect, FormCheckbox, FormSubmitButton } from '../ui/Form';

const partnerSchema = z.object({
  type: z.string().min(1, 'Veuillez sélectionner un type de partenariat'),
  companyName: z.string().min(2, 'Le nom de l\'entreprise doit contenir au moins 2 caractères'),
  industry: z.string().min(2, 'Le secteur d\'activité est requis'),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  contactName: z.string().min(2, 'Le nom du contact doit contenir au moins 2 caractères'),
  contactTitle: z.string().min(2, 'Le titre/fonction est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  address: z.string().min(10, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  interests: z.string().min(1, 'Veuillez sélectionner vos intérêts'),
  proposal: z.string().min(100, 'La proposition doit contenir au moins 100 caractères'),
  budget: z.string().min(1, 'Veuillez sélectionner une fourchette de budget'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les conditions de partenariat' }),
  }),
});

type PartnerFormData = z.infer<typeof partnerSchema>;

const PartnerForm: React.FC = () => {
  const methods = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
  });

  const { handleSubmit, formState: { errors, isSubmitting } } = methods;

  const onSubmit = async (data: PartnerFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(data);
      toast.success('Votre demande de partenariat a été envoyée avec succès !');
      methods.reset();
    } catch (error) {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSelect
          name="type"
          label="Type de partenariat"
          required
          error={errors.type?.message}
          options={[
            { value: 'sponsor', label: 'Sponsor' },
            { value: 'technical', label: 'Partenaire technique' },
            { value: 'media', label: 'Partenaire média' },
            { value: 'institutional', label: 'Partenaire institutionnel' },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="companyName"
            label="Nom de l'entreprise"
            required
            error={errors.companyName?.message}
          />
          <FormField
            name="industry"
            label="Secteur d'activité"
            required
            error={errors.industry?.message}
          />
        </div>

        <FormField
          name="website"
          label="Site web"
          type="url"
          error={errors.website?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="contactName"
            label="Nom du contact"
            required
            error={errors.contactName?.message}
          />
          <FormField
            name="contactTitle"
            label="Titre/Fonction"
            required
            error={errors.contactTitle?.message}
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

        <FormField
          name="address"
          label="Adresse"
          required
          error={errors.address?.message}
        />

        <FormField
          name="city"
          label="Ville"
          required
          error={errors.city?.message}
        />

        <FormSelect
          name="interests"
          label="Centres d'intérêt"
          required
          error={errors.interests?.message}
          options={[
            { value: 'events', label: 'Événements et tournois' },
            { value: 'teams', label: 'Équipes nationales' },
            { value: 'development', label: 'Développement de l\'esport' },
            { value: 'education', label: 'Formation et éducation' },
          ]}
        />

        <FormTextarea
          name="proposal"
          label="Proposition de partenariat"
          required
          error={errors.proposal?.message}
          placeholder="Décrivez votre vision du partenariat et ce que vous souhaitez apporter à la FEGESPORT..."
        />

        <FormSelect
          name="budget"
          label="Budget annuel envisagé"
          required
          error={errors.budget?.message}
          options={[
            { value: 'small', label: 'Moins de 5 millions FCFA' },
            { value: 'medium', label: '5 à 15 millions FCFA' },
            { value: 'large', label: '15 à 30 millions FCFA' },
            { value: 'enterprise', label: 'Plus de 30 millions FCFA' },
          ]}
        />

        <FormCheckbox
          name="acceptTerms"
          label="J'accepte les conditions de partenariat de la FEGESPORT"
          required
          error={errors.acceptTerms?.message}
        />

        <FormSubmitButton isLoading={isSubmitting} className="w-full">
          Envoyer la demande de partenariat
        </FormSubmitButton>
      </form>
    </FormProvider>
  );
};

export default PartnerForm;