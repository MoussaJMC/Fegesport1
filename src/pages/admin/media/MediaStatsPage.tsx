import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { BarChart3, Loader2, Bot, ScrollText, CheckCircle2, XCircle } from 'lucide-react';
import {
  listPublicationLogs, listAiUsage, getDashboardStats, MediaCenterStats,
  getKpiDaily, aggregateKpi,
} from '../../../lib/mediaCenterService';
import type { PublicationLog, AiUsageLog, MediaKpiDaily } from '../../../types/mediaCenter';

const ACTION_LABELS: Record<string, string> = {
  created: 'Création',
  generated: 'Génération IA',
  regenerated: 'Régénération IA',
  approved: 'Approbation',
  rejected: 'Rejet',
  published: 'Publication',
  sent: 'Envoi',
  dismissed: 'Ignoré',
};

const MediaStatsPage = () => {
  const [logs, setLogs] = useState<PublicationLog[]>([]);
  const [usage, setUsage] = useState<AiUsageLog[]>([]);
  const [stats, setStats] = useState<MediaCenterStats | null>(null);
  const [kpi, setKpi] = useState<MediaKpiDaily[]>([]);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [l, u, s, k] = await Promise.all([
          listPublicationLogs(100), listAiUsage(100), getDashboardStats(),
          getKpiDaily().catch(() => [] as MediaKpiDaily[]),
        ]);
        setLogs(l);
        setUsage(u);
        setStats(s);
        setKpi(k);
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const kpiRows = aggregateKpi(kpi, period).slice(period === 'day' ? -14 : period === 'week' ? -12 : -12).reverse();

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-fed-red-500" /></div>;
  }

  const totalTokens = usage.reduce((sum, u) => sum + u.input_tokens + u.output_tokens, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-fed-red-500" /> Statistiques & audit
        </h1>
        <p className="text-light-400 mt-0.5 text-sm">Journal de toutes les actions et consommation IA du Centre Média.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Articles publiés', value: stats.articles_published },
            { label: 'Newsletters envoyées', value: stats.campaigns_sent },
            { label: 'Appels IA aujourd\'hui', value: stats.ai_calls_today },
            { label: 'Tokens consommés (100 derniers appels)', value: totalTokens.toLocaleString('fr-FR') },
          ].map((card) => (
            <div key={card.label} className="bg-dark-800 border border-dark-700 rounded-xl p-4">
              <p className="text-xl font-bold text-white font-heading">{card.value}</p>
              <p className="text-light-400 text-xs mt-1">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-dark-700 flex items-center justify-between">
          <h2 className="font-bold text-white font-heading text-sm">KPI Média</h2>
          <div className="flex gap-1 bg-dark-900 rounded-lg p-1">
            {([['day', 'Jour'], ['week', 'Semaine'], ['month', 'Mois']] as const).map(([value, label]) => (
              <button key={value} onClick={() => setPeriod(value)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  period === value ? 'bg-fed-red-500 text-white' : 'text-light-400 hover:text-white'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        {kpiRows.length === 0 ? (
          <p className="p-8 text-center text-light-400 text-sm">
            Aucune donnée KPI — la vue media_kpi_daily sera disponible après l'application de la migration V2.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-light-400 border-b border-dark-700">
                  <th className="text-left px-4 py-2.5 font-medium">Période</th>
                  <th className="text-right px-3 py-2.5 font-medium">Articles</th>
                  <th className="text-right px-3 py-2.5 font-medium">Posts sociaux</th>
                  <th className="text-right px-3 py-2.5 font-medium">Newsletters</th>
                  <th className="text-right px-3 py-2.5 font-medium">Ouvertures</th>
                  <th className="text-right px-3 py-2.5 font-medium">Clics</th>
                  <th className="text-right px-3 py-2.5 font-medium">Taux ouv.</th>
                  <th className="text-right px-3 py-2.5 font-medium">Veille</th>
                  <th className="text-right px-3 py-2.5 font-medium">Nouv. abonnés</th>
                  <th className="text-right px-4 py-2.5 font-medium">Appels IA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/60">
                {kpiRows.map((row) => {
                  const openRate = row.newsletter_recipients > 0
                    ? Math.round((row.newsletter_opens / row.newsletter_recipients) * 100) : null;
                  return (
                    <tr key={row.day} className="text-light-200">
                      <td className="px-4 py-2 text-light-300">
                        {new Date(row.day).toLocaleDateString('fr-FR', period === 'month'
                          ? { month: 'long', year: 'numeric' }
                          : { day: '2-digit', month: 'short' })}
                        {period === 'week' ? ' (sem.)' : ''}
                      </td>
                      <td className="text-right px-3 py-2">{row.articles_published}</td>
                      <td className="text-right px-3 py-2">{row.social_posts_ready}</td>
                      <td className="text-right px-3 py-2">{row.newsletters_sent}</td>
                      <td className="text-right px-3 py-2">{row.newsletter_opens}</td>
                      <td className="text-right px-3 py-2">{row.newsletter_clicks}</td>
                      <td className="text-right px-3 py-2">{openRate !== null ? `${openRate} %` : '—'}</td>
                      <td className="text-right px-3 py-2">{row.news_collected}</td>
                      <td className="text-right px-3 py-2">{row.new_subscribers}</td>
                      <td className="text-right px-4 py-2">{row.ai_calls}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-dark-700 flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-fed-gold-500" />
            <h2 className="font-bold text-white font-heading text-sm">Journal d'audit</h2>
          </div>
          <ul className="divide-y divide-dark-700 max-h-[480px] overflow-y-auto">
            {logs.length === 0 && <li className="p-6 text-center text-light-400 text-sm">Aucune action enregistrée.</li>}
            {logs.map((log) => (
              <li key={log.id} className="px-4 py-2.5">
                <p className="text-sm text-white">
                  {ACTION_LABELS[log.action] ?? log.action}
                  <span className="text-light-400"> · {log.entity_type}{log.channel ? ` → ${log.channel}` : ''}</span>
                </p>
                <p className="text-xs text-light-500 mt-0.5">
                  {log.performed_by_email ?? 'système'} · {new Date(log.created_at).toLocaleString('fr-FR')}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-dark-700 flex items-center gap-2">
            <Bot className="h-4 w-4 text-accent-blue-400" />
            <h2 className="font-bold text-white font-heading text-sm">Consommation IA</h2>
          </div>
          <ul className="divide-y divide-dark-700 max-h-[480px] overflow-y-auto">
            {usage.length === 0 && <li className="p-6 text-center text-light-400 text-sm">Aucun appel IA.</li>}
            {usage.map((u) => (
              <li key={u.id} className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white flex items-center gap-1.5">
                    {u.success ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <XCircle className="h-3.5 w-3.5 text-fed-red-400" />}
                    {u.function_name}
                    <span className="text-light-500 text-xs">({u.model})</span>
                  </p>
                  <p className="text-xs text-light-500 mt-0.5">{new Date(u.created_at).toLocaleString('fr-FR')}</p>
                </div>
                <p className="text-xs text-light-400 text-right">
                  {u.input_tokens.toLocaleString('fr-FR')} in<br />{u.output_tokens.toLocaleString('fr-FR')} out
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MediaStatsPage;
