import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, Search, Filter, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeadershipMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  image_url: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const LeadershipAdminPage: React.FC = () => {
  const [members, setMembers] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<LeadershipMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('');
  
  const [formData, setFormData] = useState<{
    name: string;
    position: string;
    bio: string;
    image_url: string;
    is_active: boolean;
  }>({
    name: '',
    position: '',
    bio: '',
    image_url: '',
    is_active: true
  });

  useEffect(() => {
    fetchLeadershipMembers();
  }, []);

  const fetchLeadershipMembers = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('leadership_team')
        .select('*')
        .order('order', { ascending: true });

      if (error) {
        console.error('Error fetching leadership team:', error);
        // If table doesn't exist or other error, use mock data
        setMembers(getMockLeadershipMembers());
      } else if (data && data.length > 0) {
        setMembers(data);
      } else {
        // No data found, use mock data
        setMembers(getMockLeadershipMembers());
      }
    } catch (error) {
      console.error('Error in fetchLeadershipMembers:', error);
      setMembers(getMockLeadershipMembers());
    } finally {
      setLoading(false);
    }
  };

  const getMockLeadershipMembers = (): LeadershipMember[] => {
    return [
      {
        id: '1',
        name: 'Mamadou Diallo',
        position: 'Président',
        bio: 'Entrepreneur visionnaire et passionné d\'esport, Mamadou dirige la FEGESPORT avec l\'ambition de faire de la Guinée une référence de l\'esport en Afrique.',
        image_url: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
        order: 1,
        is_active: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Aïssata Camara',
        position: 'Secrétaire Générale',
        bio: 'Forte d\'une expérience de 15 ans dans l\'administration sportive, Aïssata coordonne l\'ensemble des activités de la fédération.',
        image_url: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg',
        order: 2,
        is_active: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: '3',
        name: 'Ibrahima Sow',
        position: 'Directeur Technique',
        bio: 'Ancien joueur professionnel et expert technique, Ibrahima supervise tous les aspects compétitifs et la formation des arbitres.',
        image_url: 'https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg',
        order: 3,
        is_active: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      }
    ];
  };

  const deleteLeadershipMember = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre de la direction ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('leadership_team')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMembers(members.filter(member => member.id !== id));
      toast.success('Membre supprimé avec succès');
    } catch (error) {
      console.error('Error deleting leadership member:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('leadership_team')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setMembers(members.map(member =>
        member.id === id
          ? { ...member, is_active: !currentStatus }
          : member
      ));

      toast.success(`Membre ${!currentStatus ? 'activé' : 'désactivé'} avec succès`);
    } catch (error) {
      console.error('Error updating leadership member status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMember) {
        const { error } = await supabase
          .from('leadership_team')
          .update({
            name: formData.name,
            position: formData.position,
            bio: formData.bio,
            image_url: formData.image_url,
            is_active: formData.is_active
          })
          .eq('id', editingMember.id);

        if (error) throw error;
      } else {
        const maxOrder = Math.max(...members.map(m => m.order), 0);
        const { error } = await supabase
          .from('leadership_team')
          .insert([{
            name: formData.name,
            position: formData.position,
            bio: formData.bio,
            image_url: formData.image_url,
            order: maxOrder + 1,
            is_active: formData.is_active
          }]);

        if (error) throw error;
      }

      toast.success(`Membre ${editingMember ? 'mis à jour' : 'créé'} avec succès`);
      setShowForm(false);
      setEditingMember(null);
      resetForm();
      await fetchLeadershipMembers();
    } catch (error) {
      console.error('Error saving leadership member:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (member: LeadershipMember) => {
    setFormData({
      name: member.name,
      position: member.position,
      bio: member.bio,
      image_url: member.image_url,
      is_active: member.is_active
    });
    setEditingMember(member);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      bio: '',
      image_url: '',
      is_active: true
    });
  };

  const moveUp = async (id: string) => {
    const index = members.findIndex(m => m.id === id);
    if (index <= 0) return;

    try {
      const currentMember = members[index];
      const prevMember = members[index - 1];

      await Promise.all([
        supabase.from('leadership_team').update({ order: prevMember.order }).eq('id', currentMember.id),
        supabase.from('leadership_team').update({ order: currentMember.order }).eq('id', prevMember.id)
      ]);

      const newMembers = [...members];
      newMembers[index] = { ...currentMember, order: prevMember.order };
      newMembers[index - 1] = { ...prevMember, order: currentMember.order };
      newMembers.sort((a, b) => a.order - b.order);
      setMembers(newMembers);

      toast.success('Ordre mis à jour');
    } catch (error) {
      console.error('Error moving member up:', error);
      toast.error('Erreur lors du déplacement');
    }
  };

  const moveDown = async (id: string) => {
    const index = members.findIndex(m => m.id === id);
    if (index >= members.length - 1) return;

    try {
      const currentMember = members[index];
      const nextMember = members[index + 1];

      await Promise.all([
        supabase.from('leadership_team').update({ order: nextMember.order }).eq('id', currentMember.id),
        supabase.from('leadership_team').update({ order: currentMember.order }).eq('id', nextMember.id)
      ]);

      const newMembers = [...members];
      newMembers[index] = { ...currentMember, order: nextMember.order };
      newMembers[index + 1] = { ...nextMember, order: currentMember.order };
      newMembers.sort((a, b) => a.order - b.order);
      setMembers(newMembers);

      toast.success('Ordre mis à jour');
    } catch (error) {
      console.error('Error moving member down:', error);
      toast.error('Erreur lors du déplacement');
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive = !filterActive || 
                         (filterActive === 'active' && member.is_active) ||
                         (filterActive === 'inactive' && !member.is_active);
    
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
          <h1 className="text-2xl font-bold text-gray-900">Notre Direction</h1>
          <p className="text-gray-600">Gérer l'équipe de direction affichée sur la page À Propos</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingMember(null);
            setShowForm(true);
          }}
          className="btn bg-primary-600 hover:bg-primary-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Membre
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
            {filteredMembers.length} résultat(s)
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingMember ? 'Modifier le membre' : 'Nouveau membre'}
              </h2>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
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
                    Poste / Fonction
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Biographie
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    required
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
                        className="h-20 w-20 object-cover rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/150';
                        }}
                      />
                    </div>
                  )}
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
                    Membre actif
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingMember(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {editingMember ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Leadership Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`bg-white rounded-lg shadow overflow-hidden ${!member.is_active ? 'opacity-60' : ''}`}
          >
            <div className="p-6 bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img
                  src={member.image_url}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/150?text=Photo';
                  }}
                />
              </div>
              {!member.is_active && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  Inactif
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold">{member.name}</h3>
                  <p className="text-primary-600 font-medium">{member.position}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => moveUp(member.id)}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Monter"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => moveDown(member.id)}
                    disabled={index === members.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Descendre"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{member.bio}</p>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => toggleActiveStatus(member.id, member.is_active)}
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    member.is_active 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {member.is_active ? 'Actif' : 'Inactif'}
                </button>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(member)}
                    className="p-1 text-blue-600 hover:text-blue-900"
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => deleteLeadershipMember(member.id)}
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
          transition={{ duration: 0.3, delay: filteredMembers.length * 0.05 }}
          className="bg-white rounded-lg shadow border-2 border-dashed border-gray-300 flex items-center justify-center h-64 cursor-pointer hover:border-primary-500 transition-colors"
          onClick={() => {
            resetForm();
            setEditingMember(null);
            setShowForm(true);
          }}
        >
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Ajouter un membre</h3>
            <p className="mt-1 text-xs text-gray-500">
              Cliquez pour ajouter un nouveau membre à l'équipe de direction
            </p>
          </div>
        </motion.div>
      </div>

      {filteredMembers.length === 0 && searchTerm && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun membre trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aucun membre ne correspond à vos critères de recherche.
          </p>
        </div>
      )}

      {/* Implementation Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-blue-800">
          Intégration avec la Page À Propos
        </h2>
        <div className="space-y-4 text-blue-700">
          <div>
            <h3 className="font-medium">1. Affichage sur la page À Propos</h3>
            <p className="text-sm mt-1">
              Les membres de la direction sont automatiquement affichés sur la page À Propos, dans la section "Notre Direction".
              Seuls les membres marqués comme "Actifs" sont visibles sur le site public.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">2. Ordre d'affichage</h3>
            <p className="text-sm mt-1">
              L'ordre d'affichage peut être modifié en utilisant les flèches haut/bas à côté de chaque membre.
              Le président est généralement affiché en premier, suivi des autres membres de la direction.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium">3. Images</h3>
            <p className="text-sm mt-1">
              Pour de meilleurs résultats, utilisez des images carrées ou au format portrait, de préférence avec un fond neutre.
              Dimensions recommandées : 600x600 pixels minimum.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadershipAdminPage;