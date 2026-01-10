import React, { useState, useEffect } from 'react';
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

interface MembershipType {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  features: string[];
  is_active: boolean;
}

interface MembershipFormProps {
  selectedType?: string;
}

const MembershipForm: React.FC<MembershipFormProps> = ({ selectedType }) => {
  const { t } = useTranslation();
  const [showPayment, setShowPayment] = useState(false);
  const [formData, setFormData] = useState<MembershipFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);
  const [selectedMembershipType, setSelectedMembershipType] = useState<MembershipType | null>(null);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const methods = useForm<MembershipFormData>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      type: selectedType || ''
    }
  });

  const { handleSubmit, formState: { errors }, watch, setValue } = methods;
  const watchedType = watch('type');

  useEffect(() => {
    fetchMembershipTypes();
  }, []);

  useEffect(() => {
    if (selectedType && membershipTypes.length > 0) {
      setValue('type', selectedType);
    }
  }, [selectedType, membershipTypes, setValue]);

  useEffect(() => {
    if (watchedType && membershipTypes.length > 0) {
      const selected = membershipTypes.find(type => type.id === watchedType);
      setSelectedMembershipType(selected || null);
    } else {
      setSelectedMembershipType(null);
    }
  }, [watchedType, membershipTypes]);

  const fetchMembershipTypes = async () => {
    try {
      setLoadingTypes(true);
      
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('membership_types')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching membership types:', error);
        // If table doesn't exist or other error, use default types
        setMembershipTypes(getDefaultMembershipTypes());
      } else if (data && data.length > 0) {
        setMembershipTypes(data);
      } else {
        // No data found, use default types
        setMembershipTypes(getDefaultMembershipTypes());
      }
    } catch (error) {
      console.error('Error in fetchMembershipTypes:', error);
      setMembershipTypes(getDefaultMembershipTypes());
    } finally {
      setLoadingTypes(false);
    }
  };

  const getDefaultMembershipTypes = (): MembershipType[] => {
    return [
      {
        id: 'player',
        name: t('membership.types.player'),
        description: 'Inscription gratuite avec contribution volontaire',
        price: 15000,
        period: t('membership.types.player_period'),
        features: [
          'Licence officielle de joueur',
          'Participation aux tournois officiels',
          'Accès aux formations',
          'Newsletter exclusive',
          'Badge digital officiel',
          'Contribution volontaire suggérée: 15 000 GNF'
        ],
        is_active: true
      },
      {
        id: 'club',
        name: t('membership.types.club'),
        description: 'Adhésion pour les clubs esport',
        price: 150000,
        period: t('membership.types.club_period'),
        features: [
          'Statut de club officiel',
          'Jusqu\'à 10 licences joueurs',
          'Organisation de tournois',
          'Support marketing',
          'Visibilité sur le site FEGESPORT'
        ],
        is_active: true
      },
      {
        id: 'partner',
        name: t('membership.types.partner'),
        description: 'Adhésion pour les partenaires',
        price: 0,
        period: t('membership.types.partner_period'),
        features: [
          'Statut de partenaire officiel',
          'Logo sur le site et événements',
          'Accès VIP aux événements',
          'Communication dédiée',
          'Programme personnalisé'
        ],
        is_active: true
      }
    ];
  };

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

      // For individual players, registration is free with optional contribution
      // For clubs and partners, payment is required
      const isPlayerType = data.type === 'player';

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
        status: (isPlayerType ? 'active' : 'pending') as 'active' | 'pending',
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

      if (isPlayerType) {
        // For players, registration is complete but they can make a voluntary contribution
        toast.success('Inscription réussie ! Votre adhésion est maintenant active.');
      } else {
        // For clubs and partners, show success message and proceed to payment
        toast.success('Données d\'inscription enregistrées avec succès!');
      }

      // Show payment section
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

  if (loadingTypes) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSelect
          name="type"
          label={t('membership.types.title')}
          required
          error={errors.type?.message}
          options={membershipTypes.map(type => ({
            value: type.id,
            label: type.name
          }))}
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
            {t('membership.form.continue')}
          </FormSubmitButton>
        ) : (
          <div className="space-y-4">
            {watchedType === 'player' ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Inscription réussie</h3>
                  <p className="text-green-700 mb-3">
                    Félicitations ! Votre adhésion en tant que joueur individuel est maintenant active.
                  </p>
                  <p className="text-green-700">
                    Vous pouvez faire une contribution volontaire pour soutenir la FEGESPORT et le développement de l'esport en Guinée.
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">💙 Contribution Volontaire</h3>
                  <p className="text-blue-700 mb-4">
                    Votre contribution nous aide à organiser des tournois, former des joueurs et développer l'écosystème esport guinéen.
                  </p>
                  <PayPalButton
                    amount={selectedMembershipType?.price.toString() || "15000"}
                    currency="XOF"
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    methods.reset();
                    setShowPayment(false);
                    setFormData(null);
                  }}
                  className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Terminer sans contribution
                </button>
              </>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Inscription enregistrée</h3>
                  <p className="text-green-700">
                    Vos données d'inscription ont été enregistrées avec succès dans notre base de données.
                    Procédez maintenant au paiement pour finaliser votre adhésion.
                  </p>
                </div>
                <h3 className="text-lg font-semibold text-white">Paiement requis</h3>
                <PayPalButton
                  amount={selectedMembershipType?.price.toString() || "150000"}
                  currency="XOF"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </>
            )}
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default MembershipForm;