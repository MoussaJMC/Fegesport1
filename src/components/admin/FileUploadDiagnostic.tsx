import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, RefreshCw, Database, FolderPlus } from 'lucide-react';

interface FileCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
}

const FileUploadDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<FileCategory[]>([]);
  const [showCreateCategoryForm, setShowCreateCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: 'FileText',
    color: '#6B7280'
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: DiagnosticResult[] = [
      { name: 'Connexion à Supabase', status: 'pending', message: 'Vérification...' },
      { name: 'Table file_categories', status: 'pending', message: 'Vérification...' },
      { name: 'Catégories disponibles', status: 'pending', message: 'Vérification...' },
      { name: 'Bucket de stockage', status: 'pending', message: 'Vérification...' }
    ];

    setDiagnostics([...results]);

    // Test 1: Supabase Connection
    try {
      const { data: connectionTest, error: connectionError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (connectionError) {
        results[0] = {
          name: 'Connexion à Supabase',
          status: 'error',
          message: `Erreur de connexion: ${connectionError.message}`,
          details: connectionError
        };
      } else {
        results[0] = {
          name: 'Connexion à Supabase',
          status: 'success',
          message: 'Connexion établie avec succès'
        };
      }
      setDiagnostics([...results]);
    } catch (error: any) {
      results[0] = {
        name: 'Connexion à Supabase',
        status: 'error',
        message: `Erreur: ${error.message}`,
        details: error
      };
      setDiagnostics([...results]);
    }

    // Test 2: file_categories table
    try {
      const { data: tableExists, error: tableError } = await supabase
        .from('file_categories')
        .select('id')
        .limit(1);
      
      if (tableError && tableError.code === 'PGRST116') {
        results[1] = {
          name: 'Table file_categories',
          status: 'error',
          message: 'La table file_categories n\'existe pas',
          details: tableError
        };
      } else if (tableError) {
        results[1] = {
          name: 'Table file_categories',
          status: 'error',
          message: `Erreur d'accès à la table: ${tableError.message}`,
          details: tableError
        };
      } else {
        results[1] = {
          name: 'Table file_categories',
          status: 'success',
          message: 'Table file_categories accessible'
        };
      }
      setDiagnostics([...results]);
    } catch (error: any) {
      results[1] = {
        name: 'Table file_categories',
        status: 'error',
        message: `Erreur: ${error.message}`,
        details: error
      };
      setDiagnostics([...results]);
    }

    // Test 3: Categories
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('file_categories')
        .select('*')
        .order('name');
      
      if (categoriesError) {
        results[2] = {
          name: 'Catégories disponibles',
          status: 'error',
          message: `Erreur lors du chargement des catégories: ${categoriesError.message}`,
          details: categoriesError
        };
      } else if (!categoriesData || categoriesData.length === 0) {
        results[2] = {
          name: 'Catégories disponibles',
          status: 'warning',
          message: 'Aucune catégorie trouvée'
        };
      } else {
        setCategories(categoriesData);
        results[2] = {
          name: 'Catégories disponibles',
          status: 'success',
          message: `${categoriesData.length} catégories trouvées`,
          details: categoriesData.map(c => c.name).join(', ')
        };
      }
      setDiagnostics([...results]);
    } catch (error: any) {
      results[2] = {
        name: 'Catégories disponibles',
        status: 'error',
        message: `Erreur: ${error.message}`,
        details: error
      };
      setDiagnostics([...results]);
    }

    // Test 4: Storage bucket
    try {
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('static-files');
      
      if (bucketError) {
        results[3] = {
          name: 'Bucket de stockage',
          status: 'error',
          message: `Erreur d'accès au bucket: ${bucketError.message}`,
          details: bucketError
        };
      } else {
        results[3] = {
          name: 'Bucket de stockage',
          status: 'success',
          message: 'Bucket static-files accessible',
          details: bucketData
        };
      }
      setDiagnostics([...results]);
    } catch (error: any) {
      results[3] = {
        name: 'Bucket de stockage',
        status: 'error',
        message: `Erreur: ${error.message}`,
        details: error
      };
      setDiagnostics([...results]);
    }

    setLoading(false);
  };

  const createCategory = async () => {
    if (!newCategory.name) {
      toast.error('Le nom de la catégorie est requis');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('file_categories')
        .insert([newCategory])
        .select()
        .single();

      if (error) throw error;
      
      toast.success(`Catégorie "${newCategory.name}" créée avec succès`);
      setCategories([...categories, data]);
      setShowCreateCategoryForm(false);
      setNewCategory({
        name: '',
        description: '',
        icon: 'FileText',
        color: '#6B7280'
      });
      
      // Refresh diagnostics
      runDiagnostics();
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast.error(`Erreur lors de la création: ${error.message}`);
    }
  };

  const createDefaultCategories = async () => {
    try {
      const defaultCategories = [
        { name: 'Documents', description: 'PDF, Word, Excel et autres documents', icon: 'FileText', color: '#3B82F6' },
        { name: 'Images', description: 'Photos, logos et autres images', icon: 'Image', color: '#10B981' },
        { name: 'Vidéos', description: 'Clips vidéo et enregistrements', icon: 'Video', color: '#F59E0B' },
        { name: 'Audio', description: 'Fichiers audio et musique', icon: 'Music', color: '#8B5CF6' },
        { name: 'Logos', description: 'Logos officiels et branding', icon: 'Layout', color: '#EC4899' },
        { name: 'Formulaires', description: 'Formulaires administratifs', icon: 'FileText', color: '#6366F1' },
        { name: 'Ressources', description: 'Ressources éducatives et guides', icon: 'Book', color: '#EF4444' },
        { name: 'Archives', description: 'Fichiers archivés', icon: 'Archive', color: '#6B7280' }
      ];

      for (const category of defaultCategories) {
        const { error } = await supabase
          .from('file_categories')
          .insert([category]);
        
        if (error && error.code !== '23505') { // Ignore unique constraint violations
          console.error(`Error creating category ${category.name}:`, error);
        }
      }
      
      toast.success('Catégories par défaut créées avec succès');
      runDiagnostics();
    } catch (error: any) {
      console.error('Error creating default categories:', error);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={20} />;
      case 'pending':
      default:
        return <RefreshCw className="text-gray-500 animate-spin" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Diagnostic du Téléchargement de Fichiers</h2>
        <div className="flex space-x-2">
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="btn bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={createDefaultCategories}
            className="btn bg-green-600 hover:bg-green-700 text-white"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Créer catégories par défaut
          </button>
        </div>
      </div>

      {/* Diagnostic Results */}
      <div className="space-y-4">
        {diagnostics.map((diagnostic, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getStatusColor(diagnostic.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {getStatusIcon(diagnostic.status)}
                <h3 className="ml-2 font-semibold">{diagnostic.name}</h3>
              </div>
            </div>
            <p className="text-gray-700 mb-2">{diagnostic.message}</p>
            {diagnostic.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  Voir les détails
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {typeof diagnostic.details === 'string' 
                    ? diagnostic.details 
                    : JSON.stringify(diagnostic.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Catégories de Fichiers</h3>
          <button
            onClick={() => setShowCreateCategoryForm(true)}
            className="btn bg-primary-600 hover:bg-primary-700 text-white text-sm"
          >
            <FolderPlus className="w-4 h-4 mr-1" />
            Nouvelle Catégorie
          </button>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                    <span className="text-lg">📁</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <Database className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune catégorie</h3>
            <p className="mt-1 text-sm text-gray-500">
              Créez des catégories pour organiser vos fichiers
            </p>
            <div className="mt-6">
              <button
                onClick={createDefaultCategories}
                className="btn bg-primary-600 hover:bg-primary-700 text-white"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                Créer les catégories par défaut
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Category Form */}
      {showCreateCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Nouvelle Catégorie</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icône
                  </label>
                  <select
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="FileText">Document</option>
                    <option value="Image">Image</option>
                    <option value="Video">Vidéo</option>
                    <option value="Music">Audio</option>
                    <option value="Layout">Logo</option>
                    <option value="Book">Livre</option>
                    <option value="Archive">Archive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                      className="w-10 h-10 border-0 p-0"
                    />
                    <input
                      type="text"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateCategoryForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={createCategory}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Créer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Troubleshooting Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-blue-800">Guide de dépannage</h3>
        <div className="space-y-4 text-blue-700">
          <div>
            <h4 className="font-medium">Problème: Erreur de téléchargement</h4>
            <p className="text-sm mt-1">
              Si vous rencontrez des erreurs lors du téléchargement de fichiers, vérifiez les points suivants:
            </p>
            <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
              <li>Assurez-vous que des catégories existent dans la table <code>file_categories</code></li>
              <li>Vérifiez que le bucket de stockage <code>static-files</code> existe et est accessible</li>
              <li>Vérifiez que les politiques RLS permettent l'accès aux tables</li>
              <li>Assurez-vous que la taille du fichier ne dépasse pas les limites de Supabase (50MB)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium">Solution: Créer les catégories manquantes</h4>
            <p className="text-sm mt-1">
              Si aucune catégorie n'est disponible, utilisez le bouton "Créer catégories par défaut" pour ajouter les catégories essentielles.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium">Solution: Vérifier les permissions</h4>
            <p className="text-sm mt-1">
              Assurez-vous d'être connecté avec un compte administrateur qui a les permissions nécessaires pour télécharger des fichiers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadDiagnostic;