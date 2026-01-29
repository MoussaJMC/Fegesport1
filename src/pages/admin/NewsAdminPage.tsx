import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, Search, Filter, Newspaper, Calendar, Tag, Copy, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import NewsForm from '../../components/admin/NewsForm';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url?: string;
  author_id?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const NewsAdminPage = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [copied, setCopied] = useState<string | null>(null);
  const [previewNews, setPreviewNews] = useState<NewsItem | null>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);

  useEffect(() => {
    fetchNews();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userMetadata = user?.user_metadata;

      const { data: testResult, error: testError } = await supabase
        .rpc('is_admin');

      setDiagnosticInfo({
        user: user ? { id: user.id, email: user.email } : null,
        metadata: userMetadata,
        isAdminResult: testResult,
        error: testError
      });

      console.log('Admin status:', { user, metadata: userMetadata, isAdminResult: testResult });
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast.error('Erreur lors du chargement des actualités');
    } finally {
      setLoading(false);
    }
  };

  const deleteNews = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Actualité supprimée avec succès');
      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('news')
        .update({ published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Actualité ${!currentStatus ? 'publiée' : 'dépubliée'} avec succès`);
      fetchNews();
    } catch (error) {
      console.error('Error updating news status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingNews(null);
    fetchNews();
  };

  const handleEdit = (newsItem: NewsItem) => {
    setEditingNews(newsItem);
    setShowForm(true);
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'published' && item.published) ||
                         (filterStatus === 'draft' && !item.published);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(news.map(item => item.category).filter(Boolean))];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Communiqué': return 'bg-blue-100 text-blue-800';
      case 'Compétition': return 'bg-green-100 text-green-800';
      case 'Formation': return 'bg-yellow-100 text-yellow-800';
      case 'Partenariat': return 'bg-purple-100 text-purple-800';
      case 'International': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Actualités</h1>
          <p className="text-gray-600">Gérer les actualités et publications</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDiagnostic(!showDiagnostic)}
            className="btn bg-gray-600 hover:bg-gray-700 text-white"
          >
            Diagnostic
          </button>
          <button
            onClick={() => {
              setEditingNews(null);
              setShowForm(true);
            }}
            className="btn bg-primary-600 hover:bg-primary-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Actualité
          </button>
        </div>
      </div>

      {/* Diagnostic Panel */}
      {showDiagnostic && diagnosticInfo && (
        <div className="bg-white p-4 rounded-lg shadow border-2 border-yellow-400">
          <h3 className="text-lg font-bold mb-2">Diagnostic d'authentification</h3>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(diagnosticInfo, null, 2)}
          </pre>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{news.length}</div>
          <div className="text-sm text-gray-600">Total Actualités</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{news.filter(n => n.published).length}</div>
          <div className="text-sm text-gray-600">Publiées</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">{news.filter(n => !n.published).length}</div>
          <div className="text-sm text-gray-600">Brouillons</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">
            {categories.length}
          </div>
          <div className="text-sm text-gray-600">Catégories</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par titre, extrait ou contenu..."
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

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Tous les statuts</option>
            <option value="published">Publié</option>
            <option value="draft">Brouillon</option>
          </select>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <Filter className="mr-2" size={16} />
              {filteredNews.length} résultat(s)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'bg-gray-100'}`}
                title="Vue liste"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'bg-gray-100'}`}
                title="Vue grille"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingNews ? 'Modifier l\'actualité' : 'Nouvelle actualité'}
              </h2>
              <NewsForm
                initialData={editingNews || undefined}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowForm(false);
                  setEditingNews(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">Aperçu de l'actualité</h2>
                <button
                  onClick={() => setPreviewNews(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-6">
                {previewNews.image_url && (
                  <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src={previewNews.image_url} 
                      alt={previewNews.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Image+non+disponible';
                      }}
                    />
                  </div>
                )}
                
                <div>
                  {previewNews.category && (
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(previewNews.category)} mb-2`}>
                      {previewNews.category}
                    </span>
                  )}
                  <h1 className="text-2xl font-bold">{previewNews.title}</h1>
                  <div className="flex items-center text-gray-500 text-sm mt-2">
                    <Calendar size={14} className="mr-1" />
                    <time dateTime={previewNews.created_at}>
                      {format(new Date(previewNews.created_at), 'PPP', { locale: fr })}
                    </time>
                  </div>
                </div>
                
                <div className="prose max-w-none">
                  <p className="font-medium text-lg">{previewNews.excerpt}</p>
                  <div className="mt-4 whitespace-pre-line">
                    {previewNews.content}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      setPreviewNews(null);
                      handleEdit(previewNews);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4 mr-2 inline" />
                    Modifier
                  </button>
                  <button
                    onClick={() => setPreviewNews(null)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              {item.image_url && (
                <div className="h-48 bg-gray-200 relative">
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Image+non+disponible';
                    }}
                  />
                  {!item.published && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      Brouillon
                    </div>
                  )}
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(item.category)}`}>
                    {item.category || 'Non catégorisé'}
                  </span>
                  <button
                    onClick={() => copyToClipboard(item.id)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Copier l'ID"
                  >
                    {copied === item.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.excerpt}</p>
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <Calendar size={14} className="mr-1" />
                  <time dateTime={item.created_at}>
                    {format(new Date(item.created_at), 'PPP', { locale: fr })}
                  </time>
                </div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => togglePublished(item.id, item.published)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      item.published 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                  >
                    {item.published ? 'Publié' : 'Brouillon'}
                  </button>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setPreviewNews(item)}
                      className="p-1 text-primary-600 hover:text-primary-900"
                      title="Aperçu"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => handleEdit(item)}
                      className="p-1 text-blue-600 hover:text-blue-900"
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => deleteNews(item.id)}
                      className="p-1 text-red-600 hover:text-red-900"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                {filteredNews.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt=""
                            className="h-10 w-10 rounded object-cover mr-3"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/40x40?text=NA';
                            }}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {item.title}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {item.excerpt}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryColor(item.category)}`}>
                        {item.category || 'Non catégorisé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(item.created_at), 'PPP', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePublished(item.id, item.published)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.published 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        } transition-colors cursor-pointer`}
                      >
                        {item.published ? 'Publié' : 'Brouillon'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => setPreviewNews(item)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Aperçu"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => deleteNews(item.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredNews.length === 0 && (
            <div className="text-center py-12">
              <Newspaper className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune actualité</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterCategory || filterStatus 
                  ? 'Aucune actualité ne correspond à vos critères de recherche.'
                  : 'Commencez par créer votre première actualité.'
                }
              </p>
              {!searchTerm && !filterCategory && !filterStatus && (
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setEditingNews(null);
                      setShowForm(true);
                    }}
                    className="btn bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle Actualité
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsAdminPage;