import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Eye, EyeOff, Trash2, CheckCircle, AlertCircle, FileText, Loader } from 'lucide-react';
import { toast } from 'sonner';

interface OfficialDocument {
  id: string;
  label_fr: string;
  label_en: string | null;
  description: string | null;
  icon: string;
  lang: string;
  group_name: string | null;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  is_published: boolean;
  sort_order: number;
  uploaded_at: string | null;
  created_at: string;
}

export default function DocumentsAdminPage() {
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    checkUserEmail();
    fetchDocuments();

    const channel = supabase
      .channel('admin-docs-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'official_documents'
      }, () => {
        fetchDocuments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkUserEmail = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      setUserEmail(user.email);
      console.log('Connected as:', user.email);

      const adminEmails = [
        'aamadoubah2002@gmail.com',
        'admin@fegesport.org',
        'admin@fegesport224.org',
        'president@fegesport224.org'
      ];

      if (!adminEmails.includes(user.email)) {
        toast.error(`ATTENTION: Votre email (${user.email}) n'est PAS dans la liste des admins autorisés !`);
        console.error('Email not in admin list:', user.email);
      }
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('official_documents')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching documents:', error);
        toast.error(`Erreur: ${error.message}`);
        throw error;
      }

      console.log('Documents loaded:', data?.length || 0);
      setDocuments(data || []);

      if (!data || data.length === 0) {
        toast.error('Aucun document trouvé dans la base de données');
      }
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      toast.error(error.message || 'Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, doc: OfficialDocument) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Seuls les fichiers PDF sont acceptés.');
      return;
    }

    if (file.size > 20971520) {
      alert('Le fichier est trop volumineux (max 20MB)');
      return;
    }

    setUploadingId(doc.id);
    console.log('Starting upload for:', doc.id, 'file:', file.name);

    try {
      // 1. Upload file to Supabase Storage
      const filePath = `${doc.id}/${file.name}`;
      const { error: uploadError } = await supabase
        .storage
        .from('official-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true  // overwrite if exists
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // 2. Get public URL
      const { data: urlData } = supabase
        .storage
        .from('official-documents')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      console.log('File uploaded, public URL:', publicUrl);

      // 3. Update database row
      const { data: updateData, error: dbError } = await supabase
        .from('official_documents')
        .update({
          file_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
          uploaded_at: new Date().toISOString()
        })
        .eq('id', doc.id)
        .select();

      if (dbError) {
        console.error('Database update error:', dbError);
        throw new Error(`Erreur RLS: ${dbError.message}`);
      }

      if (!updateData || updateData.length === 0) {
        console.error('No data returned from update');
        throw new Error('La mise à jour a échoué - vérifiez vos permissions admin');
      }

      console.log('Database updated successfully:', updateData);

      // 4. Refresh local state immediately
      setDocuments(prev => prev.map(d =>
        d.id === doc.id
          ? {
              ...d,
              file_url: publicUrl,
              file_name: file.name,
              file_size: file.size,
              uploaded_at: new Date().toISOString()
            }
          : d
      ));

      alert(`✅ "${file.name}" uploadé avec succès !`);
      toast.success('Document uploadé et enregistré avec succès');

      // Reload from database to ensure sync
      await fetchDocuments();

    } catch (err: any) {
      console.error('Upload error:', err);
      alert(`❌ Erreur : ${err.message}`);
      toast.error(err.message || 'Erreur lors de l\'upload du fichier');
    } finally {
      setUploadingId(null);
      // Reset input so same file can be re-uploaded
      event.target.value = '';
    }
  };

  const handleTogglePublish = async (doc: OfficialDocument) => {
    if (!doc.file_url) {
      alert('Uploadez d\'abord le fichier PDF.');
      toast.error('Veuillez d\'abord uploader le fichier');
      return;
    }

    setPublishingId(doc.id);
    console.log('Toggling publish for:', doc.id, 'current state:', doc.is_published);

    try {
      const newValue = !doc.is_published;
      const { data, error } = await supabase
        .from('official_documents')
        .update({ is_published: newValue })
        .eq('id', doc.id)
        .select();

      if (error) {
        console.error('Publish error:', error);
        throw new Error(`Erreur RLS: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.error('No data returned from publish update');
        throw new Error('La mise à jour a échoué - vérifiez vos permissions admin');
      }

      console.log('Publish status updated successfully:', data);

      // Update local state immediately
      setDocuments(prev => prev.map(d =>
        d.id === doc.id
          ? { ...d, is_published: newValue }
          : d
      ));

      const message = newValue
        ? `✅ Document publié sur le site !`
        : `⚠️ Document dépublié.`;

      alert(message);
      toast.success(newValue ? 'Document publié sur le site' : 'Document retiré du site');

      // Reload from database
      await fetchDocuments();

    } catch (err: any) {
      console.error('Error toggling publish:', err);
      alert(`❌ Erreur : ${err.message}`);
      toast.error(err.message || 'Erreur lors de la modification');
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (doc: OfficialDocument) => {
    if (!confirm('Supprimer ce fichier ? Cette action est irréversible.')) return;

    try {
      if (doc.file_url) {
        const urlParts = doc.file_url.split('/official-documents/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage
            .from('official-documents')
            .remove([filePath]);
        }
      }

      const { data, error } = await supabase
        .from('official_documents')
        .update({
          file_url: null,
          file_name: null,
          file_size: null,
          is_published: false,
          uploaded_at: null
        })
        .eq('id', doc.id)
        .select();

      if (error) {
        console.error('Delete error:', error);
        throw new Error(`Erreur RLS: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('La suppression a échoué - vérifiez vos permissions admin');
      }

      toast.success('Fichier supprimé');
      await fetchDocuments();
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const getStatus = (doc: OfficialDocument) => {
    if (!doc.file_url) {
      return { label: 'Manquant', color: '#C0392B', bgColor: '#FEE', icon: AlertCircle };
    }
    if (!doc.is_published) {
      return { label: 'En attente', color: '#E67E22', bgColor: '#FFE8D4', icon: AlertCircle };
    }
    return { label: 'Publié', color: '#1E7145', bgColor: '#D4EDDA', icon: CheckCircle };
  };

  const getStatusBadge = (doc: OfficialDocument) => {
    const status = getStatus(doc);
    const StatusIcon = status.icon;

    return (
      <span
        className="px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 inline-flex"
        style={{
          backgroundColor: status.bgColor,
          color: status.color
        }}
      >
        <StatusIcon className="w-3.5 h-3.5" />
        {status.label}
      </span>
    );
  };

  const renderLanguageBadge = (lang: string) => {
    if (lang === "FR/EN") {
      return (
        <div className="inline-flex gap-0.5">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-l-full bg-[#C0392B] text-white">
            FR
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-r-full bg-[#2E75B6] text-white">
            EN
          </span>
        </div>
      );
    }

    const bgColor = lang === "FR" ? "#C0392B" : "#2E75B6";
    return (
      <span
        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
        style={{ backgroundColor: bgColor }}
      >
        {lang}
      </span>
    );
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const publishedCount = documents.filter(d => d.is_published && d.file_url).length;
  const totalCount = documents.length;

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
            Gérer les documents publiés sur le site
          </p>
          {userEmail && (
            <p className="text-sm text-gray-500 mt-1">
              Connecté en tant que: <span className="font-mono font-semibold">{userEmail}</span>
            </p>
          )}
        </div>
      </div>

      {publishedCount === 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-yellow-900 mb-2">
                Aucun document uploadé pour le moment
              </h3>
              <p className="text-yellow-800 mb-4">
                Pour ajouter des documents officiels au site, utilisez les boutons <strong className="text-[#C0392B]">"UPLOAD PDF"</strong> rouge dans le tableau ci-dessous.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
                <li>Cliquez sur le bouton <strong className="text-[#C0392B]">"UPLOAD PDF"</strong> rouge pour un document</li>
                <li>Sélectionnez un fichier PDF sur votre ordinateur (max 20MB)</li>
                <li>Une fois uploadé, cliquez sur le bouton <strong className="text-green-600">"Publier"</strong> vert</li>
                <li>Le document apparaîtra instantanément sur la page "À propos" du site</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-2 border-[#C0392B] rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {publishedCount} / {totalCount} documents publiés
          </h3>
          <span className="text-sm text-gray-600">
            {Math.round((publishedCount / totalCount) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-[#C0392B] transition-all duration-300"
            style={{ width: `${(publishedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Instructions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Uploadez un fichier PDF (max 20MB) pour chaque document</li>
            <li>Cliquez sur "Publier" pour rendre le document visible sur le site</li>
            <li>Les documents publiés s'affichent instantanément sur la page À propos</li>
            <li>La suppression retire le fichier de manière permanente</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 overflow-hidden">
        {documents.length === 0 && !loading && (
          <div className="p-8 text-center bg-red-50 border-b-2 border-red-200">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-900 mb-2">
              ERREUR : Aucun document chargé depuis la base de données
            </h3>
            <p className="text-red-800 mb-4">
              Les données existent dans la base mais ne peuvent pas être récupérées.
              Vérifiez la console du navigateur (F12) pour plus de détails.
            </p>
            <div className="text-left bg-white p-4 rounded border border-red-300 max-w-2xl mx-auto">
              <p className="text-sm text-gray-700 mb-2 font-semibold">Diagnostic :</p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Vérifiez que vous êtes bien connecté en tant qu'admin</li>
                <li>Ouvrez la console (F12) et cherchez les erreurs RLS</li>
                <li>Votre email admin doit être dans la liste autorisée</li>
              </ul>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Langue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fichier
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc, index) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{doc.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.label_fr}</div>
                        <div className="text-xs text-gray-500">{doc.group_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderLanguageBadge(doc.lang)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(doc)}
                  </td>
                  <td className="px-6 py-4">
                    {doc.file_url ? (
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-green-600 font-medium">
                          <CheckCircle className="w-4 h-4" />
                          {doc.file_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatFileSize(doc.file_size)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Aucun fichier</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {/* Hidden file input with ref */}
                      <input
                        type="file"
                        accept="application/pdf"
                        style={{ display: 'none' }}
                        ref={(el) => { fileInputRefs.current[doc.id] = el; }}
                        onChange={(e) => handleFileUpload(e, doc)}
                      />

                      {/* Upload button */}
                      <button
                        onClick={() => {
                          const input = fileInputRefs.current[doc.id];
                          if (input) input.click();
                        }}
                        disabled={uploadingId === doc.id}
                        style={{
                          background: uploadingId === doc.id ? '#888' : '#2E75B6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 14px',
                          cursor: uploadingId === doc.id ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          opacity: uploadingId === doc.id ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        title="Cliquez pour uploader un fichier PDF"
                      >
                        {uploadingId === doc.id ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Upload en cours...
                          </>
                        ) : (
                          <>
                            📤 UPLOAD PDF
                          </>
                        )}
                      </button>

                      {/* Publish button */}
                      <button
                        onClick={() => handleTogglePublish(doc)}
                        disabled={!doc.file_url || publishingId === doc.id}
                        style={{
                          background: doc.is_published ? '#888' : '#1E7145',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 14px',
                          cursor: doc.file_url && publishingId !== doc.id ? 'pointer' : 'not-allowed',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          opacity: (!doc.file_url || publishingId === doc.id) ? 0.5 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        title={doc.is_published ? 'Retirer du site' : 'Publier sur le site'}
                      >
                        {publishingId === doc.id ? (
                          '...'
                        ) : doc.is_published ? (
                          '👁️ Dépublier'
                        ) : (
                          '🌐 Publier'
                        )}
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(doc)}
                        disabled={!doc.file_url}
                        style={{
                          background: '#C0392B',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          cursor: doc.file_url ? 'pointer' : 'not-allowed',
                          opacity: doc.file_url ? 1 : 0.3,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Supprimer définitivement le fichier"
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
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-semibold mb-2">Workflow de publication:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Uploadez le fichier PDF (max 20MB) via le bouton "Upload"</li>
              <li>Le statut passe de "Manquant" à "En attente"</li>
              <li>Cliquez sur "Publier" pour rendre le document visible publiquement</li>
              <li>Le document apparaît instantanément sur la page À propos</li>
              <li>Utilisez "Dépublier" pour retirer temporairement le document sans le supprimer</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
