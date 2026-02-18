import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { NewsTranslations, buildTranslations } from '../../utils/translations';
import TranslationEditor from './TranslationEditor';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

const newsSchema = z.object({
  id: z.string().uuid().optional(),
  category: z.string().min(1, 'La catégorie est requise'),
  image_url: z.string().url('URL invalide').optional().or(z.literal('')),
  published: z.boolean().default(false),
  translations: z.any(), // Will be validated by TranslationEditor
});

type NewsFormData = z.infer<typeof newsSchema>;

interface NewsFormBilingualProps {
  initialData?: Partial<NewsFormData & { translations: NewsTranslations }>;
  onSuccess: () => void;
  onCancel: () => void;
}

const NewsFormBilingual: React.FC<NewsFormBilingualProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const [translations, setTranslations] = useState<NewsTranslations>(
    initialData?.translations || {
      fr: { title: '', excerpt: '', content: '' },
      en: { title: '', excerpt: '', content: '' },
    }
  );
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      category: initialData?.category || '',
      image_url: initialData?.image_url || '',
      published: initialData?.published || false,
      translations: initialData?.translations || {},
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `news-${Date.now()}.${fileExt}`;
      const filePath = `news/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('static-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('static-files')
        .getPublicUrl(filePath);

      setValue('image_url', publicUrl);
      setImagePreview(publicUrl);
      toast.success('Image téléchargée avec succès');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Erreur lors du téléchargement de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setValue('image_url', '');
    setImagePreview(null);
  };

  const onSubmit = async (data: NewsFormData) => {
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
        excerpt: translations.fr.excerpt || '',
        content: translations.fr.content,
        image_url: data.image_url || null,
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from('news')
          .update(saveData)
          .eq('id', initialData.id);
        if (error) throw error;
        toast.success('Actualité mise à jour avec succès');
      } else {
        const { error } = await supabase
          .from('news')
          .insert([saveData]);
        if (error) throw error;
        toast.success('Actualité créée avec succès');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error saving news:', error);
      toast.error('Une erreur est survenue');
    }
  };

  const categories = [
    'Communiqué',
    'Compétition',
    'Formation',
    'Partenariat',
    'International',
  ];

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
            { name: 'excerpt', label: 'Résumé', type: 'textarea', required: false },
            { name: 'content', label: 'Contenu', type: 'textarea', required: true },
          ]}
          translations={translations}
          onChange={(t) => setTranslations(t as NewsTranslations)}
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
              <option value="">Sélectionner une catégorie</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-3 relative">
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="w-full h-48 object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Image+non+disponible';
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                  title="Supprimer l'image"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <Upload size={20} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {uploading ? 'Téléchargement...' : 'Télécharger une image'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {/* URL Input */}
              <div className="text-center text-sm text-gray-500">ou</div>
              <input
                type="url"
                {...register('image_url')}
                onChange={(e) => {
                  setValue('image_url', e.target.value);
                  setImagePreview(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="URL de l'image (https://...)"
              />
            </div>

            {errors.image_url && (
              <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>
            )}

            <p className="mt-1 text-xs text-gray-500">
              Max 5MB. Formats acceptés: JPG, PNG, GIF, WebP
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('published')}
              id="published"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="published" className="ml-2 text-sm text-gray-700">
              Publier cette actualité
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

export default NewsFormBilingual;
