import React, { useState, useEffect } from 'react';
import { Facebook, Twitter, Instagram, Youtube, MessageCircle, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  discord?: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  postal_code: string;
  social_media: SocialMediaLinks;
}

const SocialMediaAdminPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [socialMedia, setSocialMedia] = useState<SocialMediaLinks>({
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
    discord: ''
  });

  useEffect(() => {
    loadSocialMedia();
  }, []);

  const loadSocialMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'contact_info')
        .maybeSingle();

      if (error) throw error;

      if (data?.setting_value) {
        const contactInfo = data.setting_value as ContactInfo;
        setSocialMedia(contactInfo.social_media || {});
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des réseaux sociaux');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: currentData, error: fetchError } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'contact_info')
        .maybeSingle();

      if (fetchError) throw fetchError;

      const contactInfo = currentData?.setting_value as ContactInfo || {
        email: 'contact@fegesport224.org',
        phone: '+224 625878764',
        address: 'Conakry, Guinée',
        postal_code: 'BP 12345',
        social_media: {}
      };

      const updatedContactInfo = {
        ...contactInfo,
        social_media: socialMedia
      };

      const { error: updateError } = await supabase
        .from('site_settings')
        .update({
          setting_value: updatedContactInfo,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'contact_info');

      if (updateError) throw updateError;

      toast.success('Réseaux sociaux mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (platform: keyof SocialMediaLinks, value: string) => {
    setSocialMedia(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Réseaux Sociaux</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Information importante</p>
            <p>Ces liens seront affichés sur la page eLeague dans la section "Rejoins la Communauté". Laissez vide les champs que vous ne souhaitez pas afficher.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Facebook className="w-5 h-5 text-blue-600" />
              Facebook
            </label>
            <input
              type="url"
              value={socialMedia.facebook || ''}
              onChange={(e) => handleChange('facebook', e.target.value)}
              placeholder="https://facebook.com/votrepage"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Twitter className="w-5 h-5 text-sky-500" />
              Twitter / X
            </label>
            <input
              type="url"
              value={socialMedia.twitter || ''}
              onChange={(e) => handleChange('twitter', e.target.value)}
              placeholder="https://twitter.com/votrepage"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Instagram className="w-5 h-5 text-pink-600" />
              Instagram
            </label>
            <input
              type="url"
              value={socialMedia.instagram || ''}
              onChange={(e) => handleChange('instagram', e.target.value)}
              placeholder="https://instagram.com/votrepage"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Youtube className="w-5 h-5 text-red-600" />
              YouTube
            </label>
            <input
              type="url"
              value={socialMedia.youtube || ''}
              onChange={(e) => handleChange('youtube', e.target.value)}
              placeholder="https://youtube.com/@votrepage"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MessageCircle className="w-5 h-5 text-indigo-600" />
              Discord
            </label>
            <input
              type="url"
              value={socialMedia.discord || ''}
              onChange={(e) => handleChange('discord', e.target.value)}
              placeholder="https://discord.gg/votreinvitation"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu des liens</h3>
          <div className="space-y-2 text-sm text-gray-600">
            {socialMedia.facebook && (
              <div className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-blue-600" />
                <span>Facebook: </span>
                <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {socialMedia.facebook}
                </a>
              </div>
            )}
            {socialMedia.twitter && (
              <div className="flex items-center gap-2">
                <Twitter className="w-4 h-4 text-sky-500" />
                <span>Twitter: </span>
                <a href={socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {socialMedia.twitter}
                </a>
              </div>
            )}
            {socialMedia.instagram && (
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Instagram: </span>
                <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {socialMedia.instagram}
                </a>
              </div>
            )}
            {socialMedia.youtube && (
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-600" />
                <span>YouTube: </span>
                <a href={socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {socialMedia.youtube}
                </a>
              </div>
            )}
            {socialMedia.discord && (
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-indigo-600" />
                <span>Discord: </span>
                <a href={socialMedia.discord} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {socialMedia.discord}
                </a>
              </div>
            )}
            {!socialMedia.facebook && !socialMedia.twitter && !socialMedia.instagram && !socialMedia.youtube && !socialMedia.discord && (
              <p className="text-gray-400 italic">Aucun lien configuré</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaAdminPage;
