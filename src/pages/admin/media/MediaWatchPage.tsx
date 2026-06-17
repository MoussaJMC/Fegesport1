import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Globe, Loader2, RefreshCw, ExternalLink, EyeOff, Star, Settings } from 'lucide-react';
import { listCollectedNews, runWatch, updateCollectedNewsStatus } from '../../../lib/mediaCenterService';
import type { CollectedNews } from '../../../types/mediaCenter';
import { PRIORITY_LABELS, DECISION_LABELS } from '../../../types/mediaCenter';

const scoreColor = (score: number | null) =>
  score == null ? 'text-light-500'
    : score >= 70 ? 'text-emerald-400'
    : score >= 40 ? 'text-fed-gold-500'
    : 'text-light-400';

const MediaWatchPage = () => {
  const [news, setNews] = useState<CollectedNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setNews(await listCollectedNews());
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleScan = async () => {
    setScanning(true);
    toast.info('Scan des sources + analyse IA en cours…');
    try {
      const result = await runWatch('full');
      toast.success(`Veille terminée : ${result.inserted} nouvelle(s) actu(s), ${result.analyzed} analysée(s), ${result.sources_ok} source(s) OK${result.sources_failed ? `, ${result.sources_failed} en échec` : ''}.`);
      if (result.errors.length) console.warn('Veille — erreurs:', result.errors);
      await load();
    } catch (e) {
      toast.error(`Veille échouée : ${(e as Error).message}`);
    } finally {
      setScanning(false);
    }
  };

  const dismiss = async (item: CollectedNews) => {
    await updateCollectedNewsStatus(item.id, 'dismissed');
    setNews((prev) => prev.filter((n) => n.id !== item.id));
  };

  const filtered = news.filter((n) => n.status !== 'dismissed' && (!filter || n.status === filter));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
            <Globe className="h-6 w-6 text-fed-red-500" /> Veille mondiale esport
          </h1>
          <p className="text-light-400 mt-0.5 text-sm">
            IESF, ACES, GEF, éditeurs… scorées par l'IA selon leur pertinence pour la Guinée.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/media/sources" className="inline-flex items-center px-3 py-2 text-sm text-light-300 bg-dark-800 border border-dark-700 rounded-lg hover:bg-dark-700 hover:text-white">
            <Settings className="h-4 w-4 mr-1.5" /> Sources
          </Link>
          <button onClick={handleScan} disabled={scanning}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-fed-red-500 rounded-lg hover:bg-fed-red-600 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 mr-1.5 ${scanning ? 'animate-spin' : ''}`} /> {scanning ? 'Scan en cours…' : 'Lancer la veille'}
          </button>
        </div>
      </div>

      <select className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white"
        value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">Toutes</option>
        <option value="flagged">⭐ Pertinentes pour la Guinée</option>
        <option value="analyzed">Analysées</option>
        <option value="new">Non analysées</option>
        <option value="used">Utilisées</option>
      </select>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-fed-red-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center text-light-400 text-sm">
          Aucune actualité collectée. Lancez la veille pour scanner les sources.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className={`bg-dark-800 border rounded-xl p-4 ${item.status === 'flagged' ? 'border-fed-gold-500/40' : 'border-dark-700'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.status === 'flagged' && <Star className="h-4 w-4 text-fed-gold-500 shrink-0" />}
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-white text-sm font-medium hover:text-fed-gold-500 transition-colors">
                      {item.title}
                    </a>
                  </div>
                  <p className="text-light-400 text-xs mt-1">
                    {item.news_sources?.organization ?? 'Source inconnue'}
                    {item.ai_category ? ` · ${item.ai_category}` : ''}
                    {item.published_at ? ` · ${new Date(item.published_at).toLocaleDateString('fr-FR')}` : ''}
                  </p>
                  {(item.editorial_priority || item.editorial_decision) && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {item.editorial_priority && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${PRIORITY_LABELS[item.editorial_priority].cls}`}>
                          {PRIORITY_LABELS[item.editorial_priority].label}
                        </span>
                      )}
                      {item.editorial_decision && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-700 text-light-300" title={item.editorial_reason ?? ''}>
                          Rédaction en chef : {DECISION_LABELS[item.editorial_decision]}
                        </span>
                      )}
                    </div>
                  )}
                  {item.summary && <p className="text-light-300 text-sm mt-2">{item.summary}</p>}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 text-xs">
                  <span className={scoreColor(item.ai_relevance_guinea)}>Guinée : {item.ai_relevance_guinea ?? '—'}</span>
                  <span className={scoreColor(item.ai_impact_africa)}>Afrique : {item.ai_impact_africa ?? '—'}</span>
                  <span className={scoreColor(item.ai_importance)}>Importance : {item.ai_importance ?? '—'}</span>
                  <span className={scoreColor(item.ai_impact)}>Impact : {item.ai_impact ?? '—'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dark-700">
                <a href={item.url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center text-xs text-light-300 bg-dark-700 px-2.5 py-1.5 rounded-lg hover:text-white">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Lire la source
                </a>
                <button onClick={() => updateCollectedNewsStatus(item.id, 'used').then(load)}
                  className="inline-flex items-center text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/20">
                  Marquer utilisée
                </button>
                <div className="flex-1" />
                <button onClick={() => dismiss(item)} className="inline-flex items-center text-xs text-light-400 px-2.5 py-1.5 rounded-lg hover:text-fed-red-400">
                  <EyeOff className="h-3.5 w-3.5 mr-1.5" /> Ignorer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaWatchPage;
