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
          <div className="text-center py-12">
            <Calendar className="mx-auto mb-4 text-gray-500" size={64} />
            <h3 className="text-xl font-semibold text-white mb-2">
              Aucun événement trouvé
            </h3>
            <p className="text-gray-400">
              {searchTerm || selectedCategory !== 'all'
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Aucun événement disponible pour le moment'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsListPage;
