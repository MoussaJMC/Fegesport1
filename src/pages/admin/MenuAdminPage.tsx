import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Eye, EyeOff, Save, RefreshCw, ArrowUp, ArrowDown, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface MenuItem {
  label: string;
  path: string;
  order: number;
  enabled: boolean;
  submenu?: Array<{
    label: string;
    path: string;
  }>;
}

interface NavigationSettings {
  brand_text: string;
  items: MenuItem[];
}

const MenuAdminPage = () => {
  const [settings, setSettings] = useState<NavigationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'main_navigation')
        .single();

      if (error) throw error;

      setSettings(data.setting_value as NavigationSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          setting_value: settings,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'main_navigation');

      if (error) throw error;

      toast.success('Paramètres sauvegardés avec succès');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const toggleMenuItem = (index: number) => {
    if (!settings) return;

    const newSettings = { ...settings };
    newSettings.items = [...settings.items];
    newSettings.items[index] = {
      ...newSettings.items[index],
      enabled: !newSettings.items[index].enabled
    };

    setSettings(newSettings);
    setHasChanges(true);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (!settings) return;

    const newSettings = { ...settings };
    const items = [...settings.items];

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    // Swap items
    [items[index], items[newIndex]] = [items[newIndex], items[index]];

    // Update order numbers
    items.forEach((item, idx) => {
      item.order = idx + 1;
    });

    newSettings.items = items;
    setSettings(newSettings);
    setHasChanges(true);
  };

  const updateBrandText = (text: string) => {
    if (!settings) return;

    setSettings({
      ...settings,
      brand_text: text
    });
    setHasChanges(true);
  };

  const resetSettings = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser les modifications ?')) {
      fetchSettings();
      setHasChanges(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Impossible de charger les paramètres</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion du Menu</h1>
          <p className="text-gray-600">Activer/désactiver et réorganiser les éléments du menu</p>
        </div>
        <div className="flex space-x-3">
          {hasChanges && (
            <button
              onClick={resetSettings}
              className="btn bg-gray-500 hover:bg-gray-600 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Annuler
            </button>
          )}
          <button
            onClick={saveSettings}
            disabled={saving || !hasChanges}
            className="btn bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Changes Alert */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border-l-4 border-yellow-400 p-4"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Vous avez des modifications non sauvegardées. N'oubliez pas de sauvegarder vos changements.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Brand Text */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Texte de la marque</h2>
        <input
          type="text"
          value={settings.brand_text}
          onChange={(e) => updateBrandText(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          placeholder="Ex: FEGESPORT"
        />
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Éléments du menu</h2>
          <p className="text-sm text-gray-500 mt-1">
            Cliquez sur l'icône œil pour activer/désactiver un élément
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {settings.items.map((item, index) => (
            <motion.div
              key={item.path}
              layout
              className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                !item.enabled ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center space-x-4 flex-1">
                {/* Enable/Disable Toggle */}
                <button
                  onClick={() => toggleMenuItem(index)}
                  className={`p-2 rounded-full transition-colors ${
                    item.enabled
                      ? 'text-green-600 hover:bg-green-100'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  title={item.enabled ? 'Désactiver' : 'Activer'}
                >
                  {item.enabled ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>

                {/* Menu Item Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">
                      {item.label}
                    </span>
                    {!item.enabled && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        Désactivé
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      Chemin: {item.path}
                    </span>
                    {item.submenu && (
                      <span className="text-xs text-primary-600">
                        • {item.submenu.length} sous-menu(s)
                      </span>
                    )}
                  </div>
                </div>

                {/* Order Badge */}
                <div className="px-3 py-1 bg-gray-100 rounded-full">
                  <span className="text-xs font-medium text-gray-600">
                    Ordre: {item.order}
                  </span>
                </div>
              </div>

              {/* Move Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Monter"
                >
                  <ArrowUp size={18} />
                </button>
                <button
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === settings.items.length - 1}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Descendre"
                >
                  <ArrowDown size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">À propos de la gestion du menu</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Les éléments désactivés n'apparaîtront pas dans le menu public</li>
                <li>Les éléments restent configurés même lorsqu'ils sont désactivés</li>
                <li>Utilisez les flèches pour réorganiser l'ordre d'affichage</li>
                <li>Le menu "Administration" est automatiquement ajouté pour les utilisateurs connectés</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuAdminPage;
