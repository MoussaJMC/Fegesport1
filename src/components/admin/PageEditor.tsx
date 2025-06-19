import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Save, X, Plus, Trash2, ArrowUp, ArrowDown, Layout, Type, Image, BarChart3, Star, Users, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface Page {
  id: string;
  slug: string;
  title: string;
  meta_description?: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

interface PageSection {
  id: string;
  page_id: string;
  section_key: string;
  section_type: 'hero' | 'text' | 'image' | 'gallery' | 'stats' | 'features' | 'testimonials' | 'cta';
  title?: string;
  content?: string;
  image_url?: string;
  settings: any;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PageEditorProps {
  page: Page;
  onSave: () => void;
  onCancel: () => void;
}

const PageEditor: React.FC<PageEditorProps> = ({ page, onSave, onCancel }) => {
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageForm, setPageForm] = useState({
    title: page.title,
    slug: page.slug,
    meta_description: page.meta_description || '',
    status: page.status
  });
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [sectionForm, setSectionForm] = useState<{
    section_key: string;
    section_type: PageSection['section_type'];
    title: string;
    content: string;
    image_url: string;
    settings: any;
    is_active: boolean;
  }>({
    section_key: '',
    section_type: 'text',
    title: '',
    content: '',
    image_url: '',
    settings: {},
    is_active: true
  });

  useEffect(() => {
    fetchSections();
  }, [page.id]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', page.id)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Erreur lors du chargement des sections');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePage = async () => {
    try {
      const { error } = await supabase
        .from('pages')
        .update(pageForm)
        .eq('id', page.id);

      if (error) throw error;
      toast.success('Page mise à jour avec succès');
      onSave();
    } catch (error: any) {
      console.error('Error saving page:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleSaveSection = async () => {
    try {
      const sectionData = {
        ...sectionForm,
        page_id: page.id,
        sort_order: editingSection ? editingSection.sort_order : sections.length + 1
      };

      if (editingSection) {
        // Update existing section
        const { error } = await supabase
          .from('page_sections')
          .update(sectionData)
          .eq('id', editingSection.id);

        if (error) throw error;
        toast.success('Section mise à jour avec succès');
      } else {
        // Create new section
        const { error } = await supabase
          .from('page_sections')
          .insert([sectionData]);

        if (error) throw error;
        toast.success('Section créée avec succès');
      }
      
      setShowSectionForm(false);
      setEditingSection(null);
      fetchSections();
    } catch (error: any) {
      console.error('Error saving section:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) return;

    try {
      const { error } = await supabase
        .from('page_sections')
        .delete()
        .eq('id', sectionId);

      if (error) throw error;
      toast.success('Section supprimée avec succès');
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleMoveSectionUp = async (section: PageSection) => {
    const currentIndex = sections.findIndex(s => s.id === section.id);
    if (currentIndex <= 0) return;

    const previousSection = sections[currentIndex - 1];
    
    try {
      await Promise.all([
        supabase.from('page_sections').update({ sort_order: previousSection.sort_order }).eq('id', section.id),
        supabase.from('page_sections').update({ sort_order: section.sort_order }).eq('id', previousSection.id)
      ]);

      fetchSections();
    } catch (error) {
      console.error('Error moving section:', error);
      toast.error('Erreur lors du déplacement');
    }
  };

  const handleMoveSectionDown = async (section: PageSection) => {
    const currentIndex = sections.findIndex(s => s.id === section.id);
    if (currentIndex >= sections.length - 1) return;

    const nextSection = sections[currentIndex + 1];
    
    try {
      await Promise.all([
        supabase.from('page_sections').update({ sort_order: nextSection.sort_order }).eq('id', section.id),
        supabase.from('page_sections').update({ sort_order: section.sort_order }).eq('id', nextSection.id)
      ]);

      fetchSections();
    } catch (error) {
      console.error('Error moving section:', error);
      toast.error('Erreur lors du déplacement');
    }
  };

  const toggleSectionActive = async (section: PageSection) => {
    try {
      const { error } = await supabase
        .from('page_sections')
        .update({ is_active: !section.is_active })
        .eq('id', section.id);

      if (error) throw error;
      toast.success(`Section ${!section.is_active ? 'activée' : 'désactivée'}`);
      fetchSections();
    } catch (error) {
      console.error('Error toggling section:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'hero': return <Layout className="w-4 h-4" />;
      case 'text': return <Type className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'stats': return <BarChart3 className="w-4 h-4" />;
      case 'features': return <Star className="w-4 h-4" />;
      case 'testimonials': return <MessageSquare className="w-4 h-4" />;
      case 'cta': return <Users className="w-4 h-4" />;
      default: return <Layout className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Informations de la Page</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={pageForm.title}
              onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug (URL)
            </label>
            <input
              type="text"
              value={pageForm.slug}
              onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meta Description
          </label>
          <textarea
            value={pageForm.meta_description}
            onChange={(e) => setPageForm({ ...pageForm, meta_description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            value={pageForm.status}
            onChange={(e) => setPageForm({ ...pageForm, status: e.target.value as Page['status'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
            <option value="archived">Archivé</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSavePage}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Save className="w-4 h-4 mr-2 inline" />
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sections de Contenu</h2>
          <button
            onClick={() => {
              setSectionForm({
                section_key: '',
                section_type: 'text',
                title: '',
                content: '',
                image_url: '',
                settings: {},
                is_active: true
              });
              setEditingSection(null);
              setShowSectionForm(true);
            }}
            className="btn bg-primary-600 hover:bg-primary-700 text-white text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Ajouter Section
          </button>
        </div>

        <div className="p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : sections.length > 0 ? (
            sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`border rounded-lg p-4 ${section.is_active ? 'border-gray-200' : 'border-gray-100 bg-gray-50'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getSectionIcon(section.section_type)}
                      <span className="font-medium">{section.title || section.section_key}</span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {section.section_type}
                    </span>
                    {!section.is_active && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                        Inactif
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleMoveSectionUp(section)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveSectionDown(section)}
                      disabled={index === sections.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleSectionActive(section)}
                      className={`p-1 ${section.is_active ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                      title={section.is_active ? 'Désactiver' : 'Activer'}
                    >
                      {section.is_active ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18.6 18H5.4A2.4 2.4 0 0 1 3 15.6V8.4A2.4 2.4 0 0 1 5.4 6h13.2A2.4 2.4 0 0 1 21 8.4v7.2a2.4 2.4 0 0 1-2.4 2.4Z" />
                          <path d="M15 10v4" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18.6 18H5.4A2.4 2.4 0 0 1 3 15.6V8.4A2.4 2.4 0 0 1 5.4 6h13.2A2.4 2.4 0 0 1 21 8.4v7.2a2.4 2.4 0 0 1-2.4 2.4Z" />
                          <path d="M9 10v4" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSectionForm({
                          section_key: section.section_key,
                          section_type: section.section_type,
                          title: section.title || '',
                          content: section.content || '',
                          image_url: section.image_url || '',
                          settings: section.settings || {},
                          is_active: section.is_active
                        });
                        setEditingSection(section);
                        setShowSectionForm(true);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  {section.content && (
                    <p className="line-clamp-2">{section.content}</p>
                  )}
                  {section.image_url && (
                    <div className="mt-2">
                      <img 
                        src={section.image_url} 
                        alt={section.title}
                        className="h-20 w-32 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Layout className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Aucune section pour cette page</p>
              <p className="text-sm">Ajoutez votre première section pour commencer</p>
            </div>
          )}
        </div>
      </div>

      {/* Section Form Modal */}
      {showSectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {editingSection ? 'Modifier la section' : 'Nouvelle section'}
                </h3>
                <button
                  onClick={() => setShowSectionForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Clé de section
                    </label>
                    <input
                      type="text"
                      value={sectionForm.section_key}
                      onChange={(e) => setSectionForm({ ...sectionForm, section_key: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="ex: hero, about, contact"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de section
                    </label>
                    <select
                      value={sectionForm.section_type}
                      onChange={(e) => setSectionForm({ ...sectionForm, section_type: e.target.value as PageSection['section_type'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="hero">Hero</option>
                      <option value="text">Texte</option>
                      <option value="image">Image</option>
                      <option value="gallery">Galerie</option>
                      <option value="stats">Statistiques</option>
                      <option value="features">Fonctionnalités</option>
                      <option value="testimonials">Témoignages</option>
                      <option value="cta">Call to Action</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={sectionForm.title}
                    onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contenu
                  </label>
                  <textarea
                    value={sectionForm.content}
                    onChange={(e) => setSectionForm({ ...sectionForm, content: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de l'image
                  </label>
                  <input
                    type="url"
                    value={sectionForm.image_url}
                    onChange={(e) => setSectionForm({ ...sectionForm, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={sectionForm.is_active}
                    onChange={(e) => setSectionForm({ ...sectionForm, is_active: e.target.checked })}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                    Section active
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowSectionForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveSection}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  <Save className="w-4 h-4 mr-2 inline" />
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageEditor;