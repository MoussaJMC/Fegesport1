import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { FormField, FormTextarea, FormSelect, FormCheckbox, FormSubmitButton } from '../ui/Form';
import PayPalButton from '../payment/PayPalButton';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [showPayment, setShowPayment] = useState(false);
  const [formData, setFormData] = useState<MembershipFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<MembershipFormData>({
    resolver: zodResolver(membershipSchema),
  });

  const { handleSubmit, formState: { errors } } = methods;

  const onSubmit = async (data: MembershipFormData) => {
    try {
      setIsSubmitting(true);
      
      // First, let's test the database connection
      console.log('Testing database connection...');
      const { data: testData, error: testError } = await supabase
        .from('members')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('Database connection test failed:', testError);
        toast.error('Erreur de connexion à la base de données');
        return;
      }
      
      console.log('Database connection successful');
      
      // Prepare member data for database insertion
      const memberData = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        birth_date: data.birthDate,
        address: data.address,
        city: data.city,
        member_type: data.type as 'player' | 'club' | 'partner',
        status: 'pending' as const,
        membership_start: new Date().toISOString().split('T')[0], // Today's date
        membership_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // One year from now
      };

      console.log('Attempting to insert member data:', memberData);

      // Insert member data into database
      const { data: insertedMember, error: insertError } = await supabase
        .from('members')
        .insert([memberData])
        .select()
        .single();

      if (insertError) {
        console.error('Database insertion error:', insertError);
        toast.error(`Erreur lors de l'inscription: ${insertError.message}`);
        return;
      }

      console.log('Member successfully inserted:', insertedMember);
      
      // Store form data for payment processing
      setFormData(data);
      
      // Show success message
      toast.success('Données d\'inscription enregistrées avec succès!');
      
      // Proceed to payment
      setShowPayment(true);
      
    } catch (error: any) {
      console.error('Unexpected error during member inscription:', error);
      toast.error(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (details: any) => {
    try {
      console.log('Payment successful:', details);
      
      if (formData) {
        // Update member status to active after successful payment
        const { error: updateError } = await supabase
          .from('members')
          .update({ status: 'active' })
          .eq('email', formData.email);

        if (updateError) {
          console.error('Error updating member status:', updateError);
          toast.error('Erreur lors de la mise à jour du statut');
          return;
        }

        console.log('Member status updated to active');
        toast.success(t('membership.form.success'));
        methods.reset();
        setShowPayment(false);
        setFormData(null);
      }
    } catch (error: any) {
      console.error('Error in payment success handler:', error);
      toast.error(t('common.error'));
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast.error(t('common.error'));
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
            { value: 'player', label: t('membership.types.player') },
            { value: 'club', label: t('membership.types.club') },
            { value: 'partner', label: t('membership.types.partner') },
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
            {isSubmitting ? t('common.loading') : t('membership.form.continue')}
          </FormSubmitButton>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Inscription enregistrée</h3>
              <p className="text-green-700">
                Vos données d'inscription ont été enregistrées avec succès dans notre base de données. 
                Procédez maintenant au paiement pour finaliser votre adhésion.
              </p>
            </div>
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