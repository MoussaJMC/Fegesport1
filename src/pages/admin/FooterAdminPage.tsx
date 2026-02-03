import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Save, RefreshCw, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContactInfo {
  address: string;
  postal_code: string;
  email: string;
  phone: string;
  social_media: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
  };
}

const FooterAdminPage = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: '',
    postal_code: '',
    email: '',
    phone: '',
    social_media: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'contact_info')
        .single();

      if (error) throw error;

      if (data) {
        setContactInfo(data.setting_value as ContactInfo);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      toast.error('Erreur lors du chargement des informations de contact');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ setting_value: contactInfo })
        .eq('setting_key', 'contact_info');

      if (error) throw error;

      toast.success('Informations du footer enregistrées avec succès');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving contact info:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSocialMediaChange = (platform: keyof ContactInfo['social_media'], value: string) => {
    setContactInfo(prev => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [platform]: value
      }
    }));
    setHasChanges(true);
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion du Footer</h1>
          <p className="text-gray-600 mt-2">
            Modifiez les informations de contact et les liens des réseaux sociaux
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchContactInfo}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
        >
          <p className="text-yellow-800 text-sm">
            Vous avez des modifications non enregistrées. N'oubliez pas de sauvegarder.
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Informations de Contact
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="contact@fegesport224.org"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Téléphone
              </label>
              <input
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+224 625878764"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Adresse
              </label>
              <input
                type="text"
                value={contactInfo.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Conakry, Guinée"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code Postal
              </label>
              <input
                type="text"
                value={contactInfo.postal_code}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="BP 12345"
              />
            </div>
          </div>
        </motion.div>

        {/* Social Media */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Réseaux Sociaux
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Facebook className="w-4 h-4 inline mr-2 text-blue-600" />
                Facebook
              </label>
              <input
                type="url"
                value={contactInfo.social_media.facebook}
                onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://facebook.com/fegesport"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Twitter className="w-4 h-4 inline mr-2 text-sky-500" />
                Twitter / X
              </label>
              <input
                type="url"
                value={contactInfo.social_media.twitter}
                onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://twitter.com/fegesport"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Instagram className="w-4 h-4 inline mr-2 text-pink-600" />
                Instagram
              </label>
              <input
                type="url"
                value={contactInfo.social_media.instagram}
                onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://instagram.com/fegesport"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Youtube className="w-4 h-4 inline mr-2 text-red-600" />
                YouTube
              </label>
              <input
                type="url"
                value={contactInfo.social_media.youtube}
                onChange={(e) => handleSocialMediaChange('youtube', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://youtube.com/fegesport"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-gray-900 text-white rounded-lg shadow-md p-6"
      >
        <h2 className="text-xl font-semibold mb-6">Aperçu du Footer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Contact</h3>
            <div className="text-gray-300 space-y-1">
              <p>{contactInfo.address || 'Adresse non définie'}</p>
              {contactInfo.postal_code && <p>{contactInfo.postal_code}</p>}
              {contactInfo.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {contactInfo.email}
                </p>
              )}
              {contactInfo.phone && <p>{contactInfo.phone}</p>}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Suivez-nous</h3>
            <div className="flex gap-3">
              {contactInfo.social_media.facebook && (
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <Facebook className="w-4 h-4" />
                </div>
              )}
              {contactInfo.social_media.twitter && (
                <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center">
                  <Twitter className="w-4 h-4" />
                </div>
              )}
              {contactInfo.social_media.instagram && (
                <div className="w-8 h-8 bg-pink-600 rounded flex items-center justify-center">
                  <Instagram className="w-4 h-4" />
                </div>
              )}
              {contactInfo.social_media.youtube && (
                <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                  <Youtube className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FooterAdminPage;
