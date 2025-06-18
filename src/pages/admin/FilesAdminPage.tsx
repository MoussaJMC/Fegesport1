import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import FileManager from '../../components/admin/FileManager';
import FileUploadModal from '../../components/admin/FileUploadModal';

interface FileCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const FilesAdminPage: React.FC = () => {
  const [categories, setCategories] = useState<FileCategory[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchCategories();
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

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setShowUploadModal(false);
  };

  return (
    <div>
      <FileManager key={refreshKey} />
      
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
        categories={categories}
      />
    </div>
  );
};

export default FilesAdminPage;