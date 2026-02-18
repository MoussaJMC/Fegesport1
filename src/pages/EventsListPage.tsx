import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Users, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import EventCard from '../components/events/EventCard';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string;
  category: string;
  type: string;
  status: string;
  max_participants?: number;
  current_participants?: number;
  translations?: any;
}

const EventsListPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('upcoming');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchEvents();
  }, [selectedStatus]);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, selectedCategory]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      let query = supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (selectedStatus === 'upcoming') {
        query = query
          .gte('date', today)
          .not('status', 'eq', 'completed')
          .not('status', 'eq', 'cancelled');
      } else if (selectedStatus === 'past') {
        query = query.lt('date', today);
      } else if (selectedStatus === 'all') {
        // No filter
      } else {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      setEvents(data || []);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data?.map((event) => event.category).filter(Boolean))
      ) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((event) => {
        const title = event.translations?.[i18n.language]?.title || event.title;
        const description = event.translations?.[i18n.language]?.description || event.description;
        const location = event.location;

        return (
          title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((event) => event.category === selectedCategory);
    }

    setFilteredEvents(filtered);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const mapEvent = (event: Event): any => ({
    id: event.id,
    title: event.translations?.[i18n.language]?.title || event.title,
    description: event.translations?.[i18n.language]?.description || event.description,
    date: event.date,
    formattedDate: formatDate(event.date),
    time: event.time,
    location: event.location,
    image: event.image_url || 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
    category: event.category,
    type: (event.type === 'online' || event.type === 'in-person' || event.type === 'hybrid')
      ? event.type as 'online' | 'in-person' | 'hybrid'
      : undefined,
    maxParticipants: event.max_participants,
    currentParticipants: event.current_participants,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-900 py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('home.events.title')}
          </h1>
          <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Découvrez tous nos événements sportifs, compétitions et rencontres
          </p>
        </div>

        {/* Filters */}
        <div className="bg-secondary-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
              >
                <option value="upcoming">À venir</option>
                <option value="past">Passés</option>
                <option value="all">Tous</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={mapEvent(event)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gradient-to-br from-green-900/50 to-blue-900/50 rounded-lg shadow-xl border-2 border-green-600">
            <div className="max-w-2xl mx-auto px-6">
              <div className="bg-secondary-800 rounded-full w-24 h-24 mx-auto flex items-center justify-center shadow-lg mb-6 border-2 border-green-500">
                <Calendar className="h-12 w-12 text-green-400" />
              </div>

              <h3 className="text-3xl font-bold text-white mb-3">
                Période de vacances
              </h3>

              <div className="space-y-4 text-gray-200">
                <p className="text-xl font-medium">
                  Les activités sportives sont actuellement en pause
                </p>

                <div className="bg-secondary-800/80 rounded-lg p-6 shadow-sm border border-green-600">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center text-3xl border-2 border-green-500">
                      🌙
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">Mois sacré du Ramadan</p>
                      <p className="text-sm text-gray-300">Période de jeûne et de recueillement</p>
                    </div>
                  </div>

                  <p className="text-base leading-relaxed">
                    Nous respectons cette période importante pour notre communauté.
                    Tous les tournois, compétitions et événements sportifs reprendront
                    après la fin du Ramadan.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-6 shadow-md">
                  <p className="font-semibold text-xl mb-2">
                    📅 Reprise prochaine des activités
                  </p>
                  <p className="text-base">
                    Le calendrier complet des tournois et événements sera publié
                    dès la fin du mois de Ramadan. Restez connectés !
                  </p>
                </div>

                <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>En attente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Planification en cours</span>
                  </div>
                </div>

                {(searchTerm || selectedCategory !== 'all') && (
                  <p className="text-sm text-gray-400 mt-6 pt-6 border-t border-gray-700">
                    Aucun événement ne correspond à vos critères de recherche.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsListPage;
