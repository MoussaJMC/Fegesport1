import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { FileEdit, PlusCircle, Trash2, Loader2, Sparkles, Search } from 'lucide-react';
import { listMediaEvents, deleteMediaEvent } from '../../../lib/mediaCenterService';
import type { MediaEvent } from '../../../types/mediaCenter';

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Brouillon', cls: 'bg-dark-700 text-light-300' },
  generating: { label: 'Génération IA…', cls: 'bg-fed-gold-500/10 text-fed-gold-500' },
  in_review: { label: 'À valider', cls: 'bg-accent-blue-400/10 text-accent-blue-400' },
  published: { label: 'Publié', cls: 'bg-emerald-500/10 text-emerald-400' },
  archived: { label: 'Archivé', cls: 'bg-dark-700 text-light-400' },
};

const MediaDraftsPage = () => {
  const [events, setEvents] = useState<MediaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('');

  const load = async () => {
    setLoading(true);
    try {
      setEvents(await listMediaEvents());
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (event: MediaEvent) => {
    if (!window.confirm(`Supprimer « ${event.title} » et tous ses contenus générés ?`)) return;
    try {
      await deleteMediaEvent(event.id);
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      toast.success('Événement supprimé');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const filtered = events.filter((e) =>
    (!filter || e.status === filter) &&
    (!search || e.title.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
            <FileEdit className="h-6 w-6 text-fed-red-500" /> Brouillons & événements
          </h1>
          <p className="text-light-400 mt-0.5 text-sm">Tous les événements du Centre Média et leur état dans le workflow.</p>
        </div>
        <Link to="/admin/media/new" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-fed-red-500 rounded-lg hover:bg-fed-red-600">
          <PlusCircle className="h-4 w-4 mr-1.5" /> Nouvel événement
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-light-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-light-500"
            placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white"
          value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="draft">Brouillons</option>
          <option value="in_review">À valider</option>
          <option value="published">Publiés</option>
          <option value="archived">Archivés</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-fed-red-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center text-light-400 text-sm">
          Aucun événement trouvé.
        </div>
      ) : (
        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
          <ul className="divide-y divide-dark-700">
            {filtered.map((event) => {
              const badge = STATUS_BADGE[event.status] ?? STATUS_BADGE.draft;
              return (
                <li key={event.id} className="flex items-center justify-between p-4 hover:bg-dark-700/40 transition-colors">
                  <Link to={`/admin/media/events/${event.id}/review`} className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium truncate">{event.title}</p>
                    <p className="text-light-400 text-xs mt-0.5">
                      {event.event_date ?? 'date non définie'} · {event.location ?? 'lieu non défini'} · {event.category}
                      {event.ai_analyzed_at && <span className="text-fed-gold-500"> · analysé par l'IA</span>}
                    </p>
                  </Link>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                    <Link to={`/admin/media/events/${event.id}/review`}
                      className="p-2 text-light-400 hover:text-fed-gold-500" title="Revue & validation">
                      <Sparkles className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDelete(event)} className="p-2 text-light-400 hover:text-fed-red-500" title="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MediaDraftsPage;
