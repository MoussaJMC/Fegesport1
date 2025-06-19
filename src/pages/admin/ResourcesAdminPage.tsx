import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, Search, Filter, Download, FileText, Book, Upload, Link, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface Resource {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  category: string;
  size?: number;
  download_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface ResourceFormData {
  id?: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  category: string;
  is_public: boolean;
}

const ResourcesAdminPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState<ResourceFormData>({
    title: '',
    description: '',
    file_url: '',
    file_type: 'PDF',
    category: 'Documents Officiels',
    is_public: true
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      
      // First, check if the static_files table exists
      const { data: tableExists, error: tableCheckError } = await supabase
        .from('static_files')
        .select('id')
        .limit(1);
      
      if (tableCheckError) {
        console.error('Error checking static_files table:', tableCheckError);
        // If the table doesn't exist, we'll use mock data
        setResources(getMockResources());
        return;
      }
      
      // Try to get the Documents category ID
      const documentsCategoryId = await getCategoryId('Documents');
      
      // Build the query - only filter by category_id if we have a valid ID
      let query = supabase
        .from('static_files')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Only add category filter if we have a valid category ID
      if (documentsCategoryId) {
        query = query.eq('category_id', documentsCategoryId);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      
      // Map the data to our Resource interface
      const mappedResources = (data || []).map(file => ({
        id: file.id,
        title: file.title || file.filename,
        description: file.description || '',
        file_url: file.file_url,
        file_type: file.file_type,
        category: 'Documents',
        size: file.file_size,
        download_count: file.download_count || 0,
        is_public: file.is_public,
        created_at: file.created_at,
        updated_at: file.updated_at
      }));
      
      setResources(mappedResources.length > 0 ? mappedResources : getMockResources());
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Erreur lors du chargement des ressources');
      setResources(getMockResources());
    } finally {
      setLoading(false);
    }
  };

  const getCategoryId = async (categoryName: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('file_categories')
        .select('id')
        .eq('name', categoryName)
        .limit(1);
      
      if (error) {
        console.error('Error fetching category ID:', error);
        return null;
      }
      
      // Check if we have data and it's not empty
      if (data && data.length > 0) {
        return data[0].id;
      }
      
      return null;
    } catch (error) {
      console.error('Error in getCategoryId:', error);
      return null;
    }
  };

  const getMockResources = (): Resource[] => {
    return [
      {
        id: '1',
        title: 'Statuts de la FEGESPORT',
        description: 'Document officiel détaillant la structure et le fonctionnement de la fédération',
        file_url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
        file_type: 'application/pdf',
        category: 'Documents Officiels',
        size: 2100000,
        download_count: 45,
        is_public: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: '2',
        title: 'Règlement Intérieur',
        description: 'Règles et procédures internes de la FEGESPORT',
        file_url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
        file_type: 'application/pdf',
        category: 'Documents Officiels',
        size: 1800000,
        download_count: 32,
        is_public: true,
        created_at: '2025-01-20T14:30:00Z',
        updated_at: '2025-01-20T14:30:00Z'
      },
      {
        id: '3',
        title: 'Guide des Compétitions',
        description: 'Procédures et règlements pour l\'organisation de tournois',
        file_url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
        file_type: 'application/pdf',
        category: 'Guides Pratiques',
        size: 3500000,
        download_count: 78,
        is_public: true,
        created_at: '2025-02-05T09:15:00Z',
        updated_at: '2025-02-05T09:15:00Z'
      },
      {
        id: '4',
        title: 'Rapport Annuel 2024',
        description: 'Bilan des activités et résultats de la FEGESPORT',
        file_url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
        file_type: 'application/pdf',
        category: 'Études et Rapports',
        size: 5100000,
        download_count: 23,
        is_public: true,
        created_at: '2025-03-10T16:45:00Z',
        updated_at: '2025-03-10T16:45:00Z'
      }
    ];
  };

  const deleteResource = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      return;
    }

    try {
      // Check if we're using real data or mock data
      const isRealData = resources.length > 0 && resources[0].id !== '1';
      
      if (isRealData) {
        const { error } = await supabase
          .from('static_files')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }
      
      // Update local state regardless
      setResources(resources.filter(resource => resource.id !== id));
      toast.success('Ressource supprimée avec succès');
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const togglePublicStatus = async (id: string, currentStatus: boolean) => {
    try {
      // Check if we're using real data or mock data
      const isRealData = resources.length > 0 && resources[0].id !== '1';
      
      if (isRealData) {
        const { error } = await supabase
          .from('static_files')
          .update({ is_public: !currentStatus })
          .eq('id', id);

        if (error) throw error;
      }
      
      // Update local state regardless
      setResources(resources.map(resource => 
        resource.id === id 
          ? { ...resource, is_public: !currentStatus } 
          : resource
      ));
      
      toast.success(`Ressource ${!currentStatus ? 'publiée' : 'dépubliée'} avec succès`);
    } catch (error) {
      console.error('Error updating resource status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Check if we're using real data or mock data
      const isRealData = resources.length > 0 && resources[0].id !== '1';
      
      if (isRealData) {
        // Get category ID - if not found, proceed without category
        const categoryId = await getCategoryId(formData.category);
        
        if (editingResource) {
          // Update existing resource
          const updateData: any = {
            title: formData.title,
            description: formData.description,
            file_url: formData.file_url,
            file_type: formData.file_type,
            is_public: formData.is_public
          };
          
          // Only add category_id if we have a valid one
          if (categoryId) {
            updateData.category_id = categoryId;
          }
          
          const { error } = await supabase
            .from('static_files')
            .update(updateData)
            .eq('id', editingResource.id);

          if (error) throw error;
        } else {
          // Create new resource
          const insertData: any = {
            filename: formData.title,
            original_filename: formData.title,
            title: formData.title,
            description: formData.description,
            file_url: formData.file_url,
            file_type: formData.file_type,
            is_public: formData.is_public
          };
          
          // Only add category_id if we have a valid one
          if (categoryId) {
            insertData.category_id = categoryId;
          }
          
          const { error } = await supabase
            .from('static_files')
            .insert([insertData]);

          if (error) throw error;
        }
      } else {
        // Using mock data, just update the local state
        if (editingResource) {
          setResources(resources.map(resource => 
            resource.id === editingResource.id 
              ? { 
                  ...resource, 
                  title: formData.title,
                  description: formData.description,
                  file_url: formData.file_url,
                  file_type: formData.file_type,
                  category: formData.category,
                  is_public: formData.is_public,
                  updated_at: new Date().toISOString()
                } 
              : resource
          ));
        } else {
          const newResource: Resource = {
            id: `mock-${Date.now()}`,
            title: formData.title,
            description: formData.description,
            file_url: formData.file_url,
            file_type: formData.file_type,
            category: formData.category,
            size: 1000000, // Mock size
            download_count: 0,
            is_public: formData.is_public,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setResources([newResource, ...resources]);
        }
      }
      
      toast.success(`Ressource ${editingResource ? 'mise à jour' : 'créée'} avec succès`);
      setShowForm(false);
      setEditingResource(null);
      resetForm();
      
      // Refresh data if using real data
      if (isRealData) {
        fetchResources();
      }
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (resource: Resource) => {
    setFormData({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      file_url: resource.file_url,
      file_type: resource.file_type,
      category: resource.category,
      is_public: resource.is_public
    });
    setEditingResource(resource);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      file_url: '',
      file_type: 'PDF',
      category: 'Documents Officiels',
      is_public: true
    });
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || resource.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(resources.map(resource => resource.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Ressources</h1>
          <p className="text-gray-600">Gérer les documents, guides et autres ressources</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingResource(null);
            setShowForm(true);
          }}
          className="btn bg-primary-600 hover:bg-primary-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Ressource
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{resources.length}</div>
          <div className="text-sm text-gray-600">Total Ressources</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {resources.filter(r => r.is_public).length}
          </div>
          <div className="text-sm text-gray-600">Publiées</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">
            {resources.filter(r => r.category === 'Documents Officiels').length}
          </div>
          <div className="text-sm text-gray-600">Documents Officiels</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600">
            {resources.reduce((sum, r) => sum + (r.download_count || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Téléchargements</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <div className="flex items-center text-sm text-gray-500">
            <Filter className="mr-2" size={16} />
            {filteredResources.length} résultat(s)
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingResource ? 'Modifier la ressource' : 'Nouvelle ressource'}
              </h2>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    required
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
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL du fichier
                  </label>
                  <input
                    type="url"
                    value={formData.file_url}
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de fichier
                    </label>
                    <select
                      value={formData.file_type}
                      onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="application/pdf">PDF</option>
                      <option value="application/msword">Word</option>
                      <option value="application/vnd.ms-excel">Excel</option>
                      <option value="application/vnd.ms-powerpoint">PowerPoint</option>
                      <option value="application/zip">ZIP</option>
                      <option value="text/plain">Texte</option>
                      <option value="image/jpeg">Image JPEG</option>
                      <option value="image/png">Image PNG</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="Documents Officiels">Documents Officiels</option>
                      <option value="Guides Pratiques">Guides Pratiques</option>
                      <option value="Études et Rapports">Études et Rapports</option>
                      <option value="Formulaires">Formulaires</option>
                      <option value="Médias">Médias</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="is_public" className="ml-2 text-sm text-gray-700">
                    Ressource publique
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingResource(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {editingResource ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Resources List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ressource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taille
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléchargements
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResources.map((resource, index) => (
                <motion.tr
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                        <FileText className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {resource.title}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {resource.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                      {resource.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatFileSize(resource.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {resource.download_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => togglePublicStatus(resource.id, resource.is_public)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        resource.is_public 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      } transition-colors cursor-pointer`}
                    >
                      {resource.is_public ? 'Publié' : 'Non publié'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => window.open(resource.file_url, '_blank')}
                        className="text-primary-600 hover:text-primary-900"
                        title="Voir le document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = resource.file_url;
                          link.download = resource.title;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(resource)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteResource(resource.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <Book className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune ressource</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterCategory
                ? 'Aucune ressource ne correspond à vos critères de recherche.'
                : 'Commencez par créer votre première ressource.'
              }
            </p>
            {!searchTerm && !filterCategory && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    resetForm();
                    setEditingResource(null);
                    setShowForm(true);
                  }}
                  className="btn bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle Ressource
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resource Upload Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-blue-800 flex items-center">
          <Upload className="mr-2" />
          Guide d'Ajout de Ressources
        </h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Link className="text-blue-600" size={16} />
            </div>
            <div>
              <h3 className="font-medium text-blue-700">Hébergement des fichiers</h3>
              <p className="text-blue-600 text-sm">
                Pour ajouter des ressources, vous devez d'abord héberger vos fichiers sur un service comme Google Drive, 
                Dropbox ou tout autre service d'hébergement qui fournit un lien de téléchargement direct.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <ExternalLink className="text-blue-600" size={16} />
            </div>
            <div>
              <h3 className="font-medium text-blue-700">Liens publics</h3>
              <p className="text-blue-600 text-sm">
                Assurez-vous que les liens sont accessibles publiquement et ne nécessitent pas d'authentification.
                Pour Google Drive, utilisez l'option "Obtenir un lien" et assurez-vous qu'il est configuré pour "Toute personne disposant du lien".
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <FileText className="text-blue-600" size={16} />
            </div>
            <div>
              <h3 className="font-medium text-blue-700">Types de fichiers recommandés</h3>
              <p className="text-blue-600 text-sm">
                PDF pour les documents officiels, guides et rapports.
                Word/Excel pour les formulaires modifiables.
                Images (PNG/JPG) pour les visuels et infographies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesAdminPage;