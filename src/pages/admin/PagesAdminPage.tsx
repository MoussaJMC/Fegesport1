import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, Search, Filter, Globe, Save, X, ArrowUp, ArrowDown, Image, Type, Layout, BarChart3, Star, Users, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const PagesAdminPage = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [showPageForm, setShowPageForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Form states
  const [pageForm, setPageForm] = useState({
    slug: '',
    title: '',
    meta_description: '',
    status: 'draft' as const
  });

  const [sectionForm, setSectionForm] = useState({
    section_key: '',
    section_type: 'text' as const,
    title: '',
    content: '',
    image_url: '',
    settings: {},
    is_active: true
  });

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedPage) {
      fetchSections(selectedPage.id);
    }
  }, [selectedPage]);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Erreur lors du chargement des pages');
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async (pageId: string) => {
    try {
      const { data, error } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', pageId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Erreur lors du chargement des sections');
    }
  };

  const handleSavePage = async () => {
    try {
      if (selectedPage) {
        // Update existing page
        const { error } = await supabase
          .from('pages')
          .update(pageForm)
          .eq('id', selectedPage.id);

        if (error) throw error;
        toast.success('Page mise à jour avec succès');
      } else {
        // Create new page
        const { error } = await supabase
          .from('pages')
          .insert([pageForm]);

        if (error) throw error;
        toast.success('Page créée avec succès');
      }
      
      setShowPageForm(false);
      fetchPages();
    } catch (error: any) {
      console.error('Error saving page:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleSaveSection = async () => {
    try {
      if (!selectedPage) return;

      const sectionData = {
        ...sectionForm,
        page_id: selectedPage.id,
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
      fetchSections(selectedPage.id);
    } catch (error: any) {
      console.error('Error saving section:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return;

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;
      toast.success('Page supprimée avec succès');
      fetchPages();
      if (selectedPage?.id === pageId) {
        setSelectedPage(null);
        setSections([]);
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Erreur lors de la suppression');
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
      if (selectedPage) {
        fetchSections(selectedPage.id);
      }
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

      if (selectedPage) {
        fetchSections(selectedPage.id);
      }
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

      if (selectedPage) {
        fetchSections(selectedPage.id);
      }
    } catch (error) {
      console.error('Error moving section:', error);
      toast.error('Erreur lors du déplacement');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || page.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Pages</h1>
          <p className="text-gray-600">Gérer le contenu des pages du site web</p>
        </div>
        <button
          onClick={() => {
            setPageForm({ slug: '', title: '', meta_description: '', status: 'draft' });
            setSelectedPage(null);
            setShowPageForm(true);
          }}
          className="btn bg-primary-600 hover:bg-primary-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Page
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pages List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 w-full text-sm border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Tous</option>
                  <option value="published">Publié</option>
                  <option value="draft">Brouillon</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredPages.map((page) => (
                <div
                  key={page.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedPage?.id === page.id ? 'bg-primary-50 border-primary-200' : ''
                  }`}
                  onClick={() => setSelectedPage(page)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{page.title}</h3>
                      <p className="text-sm text-gray-500">/{page.slug}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(page.status)}`}>
                        {page.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPageForm({
                            slug: page.slug,
                            title: page.title,
                            meta_description: page.meta_description || '',
                            status: page.status
                          });
                          setSelectedPage(page);
                          setShowPageForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Page Content Editor */}
        <div className="lg:col-span-2">
          {selectedPage ? (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{selectedPage.title}</h2>
                  <p className="text-sm text-gray-500">Sections de contenu</p>
                </div>
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
                {sections.map((section, index) => (
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
                          <Edit className="w-4 h-4" />
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
                ))}

                {sections.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Layout className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>Aucune section pour cette page</p>
                    <p className="text-sm">Ajoutez votre première section pour commencer</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez une page</h3>
              <p className="text-gray-500">Choisissez une page dans la liste pour modifier son contenu</p>
            </div>
          )}
        </div>
      </div>

      {/* Page Form Modal */}
      <AnimatePresence>
        {showPageForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {selectedPage ? 'Modifier la page' : 'Nouvelle page'}
                  </h3>
                  <button
                    onClick={() => setShowPageForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      value={pageForm.meta_description}
                      onChange={(e) => setPageForm({ ...pageForm, meta_description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <select
                      value={pageForm.status}
                      onChange={(e) => setPageForm({ ...pageForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="published">Publié</option>
                      <option value="archived">Archivé</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowPageForm(false)}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Form Modal */}
      <AnimatePresence>
        {showSectionForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
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
                        onChange={(e) => setSectionForm({ ...sectionForm, section_type: e.target.value as any })}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PagesAdminPage;