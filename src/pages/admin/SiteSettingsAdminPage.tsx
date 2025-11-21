import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Settings, Save, Image, Menu, Globe, Palette, Mail } from 'lucide-react';

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_type: 'logo' | 'menu' | 'metadata' | 'theme' | 'contact';
  setting_value: any;
  description?: string;
  is_public: boolean;
}

const SiteSettingsAdminPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('setting_type');

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (id: string, newValue: any) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('site_settings')
        .update({
          setting_value: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Paramètre mis à jour');
      fetchSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'logo': return <Image size={20} />;
      case 'menu': return <Menu size={20} />;
      case 'metadata': return <Globe size={20} />;
      case 'theme': return <Palette size={20} />;
      case 'contact': return <Mail size={20} />;
      default: return <Settings size={20} />;
    }
  };

  const renderSettingEditor = (setting: SiteSetting) => {
    const value = setting.setting_value || {};

    switch (setting.setting_type) {
      case 'logo':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL du logo principal</label>
              <input
                type="url"
                value={value.main_logo || ''}
                onChange={(e) => updateSetting(setting.id, { ...value, main_logo: e.target.value })}
                className="w-full rounded-md border-gray-300"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Texte alternatif</label>
              <input
                type="text"
                value={value.alt_text || ''}
                onChange={(e) => updateSetting(setting.id, { ...value, alt_text: e.target.value })}
                className="w-full rounded-md border-gray-300"
              />
            </div>
            {value.main_logo && (
              <div className="mt-2">
                <img src={value.main_logo} alt="Logo preview" className="h-16 w-auto" />
              </div>
            )}
          </div>
        );

      case 'metadata':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre du site</label>
              <input
                type="text"
                value={value.site_title || ''}
                onChange={(e) => updateSetting(setting.id, { ...value, site_title: e.target.value })}
                className="w-full rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={value.site_description || ''}
                onChange={(e) => updateSetting(setting.id, { ...value, site_description: e.target.value })}
                rows={3}
                className="w-full rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mots-clés (séparés par des virgules)</label>
              <input
                type="text"
                value={value.keywords || ''}
                onChange={(e) => updateSetting(setting.id, { ...value, keywords: e.target.value })}
                className="w-full rounded-md border-gray-300"
              />
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={value.email || ''}
                onChange={(e) => updateSetting(setting.id, { ...value, email: e.target.value })}
                className="w-full rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="tel"
                value={value.phone || ''}
                onChange={(e) => updateSetting(setting.id, { ...value, phone: e.target.value })}
                className="w-full rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <textarea
                value={value.address || ''}
                onChange={(e) => updateSetting(setting.id, { ...value, address: e.target.value })}
                rows={2}
                className="w-full rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
              <input
                type="url"
                value={value.facebook || ''}
                onChange={(e) => updateSetting(setting.id, { ...value, facebook: e.target.value })}
                className="w-full rounded-md border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
              <input
                type="url"
                value={value.twitter || ''}
                onChange={(e) => updateSetting(setting.id, { ...value, twitter: e.target.value })}
                className="w-full rounded-md border-gray-300"
              />
            </div>
          </div>
        );

      case 'theme':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Couleur primaire</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={value.primary_color || '#3B82F6'}
                  onChange={(e) => updateSetting(setting.id, { ...value, primary_color: e.target.value })}
                  className="h-10 w-20"
                />
                <input
                  type="text"
                  value={value.primary_color || '#3B82F6'}
                  onChange={(e) => updateSetting(setting.id, { ...value, primary_color: e.target.value })}
                  className="flex-1 rounded-md border-gray-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Couleur secondaire</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={value.secondary_color || '#1F2937'}
                  onChange={(e) => updateSetting(setting.id, { ...value, secondary_color: e.target.value })}
                  className="h-10 w-20"
                />
                <input
                  type="text"
                  value={value.secondary_color || '#1F2937'}
                  onChange={(e) => updateSetting(setting.id, { ...value, secondary_color: e.target.value })}
                  className="flex-1 rounded-md border-gray-300"
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valeur JSON</label>
            <textarea
              value={JSON.stringify(value, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  updateSetting(setting.id, parsed);
                } catch (err) {
                  // Invalid JSON, don't update
                }
              }}
              rows={5}
              className="w-full rounded-md border-gray-300 font-mono text-sm"
            />
          </div>
        );
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres du Site</h1>
        <p className="text-gray-600">Gérer les paramètres globaux du site web</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {settings.map((setting) => (
          <div key={setting.id} className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-primary-100 rounded-lg mr-3">
                {getIcon(setting.setting_type)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {setting.setting_key.replace(/_/g, ' ').toUpperCase()}
                </h3>
                {setting.description && (
                  <p className="text-sm text-gray-500">{setting.description}</p>
                )}
              </div>
            </div>
            {renderSettingEditor(setting)}
          </div>
        ))}
      </div>

      {settings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Settings size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Aucun paramètre trouvé</p>
        </div>
      )}
    </div>
  );
};

export default SiteSettingsAdminPage;
