import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, Search, Filter, Tag, Copy, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import CardFormBilingual from '../../components/admin/CardFormBilingual';
import { CardTranslations } from '../../utils/translations';

interface Card {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  category: 'communiqué' | 'compétition' | 'partenariat';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  translations?: CardTranslations;
}

const CardsAdminPage: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cards:', error);
        // If table doesn't exist or other error, use mock data
        setCards(getMockCards());
      } else if (data && data.length > 0) {
        setCards(data);
      } else {
        // No data found, use mock data
        setCards(getMockCards());
      }
    } catch (error) {
      console.error('Error in fetchCards:', error);
      setCards(getMockCards());
    } finally {
      setLoading(false);
    }
  };

  const getMockCards = (): Card[] => {
    return [
      {
        id: '1',
        title: 'Lancement officiel de la FEGESPORT',
        content: 'La Fédération Guinéenne d\'Esport (FEGESPORT) a été officiellement lancée lors d\'une cérémonie à Conakry en présence de représentants du Ministère des Sports, de clubs esport et de partenaires.',
        image_url: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
        category: 'communiqué',
        is_active: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: '2',
        title: 'Premier tournoi national FIFA 25',
        content: 'La FEGESPORT organise son premier tournoi national FIFA 25 avec la participation de 64 joueurs de toute la Guinée. L\'événement se déroulera à Conakry du 20 au 22 février.',
        image_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
        category: 'compétition',
        is_active: true,
        created_at: '2025-01-28T10:00:00Z',
        updated_at: '2025-01-28T10:00:00Z'
      },
      {
        id: '3',
        title: 'Partenariat avec le Ministère de la Jeunesse et des Sports',
        content: 'La FEGESPORT a signé une convention de partenariat avec le Ministère de la Jeunesse et des Sports pour développer l\'esport en Guinée.',
        image_url: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg',
        category: 'partenariat',
        is_active: true,
        created_at: '2025-02-05T10:00:00Z',
        updated_at: '2025-02-05T10:00:00Z'
      }
    ];
  };

  const deleteCard = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
      return;
    }

    try {
      // Check if we're using real data or mock data
      const isRealData = cards.length > 0 && cards[0].id !== '1';
      
      if (isRealData) {
        const { error } = await supabase
          .from('cards')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }
      
      // Update local state regardless
      setCards(cards.filter(card => card.id !== id));
      toast.success('Carte supprimée avec succès');
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      // Check if we're using real data or mock data
      const isRealData = cards.length > 0 && cards[0].id !== '1';
      
      if (isRealData) {
        const { error } = await supabase
          .from('cards')
          .update({ is_active: !currentStatus })
          .eq('id', id);

        if (error) throw error;
      }
      
      // Update local state regardless
      setCards(cards.map(card => 
        card.id === id 
          ? { ...card, is_active: !currentStatus } 
          : card
      ));
      
      toast.success(`Carte ${!currentStatus ? 'activée' : 'désactivée'} avec succès`);
    } catch (error) {
      console.error('Error updating card status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleEdit = (card: Card) => {
    setEditingCard(card);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCard(null);
    fetchCards();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCard(null);
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || card.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'communiqué': return 'bg-blue-100 text-blue-800';
      case 'compétition': return 'bg-green-100 text-green-800';
      case 'partenariat': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'communiqué': return 'Communiqué';
      case 'compétition': return 'Compétition';
      case 'partenariat': return 'Partenariat';
      default: return category;
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Cartes</h1>
          <p className="text-gray-600">Gérer les cartes de communiqués, compétitions et partenariats</p>
        </div>
        <button
          onClick={() => {
            setEditingCard(null);
            setShowForm(true);
          }}
          className="btn bg-primary-600 hover:bg-primary-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Carte
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{cards.filter(c => c.category === 'communiqué').length}</div>
          <div className="text-sm text-gray-600">Communiqués</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{cards.filter(c => c.category === 'compétition').length}</div>
          <div className="text-sm text-gray-600">Compétitions</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{cards.filter(c => c.category === 'partenariat').length}</div>
          <div className="text-sm text-gray-600">Partenariats</div>
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
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Toutes les catégories</option>
            <option value="communiqué">Communiqués</option>
            <option value="compétition">Compétitions</option>
            <option value="partenariat">Partenariats</option>
          </select>

          <div className="flex items-center text-sm text-gray-500">
            <Filter className="mr-2" size={16} />
            {filteredCards.length} résultat(s)
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCard ? 'Modifier la carte' : 'Nouvelle carte'}
                </h2>
                <button
                  onClick={handleFormCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <CardFormBilingual
                initialData={editingCard ? {
                  id: editingCard.id,
                  category: editingCard.category,
                  image_url: editingCard.image_url,
                  is_active: editingCard.is_active,
                  translations: editingCard.translations
                } : undefined}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`bg-white rounded-lg shadow overflow-hidden ${!card.is_active ? 'opacity-60' : ''}`}
          >
            {card.image_url && (
              <div className="h-48 bg-gray-200 relative">
                <img 
                  src={card.image_url} 
                  alt={card.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
                  }}
                />
                {!card.is_active && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Inactive
                  </div>
                )}
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(card.category)}`}>
                  {getCategoryLabel(card.category)}
                </span>
                <button
                  onClick={() => copyToClipboard(card.id)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Copier l'ID"
                >
                  {copied === card.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
              <h3 className="text-lg font-bold mb-2 card-title">{card.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3 card-description">{card.content}</p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => toggleActiveStatus(card.id, card.is_active)}
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    card.is_active 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {card.is_active ? 'Active' : 'Inactive'}
                </button>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(card)}
                    className="p-1 text-blue-600 hover:text-blue-900"
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => deleteCard(card.id)}
                    className="p-1 text-red-600 hover:text-red-900"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Add New Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: filteredCards.length * 0.05 }}
          className="bg-white rounded-lg shadow border-2 border-dashed border-gray-300 flex items-center justify-center h-64 cursor-pointer hover:border-primary-500 transition-colors"
          onClick={() => {
            setEditingCard(null);
            setShowForm(true);
          }}
        >
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Ajouter une carte</h3>
            <p className="mt-1 text-xs text-gray-500">
              Cliquez pour ajouter une nouvelle carte
            </p>
          </div>
        </motion.div>
      </div>

      {filteredCards.length === 0 && searchTerm && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Tag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune carte trouvée</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aucune carte ne correspond à vos critères de recherche.
          </p>
        </div>
      )}

      {/* Implementation Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-blue-800">
          Guide d'Implémentation
        </h2>
        <div className="space-y-4 text-blue-700">
          <div>
            <h3 className="font-medium">1. Structure de la table</h3>
            <p className="text-sm mt-1">
              Pour implémenter cette fonctionnalité en production, créez une table <code>cards</code> avec les champs suivants :
            </p>
            <pre className="bg-blue-100 p-2 rounded text-xs mt-2 overflow-auto">
{`CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('communiqué', 'compétition', 'partenariat')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`}
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium">2. Utilisation des cartes</h3>
            <p className="text-sm mt-1">
              Ces cartes peuvent être utilisées sur la page d'accueil, dans les sections de communiqués, compétitions et partenariats.
              Vous pouvez les afficher en fonction de leur catégorie et de leur statut (actif/inactif).
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">3. Intégration avec les pages existantes</h3>
            <p className="text-sm mt-1">
              Modifiez les composants existants pour charger les cartes depuis la base de données au lieu d'utiliser des données statiques.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardsAdminPage;