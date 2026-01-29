import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileText, Download, Book, Shield, Eye, Image, File } from 'lucide-react';
import PDFViewer from '../components/resources/PDFViewer';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

interface FileCategory {
  id: string;
  name: string;
  description: string;
}

interface StaticFile {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size: number;
  category_id: string;
  original_filename: string;
}

interface GroupedFiles {
  category: FileCategory;
  files: StaticFile[];
}

const ResourcesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedPDF, setSelectedPDF] = useState<string | null>(null);
  const [resources, setResources] = useState<GroupedFiles[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const { data: categories, error: catError } = await supabase
        .from('file_categories')
        .select('*')
        .order('name');

      if (catError) throw catError;

      const { data: files, error: filesError } = await supabase
        .from('static_files')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (filesError) throw filesError;

      const grouped = categories?.map(category => ({
        category,
        files: files?.filter(file => file.category_id === category.id) || []
      })).filter(group => group.files.length > 0) || [];

      setResources(grouped);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewPDF = (url: string) => {
    setSelectedPDF(url);
  };

  const handleDownloadPDF = async (url: string, title: string, fileId: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      await supabase.rpc('increment_download_count', { file_id: fileId });

      toast.success(t('resources.download_started') || 'Téléchargement démarré');
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image size={24} />;
    if (fileType === 'application/pdf') return <FileText size={24} />;
    return <File size={24} />;
  };

  const isPDF = (fileType: string) => fileType === 'application/pdf';

  return (
    <div className="pt-20">
      {selectedPDF && (
        <PDFViewer url={selectedPDF} onClose={() => setSelectedPDF(null)} />
      )}

      {/* Hero Section */}
      <section className="bg-primary-700 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">{t('resources.title')}</h1>
            <p className="text-xl">
              {t('resources.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-white border-b overflow-x-auto">
        <div className="container-custom py-8">
          <div className="flex flex-nowrap md:grid md:grid-cols-4 gap-4">
            {[
              t('resources.categories.official'), 
              t('resources.categories.guides'), 
              t('resources.categories.reports'), 
              t('resources.categories.forms')
            ].map((link, index) => (
              <button
                key={index}
                className="px-6 py-3 text-center rounded-lg hover:bg-primary-50 text-primary-600 font-medium transition-colors whitespace-nowrap flex-shrink-0"
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{t('common.loading')}</p>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">{t('resources.no_resources') || 'Aucune ressource disponible pour le moment'}</p>
            </div>
          ) : (
            <div className="space-y-12">
              {resources.map((group, index) => (
                <div key={group.category.id}>
                  <h2 className="text-2xl font-bold mb-2">{group.category.name}</h2>
                  <p className="text-gray-600 mb-6">{group.category.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.files.map((file) => (
                      <motion.div
                        key={file.id}
                        className="card p-6"
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-start">
                          <div className="bg-primary-100 p-3 rounded-lg flex-shrink-0">
                            <div className="text-primary-600">
                              {getFileIcon(file.file_type)}
                            </div>
                          </div>
                          <div className="ml-4 flex-grow">
                            <h3 className="font-bold mb-2 card-title">{file.title || file.original_filename}</h3>
                            {file.description && (
                              <p className="text-sm text-gray-600 mb-4 card-description">{file.description}</p>
                            )}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <span className="text-sm text-gray-500">
                                {file.file_type.split('/')[1].toUpperCase()} • {formatFileSize(file.file_size || 0)}
                              </span>
                              <div className="flex space-x-2">
                                {isPDF(file.file_type) && (
                                  <button
                                    onClick={() => handleViewPDF(file.file_url)}
                                    className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
                                  >
                                    <Eye size={16} className="mr-1" />
                                    {t('resources.actions.view') || 'Voir'}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDownloadPDF(file.file_url, file.original_filename, file.id)}
                                  className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
                                >
                                  <Download size={16} className="mr-1" />
                                  {t('resources.actions.download') || 'Télécharger'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Additional Resources */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('resources.other.title')}</h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              className="card p-6 text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Book className="text-primary-600" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 card-title">{t('resources.other.media')}</h3>
              <p className="text-gray-600 mb-4 card-description">
                {t('resources.other.media_desc')}
              </p>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                {t('resources.other.access')}
              </button>
            </motion.div>

            <motion.div
              className="card p-6 text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="text-primary-600" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 card-title">{t('resources.other.branding')}</h3>
              <p className="text-gray-600 mb-4 card-description">
                {t('resources.other.branding_desc')}
              </p>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                {t('resources.other.download')}
              </button>
            </motion.div>

            <motion.div
              className="card p-6 text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-primary-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="text-primary-600" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 card-title">{t('resources.other.forms')}</h3>
              <p className="text-gray-600 mb-4 card-description">
                {t('resources.other.forms_desc')}
              </p>
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                {t('resources.other.viewAll')}
              </button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResourcesPage;