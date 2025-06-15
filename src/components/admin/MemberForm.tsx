import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

const memberSchema = z.object({
  id: z.string().uuid().optional(),
  first_name: z.string().min(1, 'Le prénom est requis'),
  last_name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro de téléphone invalide').optional().or(z.literal('')),
  birth_date: z.string().min(1, 'La date de naissance est requise').optional().or(z.literal('')),
  address: z.string().min(1, 'L\'adresse est requise').optional().or(z.literal('')),
  city: z.string().min(1, 'La ville est requise').optional().or(z.literal('')),
  member_type: z.enum(['player', 'club', 'partner']),
  status: z.enum(['pending', 'active', 'suspended', 'expired']).default('pending'),
  membership_start: z.string().min(1, 'La date de début est requise').optional().or(z.literal('')),
  membership_end: z.string().min(1, 'La date de fin est requise').optional().or(z.literal('')),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
  initialData?: Partial<MemberFormData>;
  onSuccess: () => void;
  onCancel: () => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      birth_date: initialData?.birth_date || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      member_type: initialData?.member_type || 'player',
      status: initialData?.status || 'pending',
      membership_start: initialData?.membership_start || '',
      membership_end: initialData?.membership_end || '',
    },
  });

  const onSubmit = async (data: MemberFormData) => {
    try {
      // Clean up empty fields
      const cleanData = {
        ...data,
        phone: data.phone || null,
        birth_date: data.birth_date || null,
        address: data.address || null,
        city: data.city || null,
        membership_start: data.membership_start || null,
        membership_end: data.membership_end || null,
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from('members')
          .update(cleanData)
          .eq('id', initialData.id);
        if (error) throw error;
        toast.success('Membre mis à jour avec succès');
      } else {
        const { error } = await supabase
          .from('members')
          .insert([cleanData]);
        if (error) throw error;
        toast.success('Membre créé avec succès');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error saving member:', error);
      toast.error('Une erreur est survenue');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Prénom</label>
          <input
            type="text"
            {...register('first_name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.first_name && (
            <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nom</label>
          <input
            type="text"
            {...register('last_name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.last_name && (
            <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            {...register('email')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
          <input
            type="tel"
            {...register('phone')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
        <input
          type="date"
          {...register('birth_date')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.birth_date && (
          <p className="mt-1 text-sm text-red-600">{errors.birth_date.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Adresse</label>
        <input
          type="text"
          {...register('address')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Ville</label>
        <input
          type="text"
          {...register('city')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.city && (
          <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type de membre</label>
        <select
          {...register('member_type')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="player">Joueur</option>
          <option value="club">Club</option>
          <option value="partner">Partenaire</option>
        </select>
        {errors.member_type && (
          <p className="mt-1 text-sm text-red-600">{errors.member_type.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Statut</label>
        <select
          {...register('status')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="pending">En attente</option>
          <option value="active">Actif</option>
          <option value="suspended">Suspendu</option>
          <option value="expired">Expiré</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date de début d'adhésion</label>
          <input
            type="date"
            {...register('membership_start')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.membership_start && (
            <p className="mt-1 text-sm text-red-600">{errors.membership_start.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date de fin d'adhésion</label>
          <input
            type="date"
            {...register('membership_end')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.membership_end && (
            <p className="mt-1 text-sm text-red-600">{errors.membership_end.message}</p>
          )}
        </div>
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

export default MemberForm;