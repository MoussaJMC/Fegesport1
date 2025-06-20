import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Search, Filter, Tag, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface MembershipType {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const MembershipTypesAdminPage: React.FC = () => {
  const [types, setTypes] = useState<MembershipType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState<MembershipType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('');
  
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: number;
    period: string;
    features: string;
    is_active: boolean;
  }>({
    name: '',
    description: '',
    price: 0,
    period: '',
    features: '',
    is_active: true
  });

  useEffect(() => {
    fetchMembershipTypes();
  }, []);

  const fetchMembershipTypes = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('membership_types')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching membership types:', error);
        // If table doesn't exist or other error, use mock data
        setTypes(getMockMembershipTypes());
      } else if (data && data.length > 0) {
        setTypes(data);
      } else {
        // No data found, use mock data
        setTypes(getMockMembershipTypes());
      }
    } catch (error) {
      console.error('Error in fetchMembershipTypes:', error);
      setTypes(getMockMembershipTypes());
    } finally {
      setLoading(false);
    }
  };

  const getMockMembershipTypes = (): MembershipType[] => {
    return [
      {
        id: '1',
        name: 'Joueur Individuel',
        description: 'Adhésion pour les joueurs individuels',
        price: 15000,
        period: 'par an',
        features: [
          'Licence officielle de joueur',
          'Participation aux tournois officiels',
          'Accès aux formations',
          'Newsletter exclusive',
          'Badge digital officiel'
        ],
        is_active: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Club Esport',
        description: 'Adhésion pour les clubs esport',
        price: 150000,
        period: 'par an',
        features: [
          'Statut de club officiel',
          'Jusqu\'à 10 licences joueurs',
          'Organisation de tournois',
          'Support marketing',
          'Visibilité sur le site FEGESPORT'
        ],
        is_active: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: '3',
        name: 'Partenaire',
        description: 'Adhésion pour les partenaires',
        price: 0,
        period: 'sur mesure',
        features: [
          'Statut de partenaire officiel',
          'Logo sur le site et événements',
          'Accès VIP aux événements',
          'Communication dédiée',
          'Programme personnalisé'
        ],
        is_active: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      }
    ];
  };

  const deleteMembershipType = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce type d\'adhésion ?')) {
      return;
    }

    try {
      // Check if we're using real data or mock data
      const isRealData = types.length > 0 && types[0].id !== '1';
      
      if (isRealData) {
        const { error } = await supabase
          .from('membership_types')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }
      
      // Update local state regardless
      setTypes(types.filter(type => type.id !== id));
      toast.success('Type d\'adhésion supprimé avec succès');
    } catch (error) {
      console.error('Error deleting membership type:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      // Check if we're using real data or mock data
      const isRealData = types.length > 0 && types[0].id !== '1';
      
      if (isRealData) {
        const { error } = await supabase
          .from('membership_types')
          .update({ is_active: !currentStatus })
          .eq('id', id);

        if (error) throw error;
      }
      
      // Update local state regardless
      setTypes(types.map(type => 
        type.id === id 
          ? { ...type, is_active: !currentStatus } 
          : type
      ));
      
      toast.success(`Type d'adhésion ${!currentStatus ? 'activé' : 'désactivé'} avec succès`);
    } catch (error) {
      console.error('Error updating membership type status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Parse features from string to array
      const featuresArray = formData.features
        .split('\n')
        .map(feature => feature.trim())
        .filter(feature => feature.length > 0);
      
      // Check if we're using real data or mock data
      const isRealData = types.length > 0 && types[0].id !== '1';
      
      if (isRealData) {
        if (editingType) {
          // Update existing type
          const { error } = await supabase
            .from('membership_types')
            .update({
              name: formData.name,
              description: formData.description,
              price: formData.price,
              period: formData.period,
              features: featuresArray,
              is_active: formData.is_active
            })
            .eq('id', editingType.id);

          if (error) throw error;
        } else {
          // Create new type
          const { error } = await supabase
            .from('membership_types')
            .insert([{
              name: formData.name,
              description: formData.description,
              price: formData.price,
              period: formData.period,
              features: featuresArray,
              is_active: formData.is_active
            }]);

          if (error) throw error;
        }
      } else {
        // Using mock data, just update the local state
        if (editingType) {
          setTypes(types.map(type => 
            type.id === editingType.id 
              ? { 
                  ...type, 
                  name: formData.name,
                  description: formData.description,
                  price: formData.price,
                  period: formData.period,
                  features: featuresArray,
                  is_active: formData.is_active,
                  updated_at: new Date().toISOString()
                } 
              : type
          ));
        } else {
          const newType: MembershipType = {
            id: `mock-${Date.now()}`,
            name: formData.name,
            description: formData.description,
            price: formData.price,
            period: formData.period,
            features: featuresArray,
            is_active: formData.is_active,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setTypes([newType, ...types]);
        }
      }
      
      toast.success(`Type d'adhésion ${editingType ? 'mis à jour' : 'créé'} avec succès`);
      setShowForm(false);
      setEditingType(null);
      resetForm();
      
      // Refresh data if using real data
      if (isRealData) {
        fetchMembershipTypes();
      }
    } catch (error) {
      console.error('Error saving membership type:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (type: MembershipType) => {
    setFormData({
      name: type.name,
      description: type.description,
      price: type.price,
      period: type.period,
      features: type.features.join('\n'),
      is_active: type.is_active
    });
    setEditingType(type);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      period: 'par an',
      features: '',
      is_active: true
    });
  };

  const filteredTypes = types.filter(type => {
    const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         type.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive = !filterActive || 
                         (filterActive === 'active' && type.is_active) ||
                         (filterActive === 'inactive' && !type.is_active);
    
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
          <h1 className="text-2xl font-bold text-gray-900">Types d'Adhésion</h1>
          <p className="text-gray-600">Gérer les différentes formules d'adhésion</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingType(null);
            setShowForm(true);
          }}
          className="btn bg-primary-600 hover:bg-primary-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Type
        </button>
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
            {filteredTypes.length} résultat(s)
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingType ? 'Modifier le type d\'adhésion' : 'Nouveau type d\'adhésion'}
              </h2>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix (FCFA)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Période
                    </label>
                    <input
                      type="text"
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="par an, par mois, etc."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avantages (un par ligne)
                  </label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Licence officielle de joueur&#10;Participation aux tournois officiels&#10;Accès aux formations"
                    required
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
                    Type d'adhésion actif
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingType(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {editingType ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Membership Types Cards (Mobile-friendly) */}
      <div className="lg:hidden space-y-4">
        {filteredTypes.map((type, index) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white rounded-lg shadow p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Tag className="h-5 w-5 text-primary-600" />
                </div>
                <div className="ml-3">
                  <div className="font-medium">{type.name}</div>
                  <div className="text-sm text-gray-500">{type.description}</div>
                </div>
              </div>
              <button
                onClick={() => toggleActiveStatus(type.id, type.is_active)}
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  type.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {type.is_active ? 'Actif' : 'Inactif'}
              </button>
            </div>
            
            <div className="flex items-center text-sm mb-3">
              <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
              <div className="text-gray-900">
                {type.price === 0 ? 'Sur mesure' : `${type.price.toLocaleString()} FCFA`}
              </div>
              <div className="text-xs text-gray-500 ml-1">
                {type.period}
              </div>
            </div>
            
            <div className="mb-3">
              <div className="text-sm font-medium mb-1">Avantages:</div>
              <ul className="text-sm text-gray-500 list-disc pl-5 space-y-1">
                {type.features.slice(0, 3).map((feature, i) => (
                  <li key={i}>
                    {feature}
                  </li>
                ))}
                {type.features.length > 3 && (
                  <li className="text-gray-400 text-xs">
                    +{type.features.length - 3} autres avantages
                  </li>
                )}
              </ul>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => handleEdit(type)}
                className="p-2 text-blue-600 hover:text-blue-900"
                title="Modifier"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => deleteMembershipType(type.id)}
                className="p-2 text-red-600 hover:text-red-900"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
        
        {filteredTypes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun type d'adhésion</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterActive
                ? 'Aucun type d\'adhésion ne correspond à vos critères de recherche.'
                : 'Commencez par créer votre premier type d\'adhésion.'
              }
            </p>
            {!searchTerm && !filterActive && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    resetForm();
                    setEditingType(null);
                    setShowForm(true);
                  }}
                  className="btn bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Type
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Membership Types Table (Desktop) */}
      <div className="hidden lg:block bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type d'adhésion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avantages
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
              {filteredTypes.map((type, index) => (
                <motion.tr
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Tag className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {type.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {type.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                      <div className="text-sm text-gray-900">
                        {type.price === 0 ? 'Sur mesure' : `${type.price.toLocaleString()} FCFA`}
                      </div>
                      <div className="text-xs text-gray-500 ml-1">
                        {type.period}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <ul className="text-sm text-gray-500 list-disc pl-5 space-y-1">
                      {type.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="truncate max-w-xs">
                          {feature}
                        </li>
                      ))}
                      {type.features.length > 3 && (
                        <li className="text-gray-400 text-xs">
                          +{type.features.length - 3} autres avantages
                        </li>
                      )}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActiveStatus(type.id, type.is_active)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        type.is_active 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } transition-colors cursor-pointer`}
                    >
                      {type.is_active ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleEdit(type)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteMembershipType(type.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTypes.length === 0 && (
          <div className="text-center py-12">
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun type d'adhésion</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterActive
                ? 'Aucun type d\'adhésion ne correspond à vos critères de recherche.'
                : 'Commencez par créer votre premier type d\'adhésion.'
              }
            </p>
            {!searchTerm && !filterActive && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    resetForm();
                    setEditingType(null);
                    setShowForm(true);
                  }}
                  className="btn bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Type d'Adhésion
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
              Pour implémenter cette fonctionnalité en production, créez une table <code>membership_types</code> avec les champs suivants :
            </p>
            <pre className="bg-blue-100 p-2 rounded text-xs mt-2 overflow-auto">
{`CREATE TABLE membership_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  period TEXT,
  features TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`}
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium">2. Intégration avec le formulaire d'adhésion</h3>
            <p className="text-sm mt-1">
              Modifiez le composant MembershipForm pour charger dynamiquement les types d'adhésion depuis la base de données.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">3. Mise à jour des traductions</h3>
            <p className="text-sm mt-1">
              Assurez-vous d'ajouter les traductions nécessaires dans les fichiers de langue pour les nouveaux types d'adhésion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipTypesAdminPage;