import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, RefreshCw, Database, FolderPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
  const { user, isAuthenticated } = useAuth();
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
      { name: 'Authentification', status: 'pending', message: 'Vérification...' },
      { name: 'Rôle Administrateur', status: 'pending', message: 'Vérification...' },
      { name: 'Table file_categories', status: 'pending', message: 'Vérification...' },
      { name: 'Catégories disponibles', status: 'pending', message: 'Vérification...' },
      { name: 'Table static_files', status: 'pending', message: 'Vérification...' },
      { name: 'Fichiers avec JOIN', status: 'pending', message: 'Vérification...' },
      { name: 'Bucket de stockage', status: 'pending', message: 'Vérification...' },
      { name: 'Permissions de stockage', status: 'pending', message: 'Vérification...' }
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

    // Test 2: Authentication
    try {
      if (isAuthenticated && user) {
        results[1] = {
          name: 'Authentification',
          status: 'success',
          message: `Authentifié en tant que: ${user.email}`,
          details: { userId: user.id, email: user.email }
        };
      } else {
        results[1] = {
          name: 'Authentification',
          status: 'error',
          message: 'Non authentifié - Connexion requise',
          details: { isAuthenticated }
        };
      }
      setDiagnostics([...results]);
    } catch (error: any) {
      results[1] = {
        name: 'Authentification',
        status: 'error',
        message: `Erreur: ${error.message}`,
        details: error
      };
      setDiagnostics([...results]);
    }

    // Test 3: Admin Role
    try {
      const isAdmin = user?.user_metadata?.role === 'admin';
      if (isAuthenticated && isAdmin) {
        results[2] = {
          name: 'Rôle Administrateur',
          status: 'success',
          message: 'Rôle administrateur détecté',
          details: { role: user?.user_metadata?.role }
        };
      } else {
        results[2] = {
          name: 'Rôle Administrateur',
          status: 'error',
          message: 'Rôle administrateur non détecté - Permissions insuffisantes',
          details: { userMetadata: user?.user_metadata }
        };
      }
      setDiagnostics([...results]);
    } catch (error: any) {
      results[2] = {
        name: 'Rôle Administrateur',
        status: 'error',
        message: `Erreur: ${error.message}`,
        details: error
      };
      setDiagnostics([...results]);
    }

    // Test 4: file_categories table
    try {
      const { data: tableExists, error: tableError } = await supabase
        .from('file_categories')
        .select('id')
        .limit(1);
      
      if (tableError && tableError.code === 'PGRST116') {
        results[3] = {
          name: 'Table file_categories',
          status: 'error',
          message: 'La table file_categories n\'existe pas',
          details: tableError
        };
      } else if (tableError) {
        results[3] = {
          name: 'Table file_categories',
          status: 'error',
          message: `Erreur d'accès à la table: ${tableError.message}`,
          details: tableError
        };
      } else {
        results[3] = {
          name: 'Table file_categories',
          status: 'success',
          message: 'Table file_categories accessible'
        };
      }
      setDiagnostics([...results]);
    } catch (error: any) {
      results[3] = {
        name: 'Table file_categories',
        status: 'error',
        message: `Erreur: ${error.message}`,
        details: error
      };
      setDiagnostics([...results]);
    }

    // Test 5: Categories
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('file_categories')
        .select('*')
        .order('name');
      
      if (categoriesError) {
        results[4] = {
          name: 'Catégories disponibles',
          status: 'error',
          message: `Erreur lors du chargement des catégories: ${categoriesError.message}`,
          details: categoriesError
        };
      } else if (!categoriesData || categoriesData.length === 0) {
        results[4] = {
          name: 'Catégories disponibles',
          status: 'warning',
          message: 'Aucune catégorie trouvée'
        };
      } else {
        setCategories(categoriesData);
        results[4] = {
          name: 'Catégories disponibles',
          status: 'success',
          message: `${categoriesData.length} catégories trouvées`,
          details: categoriesData.map(c => c.name).join(', ')
        };
      }
      setDiagnostics([...results]);
    } catch (error: any) {
      results[4] = {
        name: 'Catégories disponibles',
        status: 'error',
        message: `Erreur: ${error.message}`,
        details: error
      };
      setDiagnostics([...results]);
    }

    // Test 6: static_files table
    try {
      const { data: filesCount, error: filesError } = await supabase
        .from('static_files')
        .select('id', { count: 'exact', head: true });

      if (filesError) {
        results[5] = {
          name: 'Table static_files',
          status: 'error',
          message: `Erreur d'accès à la table: ${filesError.message}`,
          details: filesError
        };
      } else {
        results[5] = {
          name: 'Table static_files',
          status: 'success',
          message: `Table static_files accessible (${filesCount || 0} fichiers)`,
          details: { count: filesCount }
        };
      }
      setDiagnostics([...results]);
    } catch (error: any) {
      results[5] = {
        name: 'Table static_files',
        status: 'error',
        message: `Erreur: ${error.message}`,
        details: error
      };
      setDiagnostics([...results]);
    }

    // Test 7: Fetch files with JOIN (comme le FileManager)
    try {
      const { data: filesData, error: filesJoinError } = await supabase
        .from('static_files')
        .select(`
          *,
          category:file_categories(*)
        `)
        .order('created_at', { ascending: false });

      if (filesJoinError) {
        results[6] = {
          name: 'Fichiers avec JOIN',
          status: 'error',
          message: `Erreur lors du chargement des fichiers avec JOIN: ${filesJoinError.message}`,
          details: filesJoinError
        };
      } else if (!filesData || filesData.length === 0) {
        results[6] = {
          name: 'Fichiers avec JOIN',
          status: 'warning',
          message: 'Aucun fichier trouvé (la table est vide)',
          details: { count: 0 }
        };
      } else {
        results[6] = {
          name: 'Fichiers avec JOIN',
          status: 'success',
          message: `${filesData.length} fichiers récupérés avec succès`,
          details: {
            count: filesData.length,
            files: filesData.slice(0, 3).map(f => ({
              filename: f.filename,
              category: f.category?.name || 'N/A'
            }))
          }
        };
      }
      setDiagnostics([...results]);
    } catch (error: any) {
      results[6] = {
        name: 'Fichiers avec JOIN',
        status: 'error',
        message: `Erreur: ${error.message}`,
        details: error
      };
      setDiagnostics([...results]);
    }

    // Test 8: Storage bucket
    try {
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();

      if (bucketsError) {
        results[7] = {
          name: 'Bucket de stockage',
          status: 'error',
          message: `Erreur d'accès aux buckets: ${bucketsError.message}`,
          details: bucketsError
        };
      } else {
        const staticFilesBucket = buckets?.find(b => b.name === 'static-files');

        if (!staticFilesBucket) {
          results[7] = {
            name: 'Bucket de stockage',
            status: 'warning',
            message: 'Bucket static-files non trouvé',
            details: { availableBuckets: buckets?.map(b => b.name) }
          };
        } else {
          results[7] = {
            name: 'Bucket de stockage',
            status: 'success',
            message: 'Bucket static-files accessible',
            details: staticFilesBucket
          };
        }
      }
      setDiagnostics([...results]);
    } catch (error: any) {
      results[7] = {
        name: 'Bucket de stockage',
        status: 'error',
        message: `Erreur: ${error.message}`,
        details: error
      };
      setDiagnostics([...results]);
    }

    // Test 9: Storage permissions
    try {
      // Try to upload a small test file
      const testFile = new Blob(['test'], { type: 'text/plain' });
      const fileName = `test-${Date.now()}.txt`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('static-files')
        .upload(`test/${fileName}`, testFile);

      if (uploadError) {
        if (uploadError.message.includes('new row violates row-level security policy')) {
          results[8] = {
            name: 'Permissions de stockage',
            status: 'error',
            message: 'Violation de la politique RLS - Permissions insuffisantes',
            details: uploadError
          };
        } else if (uploadError.message.includes('The resource already exists')) {
          // This is actually fine, it means we can upload
          results[8] = {
            name: 'Permissions de stockage',
            status: 'success',
            message: 'Permissions de téléchargement OK (conflit de nom de fichier)',
            details: uploadError
          };
        } else {
          results[8] = {
            name: 'Permissions de stockage',
            status: 'error',
            message: `Erreur de téléchargement: ${uploadError.message}`,
            details: uploadError
          };
        }
      } else {
        // Clean up the test file
        await supabase.storage
          .from('static-files')
          .remove([`test/${fileName}`]);

        results[8] = {
          name: 'Permissions de stockage',
          status: 'success',
          message: 'Test de téléchargement réussi',
          details: { path: uploadData?.path }
        };
      }
      setDiagnostics([...results]);
    } catch (error: any) {
      results[8] = {
        name: 'Permissions de stockage',
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
              <li>Vérifiez que vous êtes connecté avec un compte administrateur</li>
              <li>Vérifiez que votre compte a le rôle <code>admin</code> dans les métadonnées utilisateur</li>
              <li>Assurez-vous que la taille du fichier ne dépasse pas les limites de Supabase (50MB)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium">Solution: Créer le bucket de stockage</h4>
            <p className="text-sm mt-1">
              Si le bucket <code>static-files</code> n'existe pas, vous devez le créer via le dashboard Supabase:
            </p>
            <ol className="list-decimal pl-5 text-sm mt-2 space-y-1">
              <li>Allez dans la section Storage du dashboard Supabase</li>
              <li>Cliquez sur "New Bucket"</li>
              <li>Nommez-le "static-files"</li>
              <li>Cochez "Public bucket" pour permettre l'accès public</li>
              <li>Cliquez sur "Create bucket"</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-medium">Solution: Vérifier les permissions</h4>
            <p className="text-sm mt-1">
              Assurez-vous d'être connecté avec un compte administrateur qui a les permissions nécessaires pour télécharger des fichiers.
              Vérifiez que votre compte utilisateur a le rôle <code>admin</code> dans les métadonnées utilisateur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploadDiagnostic;