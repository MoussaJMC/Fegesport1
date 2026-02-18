import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { Upload, X, Calendar, MapPin, Users, DollarSign, Tag } from 'lucide-react';

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
  title_en: z.string().optional(),
  description_en: z.string().optional(),
  location_en: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const EventFormBilingual: React.FC<EventFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'fr' | 'en'>('fr');
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<EventFormData>({
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
      title_en: initialData?.translations?.en?.title || '',
      description_en: initialData?.translations?.en?.description || '',
      location_en: initialData?.translations?.en?.location || '',
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Le fichier doit être une image');
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { error: uploadError } = await supabase.storage
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
      toast.error(`Erreur lors du téléchargement: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setValue('image_url', '');
    setImagePreview(null);
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      const translations: any = {};

      if (data.title_en || data.description_en || data.location_en) {
        translations.en = {
          title: data.title_en || data.title,
          description: data.description_en || data.description,
          location: data.location_en || data.location,
        };
      }

      const { title_en, description_en, location_en, ...mainData } = data;

      const eventData = {
        ...mainData,
        image_url: mainData.image_url || null,
        translations: Object.keys(translations).length > 0 ? translations : null,
      };

      if (initialData?.id) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success('Événement mis à jour avec succès');
      } else {
        const { error } = await supabase
          .from('events')
          .insert([eventData]);

        if (error) throw error;
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
      {/* Language Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            type="button"
            onClick={() => setActiveTab('fr')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'fr'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Français (FR)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('en')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'en'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            English (EN)
          </button>
        </nav>
      </div>

      {/* French Content */}
      {activeTab === 'fr' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre (FR) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('title')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Titre de l'événement"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (FR) <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Description détaillée de l'événement"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lieu (FR) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                {...register('location')}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Lieu de l'événement"
              />
            </div>
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>
        </div>
      )}

      {/* English Content */}
      {activeTab === 'en' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title (EN)
            </label>
            <input
              type="text"
              {...register('title_en')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Event title"
            />
            {errors.title_en && (
              <p className="mt-1 text-sm text-red-600">{errors.title_en.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (EN)
            </label>
            <textarea
              {...register('description_en')}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Detailed event description"
            />
            {errors.description_en && (
              <p className="mt-1 text-sm text-red-600">{errors.description_en.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location (EN)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                {...register('location_en')}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Event location"
              />
            </div>
            {errors.location_en && (
              <p className="mt-1 text-sm text-red-600">{errors.location_en.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Common Fields */}
      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Détails de l'événement</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                {...register('date')}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heure
            </label>
            <input
              type="time"
              {...register('time')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                {...register('category')}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="Tournoi">Tournoi</option>
                <option value="Formation">Formation</option>
                <option value="Conférence">Conférence</option>
                <option value="Championnat">Championnat</option>
              </select>
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register('type')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre maximum de participants <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="number"
                {...register('max_participants', { valueAsNumber: true })}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {errors.max_participants && (
              <p className="mt-1 text-sm text-red-600">{errors.max_participants.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix (FCFA) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            {...register('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="upcoming">À venir</option>
            <option value="ongoing">En cours</option>
            <option value="completed">Terminé</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image
          </label>

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
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
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

export default EventFormBilingual;
