import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Sparkles, PlusCircle, FileEdit, Newspaper, Globe, Mail, BarChart3,
  RefreshCw, Calendar, ArrowRight, Bot, Users,
} from 'lucide-react';
import { getDashboardStats, listMediaEvents, MediaCenterStats } from '../../../lib/mediaCenterService';
import type { MediaEvent } from '../../../types/mediaCenter';

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Brouillon', cls: 'bg-dark-700 text-light-300' },
  generating: { label: 'Génération IA…', cls: 'bg-fed-gold-500/10 text-fed-gold-500' },
  in_review: { label: 'À valider', cls: 'bg-accent-blue-400/10 text-accent-blue-400' },
  published: { label: 'Publié', cls: 'bg-emerald-500/10 text-emerald-400' },
  archived: { label: 'Archivé', cls: 'bg-dark-700 text-light-400' },
};

const MediaDashboardPage = () => {
  const [stats, setStats] = useState<MediaCenterStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<MediaEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, events] = await Promise.all([getDashboardStats(), listMediaEvents()]);
      setStats(s);
      setRecentEvents(events.slice(0, 6));
    } catch (e) {
      toast.error(`Chargement impossible : ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cards = stats ? [
    { label: 'Événements', value: stats.events_total, icon: Calendar, color: 'bg-fed-red-500/10 text-fed-red-500', to: '/admin/media/drafts' },
    { label: 'Contenus à valider', value: stats.articles_pending, icon: FileEdit, color: 'bg-fed-gold-500/10 text-fed-gold-500', to: '/admin/media/drafts' },
    { label: 'Articles publiés', value: stats.articles_published, icon: Newspaper, color: 'bg-emerald-500/10 text-emerald-400', to: '/admin/media/articles' },
    { label: 'Posts sociaux prêts', value: stats.social_ready, icon: Sparkles, color: 'bg-accent-blue-400/10 text-accent-blue-400', to: '/admin/media/articles' },
    { label: 'Veille à examiner', value: stats.watch_flagged, icon: Globe, color: 'bg-purple-500/10 text-purple-400', to: '/admin/media/watch' },
    { label: 'Newsletters envoyées', value: stats.campaigns_sent, icon: Mail, color: 'bg-fed-gold-500/10 text-fed-gold-500', to: '/admin/media/newsletters' },
    { label: 'Abonnés actifs', value: stats.subscribers, icon: Users, color: 'bg-emerald-500/10 text-emerald-400', to: '/admin/media/newsletters' },
    { label: 'Appels IA aujourd\'hui', value: stats.ai_calls_today, icon: Bot, color: 'bg-fed-red-500/10 text-fed-red-500', to: '/admin/media/stats' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-fed-red-500" /> Centre Média IA
          </h1>
          <p className="text-light-400 mt-0.5 text-sm">
            Publiez une activité FEGESPORT, l'IA produit article, actualité, posts sociaux et newsletter.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center px-3 py-2 text-sm text-light-300 bg-dark-800 border border-dark-700 rounded-lg hover:bg-dark-700 hover:text-white transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" /> Actualiser
          </button>
          <Link to="/admin/media/new" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-fed-red-500 rounded-lg hover:bg-fed-red-600 transition-colors">
            <PlusCircle className="h-4 w-4 mr-1.5" /> Nouvel événement
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-3 border-dark-700 border-t-fed-red-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
              <Link key={card.label} to={card.to} className="block bg-dark-800 rounded-xl border border-dark-700 hover:border-fed-red-500/30 transition-all p-5">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-bold text-white font-heading">{card.value}</span>
                </div>
                <p className="text-sm text-light-400 mt-3">{card.label}</p>
              </Link>
            ))}
          </div>

          <div className="bg-dark-800 rounded-xl border border-dark-700">
            <div className="flex items-center justify-between p-5 border-b border-dark-700">
              <h2 className="font-bold text-white font-heading">Événements récents</h2>
              <Link to="/admin/media/drafts" className="text-sm text-fed-gold-500 hover:text-fed-gold-400 inline-flex items-center">
                Tout voir <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </div>
            {recentEvents.length === 0 ? (
              <div className="p-10 text-center text-light-400 text-sm">
                Aucun événement pour l'instant. <Link to="/admin/media/new" className="text-fed-red-500 hover:underline">Créez le premier</Link>.
              </div>
            ) : (
              <ul className="divide-y divide-dark-700">
                {recentEvents.map((event) => {
                  const badge = STATUS_LABELS[event.status] ?? STATUS_LABELS.draft;
                  return (
                    <li key={event.id}>
                      <Link to={`/admin/media/events/${event.id}/review`} className="flex items-center justify-between p-4 hover:bg-dark-700/40 transition-colors">
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{event.title}</p>
                          <p className="text-light-400 text-xs mt-0.5">
                            {event.event_date ?? 'date non définie'} · {event.location ?? 'lieu non défini'} · {event.category}
                          </p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ml-4 ${badge.cls}`}>{badge.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="bg-dark-800 rounded-xl border border-fed-gold-500/20 p-5">
            <h3 className="text-sm font-bold text-fed-gold-500 mb-2 flex items-center gap-2"><Bot className="h-4 w-4" /> Workflow</h3>
            <p className="text-light-400 text-sm">
              1. Créez un événement avec ses médias → 2. Lancez la génération IA (analyse + 6 versions) →
              3. Relisez, modifiez ou régénérez → 4. <span className="text-white">Approuvez</span> (validation humaine obligatoire) →
              5. Publiez : article sur le site, newsletter via Resend, textes sociaux prêts à coller.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default MediaDashboardPage;
