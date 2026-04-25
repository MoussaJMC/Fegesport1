import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import {
  Plus, Edit, Trash2, Eye, Search, Calendar as CalendarIcon,
  MapPin, Users, Clock, DollarSign, Check, X, TrendingUp,
  AlertCircle, Copy, Image as ImageIcon, Loader2
} from 'lucide-react';
import { format, addDays, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import EventFormBilingual from '../../components/admin/EventFormBilingual';
import { AdminPageHeader, EmptyState, StatusBadge } from '../../components/admin/ui';

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
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', today)
        .not('status', 'eq', 'completed')
        .not('status', 'eq', 'cancelled')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Erreur lors du chargement des evenements');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Etes-vous sur de vouloir supprimer cet evenement ?')) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      toast.success('Evenement supprime');
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
      const { error } = await supabase.from('events').insert([newEvent]);
      if (error) throw error;
      toast.success('Evenement duplique');
      fetchUpcomingEvents();
    } catch (error) {
      console.error('Error duplicating event:', error);
      toast.error('Erreur lors de la duplication');
    }
  };

  const startEvent = async (id: string) => {
    try {
      const { error } = await supabase.from('events').update({ status: 'ongoing' }).eq('id', id);
      if (error) throw error;
      toast.success('Evenement demarre');
      fetchUpcomingEvents();
    } catch (error: any) {
      console.error('Error starting event:', error);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const cancelEvent = async (id: string) => {
    if (!confirm('Etes-vous sur de vouloir annuler cet evenement ?')) return;
    try {
      const { error } = await supabase.from('events').update({ status: 'cancelled' }).eq('id', id);
      if (error) throw error;
      toast.success('Evenement annule');
      fetchUpcomingEvents();
    } catch (error: any) {
      console.error('Error cancelling event:', error);
      toast.error(`Erreur: ${error.message}`);
    }
  };

  const bulkDelete = async () => {
    if (selectedEvents.size === 0) {
      toast.error('Aucun evenement selectionne');
      return;
    }
    if (!confirm(`Supprimer ${selectedEvents.size} evenement(s) ?`)) return;
    try {
      const { error } = await supabase.from('events').delete().in('id', Array.from(selectedEvents));
      if (error) throw error;
      toast.success(`${selectedEvents.size} evenement(s) supprime(s)`);
      setSelectedEvents(new Set());
      fetchUpcomingEvents();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast.error('Erreur lors de la suppression groupee');
    }
  };

  const toggleSelectEvent = (id: string) => {
    setSelectedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
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
        case 'date': comparison = new Date(a.date).getTime() - new Date(b.date).getTime(); break;
        case 'title': comparison = a.title.localeCompare(b.title); break;
        case 'participants': comparison = (a.current_participants || 0) - (b.current_participants || 0); break;
        case 'created_at': comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const filterByTimeRange = (event: Event) => {
    const eventDate = new Date(event.date);
    const today = new Date();
    switch (filterTimeRange) {
      case 'week': return isWithinInterval(eventDate, { start: today, end: addDays(today, 7) });
      case 'month': return isWithinInterval(eventDate, { start: today, end: addDays(today, 30) });
      case 'quarter': return isWithinInterval(eventDate, { start: today, end: addDays(today, 90) });
      default: return true;
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

  const getTypeLabel = (type: string): { label: string; emoji: string; color: string } => {
    switch (type) {
      case 'online': return { label: 'En ligne', emoji: '🌐', color: 'bg-accent-blue-500/15 text-accent-blue-400 border-accent-blue-500/30' };
      case 'in-person': return { label: 'Presentiel', emoji: '📍', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'hybrid': return { label: 'Hybride', emoji: '🔄', color: 'bg-fed-gold-500/15 text-fed-gold-500 border-fed-gold-500/30' };
      default: return { label: type, emoji: '•', color: 'bg-dark-700 text-light-400 border-dark-700' };
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
        <Loader2 className="w-12 h-12 animate-spin text-fed-red-500" />
      </div>
    );
  }

  const totalParticipants = events.reduce((acc, e) => acc + (e.current_participants || 0), 0);
  const avgFillRate = Math.round(events.reduce((acc, e) => acc + getParticipationRate(e), 0) / (events.length || 1));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={<CalendarIcon size={20} />}
        title="Evenements a Venir"
        subtitle="Gerer les evenements futurs et planifies"
        publicLink="https://fegesport224.org"
        publicLinkLabel="Voir le site"
        actions={
          <button
            onClick={() => { setEditingEvent(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-fed-red-500 hover:bg-fed-red-600 text-white text-sm font-semibold shadow-lg shadow-fed-red-500/20 transition-all"
          >
            <Plus size={16} />
            Nouvel evenement
          </button>
        }
      />

      {/* === STATS CARDS === */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total a venir', value: events.length, icon: <CalendarIcon size={18} />, accent: 'accent-blue' },
          { label: 'Cette semaine', value: events.filter(e => isEventSoon(e.date)).length, icon: <AlertCircle size={18} />, accent: 'fed-gold' },
          { label: 'Inscrits totaux', value: totalParticipants, icon: <Users size={18} />, accent: 'emerald' },
          { label: 'Taux remplissage', value: `${avgFillRate}%`, icon: <TrendingUp size={18} />, accent: 'fed-red' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="bg-dark-800 border border-dark-700 rounded-xl p-4 hover:border-fed-gold-500/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-lg bg-${stat.accent}-500/10 border border-${stat.accent}-500/20 flex items-center justify-center text-${stat.accent}-${stat.accent === 'emerald' ? '400' : '500'}`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-heading">{stat.value}</div>
            <div className="text-xs text-light-400 uppercase tracking-wider mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* === FILTERS === */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher (titre, description, lieu)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 w-full bg-dark-900 border border-dark-700 rounded-lg text-sm text-light-100 placeholder-light-400 focus:outline-none focus:border-fed-red-500 focus:ring-1 focus:ring-fed-red-500/30"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-sm text-light-100"
          >
            <option value="">Tous les types</option>
            <option value="online">En ligne</option>
            <option value="in-person">Presentiel</option>
            <option value="hybrid">Hybride</option>
          </select>

          <select
            value={filterTimeRange}
            onChange={(e) => setFilterTimeRange(e.target.value)}
            className="px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-sm text-light-100"
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
            className="px-3 py-2 bg-dark-900 border border-dark-700 rounded-lg text-sm text-light-100"
          >
            <option value="date-asc">Date ↑</option>
            <option value="date-desc">Date ↓</option>
            <option value="title-asc">Titre A→Z</option>
            <option value="title-desc">Titre Z→A</option>
            <option value="participants-asc">Participants ↑</option>
            <option value="participants-desc">Participants ↓</option>
          </select>
        </div>

        {selectedEvents.size > 0 && (
          <div className="mt-4 flex items-center justify-between p-3 bg-fed-red-500/10 border border-fed-red-500/20 rounded-lg">
            <span className="text-sm text-fed-red-400 font-semibold">
              {selectedEvents.size} evenement(s) selectionne(s)
            </span>
            <button
              onClick={bulkDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-fed-red-500 hover:bg-fed-red-600 text-white text-xs font-semibold transition-all"
            >
              <Trash2 size={12} /> Supprimer la selection
            </button>
          </div>
        )}
      </div>

      {/* === FORM MODAL === */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowForm(false); setEditingEvent(null); } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-dark-800 border border-dark-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-dark-700">
                  <h2 className="text-lg font-bold text-white font-heading">
                    {editingEvent ? 'Modifier l\'evenement' : 'Nouvel evenement'}
                  </h2>
                  <button
                    onClick={() => { setShowForm(false); setEditingEvent(null); }}
                    className="text-light-400 hover:text-white p-1 rounded-md hover:bg-dark-700"
                  >
                    <X size={20} />
                  </button>
                </div>
                <EventFormBilingual
                  initialData={editingEvent || undefined}
                  onSuccess={handleFormSuccess}
                  onCancel={() => { setShowForm(false); setEditingEvent(null); }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === EVENTS GRID === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredEvents.map((event, index) => {
          const typeInfo = getTypeLabel(event.type);
          const participationRate = getParticipationRate(event);
          const isSoon = isEventSoon(event.date);

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
              className={`bg-dark-800 rounded-xl border overflow-hidden transition-all hover:border-fed-gold-500/40 ${
                isSoon ? 'border-fed-gold-500/40' : 'border-dark-700'
              }`}
            >
              {/* === HEADER (image or gradient) === */}
              <div className="relative h-40 bg-gradient-to-br from-fed-red-500/20 to-fed-gold-500/20 overflow-hidden">
                {event.image_url ? (
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CalendarIcon className="text-light-400/40" size={56} />
                  </div>
                )}

                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent" />

                {/* Top-left: checkbox */}
                <div className="absolute top-3 left-3">
                  <input
                    type="checkbox"
                    checked={selectedEvents.has(event.id)}
                    onChange={() => toggleSelectEvent(event.id)}
                    className="w-4 h-4 rounded accent-fed-red-500 cursor-pointer"
                  />
                </div>

                {/* Top-right: badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                  {isSoon && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-fed-gold-500 text-dark-950 text-[10px] font-bold uppercase tracking-wider">
                      <AlertCircle size={10} /> Bientot
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${typeInfo.color}`}>
                    <span>{typeInfo.emoji}</span> {typeInfo.label}
                  </span>
                </div>

                {/* Bottom: date pill */}
                <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-dark-950/80 backdrop-blur-sm text-white text-xs font-semibold border border-dark-700">
                  <CalendarIcon size={12} className="text-fed-gold-500" />
                  {format(new Date(event.date), 'd MMM yyyy', { locale: fr })}
                  {event.time && (<><Clock size={11} className="ml-1 text-fed-gold-500" />{event.time}</>)}
                </div>
              </div>

              {/* === BODY === */}
              <div className="p-5">
                {/* Title + category */}
                <div className="mb-3">
                  <h3 className="text-base font-bold text-white font-heading mb-1 line-clamp-1">
                    {event.title}
                  </h3>
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-dark-700 text-light-300 rounded">
                    {event.category}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-light-400 mb-4 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-light-300">
                    <MapPin size={14} className="text-light-400 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>

                  {event.max_participants && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2 text-light-300">
                          <Users size={14} className="text-light-400" />
                          <span>{event.current_participants || 0} / {event.max_participants}</span>
                        </div>
                        <span className="font-semibold text-light-300">
                          {Math.round(participationRate)}%
                        </span>
                      </div>
                      <div className="w-full bg-dark-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            participationRate >= 80 ? 'bg-fed-red-500'
                              : participationRate >= 50 ? 'bg-fed-gold-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(participationRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {event.price !== undefined && event.price > 0 && (
                    <div className="flex items-center gap-2 text-light-300">
                      <DollarSign size={14} className="text-fed-gold-500 flex-shrink-0" />
                      <span className="font-semibold">{event.price.toLocaleString()} GNF</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-dark-700">
                  <button
                    onClick={() => startEvent(event.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-all"
                    title="Demarrer l'evenement"
                  >
                    <Check size={13} /> Demarrer
                  </button>
                  <button
                    onClick={() => handleEdit(event)}
                    className="inline-flex items-center justify-center w-9 h-8 rounded-lg bg-accent-blue-500/15 hover:bg-accent-blue-500/30 text-accent-blue-400 transition-all"
                    title="Modifier"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => duplicateEvent(event)}
                    className="inline-flex items-center justify-center w-9 h-8 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 text-purple-400 transition-all"
                    title="Dupliquer"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => cancelEvent(event.id)}
                    className="inline-flex items-center justify-center w-9 h-8 rounded-lg bg-fed-gold-500/15 hover:bg-fed-gold-500/30 text-fed-gold-500 transition-all"
                    title="Annuler"
                  >
                    <X size={14} />
                  </button>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="inline-flex items-center justify-center w-9 h-8 rounded-lg bg-fed-red-500/15 hover:bg-fed-red-500/30 text-fed-red-400 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* === EMPTY STATE — Generique professionnel === */}
      {filteredEvents.length === 0 && (
        <EmptyState
          icon={<CalendarIcon size={28} />}
          title={
            searchTerm || filterType || filterTimeRange !== 'all'
              ? 'Aucun resultat'
              : 'Aucun evenement programme'
          }
          description={
            searchTerm || filterType || filterTimeRange !== 'all'
              ? 'Aucun evenement ne correspond a vos criteres de recherche. Essayez de modifier les filtres.'
              : 'Le calendrier des prochains evenements est actuellement vide. Planifiez le premier evenement de la federation pour commencer.'
          }
          action={
            !searchTerm && !filterType && filterTimeRange === 'all' && (
              <button
                onClick={() => { setEditingEvent(null); setShowForm(true); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-fed-red-500 hover:bg-fed-red-600 text-white text-sm font-semibold shadow-lg shadow-fed-red-500/20 transition-all"
              >
                <Plus size={16} />
                Creer un evenement
              </button>
            )
          }
        />
      )}

      {/* === Results Summary === */}
      {filteredEvents.length > 0 && (
        <div className="text-center text-xs text-light-400 pt-2">
          Affichage de <strong className="text-light-100">{filteredEvents.length}</strong> evenement(s)
          {filteredEvents.length !== events.length && (
            <> sur <strong className="text-light-100">{events.length}</strong></>
          )}
        </div>
      )}
    </div>
  );
};

export default UpcomingEventsAdminPage;
