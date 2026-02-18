import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

const eventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  date: z.string().min(1, 'La date est requise'),
  time: z.string().optional(),
  location: z.string().min(1, 'Le lieu est requis'),
  image_url: z.string().url('URL invalide').optional().or(z.literal('')),
  category: z.string().min(1, 'La catégorie est requise'),
  type: z.enum(['online', 'in-person', 'hybrid']),
  max_participants: z.number().min(1, 'Le nombre maximum de participants est requis'),
  price: z.number().min(0, 'Le prix doit être positif'),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming'),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  initialData?: Partial<EventFormData>;
  onSuccess: () => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      date: initialData?.date || '',
      time: initialData?.time || '',
      location: initialData?.location || '',
      image_url: initialData?.image_url || '',
      category: initialData?.category || '',
      type: initialData?.type || 'in-person',
      max_participants: initialData?.max_participants || 50,
      price: initialData?.price || 0,
      status: initialData?.status || 'upcoming',
    },
  });

  const onSubmit = async (data: EventFormData) => {
    try {
      // Clean up empty image_url
      const cleanData = {
        ...data,
        image_url: data.image_url || null
      };

      if (initialData?.id) {
        console.log('Updating event:', initialData.id, cleanData);
        const { data: updatedData, error } = await supabase
          .from('events')
          .update(cleanData)
          .eq('id', initialData.id)
          .select();

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Update successful:', updatedData);
        toast.success('Événement mis à jour avec succès');
      } else {
        console.log('Creating event:', cleanData);
        const { data: newData, error } = await supabase
          .from('events')
          .insert([cleanData])
          .select();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        console.log('Insert successful:', newData);
        toast.success('Événement créé avec succès');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast.error(`Erreur: ${error.message || 'Une erreur est survenue'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Titre</label>
        <input
          type="text"
          {...register('title')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            {...register('date')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Heure</label>
          <input
            type="time"
            {...register('time')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.time && (
            <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Lieu</label>
        <input
          type="text"
          {...register('location')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">URL de l'image</label>
        <input
          type="url"
          {...register('image_url')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.image_url && (
          <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Catégorie</label>
          <select
            {...register('category')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Sélectionner une catégorie</option>
            <option value="Tournoi">Tournoi</option>
            <option value="Formation">Formation</option>
            <option value="Conférence">Conférence</option>
            <option value="Championnat">Championnat</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            {...register('type')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="online">En ligne</option>
            <option value="in-person">Présentiel</option>
            <option value="hybrid">Hybride</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre maximum de participants</label>
          <input
            type="number"
            {...register('max_participants', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.max_participants && (
            <p className="mt-1 text-sm text-red-600">{errors.max_participants.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Prix (FCFA)</label>
          <input
            type="number"
            {...register('price', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Statut</label>
        <select
          {...register('status')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="upcoming">À venir</option>
          <option value="ongoing">En cours</option>
          <option value="completed">Terminé</option>
          <option value="cancelled">Annulé</option>
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

export default EventForm;