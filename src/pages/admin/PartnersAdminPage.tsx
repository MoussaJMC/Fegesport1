import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, Search, Filter, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import PartnerForm from '../../components/admin/PartnerForm';

interface Partner {
  id: string;
  name: string;
  logo_url?: string;
  website?: string;
  description: string;
  partnership_type: 'sponsor' | 'technical' | 'media' | 'institutional';
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  partnership_start?: string;
  partnership_end?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

const PartnersAdminPage = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error('Erreur lors du chargement des partenaires');
    } finally {
      setLoading(false);
    }
  };

  const deletePartner = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Partenaire supprimé avec succès');
      fetchPartners();
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const updatePartnerStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('partners')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success('Statut du partenaire mis à jour');
      fetchPartners();
    } catch (error) {
      console.error('Error updating partner status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingPartner(null);
    fetchPartners();
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setShowForm(true);
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || partner.partnership_type === filterType;
    const matchesStatus = !filterStatus || partner.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sponsor': return 'bg-yellow-100 text-yellow-800';
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'media': return 'bg-purple-100 text-purple-800';
      case 'institutional': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sponsor': return 'Sponsor';
      case 'technical': return 'Technique';
      case 'media': return 'Média';
      case 'institutional': return 'Institutionnel';
      default: return type;
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Partenaires</h1>
          <p className="text-gray-600">Gérer les partenariats et collaborations</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn bg-primary-600 hover:bg-primary-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Partenaire
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">{partners.filter(p => p.partnership_type === 'sponsor').length}</div>
          <div className="text-sm text-gray-600">Sponsors</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{partners.filter(p => p.partnership_type === 'technical').length}</div>
          <div className="text-sm text-gray-600">Techniques</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{partners.filter(p => p.partnership_type === 'media').length}</div>
          <div className="text-sm text-gray-600">Médias</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{partners.filter(p => p.status === 'active').length}</div>
          <div className="text-sm text-gray-600">Actifs</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Tous les types</option>
            <option value="sponsor">Sponsor</option>
            <option value="technical">Technique</option>
            <option value="media">Média</option>
            <option value="institutional">Institutionnel</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>

          <div className="flex items-center text-sm text-gray-500">
            <Filter className="mr-2" size={16} />
            {filteredPartners.length} résultat(s)
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingPartner ? 'Modifier le partenaire' : 'Nouveau partenaire'}
              </h2>
              <PartnerForm
                initialData={editingPartner || undefined}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowForm(false);
                  setEditingPartner(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Partners List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partenaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Période
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
              {filteredPartners.map((partner, index) => (
                <motion.tr
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {partner.logo_url ? (
                        <img
                          src={partner.logo_url}
                          alt=""
                          className="h-10 w-10 rounded object-cover mr-3"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-gray-500">
                            {partner.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {partner.name}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {partner.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(partner.partnership_type)}`}>
                      {getTypeLabel(partner.partnership_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="font-medium">{partner.contact_name}</div>
                      <div>{partner.contact_email}</div>
                      <div>{partner.contact_phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {partner.partnership_start && partner.partnership_end ? (
                      <div>
                        <div>Du {format(new Date(partner.partnership_start), 'PP', { locale: fr })}</div>
                        <div>Au {format(new Date(partner.partnership_end), 'PP', { locale: fr })}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Non défini</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={partner.status}
                      onChange={(e) => updatePartnerStatus(partner.id, e.target.value)}
                      className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full border-0 ${getStatusColor(partner.status)} cursor-pointer`}
                    >
                      <option value="active">Actif</option>
                      <option value="inactive">Inactif</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {partner.website && (
                        <button 
                          onClick={() => window.open(partner.website, '_blank')}
                          className="text-green-600 hover:text-green-900"
                          title="Visiter le site web"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                      {partner.logo_url && (
                        <button 
                          onClick={() => window.open(partner.logo_url, '_blank')}
                          className="text-primary-600 hover:text-primary-900"
                          title="Voir le logo"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleEdit(partner)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deletePartner(partner.id)}
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
        
        {filteredPartners.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">🤝</div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun partenaire</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterType || filterStatus 
                ? 'Aucun partenaire ne correspond à vos critères de recherche.'
                : 'Commencez par ajouter votre premier partenaire.'
              }
            </p>
            {!searchTerm && !filterType && !filterStatus && (
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="btn bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Partenaire
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnersAdminPage;