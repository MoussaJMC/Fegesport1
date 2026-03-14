import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Upload, CreditCard as Edit2, Trash2, Eye, EyeOff, Save, X, AlertCircle, History, Plus, CheckCircle, Clock, Loader } from 'lucide-react';
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
  version_number: string;
  is_current_version: boolean;
  parent_document_id: string | null;
  published_at: string;
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
  version_number: string;
  is_active: boolean;
  display_order: number;
  published_at: string;
}

export default function DocumentsAdminPage() {
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDocument, setEditingDocument] = useState<OfficialDocument | null>(null);
  const [selectedDocumentVersions, setSelectedDocumentVersions] = useState<OfficialDocument[]>([]);
  const [showVersions, setShowVersions] = useState<string | null>(null);
  const [isAddingVersion, setIsAddingVersion] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    title_en: '',
    description: '',
    description_en: '',
    document_type: 'statuts',
    file_url: '',
    version: '',
    version_number: '1.0',
    is_active: true,
    display_order: 0,
    published_at: new Date().toISOString().split('T')[0]
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
        .is('parent_document_id', null)
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

  const fetchDocumentVersions = async (documentId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_document_versions', {
        doc_id: documentId
      });

      if (error) throw error;
      setSelectedDocumentVersions(data || []);
      setShowVersions(documentId);
    } catch (error) {
      console.error('Error fetching document versions:', error);
      toast.error('Erreur lors du chargement des versions');
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
      version_number: document.version_number,
      is_active: document.is_active,
      display_order: document.display_order,
      published_at: document.published_at ? document.published_at.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsEditing(true);
    setIsAddingVersion(false);
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
      version_number: '1.0',
      is_active: true,
      display_order: documents.length,
      published_at: new Date().toISOString().split('T')[0]
    });
    setIsEditing(true);
    setIsAddingVersion(false);
  };

  const handleAddVersion = (document: OfficialDocument) => {
    setEditingDocument(document);
    setFormData({
      title: document.title,
      title_en: document.title_en,
      description: document.description,
      description_en: document.description_en,
      document_type: document.document_type,
      file_url: '',
      version: '',
      version_number: '',
      is_active: document.is_active,
      display_order: document.display_order,
      published_at: new Date().toISOString().split('T')[0]
    });
    setIsEditing(true);
    setIsAddingVersion(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingDocument(null);
    setIsAddingVersion(false);
    setFormData({
      title: '',
      title_en: '',
      description: '',
      description_en: '',
      document_type: 'statuts',
      file_url: '',
      version: '',
      version_number: '1.0',
      is_active: true,
      display_order: 0,
      published_at: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.title_en || !formData.file_url || !formData.version_number) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (isAddingVersion && editingDocument) {
        const newVersion = {
          ...formData,
          parent_document_id: editingDocument.id,
          is_current_version: true
        };

        const { error: insertError } = await supabase
          .from('official_documents')
          .insert([newVersion]);

        if (insertError) throw insertError;

        await supabase.rpc('set_current_document_version', {
          doc_id: editingDocument.id
        });

        toast.success('Nouvelle version ajoutée avec succès');
      } else if (editingDocument) {
        const { error } = await supabase
          .from('official_documents')
          .update(formData)
          .eq('id', editingDocument.id);

        if (error) throw error;
        toast.success('Document mis à jour avec succès');
      } else {
        const { error } = await supabase
          .from('official_documents')
          .insert([{ ...formData, is_current_version: true }]);

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

  const setCurrentVersion = async (versionId: string) => {
    try {
      await supabase.rpc('set_current_document_version', {
        doc_id: versionId
      });

      toast.success('Version définie comme version actuelle');
      if (showVersions) {
        fetchDocumentVersions(showVersions);
      }
      fetchDocuments();
    } catch (error: any) {
      console.error('Error setting current version:', error);
      toast.error(error.message || 'Erreur lors de la définition de la version actuelle');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Seuls les fichiers PDF sont acceptés');
      return;
    }

    if (file.size > 52428800) {
      toast.error('Le fichier est trop volumineux (max 50MB)');
      return;
    }

    try {
      setUploading(true);
      const fileExt = 'pdf';
      const timestamp = Date.now();
      const fileName = `${formData.document_type}-${timestamp}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('official-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('official-documents')
        .getPublicUrl(filePath);

      setFormData({ ...formData, file_url: publicUrl });
      toast.success('Fichier téléchargé avec succès');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Erreur lors du téléchargement du fichier');
    } finally {
      setUploading(false);
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Instructions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Utilisez le bouton "Sélectionner le fichier PDF" pour télécharger votre document</li>
            <li>Les documents sont protégés contre le téléchargement côté utilisateur</li>
            <li>Seuls les documents actifs sont visibles sur la page À propos</li>
            <li>Taille maximale: 50MB - Format: PDF uniquement</li>
          </ul>
        </div>
      </div>

      {isEditing ? (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {isAddingVersion
                ? `Ajouter une nouvelle version - ${editingDocument?.title}`
                : editingDocument
                ? 'Modifier le Document'
                : 'Nouveau Document'}
            </h2>
            <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          {isAddingVersion && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Ajout d'une nouvelle version:</strong> Les titres et descriptions seront copiés du document original.
                Vous devez fournir un nouveau fichier PDF et un numéro de version unique.
              </p>
            </div>
          )}

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
                  Numéro de Version *
                </label>
                <input
                  type="text"
                  value={formData.version_number}
                  onChange={(e) => setFormData({ ...formData, version_number: e.target.value })}
                  className="input"
                  placeholder="2.0, 2026, v3.0..."
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {isAddingVersion ? 'Numéro de la nouvelle version' : 'Identifiant unique de la version'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de publication
                </label>
                <input
                  type="date"
                  value={formData.published_at}
                  onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version (description)
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
                  Fichier PDF *
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="btn-secondary flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Téléchargement...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Sélectionner le fichier PDF
                        </>
                      )}
                    </button>
                    {formData.file_url && (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Fichier sélectionné
                      </span>
                    )}
                  </div>
                  {formData.file_url && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">URL du fichier:</p>
                      <p className="text-sm text-gray-900 break-all">{formData.file_url}</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    Téléchargez votre fichier PDF (max 50MB). L'URL sera générée automatiquement.
                  </p>
                </div>
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
              <div key={doc.id} className="space-y-4">
                <div className="card p-6">
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
                          {doc.is_current_version && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Version actuelle
                            </span>
                          )}
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
                          <span className="font-medium">Version: {doc.version_number}</span>
                          {doc.version && <span>{doc.version}</span>}
                          <span>Ordre: {doc.display_order}</span>
                          {doc.published_at && (
                            <span>Publié: {new Date(doc.published_at).toLocaleDateString('fr-FR')}</span>
                          )}
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

                        <div className="flex items-center gap-2 mt-4">
                          <button
                            onClick={() => fetchDocumentVersions(doc.id)}
                            className="btn-secondary text-sm flex items-center gap-2"
                          >
                            <History className="w-4 h-4" />
                            Voir les versions
                          </button>
                          <button
                            onClick={() => handleAddVersion(doc)}
                            className="btn-secondary text-sm flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Ajouter une version
                          </button>
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

                {showVersions === doc.id && selectedDocumentVersions.length > 0 && (
                  <div className="card p-6 bg-gray-50 ml-12">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <History className="w-5 h-5" />
                        Historique des versions
                      </h4>
                      <button
                        onClick={() => setShowVersions(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {selectedDocumentVersions.map((version) => (
                        <div
                          key={version.id}
                          className={`p-4 rounded-lg border-2 ${
                            version.is_current_version
                              ? 'bg-white border-green-500'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-semibold">Version {version.version_number}</span>
                                {version.is_current_version && (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Actuelle
                                  </span>
                                )}
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(version.published_at).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              <a
                                href={version.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary-600 hover:text-primary-700"
                              >
                                {version.file_url}
                              </a>
                            </div>

                            {!version.is_current_version && (
                              <button
                                onClick={() => setCurrentVersion(version.id)}
                                className="btn-primary text-sm"
                              >
                                Définir comme actuelle
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
