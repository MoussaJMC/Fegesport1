import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { FormField, FormTextarea, FormSelect, FormCheckbox, FormSubmitButton } from '../ui/Form';
import PayPalButton from '../payment/PayPalButton';

const membershipSchema = z.object({
  type: z.string().min(1, 'Veuillez sélectionner un type d\'adhésion'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  birthDate: z.string().min(1, 'Date de naissance requise'),
  address: z.string().min(10, 'Adresse requise'),
  city: z.string().min(2, 'Ville requise'),
  experience: z.string().min(1, 'Veuillez sélectionner votre niveau d\'expérience'),
  games: z.string().min(1, 'Veuillez indiquer vos jeux préférés'),
  motivation: z.string().min(50, 'La motivation doit contenir au moins 50 caractères'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les conditions d\'utilisation' }),
  }),
});

type MembershipFormData = z.infer<typeof membershipSchema>;

const MembershipForm: React.FC = () => {
  const [showPayment, setShowPayment] = useState(false);
  const [formData, setFormData] = useState<MembershipFormData | null>(null);

  const methods = useForm<MembershipFormData>({
    resolver: zodResolver(membershipSchema),
  });

  const { handleSubmit, formState: { errors, isSubmitting } } = methods;

  const onSubmit = async (data: MembershipFormData) => {
    try {
      setFormData(data);
      setShowPayment(true);
    } catch (error) {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const handlePaymentSuccess = async (details: any) => {
    try {
      // Here you would typically send both the form data and payment details to your backend
      console.log('Payment successful', details);
      console.log('Form data', formData);
      
      toast.success('Votre adhésion a été finalisée avec succès !');
      methods.reset();
      setShowPayment(false);
    } catch (error) {
      toast.error('Une erreur est survenue lors de la finalisation de l\'adhésion.');
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast.error('Une erreur est survenue lors du paiement. Veuillez réessayer.');
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSelect
          name="type"
          label="Type d'adhésion"
          required
          error={errors.type?.message}
          options={[
            { value: 'player', label: 'Joueur' },
            { value: 'club', label: 'Club' },
            { value: 'partner', label: 'Partenaire' },
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

        <FormField
          name="birthDate"
          label="Date de naissance"
          type="date"
          required
          error={errors.birthDate?.message}
        />

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

        <FormField
          name="games"
          label="Jeux préférés"
          required
          error={errors.games?.message}
          placeholder="Ex: FIFA, League of Legends, Counter-Strike..."
        />

        <FormTextarea
          name="motivation"
          label="Motivation"
          required
          error={errors.motivation?.message}
          placeholder="Expliquez-nous pourquoi vous souhaitez rejoindre la FEGESPORT..."
        />

        <FormCheckbox
          name="acceptTerms"
          label="J'accepte les conditions d'utilisation et la politique de confidentialité"
          required
          error={errors.acceptTerms?.message}
        />

        {!showPayment ? (
          <FormSubmitButton isLoading={isSubmitting} className="w-full">
            Continuer vers le paiement
          </FormSubmitButton>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Paiement</h3>
            <PayPalButton
              amount="15000"
              currency="XOF"
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default MembershipForm;