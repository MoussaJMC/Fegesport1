import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Upload, X, Image, FileText, Video, Music, Shield, Layout, User, Archive } from 'lucide-react';
import { motion } from 'framer-motion';

interface FileCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: FileCategory[];
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categories
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    alt_text: '',
    description: '',
    tags: '',
    is_public: true,
    is_featured: false
  });

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      Image, FileText, Video, Music, Shield, Layout, User, Archive
    };
    return icons[iconName] || FileText;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('static-files')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('static-files')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number } | null> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(null);
        return;
      }

      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Veuillez sélectionner au moins un fichier');
      return;
    }

    if (!formData.category_id) {
      toast.error('Veuillez sélectionner une catégorie');
      return;
    }

    setUploading(true);
    const progress: { [key: string]: number } = {};

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        progress[file.name] = 0;
        setUploadProgress({ ...progress });

        // Upload file to Supabase Storage
        const fileUrl = await uploadFile(file);
        progress[file.name] = 50;
        setUploadProgress({ ...progress });

        // Get image dimensions if it's an image
        const dimensions = await getImageDimensions(file);
        progress[file.name] = 75;
        setUploadProgress({ ...progress });

        // Save file metadata to database
        const fileData = {
          filename: file.name.split('.')[0],
          original_filename: file.name,
          file_url: fileUrl,
          file_type: file.type,
          file_size: file.size,
          category_id: formData.category_id,
          title: formData.title || file.name.split('.')[0],
          alt_text: formData.alt_text,
          description: formData.description,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
          width: dimensions?.width,
          height: dimensions?.height,
          is_public: formData.is_public,
          is_featured: formData.is_featured
        };

        const { error } = await supabase
          .from('static_files')
          .insert([fileData]);

        if (error) throw error;

        progress[file.name] = 100;
        setUploadProgress({ ...progress });
      }

      toast.success(`${files.length} fichier(s) téléchargé(s) avec succès`);
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setFormData({
      category_id: '',
      title: '',
      alt_text: '',
      description: '',
      tags: '',
      is_public: true,
      is_featured: false
    });
    setUploadProgress({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Télécharger des Fichiers</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* File Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-primary-400 transition-colors"
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Glissez-déposez vos fichiers ici
            </p>
            <p className="text-gray-500 mb-4">ou</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn bg-primary-600 hover:bg-primary-700 text-white"
            >
              Sélectionner des fichiers
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
            />
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Fichiers sélectionnés</h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-primary-100 rounded flex items-center justify-center mr-3">
                        {file.type.startsWith('image/') ? (
                          <Image size={16} className="text-primary-600" />
                        ) : (
                          <FileText size={16} className="text-primary-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {uploadProgress[file.name] !== undefined && (
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress[file.name]}%` }}
                          />
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={uploading}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Titre du fichier (optionnel)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Texte alternatif (pour les images)
              </label>
              <input
                type="text"
                value={formData.alt_text}
                onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Description pour l'accessibilité"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Description du fichier"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Séparez les tags par des virgules"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Public</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Fichier vedette</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={uploading}
            >
              Annuler
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Téléchargement...' : 'Télécharger'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FileUploadModal;