import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Twitch, Youtube, RefreshCw, ExternalLink, Calendar, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Stream {
  id: string;
  title: string;
  platform: 'youtube' | 'twitch';
  stream_id: string;
  description?: string;
  is_live: boolean;
  scheduled_for?: string;
  thumbnail_url?: string;
}

const DirectPage: React.FC = () => {
  const { t } = useTranslation();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStream, setActiveStream] = useState<Stream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('streams')
        .select('*')
        .order('is_live', { ascending: false })
        .order('scheduled_for', { ascending: true });
      
      if (error) {
        console.error('Error fetching streams:', error);
        // Use mock data if there's an error
        const mockStreams = getMockStreams();
        setStreams(mockStreams);
        setActiveStream(mockStreams.find(s => s.is_live) || mockStreams[0]);
      } else if (data && data.length > 0) {
        setStreams(data);
        setActiveStream(data.find(s => s.is_live) || data[0]);
      } else {
        // No data found, use mock data
        const mockStreams = getMockStreams();
        setStreams(mockStreams);
        setActiveStream(mockStreams.find(s => s.is_live) || mockStreams[0]);
      }
    } catch (error) {
      console.error('Error in fetchStreams:', error);
      setError('Une erreur est survenue lors du chargement des streams');
      // Use mock data on error
      const mockStreams = getMockStreams();
      setStreams(mockStreams);
      setActiveStream(mockStreams.find(s => s.is_live) || mockStreams[0]);
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
        thumbnail_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg'
      },
      {
        id: '2',
        title: 'PUBG Mobile Championship - Jour 2',
        platform: 'twitch',
        stream_id: 'esl_pubgmobile',
        description: 'Deuxième journée du championnat PUBG Mobile avec les meilleures équipes guinéennes.',
        is_live: false,
        scheduled_for: '2025-07-15T18:00:00Z',
        thumbnail_url: 'https://images.pexels.com/photos/159393/gamepad-video-game-controller-game-controller-controller-159393.jpeg'
      },
      {
        id: '3',
        title: 'Conférence: L\'avenir de l\'esport en Guinée',
        platform: 'youtube',
        stream_id: 'dQw4w9WgXcQ',
        description: 'Conférence avec les acteurs majeurs de l\'esport guinéen sur les perspectives d\'avenir.',
        is_live: false,
        scheduled_for: '2025-07-20T16:30:00Z',
        thumbnail_url: 'https://images.pexels.com/photos/7862508/pexels-photo-7862508.jpeg'
      }
    ];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderEmbed = (stream: Stream) => {
    if (stream.platform === 'youtube') {
      let embedUrl: string;
      const streamId = stream.stream_id.trim();

      if (streamId.startsWith('UC') || streamId.startsWith('@')) {
        return (
          <div className="w-full aspect-video bg-secondary-700 rounded-lg flex flex-col items-center justify-center p-8 text-center">
            <Youtube className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-white text-lg font-semibold mb-2">Stream non disponible en intégration</p>
            <p className="text-gray-300 mb-4">
              YouTube ne permet pas l'intégration directe des live streams de chaîne.
            </p>
            <a
              href={
                streamId.startsWith('UC')
                  ? `https://www.youtube.com/channel/${streamId}/live`
                  : `https://www.youtube.com/${streamId}/live`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Youtube className="w-5 h-5 mr-2" />
              Voir sur YouTube
            </a>
            <p className="text-gray-400 text-sm mt-4">
              Conseil: Utilisez l'ID de la vidéo live spécifique dans les paramètres pour l'intégrer ici
            </p>
          </div>
        );
      } else if (streamId.includes('youtube.com/watch?v=')) {
        const videoId = streamId.split('v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&enablejsapi=1`;
      } else if (streamId.includes('youtu.be/')) {
        const videoId = streamId.split('youtu.be/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&enablejsapi=1`;
      } else {
        embedUrl = `https://www.youtube.com/embed/${streamId}?autoplay=1&modestbranding=1&rel=0&enablejsapi=1`;
      }

      return (
        <iframe
          src={embedUrl}
          className="w-full aspect-video rounded-lg"
          title={stream.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        ></iframe>
      );
    } else if (stream.platform === 'twitch') {
      return (
        <iframe
          src={`https://player.twitch.tv/?channel=${stream.stream_id}&parent=${window.location.hostname}&autoplay=true`}
          className="w-full aspect-video rounded-lg"
          title={stream.title}
          frameBorder="0"
          allowFullScreen
        ></iframe>
      );
    }

    return (
      <div className="w-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-white">Stream non disponible</p>
      </div>
    );
  };

  return (
    <div className="pt-20 min-h-screen bg-secondary-900">
      {/* Hero Section */}
      <section className="bg-primary-700 text-white py-12">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">DIRECT</h1>
            <p className="text-xl">
              Suivez en direct les compétitions et événements de la FEGESPORT
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section bg-secondary-800">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Stream */}
            <div className="lg:col-span-2 space-y-6">
              {loading ? (
                <div className="w-full aspect-video bg-secondary-700 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-12 h-12 text-primary-500 animate-spin" />
                </div>
              ) : error ? (
                <div className="w-full aspect-video bg-secondary-700 rounded-lg flex items-center justify-center">
                  <p className="text-white">{error}</p>
                </div>
              ) : activeStream ? (
                <>
                  {renderEmbed(activeStream)}
                  
                  <div className="bg-secondary-700 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{activeStream.title}</h2>
                        {activeStream.is_live && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5 animate-pulse"></span>
                            EN DIRECT
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {activeStream.platform === 'youtube' && (
                          <a
                            href={
                              activeStream.stream_id.startsWith('UC')
                                ? `https://www.youtube.com/channel/${activeStream.stream_id}/live`
                                : activeStream.stream_id.startsWith('@')
                                ? `https://www.youtube.com/${activeStream.stream_id}/live`
                                : activeStream.stream_id.includes('youtube.com')
                                ? activeStream.stream_id
                                : `https://www.youtube.com/watch?v=${activeStream.stream_id}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                            title="Voir sur YouTube"
                          >
                            <Youtube size={20} />
                          </a>
                        )}
                        {activeStream.platform === 'twitch' && (
                          <a
                            href={`https://www.twitch.tv/${activeStream.stream_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700"
                            title="Voir sur Twitch"
                          >
                            <Twitch size={20} />
                          </a>
                        )}
                      </div>
                    </div>
                    
                    {activeStream.description && (
                      <p className="text-gray-300 mt-4">{activeStream.description}</p>
                    )}
                    
                    {!activeStream.is_live && activeStream.scheduled_for && (
                      <div className="mt-4 bg-secondary-600 p-4 rounded-lg">
                        <p className="text-white font-medium">Programmé pour:</p>
                        <div className="flex items-center space-x-4 mt-2 text-gray-300">
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-1.5" />
                            {formatDate(activeStream.scheduled_for)}
                          </div>
                          <div className="flex items-center">
                            <Clock size={16} className="mr-1.5" />
                            {formatTime(activeStream.scheduled_for)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full aspect-video bg-secondary-700 rounded-lg flex items-center justify-center">
                  <p className="text-white">Aucun stream disponible</p>
                </div>
              )}
            </div>
            
            {/* Sidebar - Upcoming & Recent Streams */}
            <div className="space-y-6">
              <div className="bg-secondary-700 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Streams</h3>
                  <button 
                    onClick={fetchStreams}
                    className="p-2 bg-secondary-600 rounded-full hover:bg-secondary-500 text-white"
                    title="Actualiser"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
                
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-24 bg-secondary-600 rounded-lg mb-2"></div>
                        <div className="h-4 bg-secondary-600 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-secondary-600 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : streams.length > 0 ? (
                  <div className="space-y-4">
                    {streams.map(stream => (
                      <motion.div
                        key={stream.id}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className={`bg-secondary-600 rounded-lg overflow-hidden cursor-pointer ${
                          activeStream?.id === stream.id ? 'ring-2 ring-primary-500' : ''
                        }`}
                        onClick={() => setActiveStream(stream)}
                      >
                        <div className="relative h-24">
                          <img 
                            src={stream.thumbnail_url || 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg'} 
                            alt={stream.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                          {stream.is_live && (
                            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center">
                              <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></span>
                              LIVE
                            </div>
                          )}
                          {stream.platform === 'youtube' && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white p-1 rounded">
                              <Youtube size={14} />
                            </div>
                          )}
                          {stream.platform === 'twitch' && (
                            <div className="absolute top-2 left-2 bg-purple-600 text-white p-1 rounded">
                              <Twitch size={14} />
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2 right-2">
                            <h4 className="text-white text-sm font-medium truncate">{stream.title}</h4>
                          </div>
                        </div>
                        
                        {!stream.is_live && stream.scheduled_for && (
                          <div className="p-2 text-xs text-gray-300 flex items-center">
                            <Calendar size={12} className="mr-1" />
                            {formatDate(stream.scheduled_for)} - {formatTime(stream.scheduled_for)}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">Aucun stream disponible</p>
                )}
              </div>
              
              <div className="bg-secondary-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Chaînes Officielles</h3>
                <div className="space-y-4">
                  <a
                    href="https://www.youtube.com/@fegesporttv7126"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-secondary-600 rounded-lg hover:bg-secondary-500 transition-colors"
                  >
                    <div className="flex items-center">
                      <Youtube className="text-red-500 mr-3" size={24} />
                      <span className="text-white">FEGESPORT TV</span>
                    </div>
                    <ExternalLink size={16} className="text-gray-400" />
                  </a>

                  <a
                    href="https://www.twitch.tv/fegesport"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-secondary-600 rounded-lg hover:bg-secondary-500 transition-colors"
                  >
                    <div className="flex items-center">
                      <Twitch className="text-purple-500 mr-3" size={24} />
                      <span className="text-white">Twitch FEGESPORT</span>
                    </div>
                    <ExternalLink size={16} className="text-gray-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DirectPage;