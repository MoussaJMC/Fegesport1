import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import {
  Upload, Search, Filter, Grid, List, Eye, Download,
  Trash2, Edit, Plus, Image, FileText, Video, Music,
  Shield, Layout, User, Archive, X, Copy, ExternalLink, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUploadModal from './FileUploadModal';

interface FileCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface StaticFile {
  id: string;
  filename: string;
  original_filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  category_id: string;
  title: string;
  alt_text: string;
  description: string;
  tags: string[];
  width?: number;
  height?: number;
  is_public: boolean;
  is_featured: boolean;
  download_count: number;
  created_at: string;
  category?: FileCategory;
}

const FileManager: React.FC = () => {
  const [files, setFiles] = useState<StaticFile[]>([]);
  const [categories, setCategories] = useState<FileCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<StaticFile | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchFiles();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('file_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erreur lors du chargement des catégories');
    }
  };

  const fetchFiles = async () => {
    console.log('=== fetchFiles START ===');
    try {
      console.log('Making query to static_files...');
      const { data, error } = await supabase
        .from('static_files')
        .select(`
          *,
          category:file_categories(*)
        `)
        .order('created_at', { ascending: false });

      console.log('Query response:', { data: data?.length, error });

      if (error) {
        console.error('Error fetching files:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('Files fetched successfully:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('First 3 files:', data.slice(0, 3).map(f => ({
          id: f.id,
          filename: f.filename,
          category: f.category
        })));
      }

      setFiles(data || []);
      console.log('State updated with files:', data?.length || 0);

      if (!data || data.length === 0) {
        console.warn('No files found in database');
      }
    } catch (error) {
      console.error('Exception in fetchFiles:', error);
      toast.error('Erreur lors du chargement des fichiers');
    } finally {
      setLoading(false);
      console.log('=== fetchFiles END ===');
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      Image, FileText, Video, Music, Shield, Layout, User, Archive
    };
    return icons[iconName] || FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || file.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Debug logging
  useEffect(() => {
    console.log('FileManager state:', {
      totalFiles: files.length,
      filteredFiles: filteredFiles.length,
      searchTerm,
      selectedCategory,
      loading
    });
  }, [files.length, filteredFiles.length, searchTerm, selectedCategory, loading]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('URL copiée dans le presse-papiers');
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) return;

    try {
      const { error } = await supabase
        .from('static_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;
      toast.success('Fichier supprimé avec succès');
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleUploadSuccess = async () => {
    // Force a fresh fetch from the database
    setLoading(true);
    await fetchFiles();
    setLoading(false);
    setShowUploadModal(false);
  };

  const hasActiveFilters = searchTerm || selectedCategory;
  const hasFiles = files.length > 0;
  const hasFilteredFiles = filteredFiles.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* DEBUG INFO - TRES VISIBLE */}
      <div className="bg-red-100 border-4 border-red-500 rounded-lg p-6">
        <h2 className="text-3xl font-bold text-red-900 mb-4">🔍 PANNEAU DEBUG</h2>
        <div className="bg-white p-4 rounded text-xl space-y-3">
          <p>Total fichiers chargés: <strong className="text-4xl text-blue-600">{files.length}</strong></p>
          <p>Fichiers après filtrage: <strong className="text-4xl text-green-600">{filteredFiles.length}</strong></p>
          <p>Recherche active: <strong>{searchTerm || '(AUCUNE)'}</strong></p>
          <p>Catégorie sélectionnée: <strong>{selectedCategory || '(TOUTES)'}</strong></p>
          <p>En chargement: <strong>{loading ? '✅ OUI' : '❌ NON'}</strong></p>
        </div>
        {files.length > 0 && (
          <div className="mt-4 bg-yellow-100 p-4 rounded">
            <p className="font-bold text-lg mb-2">Premiers fichiers trouvés:</p>
            <ul className="space-y-2">
              {files.slice(0, 5).map(f => (
                <li key={f.id} className="bg-white p-2 rounded text-sm">
                  <strong>{f.filename}</strong> - {f.title || '(sans titre)'}<br/>
                  Type: {f.file_type} - URL existe: {f.file_url ? '✅' : '❌'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestionnaire de Fichiers</h1>
          <p className="text-gray-600">Gérer les images, documents et autres fichiers statiques</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setLoading(true);
              await fetchFiles();
              setLoading(false);
              toast.success('Liste rafraîchie');
            }}
            className="btn bg-gray-600 hover:bg-gray-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Rafraîchir
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn bg-primary-600 hover:bg-primary-700 text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            Télécharger
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{files.length}</div>
          <div className="text-sm text-gray-600">Total Fichiers</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {formatFileSize(files.reduce((sum, file) => sum + (file.file_size || 0), 0))}
          </div>
          <div className="text-sm text-gray-600">Taille Totale</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">
            {files.filter(f => f.file_type.startsWith('image/')).length}
          </div>
          <div className="text-sm text-gray-600">Images</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600">
            {files.filter(f => f.is_public).length}
          </div>
          <div className="text-sm text-gray-600">Publics</div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher des fichiers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4 p-3 bg-primary-50 rounded-lg flex items-center justify-between">
            <span className="text-primary-700">{selectedFiles.length} fichier(s) sélectionné(s)</span>
            <div className="flex gap-2">
              <button className="text-primary-600 hover:text-primary-700">
                <Download size={16} />
              </button>
              <button className="text-red-600 hover:text-red-700">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Files Grid/List */}
      <div className="bg-white rounded-lg shadow">
        {hasFilteredFiles ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-6">
                {filteredFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`relative group border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      selectedFiles.includes(file.id) 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                    onClick={() => toggleFileSelection(file.id)}
                  >
                    <div className="aspect-square mb-2 bg-gray-100 rounded-lg overflow-hidden">
                      {file.file_type.startsWith('image/') ? (
                        <img 
                          src={file.file_url} 
                          alt={file.alt_text || file.filename}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {React.createElement(getIconComponent(file.category?.icon || 'FileText'), {
                            size: 32,
                            className: 'text-gray-400'
                          })}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs">
                      <div className="font-medium truncate" title={file.title || file.filename}>
                        {file.title || file.filename}
                      </div>
                      <div className="text-gray-500">{formatFileSize(file.file_size || 0)}</div>
                    </div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewFile(file);
                          }}
                          className="p-1 bg-white rounded shadow hover:bg-gray-50"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(file.file_url);
                          }}
                          className="p-1 bg-white rounded shadow hover:bg-gray-50"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>

                    {file.is_featured && (
                      <div className="absolute top-2 left-2">
                        <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                          Vedette
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFiles(filteredFiles.map(f => f.id));
                            } else {
                              setSelectedFiles([]);
                            }
                          }}
                          checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fichier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Taille
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedFiles.includes(file.id)}
                            onChange={() => toggleFileSelection(file.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 mr-3">
                              {file.file_type.startsWith('image/') ? (
                                <img 
                                  src={file.file_url} 
                                  alt={file.alt_text || file.filename}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                                  {React.createElement(getIconComponent(file.category?.icon || 'FileText'), {
                                    size: 20,
                                    className: 'text-gray-400'
                                  })}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {file.title || file.filename}
                              </div>
                              <div className="text-sm text-gray-500">
                                {file.original_filename}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {file.category && (
                            <span 
                              className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                              style={{ 
                                backgroundColor: file.category.color + '20',
                                color: file.category.color 
                              }}
                            >
                              {file.category.name}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatFileSize(file.file_size || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(file.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => setPreviewFile(file)}
                              className="text-primary-600 hover:text-primary-900"
                              title="Aperçu"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => copyToClipboard(file.file_url)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Copier l'URL"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => window.open(file.file_url, '_blank')}
                              className="text-green-600 hover:text-green-900"
                              title="Ouvrir"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteFile(file.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {!hasFiles ? 'Aucun fichier' : 'Aucun résultat'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {!hasFiles ? (
                'Commencez par télécharger votre premier fichier.'
              ) : hasActiveFilters ? (
                'Aucun fichier ne correspond à vos critères de recherche.'
              ) : (
                'Aucun fichier disponible.'
              )}
            </p>
            {!hasFiles && (
              <div className="mt-6">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Télécharger un fichier
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {previewFile.title || previewFile.filename}
                </h3>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    {previewFile.file_type.startsWith('image/') ? (
                      <img 
                        src={previewFile.file_url} 
                        alt={previewFile.alt_text || previewFile.filename}
                        className="w-full h-auto rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        {React.createElement(getIconComponent(previewFile.category?.icon || 'FileText'), {
                          size: 64,
                          className: 'text-gray-400'
                        })}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom du fichier</label>
                      <p className="text-sm text-gray-900">{previewFile.original_filename}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Taille</label>
                      <p className="text-sm text-gray-900">{formatFileSize(previewFile.file_size || 0)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <p className="text-sm text-gray-900">{previewFile.file_type}</p>
                    </div>
                    
                    {previewFile.width && previewFile.height && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Dimensions</label>
                        <p className="text-sm text-gray-900">{previewFile.width} × {previewFile.height} px</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">URL</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={previewFile.file_url} 
                          readOnly 
                          className="flex-1 text-sm bg-gray-50 border border-gray-300 rounded px-3 py-2"
                        />
                        <button
                          onClick={() => copyToClipboard(previewFile.file_url)}
                          className="btn bg-primary-600 hover:bg-primary-700 text-white text-sm"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {previewFile.tags && previewFile.tags.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tags</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {previewFile.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
        categories={categories}
      />
    </div>
  );
};

export default FileManager;