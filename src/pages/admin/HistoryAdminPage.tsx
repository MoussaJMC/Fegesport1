import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Save, X, RefreshCw, Clock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryEntry {
  id: string;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  year_start: number;
  year_end: number | null;
  order_position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FormData {
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  year_start: number | string;
  year_end: number | string;
  order_position: number | string;
  is_active: boolean;
}

const HistoryAdminPage = () => {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title_fr: '',
    title_en: '',
    description_fr: '',
    description_en: '',
    year_start: new Date().getFullYear(),
    year_end: '',
    order_position: 0,
    is_active: true
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('history_timeline')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) throw error;
      setEntries(data || []);
    } catch (error: any) {
      console.error('Error fetching history entries:', error);
      const errorMessage = error?.message || 'Erreur lors du chargement de l\'historique';
      toast.error(`Erreur: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_fr || !formData.description_fr || !formData.year_start) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const dataToSave = {
        title_fr: formData.title_fr,
        title_en: formData.title_en || formData.title_fr,
        description_fr: formData.description_fr,
        description_en: formData.description_en || formData.description_fr,
        year_start: Number(formData.year_start),
        year_end: formData.year_end ? Number(formData.year_end) : null,
        order_position: Number(formData.order_position),
        is_active: formData.is_active
      };

      if (editingId) {
        const { error } = await supabase
          .from('history_timeline')
          .update(dataToSave)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Entrée modifiée avec succès');
      } else {
        const { error } = await supabase
          .from('history_timeline')
          .insert([dataToSave]);

        if (error) throw error;
        toast.success('Entrée ajoutée avec succès');
      }

      resetForm();
      fetchEntries();
    } catch (error: any) {
      console.error('Error saving history entry:', error);
      const errorMessage = error?.message || 'Erreur lors de l\'enregistrement';
      toast.error(`Erreur: ${errorMessage}`);
    }
  };

  const handleEdit = (entry: HistoryEntry) => {
    setEditingId(entry.id);
    setFormData({
      title_fr: entry.title_fr,
      title_en: entry.title_en,
      description_fr: entry.description_fr,
      description_en: entry.description_en,
      year_start: entry.year_start,
      year_end: entry.year_end || '',
      order_position: entry.order_position,
      is_active: entry.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('history_timeline')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Entrée supprimée avec succès');
      fetchEntries();
    } catch (error: any) {
      console.error('Error deleting history entry:', error);
      const errorMessage = error?.message || 'Erreur lors de la suppression';
      toast.error(`Erreur: ${errorMessage}`);
    }
  };

  const toggleActive = async (entry: HistoryEntry) => {
    try {
      const { error } = await supabase
        .from('history_timeline')
        .update({ is_active: !entry.is_active })
        .eq('id', entry.id);

      if (error) throw error;
      toast.success(`Entrée ${!entry.is_active ? 'activée' : 'désactivée'}`);
      fetchEntries();
    } catch (error: any) {
      console.error('Error toggling active status:', error);
      const errorMessage = error?.message || 'Erreur lors de la mise à jour';
      toast.error(`Erreur: ${errorMessage}`);
    }
  };

  const resetForm = () => {
    setFormData({
      title_fr: '',
      title_en: '',
      description_fr: '',
      description_en: '',
      year_start: new Date().getFullYear(),
      year_end: '',
      order_position: entries.length + 1,
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const formatYearRange = (start: number, end: number | null) => {
    if (end) {
      return `${start}-${end}`;
    }
    return `${start} - Aujourd'hui`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion de Notre Histoire</h1>
          <p className="text-gray-600 mt-2">
            Gérez la chronologie et les étapes importantes de FEGESPORT
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchEntries}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter une Entrée
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {editingId ? 'Modifier l\'Entrée' : 'Nouvelle Entrée'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre (Français) *
                  </label>
                  <input
                    type="text"
                    value={formData.title_fr}
                    onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Fondation"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre (Anglais)
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Foundation"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Français) *
                </label>
                <textarea
                  value={formData.description_fr}
                  onChange={(e) => setFormData({ ...formData, description_fr: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description détaillée en français..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Anglais)
                </label>
                <textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Detailed description in English..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année de début *
                  </label>
                  <input
                    type="number"
                    value={formData.year_start}
                    onChange={(e) => setFormData({ ...formData, year_start: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="2000"
                    max="2100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année de fin (optionnel)
                  </label>
                  <input
                    type="number"
                    value={formData.year_end}
                    onChange={(e) => setFormData({ ...formData, year_end: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="2000"
                    max="2100"
                    placeholder="Laissez vide pour 'Aujourd'hui'"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordre d'affichage *
                  </label>
                  <input
                    type="number"
                    value={formData.order_position}
                    onChange={(e) => setFormData({ ...formData, order_position: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Entrée active (visible sur le site)
                </label>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {entries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune entrée historique
            </h3>
            <p className="text-gray-600 mb-4">
              Commencez par ajouter votre première entrée
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter une Entrée
            </button>
          </div>
        ) : (
          entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-lg shadow-md p-6 ${
                !entry.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                      {entry.order_position}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">
                      {entry.title_fr}
                      {entry.title_en && entry.title_en !== entry.title_fr && (
                        <span className="text-gray-500 text-base ml-2">
                          / {entry.title_en}
                        </span>
                      )}
                    </h3>
                    <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      {formatYearRange(entry.year_start, entry.year_end)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">FR:</span>
                      <p className="text-gray-700 mt-1">{entry.description_fr}</p>
                    </div>
                    {entry.description_en && entry.description_en !== entry.description_fr && (
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase">EN:</span>
                        <p className="text-gray-600 mt-1">{entry.description_en}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleActive(entry)}
                    className={`p-2 rounded-lg transition-colors ${
                      entry.is_active
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={entry.is_active ? 'Désactiver' : 'Activer'}
                  >
                    {entry.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(entry)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryAdminPage;
