import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: 'logo' | 'menu' | 'metadata' | 'theme' | 'contact';
  description?: string;
  is_public: boolean;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('is_public', true);

      if (error) throw error;

      // Convert array to object with setting_key as keys
      const settingsObject = (data || []).reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, any>);

      setSettings(settingsObject);
    } catch (err: any) {
      console.error('Error fetching site settings:', err);
      setError(err.message);
      
      // Fallback to default settings if database fails
      setSettings({
        site_logo: {
          main_logo: "https://images.pexels.com/photos/7915559/pexels-photo-7915559.jpeg",
          alt_text: "FEGESPORT Logo",
          width: 48,
          height: 48,
          link: "/"
        },
        main_navigation: {
          brand_text: "FEGESPORT",
          items: [
            { label: "Accueil", path: "/", order: 1 },
            { label: "À propos", path: "/about", order: 2 },
            { label: "Actualités", path: "/news", order: 3 },
            { label: "Adhésion", path: "/membership", order: 4, submenu: [
              { label: "Adhésion", path: "/membership" },
              { label: "Communauté", path: "/membership/community" }
            ]},
            { label: "Ressources", path: "/resources", order: 5 },
            { label: "Partenaires", path: "/partners", order: 6 },
            { label: "Contact", path: "/contact", order: 7 }
          ]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const getSetting = (key: string, defaultValue: any = null) => {
    return settings[key] || defaultValue;
  };

  const refreshSettings = () => {
    fetchSettings();
  };

  return {
    settings,
    loading,
    error,
    getSetting,
    refreshSettings
  };
}