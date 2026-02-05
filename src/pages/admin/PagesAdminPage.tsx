import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter, Globe, Save, X, ArrowUp, ArrowDown, Image, Type, Layout, BarChart3, Star, Users, MessageSquare, Menu as MenuIcon, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageEditor from '../../components/admin/PageEditor';

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

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: 'logo' | 'menu' | 'metadata' | 'theme' | 'contact';
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

const PagesAdminPage = React.memo(() => {
  const [pages, setPages] = useState<Page[]>([]);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [showPageForm, setShowPageForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'pages' | 'settings'>('pages');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showPageEditor, setShowPageEditor] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Form states
  const [pageForm, setPageForm] = useState<{
    slug: string;
    title: string;
    meta_description: string;
    status: Page['status'];
  }>({
    slug: '',
    title: '',
    meta_description: '',
    status: 'draft'
  });

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

  const [logoSettings, setLogoSettings] = useState({
    main_logo: '',
    alt_text: '',
    width: 48,
    height: 48,
    link: '/'
  });

  const [menuSettings, setMenuSettings] = useState({
    brand_text: '',
    items: [] as any[]
  });

  useEffect(() => {
    if (!hasInitialized) {
      fetchPages();
      fetchSiteSettings();
      setHasInitialized(true);
    }
  }, [hasInitialized]);

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

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('setting_type', { ascending: true });

      if (error) throw error;
      setSiteSettings(data || []);

      // Initialize form states with current settings
      const logoSetting = data?.find(s => s.setting_key === 'site_logo');
      if (logoSetting) {
        setLogoSettings(logoSetting.setting_value);
      }

      const menuSetting = data?.find(s => s.setting_key === 'main_navigation');
      if (menuSetting) {
        setMenuSettings(menuSetting.setting_value);
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
      toast.error('Erreur lors du chargement des paramètres');
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

  const handleSaveSettings = async () => {
    try {
      // Update logo settings
      const { error: logoError } = await supabase
        .from('site_settings')
        .update({ setting_value: logoSettings })
        .eq('setting_key', 'site_logo');

      if (logoError) throw logoError;

      // Update menu settings
      const { error: menuError } = await supabase
        .from('site_settings')
        .update({ setting_value: menuSettings })
        .eq('setting_key', 'main_navigation');

      if (menuError) throw menuError;

      toast.success('Paramètres sauvegardés avec succès');
      setShowSettingsForm(false);
      fetchSiteSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Erreur lors de la sauvegarde des paramètres');
    }
  };

  const handleArchivePage = async (pageId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'archived' ? 'draft' : 'archived';

    try {
      const { error } = await supabase
        .from('pages')
        .update({ status: newStatus })
        .eq('id', pageId);

      if (error) throw error;
      toast.success(`Page ${newStatus === 'archived' ? 'archivée' : 'restaurée'} avec succès`);
      fetchPages();
    } catch (error) {
      console.error('Error archiving page:', error);
      toast.error('Erreur lors de l\'opération');
    }
  };

  const handleToggleSection = async (sectionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('page_sections')
        .update({ is_active: !currentStatus })
        .eq('id', sectionId);

      if (error) throw error;
      toast.success(`Section ${!currentStatus ? 'activée' : 'désactivée'} avec succès`);
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

  const addMenuItem = () => {
    const newItem = {
      label: '',
      path: '',
      order: menuSettings.items.length + 1
    };
    setMenuSettings({
      ...menuSettings,
      items: [...menuSettings.items, newItem]
    });
  };

  const removeMenuItem = (index: number) => {
    const newItems = menuSettings.items.filter((_, i) => i !== index);
    setMenuSettings({
      ...menuSettings,
      items: newItems
    });
  };

  const updateMenuItem = (index: number, field: string, value: string) => {
    const newItems = [...menuSettings.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setMenuSettings({
      ...menuSettings,
      items: newItems
    });
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Pages & Paramètres</h1>
          <p className="text-gray-600">Gérer le contenu des pages et les paramètres du site</p>
        </div>
        <div className="flex space-x-2">
          {activeTab === 'pages' && (
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
          )}
          {activeTab === 'settings' && (
            <button
              onClick={() => setShowSettingsForm(true)}
              className="btn bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Modifier Paramètres
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pages')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pages'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Globe className="w-4 h-4 mr-2 inline" />
            Pages
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Settings className="w-4 h-4 mr-2 inline" />
            Menu & Logo
          </button>
        </nav>
      </div>

      {/* Pages Tab Content */}
      {activeTab === 'pages' && (
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
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchivePage(page.id, page.status);
                          }}
                          className={`${page.status === 'archived' ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'}`}
                          title={page.status === 'archived' ? 'Restaurer' : 'Archiver'}
                        >
                          {page.status === 'archived' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
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
                    <p className="text-sm text-gray-500">/{selectedPage.slug}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        window.open(`/${selectedPage.slug}`, '_blank');
                      }}
                      className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </button>
                    <button
                      onClick={() => {
                        setShowPageEditor(true);
                      }}
                      className="btn bg-primary-600 hover:bg-primary-700 text-white text-sm"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Éditer
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  {showPageEditor ? (
                    <PageEditor 
                      page={selectedPage} 
                      onSave={() => {
                        setShowPageEditor(false);
                        fetchPages();
                        if (selectedPage) {
                          fetchSections(selectedPage.id);
                        }
                      }}
                      onCancel={() => setShowPageEditor(false)}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Informations</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Statut:</span> 
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedPage.status)}`}>
                              {selectedPage.status}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Dernière mise à jour:</span> {new Date(selectedPage.updated_at).toLocaleDateString()}
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Meta Description:</span> {selectedPage.meta_description || 'Non définie'}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Sections ({sections.length})</h3>
                        {sections.length > 0 ? (
                          <div className="space-y-2">
                            {sections.map((section) => (
                              <div 
                                key={section.id}
                                className={`p-3 border rounded-lg ${!section.is_active ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    {getSectionIcon(section.section_type)}
                                    <span className="ml-2 font-medium">{section.title || section.section_key}</span>
                                    {!section.is_active && (
                                      <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                                        Inactif
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {section.section_type}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Aucune section pour cette page</p>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-center pt-4">
                        <button
                          onClick={() => setShowPageEditor(true)}
                          className="btn bg-primary-600 hover:bg-primary-700 text-white"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Éditer cette page
                        </button>
                      </div>
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
      )}

      {/* Settings Tab Content */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Logo Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center">
                <Image className="w-5 h-5 mr-2" />
                Configuration du Logo
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL du Logo
                </label>
                <input
                  type="url"
                  value={logoSettings.main_logo}
                  onChange={(e) => setLogoSettings({ ...logoSettings, main_logo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texte alternatif
                </label>
                <input
                  type="text"
                  value={logoSettings.alt_text}
                  onChange={(e) => setLogoSettings({ ...logoSettings, alt_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Description du logo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Largeur (px)
                  </label>
                  <input
                    type="number"
                    value={logoSettings.width}
                    onChange={(e) => setLogoSettings({ ...logoSettings, width: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hauteur (px)
                  </label>
                  <input
                    type="number"
                    value={logoSettings.height}
                    onChange={(e) => setLogoSettings({ ...logoSettings, height: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {logoSettings.main_logo && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aperçu
                  </label>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <img
                      src={logoSettings.main_logo}
                      alt={logoSettings.alt_text}
                      style={{ width: logoSettings.width, height: logoSettings.height }}
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveSettings}
                  className="btn bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>

          {/* Menu Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center">
                <MenuIcon className="w-5 h-5 mr-2" />
                Configuration du Menu
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texte de la marque
                </label>
                <input
                  type="text"
                  value={menuSettings.brand_text}
                  onChange={(e) => setMenuSettings({ ...menuSettings, brand_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="FEGESPORT"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Éléments du menu
                  </label>
                  <button
                    onClick={addMenuItem}
                    className="btn bg-primary-600 hover:bg-primary-700 text-white text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </button>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {menuSettings.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => updateMenuItem(index, 'label', e.target.value)}
                          placeholder="Libellé"
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                        />
                        <input
                          type="text"
                          value={item.path}
                          onChange={(e) => updateMenuItem(index, 'path', e.target.value)}
                          placeholder="/chemin"
                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => removeMenuItem(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveSettings}
                  className="btn bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                      onChange={(e) => setPageForm({ ...pageForm, status: e.target.value as Page['status'] })}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Form Modal */}
      <AnimatePresence>
        {showSettingsForm && (
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
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Modifier les Paramètres</h3>
                  <button
                    onClick={() => setShowSettingsForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Logo Settings */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold flex items-center">
                      <Image className="w-4 h-4 mr-2" />
                      Configuration du Logo
                    </h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL du Logo
                      </label>
                      <input
                        type="url"
                        value={logoSettings.main_logo}
                        onChange={(e) => setLogoSettings({ ...logoSettings, main_logo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Texte alternatif
                      </label>
                      <input
                        type="text"
                        value={logoSettings.alt_text}
                        onChange={(e) => setLogoSettings({ ...logoSettings, alt_text: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Largeur (px)
                        </label>
                        <input
                          type="number"
                          value={logoSettings.width}
                          onChange={(e) => setLogoSettings({ ...logoSettings, width: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hauteur (px)
                        </label>
                        <input
                          type="number"
                          value={logoSettings.height}
                          onChange={(e) => setLogoSettings({ ...logoSettings, height: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Menu Settings */}
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold flex items-center">
                      <MenuIcon className="w-4 h-4 mr-2" />
                      Configuration du Menu
                    </h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Texte de la marque
                      </label>
                      <input
                        type="text"
                        value={menuSettings.brand_text}
                        onChange={(e) => setMenuSettings({ ...menuSettings, brand_text: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Éléments du menu
                        </label>
                        <button
                          onClick={addMenuItem}
                          className="btn bg-primary-600 hover:bg-primary-700 text-white text-sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Ajouter
                        </button>
                      </div>

                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {menuSettings.items.map((item, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-3">
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <input
                                type="text"
                                value={item.label}
                                onChange={(e) => updateMenuItem(index, 'label', e.target.value)}
                                placeholder="Libellé"
                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                              />
                              <input
                                type="text"
                                value={item.path}
                                onChange={(e) => updateMenuItem(index, 'path', e.target.value)}
                                placeholder="/chemin"
                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                              />
                            </div>
                            <div className="flex justify-end">
                              <button
                                onClick={() => removeMenuItem(index)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowSettingsForm(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    <Save className="w-4 h-4 mr-2 inline" />
                    Sauvegarder les Paramètres
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default PagesAdminPage;