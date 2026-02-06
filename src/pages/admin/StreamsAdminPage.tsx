import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, Search, Filter, Video, Twitch, Youtube, Calendar, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface Stream {
  id: string;
  title: string;
  platform: 'youtube' | 'twitch';
  stream_id: string;
  description?: string;
  is_live: boolean;
  scheduled_for?: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

const StreamsAdminPage: React.FC = () => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [formData, setFormData] = useState<{
    title: string;
    platform: 'youtube' | 'twitch';
    stream_id: string;
    description: string;
    is_live: boolean;
    scheduled_for: string;
    thumbnail_url: string;
  }>({
    title: '',
    platform: 'youtube',
    stream_id: '',
    description: '',
    is_live: false,
    scheduled_for: '',
    thumbnail_url: ''
  });

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('streams')
        .select('*')
        .order('is_live', { ascending: false })
        .order('scheduled_for', { ascending: true });

      if (error) {
        console.error('Error fetching streams:', error);
        // If table doesn't exist or other error, use mock data
        setStreams(getMockStreams());
      } else if (data && data.length > 0) {
        setStreams(data);
      } else {
        // No data found, use mock data
        setStreams(getMockStreams());
      }
    } catch (error) {
      console.error('Error in fetchStreams:', error);
      setStreams(getMockStreams());
    } finally {
      setLoading(false);
    }
  };

  const getMockStreams = (): Stream[] => {
    return [
      {
        id: '1',
        title: 'Tournoi FIFA 25 - Quarts de finale',
        platform: 'youtube',
        stream_id: 'jfKfPfyJRdk',
        description: 'Suivez en direct les quarts de finale du tournoi FIFA 25 organisé par la FEGESPORT.',
        is_live: true,
        thumbnail_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: '2',
        title: 'PUBG Mobile Championship - Jour 2',
        platform: 'twitch',
        stream_id: 'esl_pubgmobile',
        description: 'Deuxième journée du championnat PUBG Mobile avec les meilleures équipes guinéennes.',
        is_live: false,
        scheduled_for: '2025-07-15T18:00:00Z',
        thumbnail_url: 'https://images.pexels.com/photos/159393/gamepad-video-game-controller-game-controller-controller-159393.jpeg',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: '3',
        title: 'Conférence: L\'avenir de l\'esport en Guinée',
        platform: 'youtube',
        stream_id: 'dQw4w9WgXcQ',
        description: 'Conférence avec les acteurs majeurs de l\'esport guinéen sur les perspectives d\'avenir.',
        is_live: false,
        scheduled_for: '2025-07-20T16:30:00Z',
        thumbnail_url: 'https://images.pexels.com/photos/7862508/pexels-photo-7862508.jpeg',
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      }
    ];
  };

  const deleteStream = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce stream ?')) {
      return;
    }

    try {
      // Check if we're using real data or mock data
      const isRealData = streams.length > 0 && streams[0].id !== '1';
      
      if (isRealData) {
        const { error } = await supabase
          .from('streams')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }
      
      // Update local state regardless
      setStreams(streams.filter(stream => stream.id !== id));
      toast.success('Stream supprimé avec succès');
    } catch (error) {
      console.error('Error deleting stream:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleLiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      // Check if we're using real data or mock data
      const isRealData = streams.length > 0 && streams[0].id !== '1';
      
      if (isRealData) {
        const { error } = await supabase
          .from('streams')
          .update({ is_live: !currentStatus })
          .eq('id', id);

        if (error) throw error;
      }
      
      // Update local state regardless
      setStreams(streams.map(stream => 
        stream.id === id 
          ? { ...stream, is_live: !currentStatus } 
          : stream
      ));
      
      toast.success(`Stream marqué comme ${!currentStatus ? 'en direct' : 'hors ligne'}`);
    } catch (error) {
      console.error('Error updating stream status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Check if we're using real data or mock data
      const isRealData = streams.length > 0 && streams[0].id !== '1';
      
      if (isRealData) {
        if (editingStream) {
          // Update existing stream
          const { error } = await supabase
            .from('streams')
            .update({
              title: formData.title,
              platform: formData.platform,
              stream_id: formData.stream_id,
              description: formData.description || null,
              is_live: formData.is_live,
              scheduled_for: formData.scheduled_for || null,
              thumbnail_url: formData.thumbnail_url || null
            })
            .eq('id', editingStream.id);

          if (error) throw error;
        } else {
          // Create new stream
          const { error } = await supabase
            .from('streams')
            .insert([{
              title: formData.title,
              platform: formData.platform,
              stream_id: formData.stream_id,
              description: formData.description || null,
              is_live: formData.is_live,
              scheduled_for: formData.scheduled_for || null,
              thumbnail_url: formData.thumbnail_url || null
            }]);

          if (error) throw error;
        }
      } else {
        // Using mock data, just update the local state
        if (editingStream) {
          setStreams(streams.map(stream => 
            stream.id === editingStream.id 
              ? { 
                  ...stream, 
                  title: formData.title,
                  platform: formData.platform,
                  stream_id: formData.stream_id,
                  description: formData.description,
                  is_live: formData.is_live,
                  scheduled_for: formData.scheduled_for,
                  thumbnail_url: formData.thumbnail_url,
                  updated_at: new Date().toISOString()
                } 
              : stream
          ));
        } else {
          const newStream: Stream = {
            id: `mock-${Date.now()}`,
            title: formData.title,
            platform: formData.platform,
            stream_id: formData.stream_id,
            description: formData.description,
            is_live: formData.is_live,
            scheduled_for: formData.scheduled_for,
            thumbnail_url: formData.thumbnail_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setStreams([newStream, ...streams]);
        }
      }
      
      toast.success(`Stream ${editingStream ? 'mis à jour' : 'créé'} avec succès`);
      setShowForm(false);
      setEditingStream(null);
      resetForm();
      
      // Refresh data if using real data
      if (isRealData) {
        fetchStreams();
      }
    } catch (error) {
      console.error('Error saving stream:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (stream: Stream) => {
    setFormData({
      title: stream.title,
      platform: stream.platform,
      stream_id: stream.stream_id,
      description: stream.description || '',
      is_live: stream.is_live,
      scheduled_for: stream.scheduled_for || '',
      thumbnail_url: stream.thumbnail_url || ''
    });
    setEditingStream(stream);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      platform: 'youtube',
      stream_id: '',
      description: '',
      is_live: false,
      scheduled_for: '',
      thumbnail_url: ''
    });
  };

  const filteredStreams = streams.filter(stream => {
    const matchesSearch = stream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stream.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = !filterPlatform || stream.platform === filterPlatform;
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'live' && stream.is_live) ||
                         (filterStatus === 'scheduled' && !stream.is_live);
    
    return matchesSearch && matchesPlatform && matchesStatus;
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Streams</h1>
          <p className="text-gray-600">Gérer les streams YouTube et Twitch pour la page DIRECT</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingStream(null);
            setShowForm(true);
          }}
          className="btn bg-primary-600 hover:bg-primary-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Stream
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{streams.length}</div>
          <div className="text-sm text-gray-600">Total Streams</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">
            {streams.filter(s => s.platform === 'youtube').length}
          </div>
          <div className="text-sm text-gray-600">YouTube</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">
            {streams.filter(s => s.platform === 'twitch').length}
          </div>
          <div className="text-sm text-gray-600">Twitch</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {streams.filter(s => s.is_live).length}
          </div>
          <div className="text-sm text-gray-600">En Direct</div>
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
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Toutes les plateformes</option>
            <option value="youtube">YouTube</option>
            <option value="twitch">Twitch</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Tous les statuts</option>
            <option value="live">En direct</option>
            <option value="scheduled">Programmé</option>
          </select>

          <div className="flex items-center text-sm text-gray-500">
            <Filter className="mr-2" size={16} />
            {filteredStreams.length} résultat(s)
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingStream ? 'Modifier le stream' : 'Nouveau stream'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingStream(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plateforme
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value as 'youtube' | 'twitch' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="twitch">Twitch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.platform === 'youtube' ? 'ID de vidéo, ID de chaîne ou URL YouTube' : 'Nom de la chaîne Twitch'}
                    </label>
                    <div className="relative">
                      {formData.platform === 'youtube' ? (
                        <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      ) : (
                        <Twitch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      )}
                      <input
                        type="text"
                        value={formData.stream_id}
                        onChange={(e) => setFormData({ ...formData, stream_id: e.target.value })}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder={formData.platform === 'youtube' ? 'UCrqM0rNeu8-tK2fKiKwlxTQ (ID de chaîne)' : 'fegesport'}
                        required
                      />
                    </div>
                    {formData.platform === 'youtube' ? (
                      <div className="mt-2 space-y-3">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-xs font-bold text-green-900 mb-2">✅ Pour intégrer le live de votre chaîne:</p>
                          <p className="text-xs text-green-800 mb-2">
                            Utilisez l'<strong>ID de chaîne</strong> (commence par UC) pour afficher automatiquement le live en cours de votre chaîne.
                          </p>
                          <p className="text-xs text-green-700">
                            Exemple: <strong>UCrqM0rNeu8-tK2fKiKwlxTQ</strong>
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-xs font-medium text-blue-900 mb-2">Autres formats acceptés:</p>
                          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                            <li><strong>ID de vidéo live spécifique</strong>: jfKfPfyJRdk</li>
                            <li><strong>URL complète</strong>: https://www.youtube.com/watch?v=jfKfPfyJRdk</li>
                            <li><strong>URL courte</strong>: https://youtu.be/jfKfPfyJRdk</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-xs font-medium text-yellow-900 mb-1">Format non supporté:</p>
                          <p className="text-xs text-yellow-800">
                            <strong>Handle</strong> (@...): @fegesporttv7126 - Utilisez plutôt l'ID de chaîne (UC...)
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">
                        Exemple: Pour https://www.twitch.tv/fegesport, entrez fegesport
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de la miniature
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.thumbnail_url && (
                    <div className="mt-2">
                      <img 
                        src={formData.thumbnail_url} 
                        alt="Aperçu" 
                        className="h-24 w-auto object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/320x180?text=Miniature+non+disponible';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_live"
                      checked={formData.is_live}
                      onChange={(e) => setFormData({ ...formData, is_live: e.target.checked })}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="is_live" className="ml-2 text-sm text-gray-700">
                      En direct maintenant
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date programmée
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_for}
                      onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      disabled={formData.is_live}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingStream(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {editingStream ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Streams List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stream
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plateforme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID / Chaîne
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
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
              {filteredStreams.map((stream, index) => (
                <motion.tr
                  key={stream.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-16 w-24 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={stream.thumbnail_url || 'https://via.placeholder.com/240x160?text=No+Thumbnail'} 
                          alt={stream.title} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/240x160?text=No+Thumbnail';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{stream.title}</div>
                        {stream.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{stream.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {stream.platform === 'youtube' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Youtube size={12} className="mr-1" />
                        YouTube
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Twitch size={12} className="mr-1" />
                        Twitch
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">{stream.stream_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {stream.is_live ? (
                      <span className="text-sm text-gray-900">En cours</span>
                    ) : stream.scheduled_for ? (
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1 text-gray-500" />
                          {format(new Date(stream.scheduled_for), 'PPP', { locale: fr })}
                        </div>
                        <div className="flex items-center mt-1">
                          <Clock size={14} className="mr-1 text-gray-500" />
                          {format(new Date(stream.scheduled_for), 'HH:mm', { locale: fr })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Non programmé</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleLiveStatus(stream.id, stream.is_live)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        stream.is_live 
                          ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {stream.is_live ? 'En direct' : 'Hors ligne'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          const url = stream.platform === 'youtube'
                            ? stream.stream_id.startsWith('UC')
                              ? `https://www.youtube.com/channel/${stream.stream_id}/live`
                              : `https://www.youtube.com/watch?v=${stream.stream_id}`
                            : `https://www.twitch.tv/${stream.stream_id}`;
                          window.open(url, '_blank');
                        }}
                        className="p-1 text-primary-600 hover:text-primary-900"
                        title="Voir le stream"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEdit(stream)}
                        className="p-1 text-blue-600 hover:text-blue-900"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => deleteStream(stream.id)}
                        className="p-1 text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredStreams.length === 0 && (
          <div className="text-center py-12">
            <Video className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun stream</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterPlatform || filterStatus
                ? 'Aucun stream ne correspond à vos critères de recherche.'
                : 'Commencez par ajouter votre premier stream.'
              }
            </p>
            {!searchTerm && !filterPlatform && !filterStatus && (
              <div className="mt-6">
                <button
                  onClick={() => {
                    resetForm();
                    setEditingStream(null);
                    setShowForm(true);
                  }}
                  className="btn bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un stream
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Implementation Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-blue-800">
          Guide d'Implémentation
        </h2>
        <div className="space-y-4 text-blue-700">
          <div>
            <h3 className="font-medium">1. Structure de la table</h3>
            <p className="text-sm mt-1">
              Pour implémenter cette fonctionnalité en production, créez une table <code>streams</code> avec les champs suivants :
            </p>
            <pre className="bg-blue-100 p-2 rounded text-xs mt-2 overflow-auto">
{`CREATE TABLE streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'twitch')),
  stream_id TEXT NOT NULL,
  description TEXT,
  is_live BOOLEAN DEFAULT FALSE,
  scheduled_for TIMESTAMPTZ,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`}
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium">2. Intégration YouTube</h3>
            <p className="text-sm mt-1">
              Pour les streams YouTube, vous avez deux options :
            </p>
            <ul className="text-sm mt-2 ml-4 space-y-1">
              <li><strong>Vidéo spécifique :</strong> Utilisez l'ID de la vidéo (ex: dQw4w9WgXcQ pour https://www.youtube.com/watch?v=dQw4w9WgXcQ)</li>
              <li><strong>Live de chaîne :</strong> Utilisez l'ID de la chaîne qui commence par UC (ex: UCrqM0rNeu8-tK2fKiKwlxTQ). Le système affichera automatiquement le stream en direct de la chaîne.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium">3. Intégration Twitch</h3>
            <p className="text-sm mt-1">
              Pour les streams Twitch, vous devez fournir le nom de la chaîne.
              Par exemple, pour <code>https://www.twitch.tv/fegesport</code>, le nom de la chaîne est <code>fegesport</code>.
            </p>
            <p className="text-sm mt-1">
              <strong>Important:</strong> Pour que l'intégration Twitch fonctionne, vous devez ajouter votre domaine dans les paramètres d'intégration de Twitch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamsAdminPage;