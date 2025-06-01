import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

const newsSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Le titre est requis'),
  excerpt: z.string().min(1, 'Le résumé est requis'),
  content: z.string().min(1, 'Le contenu est requis'),
  category: z.string().min(1, 'La catégorie est requise'),
  image_url: z.string().url('URL invalide').optional(),
  published: z.boolean().default(false),
});

type NewsFormData = z.infer<typeof newsSchema>;

interface NewsFormProps {
  initialData?: NewsFormData;
  onSuccess: () => void;
  onCancel: () => void;
}

const NewsForm: React.FC<NewsFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: NewsFormData) => {
    try {
      if (initialData?.id) {
        const { error } = await supabase
          .from('news')
          .update(data)
          .eq('id', initialData.id);
        if (error) throw error;
        toast.success('Actualité mise à jour avec succès');
      } else {
        const { error } = await supabase
          .from('news')
          .insert([data]);
        if (error) throw error;
        toast.success('Actualité créée avec succès');
      }
      onSuccess();
    } catch (error) {
      toast.error('Une erreur est survenue');
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
        <label className="block text-sm font-medium text-gray-700">Résumé</label>
        <textarea
          {...register('excerpt')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.excerpt && (
          <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Contenu</label>
        <textarea
          {...register('content')}
          rows={6}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Catégorie</label>
        <select
          {...register('category')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">Sélectionner une catégorie</option>
          <option value="Communiqué">Communiqué</option>
          <option value="Compétition">Compétition</option>
          <option value="Formation">Formation</option>
          <option value="Partenariat">Partenariat</option>
          <option value="International">International</option>
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
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

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('published')}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label className="ml-2 block text-sm text-gray-900">Publier</label>
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
          {isSubmitting ? 'Enregistrement...' : initialData ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default NewsForm;