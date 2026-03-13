import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Upload, Edit2, Trash2, Eye, EyeOff, Save, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface OfficialDocument {
  id: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  document_type: 'statuts' | 'reglement' | 'other';
  file_url: string;
  file_size: number;
  is_active: boolean;
  display_order: number;
  version: string;
  created_at: string;
  updated_at: string;
}

interface DocumentFormData {
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  document_type: 'statuts' | 'reglement' | 'other';
  file_url: string;
  version: string;
  is_active: boolean;
  display_order: number;
}

export default function DocumentsAdminPage() {
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDocument, setEditingDocument] = useState<OfficialDocument | null>(null);
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    title_en: '',
    description: '',
    description_en: '',
    document_type: 'statuts',
    file_url: '',
    version: '',
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('official_documents')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (document: OfficialDocument) => {
    setEditingDocument(document);
    setFormData({
      title: document.title,
      title_en: document.title_en,
      description: document.description,
      description_en: document.description_en,
      document_type: document.document_type,
      file_url: document.file_url,
      version: document.version,
      is_active: document.is_active,
      display_order: document.display_order
    });
    setIsEditing(true);
  };

  const handleCreate = () => {
    setEditingDocument(null);
    setFormData({
      title: '',
      title_en: '',
      description: '',
      description_en: '',
      document_type: 'statuts',
      file_url: '',
      version: '',
      is_active: true,
      display_order: documents.length
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingDocument(null);
    setFormData({
      title: '',
      title_en: '',
      description: '',
      description_en: '',
      document_type: 'statuts',
      file_url: '',
      version: '',
      is_active: true,
      display_order: 0
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.title_en || !formData.file_url) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (editingDocument) {
        const { error } = await supabase
          .from('official_documents')
          .update(formData)
          .eq('id', editingDocument.id);

        if (error) throw error;
        toast.success('Document mis à jour avec succès');
      } else {
        const { error } = await supabase
          .from('official_documents')
          .insert([formData]);

        if (error) throw error;
        toast.success('Document créé avec succès');
      }

      handleCancel();
      fetchDocuments();
    } catch (error: any) {
      console.error('Error saving document:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde du document');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

    try {
      const { error } = await supabase
        .from('official_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Document supprimé avec succès');
      fetchDocuments();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast.error(error.message || 'Erreur lors de la suppression du document');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('official_documents')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(currentStatus ? 'Document masqué' : 'Document affiché');
      fetchDocuments();
    } catch (error: any) {
      console.error('Error toggling document status:', error);
      toast.error(error.message || 'Erreur lors de la modification du statut');
    }
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'statuts':
        return 'Statuts';
      case 'reglement':
        return 'Règlement Intérieur';
      case 'other':
        return 'Autre';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents Officiels</h1>
          <p className="text-gray-600 mt-2">
            Gérer les documents officiels de la fédération (Statuts, Règlements)
          </p>
        </div>
        {!isEditing && (
          <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Ajouter un Document
          </button>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-1">Instructions importantes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Téléchargez d'abord le PDF dans le gestionnaire de fichiers</li>
            <li>Copiez l'URL du fichier et collez-la dans le champ "URL du fichier"</li>
            <li>Les documents sont protégés contre le téléchargement côté utilisateur</li>
            <li>Seuls les documents actifs sont visibles sur la page À propos</li>
          </ul>
        </div>
      </div>

      {isEditing ? (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {editingDocument ? 'Modifier le Document' : 'Nouveau Document'}
            </h2>
            <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre (Français) *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (English) *
                </label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Français)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (English)
                </label>
                <textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  className="input"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de Document *
                </label>
                <select
                  value={formData.document_type}
                  onChange={(e) => setFormData({ ...formData, document_type: e.target.value as any })}
                  className="input"
                  required
                >
                  <option value="statuts">Statuts</option>
                  <option value="reglement">Règlement Intérieur</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="input"
                  placeholder="Version 2025"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL du Fichier PDF *
                </label>
                <input
                  type="text"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  className="input"
                  placeholder="/media/documents/statuts-fegesport.pdf"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Téléchargez le fichier dans le gestionnaire de fichiers, puis copiez l'URL ici
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="input"
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                  Document actif (visible sur le site)
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                {editingDocument ? 'Mettre à jour' : 'Créer'}
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Annuler
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {documents.length === 0 ? (
            <div className="card p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun document
              </h3>
              <p className="text-gray-600 mb-4">
                Commencez par ajouter votre premier document officiel
              </p>
              <button onClick={handleCreate} className="btn-primary inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Ajouter un Document
              </button>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${doc.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <FileText className={`w-6 h-6 ${doc.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">{doc.title}</h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                          {getDocumentTypeName(doc.document_type)}
                        </span>
                        {!doc.is_active && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            Masqué
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{doc.title_en}</p>
                      {doc.description && (
                        <p className="text-sm text-gray-500 mb-3">{doc.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {doc.version && <span>Version: {doc.version}</span>}
                        <span>Ordre: {doc.display_order}</span>
                      </div>
                      <div className="mt-2">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          {doc.file_url}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(doc.id, doc.is_active)}
                      className="p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100"
                      title={doc.is_active ? 'Masquer' : 'Afficher'}
                    >
                      {doc.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleEdit(doc)}
                      className="p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-100"
                      title="Modifier"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
