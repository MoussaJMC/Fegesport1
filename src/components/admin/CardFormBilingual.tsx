import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { CardTranslations } from '../../utils/translations';
import TranslationEditor from './TranslationEditor';

const cardSchema = z.object({
  id: z.string().uuid().optional(),
  category: z.enum(['communiqué', 'compétition', 'partenariat'], {
    errorMap: () => ({ message: 'La catégorie est requise' }),
  }),
  image_url: z.string().url('URL invalide').optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  translations: z.any(),
});

type CardFormData = z.infer<typeof cardSchema>;

interface CardFormBilingualProps {
  initialData?: Partial<CardFormData & { translations: CardTranslations }>;
  onSuccess: () => void;
  onCancel: () => void;
}

const CardFormBilingual: React.FC<CardFormBilingualProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const [translations, setTranslations] = useState<CardTranslations>(
    initialData?.translations || {
      fr: { title: '', content: '' },
      en: { title: '', content: '' },
    }
  );

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      category: initialData?.category || 'communiqué',
      image_url: initialData?.image_url || '',
      is_active: initialData?.is_active ?? true,
      translations: initialData?.translations || {},
    },
  });

  const onSubmit = async (data: CardFormData) => {
    try {
      // Validate translations
      if (!translations.fr?.title || !translations.fr?.content) {
        toast.error('Les champs français sont requis');
        return;
      }

      const saveData = {
        ...data,
        translations,
        // Keep old columns for backward compatibility
        title: translations.fr.title,
        content: translations.fr.content,
        image_url: data.image_url || null,
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from('cards')
          .update(saveData)
          .eq('id', initialData.id);
        if (error) throw error;
        toast.success('Carte mise à jour avec succès');
      } else {
        const { error } = await supabase
          .from('cards')
          .insert([saveData]);
        if (error) throw error;
        toast.success('Carte créée avec succès');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error saving card:', error);
      toast.error('Une erreur est survenue');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Translation Editor */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Contenu Bilingue (FR/EN)
        </h3>
        <TranslationEditor
          fields={[
            { name: 'title', label: 'Titre', type: 'text', required: true },
            { name: 'content', label: 'Contenu', type: 'textarea', required: true },
          ]}
          translations={translations}
          onChange={(t) => setTranslations(t as CardTranslations)}
        />
      </div>

      {/* Other Fields */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Informations Générales
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="communiqué">Communiqué</option>
              <option value="compétition">Compétition</option>
              <option value="partenariat">Partenariat</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de l'image
            </label>
            <input
              type="url"
              {...register('image_url')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            {errors.image_url && (
              <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('is_active')}
              id="is_active"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Activer cette carte
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting
            ? 'Enregistrement...'
            : initialData?.id
            ? 'Mettre à jour'
            : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default CardFormBilingual;
