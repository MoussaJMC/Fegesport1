import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon, Eye, EyeOff, MoveUp, MoveDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  alt_text: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SponsorFormData {
  name: string;
  logo_url: string;
  alt_text: string;
  order_index: number;
  is_active: boolean;
}

const SponsorsAdminPage: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<SponsorFormData>({
    name: '',
    logo_url: '',
    alt_text: '',
    order_index: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setSponsors(data || []);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      toast.error('Erreur lors du chargement des sponsors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('sponsors')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Sponsor mis à jour avec succès');
      } else {
        const { error } = await supabase
          .from('sponsors')
          .insert([formData]);

        if (error) throw error;
        toast.success('Sponsor ajouté avec succès');
      }

      resetForm();
      fetchSponsors();
    } catch (error) {
      console.error('Error saving sponsor:', error);
      toast.error('Erreur lors de l\'enregistrement du sponsor');
    }
  };

  const handleEdit = (sponsor: Sponsor) => {
    setFormData({
      name: sponsor.name,
      logo_url: sponsor.logo_url,
      alt_text: sponsor.alt_text,
      order_index: sponsor.order_index,
      is_active: sponsor.is_active,
    });
    setEditingId(sponsor.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce sponsor ?')) return;

    try {
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Sponsor supprimé avec succès');
      fetchSponsors();
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      toast.error('Erreur lors de la suppression du sponsor');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('sponsors')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Sponsor ${!currentStatus ? 'activé' : 'désactivé'}`);
      fetchSponsors();
    } catch (error) {
      console.error('Error toggling sponsor:', error);
      toast.error('Erreur lors de la modification du statut');
    }
  };

  const moveOrder = async (id: string, direction: 'up' | 'down') => {
    const index = sponsors.findIndex(s => s.id === id);
    if (index === -1) return;

    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sponsors.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const sponsor = sponsors[index];
    const swapSponsor = sponsors[swapIndex];

    try {
      const { error: error1 } = await supabase
        .from('sponsors')
        .update({ order_index: swapSponsor.order_index })
        .eq('id', sponsor.id);

      const { error: error2 } = await supabase
        .from('sponsors')
        .update({ order_index: sponsor.order_index })
        .eq('id', swapSponsor.id);

      if (error1 || error2) throw error1 || error2;

      toast.success('Ordre modifié');
      fetchSponsors();
    } catch (error) {
      console.error('Error moving sponsor:', error);
      toast.error('Erreur lors du changement d\'ordre');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      alt_text: '',
      order_index: sponsors.length,
      is_active: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Sponsors LEG</h1>
          <p className="text-gray-600 mt-2">Gérez les logos sponsors affichés dans le carousel de la page eLeague</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nouveau Sponsor
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingId ? 'Modifier le sponsor' : 'Nouveau sponsor'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du sponsor *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texte alternatif *
                </label>
                <input
                  type="text"
                  value={formData.alt_text}
                  onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL du logo *
              </label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="https://example.com/logo.svg"
                required
              />
              {formData.logo_url && (
                <div className="mt-2 p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                  <img
                    src={formData.logo_url}
                    alt="Aperçu"
                    className="max-h-16 max-w-xs object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EErreur%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Actif (affiché)</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Save className="w-5 h-5" />
                {editingId ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Logo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sponsors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-lg font-medium">Aucun sponsor</p>
                    <p className="text-sm mt-1">Ajoutez votre premier sponsor pour commencer</p>
                  </td>
                </tr>
              ) : (
                sponsors.map((sponsor, index) => (
                  <tr key={sponsor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">#{sponsor.order_index}</span>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveOrder(sponsor.id, 'up')}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Monter"
                          >
                            <MoveUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveOrder(sponsor.id, 'down')}
                            disabled={index === sponsors.length - 1}
                            className="text-gray-400 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Descendre"
                          >
                            <MoveDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={sponsor.logo_url}
                        alt={sponsor.alt_text}
                        className="h-12 w-24 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="50"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EErreur%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{sponsor.name}</div>
                      <div className="text-sm text-gray-500">{sponsor.alt_text}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(sponsor.id, sponsor.is_active)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          sponsor.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {sponsor.is_active ? (
                          <>
                            <Eye className="w-3 h-3" />
                            Actif
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            Inactif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(sponsor)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Modifier"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(sponsor.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SponsorsAdminPage;
