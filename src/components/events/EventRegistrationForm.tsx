import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { FormField, FormSelect, FormCheckbox, FormSubmitButton } from '../ui/Form';
import PayPalButton from '../payment/PayPalButton';
import { EventPrice } from '../../types/events';
import { useTranslation } from 'react-i18next';

const registrationSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide'),
  birthDate: z.string().min(1, 'Date de naissance requise'),
  gamertag: z.string().min(2, 'Le pseudo doit contenir au moins 2 caractères'),
  platform: z.string().min(1, 'Plateforme requise'),
  priceId: z.string().min(1, 'Veuillez sélectionner un forfait'),
  acceptRules: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter le règlement' }),
  }),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface EventRegistrationFormProps {
  eventId: string;
  prices: EventPrice[];
  onSuccess: () => void;
}

const EventRegistrationForm: React.FC<EventRegistrationFormProps> = ({
  eventId,
  prices,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [showPayment, setShowPayment] = React.useState(false);
  const [selectedPrice, setSelectedPrice] = React.useState<EventPrice | null>(null);
  const [formData, setFormData] = React.useState<RegistrationFormData | null>(null);

  const methods = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const { handleSubmit, watch, formState: { errors, isSubmitting } } = methods;
  const selectedPriceId = watch('priceId');

  React.useEffect(() => {
    if (selectedPriceId) {
      const price = prices.find(p => p.id === selectedPriceId);
      setSelectedPrice(price || null);
    }
  }, [selectedPriceId, prices]);

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      setFormData(data);
      setShowPayment(true);
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handlePaymentSuccess = async (details: any) => {
    try {
      // Here you would typically send both the form data and payment details to your backend
      console.log('Payment successful', details);
      console.log('Form data', formData);
      
      toast.success(t('membership.form.success'));
      methods.reset();
      setShowPayment(false);
      onSuccess();
    } catch (error) {
      toast.error('Une erreur est survenue lors de la finalisation de l\'inscription.');
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast.error('Une erreur est survenue lors du paiement. Veuillez réessayer.');
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-300">
            Sélectionnez votre forfait
          </label>
          {prices.map((price) => (
            <div
              key={price.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedPriceId === price.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-300'
              }`}
              onClick={() => methods.setValue('priceId', price.id)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{price.name}</h3>
                <span className="text-xl font-bold text-primary-600">
                  {price.amount.toLocaleString()} FCFA
                </span>
              </div>
              <p className="text-gray-600 mb-2">{price.description}</p>
              <ul className="space-y-1">
                {price.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-500 flex items-center">
                    <span className="mr-2">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {errors.priceId && (
            <p className="text-sm text-primary-500">{errors.priceId.message}</p>
          )}
        </div>

        <FormCheckbox
          name="acceptRules"
          label="J'accepte le règlement du tournoi et je m'engage à le respecter"
          required
          error={errors.acceptRules?.message}
        />

        {!showPayment ? (
          <FormSubmitButton isLoading={isSubmitting} className="w-full">
            {t('membership.form.continue')}
          </FormSubmitButton>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Paiement</h3>
            {selectedPrice && (
              <PayPalButton
                amount={selectedPrice.amount.toString()}
                currency="XOF"
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default EventRegistrationForm;