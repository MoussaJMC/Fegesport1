import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { Image, Link, Calendar, Tag, Info, X } from 'lucide-react';

const newsSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Le titre est requis'),
  excerpt: z.string().min(1, 'Le résumé est requis'),
  content: z.string().min(1, 'Le contenu est requis'),
  category: z.string().min(1, 'La catégorie est requise'),
  image_url: z.string().url('URL invalide').optional().or(z.literal('')),
  published: z.boolean().default(false),
});

type NewsFormData = z.infer<typeof newsSchema>;

interface NewsFormProps {
  initialData?: Partial<NewsFormData>;
  onSuccess: () => void;
  onCancel: () => void;
}

const NewsForm: React.FC<NewsFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(200);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: initialData?.title || '',
      excerpt: initialData?.excerpt || '',
      content: initialData?.content || '',
      category: initialData?.category || '',
      image_url: initialData?.image_url || '',
      published: initialData?.published || false,
    },
  });

  // Auto-resize content textarea
  React.useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [watch('content')]);

  const onSubmit = async (data: NewsFormData) => {
    try {
      setErrorDetails(null);

      const { data: { user } } = await supabase.auth.getUser();
      const { data: jwtData } = await supabase.rpc('get_jwt_claims');

      setDiagnosticInfo({
        user: user ? { id: user.id, email: user.email } : null,
        jwtClaims: jwtData
      });

      const cleanData = {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        image_url: data.image_url || null,
        published: data.published,
      };

      if (initialData?.id) {
        const { data: result, error } = await supabase
          .from('news')
          .update(cleanData)
          .eq('id', initialData.id)
          .select();

        if (error) {
          setErrorDetails(JSON.stringify({
            operation: 'UPDATE',
            error: error,
            data: cleanData,
            user: user?.email
          }, null, 2));
          throw error;
        }
        toast.success('Actualité mise à jour avec succès');
      } else {
        const { data: result, error } = await supabase
          .from('news')
          .insert([cleanData])
          .select();

        if (error) {
          setErrorDetails(JSON.stringify({
            operation: 'INSERT',
            error: error,
            data: cleanData,
            user: user?.email
          }, null, 2));
          throw error;
        }
        toast.success('Actualité créée avec succès');
      }
      onSuccess();
    } catch (error: any) {
      const errorMessage = error?.message || 'Une erreur est survenue';
      toast.error(`Erreur: ${errorMessage}`);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setValue('image_url', url);
    setImagePreview(url);
  };

  const categories = [
    'Communiqué',
    'Compétition',
    'Formation',
    'Partenariat',
    'International'
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {diagnosticInfo && (
        <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
          <h3 className="text-lg font-bold text-blue-900 mb-2">Informations de diagnostic</h3>
          <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(diagnosticInfo, null, 2)}
          </pre>
        </div>
      )}

      {errorDetails && (
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4">
          <h3 className="text-lg font-bold text-red-900 mb-2">Erreur détaillée</h3>
          <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-60 text-red-800">
            {errorDetails}
          </pre>
          <p className="text-sm text-red-700 mt-2">
            Copiez ce message et envoyez-le pour obtenir de l'aide.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Info className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                {...register('title')}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Titre de l'actualité"
              />
            </div>
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Résumé <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                {...register('excerpt')}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Bref résumé de l'actualité (affiché dans les listes)"
              />
            </div>
            {errors.excerpt && (
              <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                {...register('category')}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de l'image
            </label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="url"
                {...register('image_url')}
                onChange={handleImageUrlChange}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {errors.image_url && (
              <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>
            )}
            {imagePreview && (
              <div className="mt-2 relative">
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="h-32 w-full object-cover rounded-md"
                  onError={() => setImagePreview(null)}
                />
                <button
                  type="button"
                  onClick={() => {
                    setValue('image_url', '');
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              {...register('published')}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
              Publier immédiatement
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contenu <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('content')}
            ref={contentRef}
            style={{ height: `${contentHeight}px` }}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Contenu détaillé de l'actualité"
            onChange={(e) => {
              if (contentRef.current) {
                contentRef.current.style.height = 'auto';
                contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
                setContentHeight(contentRef.current.scrollHeight);
              }
            }}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
          <div className="mt-2 text-xs text-gray-500">
            <p>Conseils de formatage:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Utilisez des paragraphes séparés par des lignes vides</li>
              <li>Vous pouvez utiliser des liens en format URL complet</li>
              <li>Pour les listes, utilisez des tirets (-) ou des astérisques (*)</li>
            </ul>
          </div>
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

export default NewsForm;