import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { FormField, FormTextarea, FormSelect, FormCheckbox, FormSubmitButton } from '../ui/Form';
import { useTranslation } from 'react-i18next';

const tournamentSchema = z.object({
  tournament: z.string().min(1, 'Veuillez sélectionner un tournoi'),
  gamertag: z.string().min(2, 'Le pseudo doit contenir au moins 2 caractères'),
  platform: z.string().min(1, 'Veuillez sélectionner une plateforme'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  birthDate: z.string().min(1, 'Date de naissance requise'),
  experience: z.string().min(1, 'Veuillez sélectionner votre niveau d\'expérience'),
  achievements: z.string().optional(),
  acceptRules: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter le règlement du tournoi' }),
  }),
});

type TournamentFormData = z.infer<typeof tournamentSchema>;

const TournamentForm: React.FC = () => {
  const { t } = useTranslation();
  const methods = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
  });

  const { handleSubmit, formState: { errors, isSubmitting } } = methods;

  const onSubmit = async (data: TournamentFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(data);
      toast.success('Votre inscription au tournoi a été enregistrée avec succès !');
      methods.reset();
    } catch (error) {
      console.error('Error submitting tournament form:', error);
      toast.error(t('common.error'));
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSelect
          name="tournament"
          label="Tournoi"
          required
          error={errors.tournament?.message}
          options={[
            { value: 'fifa25', label: 'Tournoi National FIFA 25' },
            { value: 'pubg', label: 'PUBG Mobile Championship' },
            { value: 'valorant', label: 'Valorant Open Series' },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="gamertag"
            label="Pseudo / Gamertag"
            required
            error={errors.gamertag?.message}
          />
          <FormSelect
            name="platform"
            label="Plateforme"
            required
            error={errors.platform?.message}
            options={[
              { value: 'pc', label: 'PC' },
              { value: 'ps5', label: 'PlayStation 5' },
              { value: 'xbox', label: 'Xbox Series X/S' },
              { value: 'mobile', label: 'Mobile' },
            ]}
          />
        </div>

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

        <FormField
          name="birthDate"
          label="Date de naissance"
          type="date"
          required
          error={errors.birthDate?.message}
        />

        <FormSelect
          name="experience"
          label="Niveau d'expérience"
          required
          error={errors.experience?.message}
          options={[
            { value: 'beginner', label: 'Débutant' },
            { value: 'intermediate', label: 'Intermédiaire' },
            { value: 'advanced', label: 'Avancé' },
            { value: 'professional', label: 'Professionnel' },
          ]}
        />

        <FormTextarea
          name="achievements"
          label="Palmarès / Réalisations"
          error={errors.achievements?.message}
          placeholder="Listez vos principales réalisations dans l'esport..."
        />

        <FormCheckbox
          name="acceptRules"
          label="J'accepte le règlement du tournoi et je m'engage à le respecter"
          required
          error={errors.acceptRules?.message}
        />

        <FormSubmitButton isLoading={isSubmitting} className="w-full">
          {isSubmitting ? t('common.loading') : 'S\'inscrire au tournoi'}
        </FormSubmitButton>
      </form>
    </FormProvider>
  );
};

export default TournamentForm;