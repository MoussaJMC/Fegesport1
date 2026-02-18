import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: 'logo' | 'menu' | 'metadata' | 'theme' | 'contact';
  description?: string;
  is_public: boolean;
}

const DEFAULT_SETTINGS = {
  site_logo: {
    main_logo: "https://geozovninpeqsgtzwchu.supabase.co/storage/v1/object/public/static-files/uploads/d5b2ehmnrec.jpg",
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
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<Record<string, any>>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('is_public', true);

        if (error) throw error;

        if (isMounted) {
          const settingsObject = (data || []).reduce((acc, setting) => {
            acc[setting.setting_key] = setting.setting_value;
            return acc;
          }, {} as Record<string, any>);

          setSettings({ ...DEFAULT_SETTINGS, ...settingsObject });
        }
      } catch (err: any) {
        console.error('Error fetching site settings:', err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const getSetting = useCallback((key: string, defaultValue: any = null) => {
    return settings[key] || defaultValue;
  }, [settings]);

  const refreshSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('is_public', true);

      if (error) throw error;

      const settingsObject = (data || []).reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, any>);

      setSettings({ ...DEFAULT_SETTINGS, ...settingsObject });
    } catch (err: any) {
      console.error('Error refreshing site settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(() => ({
    settings,
    loading,
    error,
    getSetting,
    refreshSettings
  }), [settings, loading, error, getSetting, refreshSettings]);
}