import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

const partnerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Le nom est requis'),
  logo_url: z.string().url('URL invalide').optional().or(z.literal('')),
  website: z.string().url('URL invalide').optional().or(z.literal('')),
  description: z.string().min(1, 'La description est requise'),
  partnership_type: z.enum(['sponsor', 'technical', 'media', 'institutional']),
  contact_name: z.string().min(1, 'Le nom du contact est requis').optional().or(z.literal('')),
  contact_email: z.string().email('Email invalide').optional().or(z.literal('')),
  contact_phone: z.string().min(8, 'Numéro de téléphone invalide').optional().or(z.literal('')),
  partnership_start: z.string().min(1, 'La date de début est requise').optional().or(z.literal('')),
  partnership_end: z.string().min(1, 'La date de fin est requise').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active'),
});

type PartnerFormData = z.infer<typeof partnerSchema>;

interface PartnerFormProps {
  initialData?: Partial<PartnerFormData>;
  onSuccess: () => void;
  onCancel: () => void;
}

const PartnerForm: React.FC<PartnerFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: initialData?.name || '',
      logo_url: initialData?.logo_url || '',
      website: initialData?.website || '',
      description: initialData?.description || '',
      partnership_type: initialData?.partnership_type || 'sponsor',
      contact_name: initialData?.contact_name || '',
      contact_email: initialData?.contact_email || '',
      contact_phone: initialData?.contact_phone || '',
      partnership_start: initialData?.partnership_start || '',
      partnership_end: initialData?.partnership_end || '',
      status: initialData?.status || 'active',
    },
  });

  const onSubmit = async (data: PartnerFormData) => {
    try {
      // Clean up empty fields
      const cleanData = {
        ...data,
        logo_url: data.logo_url || null,
        website: data.website || null,
        contact_name: data.contact_name || null,
        contact_email: data.contact_email || null,
        contact_phone: data.contact_phone || null,
        partnership_start: data.partnership_start || null,
        partnership_end: data.partnership_end || null,
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from('partners')
          .update(cleanData)
          .eq('id', initialData.id);
        if (error) throw error;
        toast.success('Partenaire mis à jour avec succès');
      } else {
        const { error } = await supabase
          .from('partners')
          .insert([cleanData]);
        if (error) throw error;
        toast.success('Partenaire créé avec succès');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error saving partner:', error);
      toast.error('Une erreur est survenue');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nom</label>
        <input
          type="text"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">URL du logo</label>
        <input
          type="url"
          {...register('logo_url')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.logo_url && (
          <p className="mt-1 text-sm text-red-600">{errors.logo_url.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Site web</label>
        <input
          type="url"
          {...register('website')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.website && (
          <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description')}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type de partenariat</label>
        <select
          {...register('partnership_type')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="sponsor">Sponsor</option>
          <option value="technical">Partenaire technique</option>
          <option value="media">Partenaire média</option>
          <option value="institutional">Partenaire institutionnel</option>
        </select>
        {errors.partnership_type && (
          <p className="mt-1 text-sm text-red-600">{errors.partnership_type.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom du contact</label>
          <input
            type="text"
            {...register('contact_name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.contact_name && (
            <p className="mt-1 text-sm text-red-600">{errors.contact_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email du contact</label>
          <input
            type="email"
            {...register('contact_email')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.contact_email && (
            <p className="mt-1 text-sm text-red-600">{errors.contact_email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone du contact</label>
          <input
            type="tel"
            {...register('contact_phone')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.contact_phone && (
            <p className="mt-1 text-sm text-red-600">{errors.contact_phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date de début du partenariat</label>
          <input
            type="date"
            {...register('partnership_start')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.partnership_start && (
            <p className="mt-1 text-sm text-red-600">{errors.partnership_start.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date de fin du partenariat</label>
          <input
            type="date"
            {...register('partnership_end')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.partnership_end && (
            <p className="mt-1 text-sm text-red-600">{errors.partnership_end.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Statut</label>
        <select
          {...register('status')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {isSubmitting ? 'Enregistrement...' : initialData?.id ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default PartnerForm;