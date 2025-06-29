import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, Search, Filter, Image, ArrowUp, ArrowDown, Link as LinkIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface SlideImage {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  link?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const SlideshowAdminPage: React.FC = () => {
  const [slides, setSlides] = useState<SlideImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState<SlideImage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('');
  
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    image_url: string;
    link: string;
    is_active: boolean;
  }>({
    title: '',
    description: '',
    image_url: '',
    link: '',
    is_active: true
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('slideshow_images')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching slides:', error);
        // If table doesn't exist or other error, use mock data
        setSlides(getMockSlides());
      } else if (data && data.length > 0) {
        setSlides(data);
      } else {
        // No data found, use mock data
        setSlides(getMockSlides());
      }
    } catch (error) {
      console.error('Error in fetchSlides:', error);
      setSlides(getMockSlides());
    } finally {
      setLoading(false);
    }
  };

  const getMockSlides = (): SlideImage[] => {
    return [
      {
        id: '1',
        title: 'Tournoi National FIFA 25',
        description: 'Les meilleurs joueurs guinéens s\'affrontent pour le titre de champion national',
        image_url: 'https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg',
        sort_order: 1,
        is_active: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: '2',
        title: 'Formation des Arbitres Esport',
        description: 'Programme de certification pour les arbitres officiels de la FEGESPORT',
        image_url: 'https://images.pexels.com/photos/159393/gamepad-video-game-controller-game-controller-controller-159393.jpeg',
        sort_order: 2,
        is_active: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: '3',
        title: 'Championnat PUBG Mobile',
        description: 'Les meilleures équipes guinéennes s\'affrontent dans une compétition intense',
        image_url: 'https://images.pexels.com/photos/7862608/pexels-photo-7862608.jpeg',
        sort_order: 3,
        is_active: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      }
    ];
  };

  const deleteSlide = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      return;
    }

    try {
      // Check if we're using real data or mock data
      const isRealData = slides.length > 0 && slides[0].id !== '1';
      
      if (isRealData) {
        const { error } = await supabase
          .from('slideshow_images')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }
      
      // Update local state regardless
      setSlides(slides.filter(slide => slide.id !== id));
      toast.success('Image supprimée avec succès');
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      // Check if we're using real data or mock data
      const isRealData = slides.length > 0 && slides[0].id !== '1';
      
      if (isRealData) {
        const { error } = await supabase
          .from('slideshow_images')
          .update({ is_active: !currentStatus })
          .eq('id', id);

        if (error) throw error;
      }
      
      // Update local state regardless
      setSlides(slides.map(slide => 
        slide.id === id 
          ? { ...slide, is_active: !currentStatus } 
          : slide
      ));
      
      toast.success(`Image ${!currentStatus ? 'activée' : 'désactivée'} avec succès`);
    } catch (error) {
      console.error('Error updating slide status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Check if we're using real data or mock data
      const isRealData = slides.length > 0 && slides[0].id !== '1';
      
      if (isRealData) {
        if (editingSlide) {
          // Update existing slide
          const { error } = await supabase
            .from('slideshow_images')
            .update({
              title: formData.title,
              description: formData.description || null,
              image_url: formData.image_url,
              link: formData.link || null,
              is_active: formData.is_active
            })
            .eq('id', editingSlide.id);

          if (error) throw error;
        } else {
          // Create new slide
          const maxOrder = Math.max(...slides.map(s => s.sort_order), 0);
          const { error } = await supabase
            .from('slideshow_images')
            .insert([{
              title: formData.title,
              description: formData.description || null,
              image_url: formData.image_url,
              link: formData.link || null,
              sort_order: maxOrder + 1,
              is_active: formData.is_active
            }]);

          if (error) throw error;
        }
      } else {
        // Using mock data, just update the local state
        if (editingSlide) {
          setSlides(slides.map(slide => 
            slide.id === editingSlide.id 
              ? { 
                  ...slide, 
                  title: formData.title,
                  description: formData.description,
                  image_url: formData.image_url,
                  link: formData.link,
                  is_active: formData.is_active,
                  updated_at: new Date().toISOString()
                } 
              : slide
          ));
        } else {
          const maxOrder = Math.max(...slides.map(s => s.sort_order), 0);
          const newSlide: SlideImage = {
            id: `mock-${Date.now()}`,
            title: formData.title,
            description: formData.description,
            image_url: formData.image_url,
            link: formData.link,
            sort_order: maxOrder + 1,
            is_active: formData.is_active,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setSlides([...slides, newSlide].sort((a, b) => a.sort_order - b.sort_order));
        }
      }
      
      toast.success(`Image ${editingSlide ? 'mise à jour' : 'créée'} avec succès`);
      setShowForm(false);
      setEditingSlide(null);
      resetForm();
      
      // Refresh data if using real data
      if (isRealData) {
        fetchSlides();
      }
    } catch (error) {
      console.error('Error saving slide:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (slide: SlideImage) => {
    setFormData({
      title: slide.title,
      description: slide.description || '',
      image_url: slide.image_url,
      link: slide.link || '',
      is_active: slide.is_active
    });
    setEditingSlide(slide);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link: '',
      is_active: true
    });
  };

  const moveUp = async (id: string) => {
    const index = slides.findIndex(s => s.id === id);
    if (index <= 0) return;
    
    try {
      const currentSlide = slides[index];
      const prevSlide = slides[index - 1];
      
      // Check if we're using real data or mock data
      const isRealData = slides.length > 0 && slides[0].id !== '1';
      
      if (isRealData) {
        // Update orders in database
        await Promise.all([
          supabase.from('slideshow_images').update({ sort_order: prevSlide.sort_order }).eq('id', currentSlide.id),
          supabase.from('slideshow_images').update({ sort_order: currentSlide.sort_order }).eq('id', prevSlide.id)
        ]);
      }
      
      // Update local state
      const newSlides = [...slides];
      newSlides[index] = { ...currentSlide, sort_order: prevSlide.sort_order };
      newSlides[index - 1] = { ...prevSlide, sort_order: currentSlide.sort_order };
      newSlides.sort((a, b) => a.sort_order - b.sort_order);
      setSlides(newSlides);
      
      toast.success('Ordre mis à jour');
    } catch (error) {
      console.error('Error moving slide up:', error);
      toast.error('Erreur lors du déplacement');
    }
  };

  const moveDown = async (id: string) => {
    const index = slides.findIndex(s => s.id === id);
    if (index >= slides.length - 1) return;
    
    try {
      const currentSlide = slides[index];
      const nextSlide = slides[index + 1];
      
      // Check if we're using real data or mock data
      const isRealData = slides.length > 0 && slides[0].id !== '1';
      
      if (isRealData) {
        // Update orders in database
        await Promise.all([
          supabase.from('slideshow_images').update({ sort_order: nextSlide.sort_order }).eq('id', currentSlide.id),
          supabase.from('slideshow_images').update({ sort_order: currentSlide.sort_order }).eq('id', nextSlide.id)
        ]);
      }
      
      // Update local state
      const newSlides = [...slides];
      newSlides[index] = { ...currentSlide, sort_order: nextSlide.sort_order };
      newSlides[index + 1] = { ...nextSlide, sort_order: currentSlide.sort_order };
      newSlides.sort((a, b) => a.sort_order - b.sort_order);
      setSlides(newSlides);
      
      toast.success('Ordre mis à jour');
    } catch (error) {
      console.error('Error moving slide down:', error);
      toast.error('Erreur lors du déplacement');
    }
  };

  const filteredSlides = slides.filter(slide => {
    const matchesSearch = slide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         slide.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive = !filterActive || 
                         (filterActive === 'active' && slide.is_active) ||
                         (filterActive === 'inactive' && !slide.is_active);
    
    return matchesSearch && matchesActive;
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion du Diaporama</h1>
          <p className="text-gray-600">Gérer les images du diaporama de la page d'accueil</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingSlide(null);
            setShowForm(true);
          }}
          className="btn bg-primary-600 hover:bg-primary-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Image
        </button>
      </div>

      {/* Preview */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Aperçu du Diaporama</h2>
        <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden">
          {slides.length > 0 ? (
            <>
              <img 
                src={slides[0].image_url} 
                alt={slides[0].title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Image+non+disponible';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{slides[0].title}</h3>
                {slides[0].description && (
                  <p className="text-gray-200">{slides[0].description}</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Aucune image dans le diaporama</p>
            </div>
          )}
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <p>Le diaporama affiche {slides.length} image(s) sur la page d'accueil.</p>
          <p>Les images sont affichées dans l'ordre indiqué ci-dessous et changent automatiquement toutes les 5 secondes.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>

          <div className="flex items-center text-sm text-gray-500">
            <Filter className="mr-2" size={16} />
            {filteredSlides.length} résultat(s)
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingSlide ? 'Modifier l\'image' : 'Nouvelle image'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingSlide(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de l'image
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                  {formData.image_url && (
                    <div className="mt-2">
                      <img 
                        src={formData.image_url} 
                        alt="Aperçu" 
                        className="h-32 w-full object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Image+non+disponible';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lien (optionnel)
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://example.com/page"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                    Image active
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingSlide(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {editingSlide ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Slides List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lien
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSlides.map((slide, index) => (
                <motion.tr
                  key={slide.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-16 w-24 bg-gray-200 rounded overflow-hidden">
                      <img 
                        src={slide.image_url} 
                        alt={slide.title} 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/240x160?text=Image+non+disponible';
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{slide.title}</div>
                    {slide.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">{slide.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {slide.link ? (
                      <a 
                        href={slide.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <LinkIcon size={14} className="mr-1" />
                        <span className="truncate max-w-xs">{slide.link}</span>
                      </a>
                    ) : (
                      <span className="text-gray-400">Aucun lien</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900">{slide.sort_order}</span>
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveUp(slide.id)}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => moveDown(slide.id)}
                          disabled={index === slides.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActiveStatus(slide.id, slide.is_active)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        slide.is_active 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {slide.is_active ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => window.open(slide.image_url, '_blank')}
                        className="p-1 text-primary-600 hover:text-primary-900"
                        title="Voir l'image"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEdit(slide)}
                        className="p-1 text-blue-600 hover:text-blue-900"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => deleteSlide(slide.id)}
                        className="p-1 text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSlides.length === 0 && (
          <div className="text-center py-12">
            <Image className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune image</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterActive
                ? 'Aucune image ne correspond à vos critères de recherche.'
                : 'Commencez par ajouter votre première image au diaporama.'
              }
            </p>
            {!searchTerm && !filterActive && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    resetForm();
                    setEditingSlide(null);
                    setShowForm(true);
                  }}
                  className="btn bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une image
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Implementation Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-blue-800">
          Guide d'Implémentation
        </h2>
        <div className="space-y-4 text-blue-700">
          <div>
            <h3 className="font-medium">1. Structure de la table</h3>
            <p className="text-sm mt-1">
              Pour implémenter cette fonctionnalité en production, créez une table <code>slideshow_images</code> avec les champs suivants :
            </p>
            <pre className="bg-blue-100 p-2 rounded text-xs mt-2 overflow-auto">
{`CREATE TABLE slideshow_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`}
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium">2. Affichage sur la page d'accueil</h3>
            <p className="text-sm mt-1">
              Le diaporama est automatiquement affiché sur la page d'accueil, montrant les images marquées comme "Actives" dans l'ordre spécifié.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">3. Recommandations pour les images</h3>
            <p className="text-sm mt-1">
              Pour de meilleurs résultats, utilisez des images de dimensions similaires, idéalement 1920x1080 pixels ou un ratio 16:9.
              Les images trop petites peuvent apparaître pixelisées lorsqu'elles sont agrandies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideshowAdminPage;