import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import {
  Plus, Edit, Trash2, Eye, Search, Calendar as CalendarIcon,
  MapPin, Users, Clock, DollarSign, Check, X, TrendingUp,
  AlertCircle, Copy, Share2
} from 'lucide-react';
import { format, isPast, isFuture, addDays, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import EventFormBilingual from '../../components/admin/EventFormBilingual';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location: string;
  image_url?: string;
  category: string;
  type: 'online' | 'in-person' | 'hybrid';
  max_participants?: number;
  current_participants?: number;
  price?: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  translations?: any;
}

type SortField = 'date' | 'title' | 'participants' | 'created_at';
type SortOrder = 'asc' | 'desc';

const UpcomingEventsAdminPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterTimeRange, setFilterTimeRange] = useState('all');
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Événement supprimé avec succès');
      fetchUpcomingEvents();
      setSelectedEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const duplicateEvent = async (event: Event) => {
    try {
      const { id, created_at, updated_at, ...eventData } = event;
      const newEvent = {
        ...eventData,
        title: `${event.title} (Copie)`,
        current_participants: 0,
      };

      const { error } = await supabase
        .from('events')
        .insert([newEvent]);

      if (error) throw error;
      toast.success('Événement dupliqué avec succès');
      fetchUpcomingEvents();
    } catch (error) {
      console.error('Error duplicating event:', error);
      toast.error('Erreur lors de la duplication');
    }
  };

  const startEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'ongoing' })
        .eq('id', id);

      if (error) throw error;
      toast.success('Événement démarré');
      fetchUpcomingEvents();
    } catch (error: any) {
      console.error('Error starting event:', error);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const cancelEvent = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cet événement ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
      toast.success('Événement annulé');
      fetchUpcomingEvents();
    } catch (error: any) {
      console.error('Error cancelling event:', error);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const bulkDelete = async () => {
    if (selectedEvents.size === 0) {
      toast.error('Aucun événement sélectionné');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedEvents.size} événement(s) ?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .in('id', Array.from(selectedEvents));

      if (error) throw error;
      toast.success(`${selectedEvents.size} événement(s) supprimé(s)`);
      setSelectedEvents(new Set());
      fetchUpcomingEvents();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast.error('Erreur lors de la suppression groupée');
    }
  };

  const toggleSelectAll = () => {
    if (selectedEvents.size === filteredEvents.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(filteredEvents.map(e => e.id)));
    }
  };

  const toggleSelectEvent = (id: string) => {
    setSelectedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEvent(null);
    fetchUpcomingEvents();
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const sortEvents = (events: Event[]) => {
    return [...events].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'participants':
          comparison = (a.current_participants || 0) - (b.current_participants || 0);
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const filterByTimeRange = (event: Event) => {
    const eventDate = new Date(event.date);
    const today = new Date();

    switch (filterTimeRange) {
      case 'week':
        return isWithinInterval(eventDate, {
          start: today,
          end: addDays(today, 7)
        });
      case 'month':
        return isWithinInterval(eventDate, {
          start: today,
          end: addDays(today, 30)
        });
      case 'quarter':
        return isWithinInterval(eventDate, {
          start: today,
          end: addDays(today, 90)
        });
      default:
        return true;
    }
  };

  const filteredEvents = sortEvents(
    events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !filterType || event.type === filterType;
      const matchesTimeRange = filterByTimeRange(event);

      return matchesSearch && matchesType && matchesTimeRange;
    })
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'online': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-person': return 'bg-green-100 text-green-800 border-green-200';
      case 'hybrid': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getParticipationRate = (event: Event) => {
    if (!event.max_participants) return 0;
    return ((event.current_participants || 0) / event.max_participants) * 100;
  };

  const isEventSoon = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const daysUntil = Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7;
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Événements à Venir</h1>
          <p className="text-gray-600">Gérer les événements futurs et planifiés</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn bg-primary-600 hover:bg-primary-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel Événement
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{events.length}</div>
              <div className="text-sm text-gray-600">Total à venir</div>
            </div>
            <CalendarIcon className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {events.filter(e => isEventSoon(e.date)).length}
              </div>
              <div className="text-sm text-gray-600">Cette semaine</div>
            </div>
            <AlertCircle className="text-orange-500" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {events.reduce((acc, e) => acc + (e.current_participants || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Participants inscrits</div>
            </div>
            <Users className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(
                  events.reduce((acc, e) => acc + getParticipationRate(e), 0) /
                  (events.length || 1)
                )}%
              </div>
              <div className="text-sm text-gray-600">Taux de remplissage</div>
            </div>
            <TrendingUp className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par titre, description ou lieu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tous les types</option>
            <option value="online">En ligne</option>
            <option value="in-person">Présentiel</option>
            <option value="hybrid">Hybride</option>
          </select>

          <select
            value={filterTimeRange}
            onChange={(e) => setFilterTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Toutes les dates</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">3 prochains mois</option>
          </select>

          <select
            value={`${sortField}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortField(field as SortField);
              setSortOrder(order as SortOrder);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="date-asc">Date (ancien → récent)</option>
            <option value="date-desc">Date (récent → ancien)</option>
            <option value="title-asc">Titre (A → Z)</option>
            <option value="title-desc">Titre (Z → A)</option>
            <option value="participants-asc">Participants (↑)</option>
            <option value="participants-desc">Participants (↓)</option>
          </select>
        </div>

        {selectedEvents.size > 0 && (
          <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-md">
            <span className="text-sm text-blue-700">
              {selectedEvents.size} événement(s) sélectionné(s)
            </span>
            <button
              onClick={bulkDelete}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Supprimer la sélection
            </button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
              </h2>
              <EventFormBilingual
                initialData={editingEvent || undefined}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowForm(false);
                  setEditingEvent(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`bg-white rounded-lg shadow-sm border ${
              isEventSoon(event.date) ? 'border-orange-300' : 'border-gray-200'
            } overflow-hidden hover:shadow-md transition-shadow`}
          >
            {/* Event Image */}
            {event.image_url && (
              <div className="relative h-48 bg-gray-200">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Image+non+disponible';
                  }}
                />
                {isEventSoon(event.date) && (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <AlertCircle size={14} />
                    Bientôt
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedEvents.has(event.id)}
                    onChange={() => toggleSelectEvent(event.id)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="p-5">
              {/* Title and Category */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {event.title}
                  </h3>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                    {event.category}
                  </span>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getTypeColor(event.type)}`}>
                  {event.type === 'online' ? '🌐 En ligne' :
                   event.type === 'in-person' ? '📍 Présentiel' : '🔄 Hybride'}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {event.description}
              </p>

              {/* Event Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-700">
                  <CalendarIcon className="mr-2 text-gray-400" size={16} />
                  <span className="font-medium">
                    {format(new Date(event.date), 'EEEE d MMMM yyyy', { locale: fr })}
                  </span>
                  {event.time && (
                    <>
                      <Clock className="ml-3 mr-2 text-gray-400" size={16} />
                      <span>{event.time}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-700">
                  <MapPin className="mr-2 text-gray-400" size={16} />
                  <span className="truncate">{event.location}</span>
                </div>

                {event.max_participants && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-700">
                        <Users className="mr-2 text-gray-400" size={16} />
                        <span>
                          {event.current_participants || 0} / {event.max_participants} participants
                        </span>
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {Math.round(getParticipationRate(event))}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          getParticipationRate(event) >= 80
                            ? 'bg-red-500'
                            : getParticipationRate(event) >= 50
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(getParticipationRate(event), 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {event.price !== undefined && event.price > 0 && (
                  <div className="flex items-center text-sm text-gray-700">
                    <DollarSign className="mr-2 text-gray-400" size={16} />
                    <span className="font-semibold">{event.price.toLocaleString()} FCFA</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <button
                  onClick={() => startEvent(event.id)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors flex items-center justify-center gap-1"
                  title="Démarrer l'événement"
                >
                  <Check size={16} />
                  Démarrer
                </button>

                <button
                  onClick={() => handleEdit(event)}
                  className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                  title="Modifier"
                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={() => duplicateEvent(event)}
                  className="px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
                  title="Dupliquer"
                >
                  <Copy size={16} />
                </button>

                {event.image_url && (
                  <button
                    onClick={() => window.open(event.image_url, '_blank')}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                    title="Voir l'image"
                  >
                    <Eye size={16} />
                  </button>
                )}

                <button
                  onClick={() => cancelEvent(event.id)}
                  className="px-3 py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors"
                  title="Annuler"
                >
                  <X size={16} />
                </button>

                <button
                  onClick={() => deleteEvent(event.id)}
                  className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun événement à venir</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterType || filterTimeRange !== 'all'
              ? 'Aucun événement ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre premier événement à venir.'
            }
          </p>
          {!searchTerm && !filterType && filterTimeRange === 'all' && (
            <div className="mt-6">
              <button
                onClick={() => setShowForm(true)}
                className="btn bg-primary-600 hover:bg-primary-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer un événement
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      {filteredEvents.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Affichage de {filteredEvents.length} événement(s) sur {events.length}
        </div>
      )}
    </div>
  );
};

export default UpcomingEventsAdminPage;
