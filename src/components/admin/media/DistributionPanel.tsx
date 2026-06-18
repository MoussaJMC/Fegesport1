import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  X, Send, Copy, Check, RefreshCw, Loader2, History, Megaphone, Mail, AlertTriangle,
} from 'lucide-react';
import {
  ensureDistributionQueue, distributeSelected, markChannelPublishedManually,
  retryChannel, listDistributionHistory,
} from '../../../lib/mediaCenterService';
import type { DistributionItem, DistributionChannel, PublicationLog } from '../../../types/mediaCenter';
import {
  DISTRIBUTION_CHANNELS, DISTRIBUTION_CHANNEL_LABELS, DISTRIBUTION_STATUS_LABELS,
} from '../../../types/mediaCenter';

interface Props {
  eventId: string;
  title?: string;
  onClose: () => void;
}

const ACTION_LABELS: Record<string, string> = {
  distribution_requested: 'Diffusion demandée',
  channel_published_manually: 'Publié manuellement',
  channel_retry: 'Réessai',
  published: 'Publication site',
  sent: 'Envoi newsletter',
};

const DistributionPanel = ({ eventId, title, onClose }: Props) => {
  const [items, setItems] = useState<DistributionItem[]>([]);
  const [selected, setSelected] = useState<Set<DistributionChannel>>(new Set());
  const [history, setHistory] = useState<PublicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const load = async () => {
    try {
      const list = await ensureDistributionQueue(eventId);
      setItems(list);
      // Par défaut : cocher les canaux qui ont du contenu et ne sont pas déjà publiés
      setSelected(new Set(list.filter((i) => i.content_preview && i.status !== 'published').map((i) => i.channel)));
      setHistory(await listDistributionHistory(eventId).catch(() => []));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [eventId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (c: DistributionChannel) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });

  const handleDistribute = async () => {
    setBusy(true);
    try {
      const updated = await distributeSelected(eventId, [...selected]);
      setItems(updated);
      setHistory(await listDistributionHistory(eventId).catch(() => []));
      toast.success('File de diffusion mise à jour (canaux prêts / ignorés). Aucune publication automatique.');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const copyText = (item: DistributionItem) => {
    navigator.clipboard.writeText(item.content_preview ?? '');
    setCopied(item.id);
    setTimeout(() => setCopied(null), 1500);
    toast.success(`Texte ${DISTRIBUTION_CHANNEL_LABELS[item.channel]} copié.`);
  };

  const doManualPublish = (item: DistributionItem) => withRow(async () => {
    await markChannelPublishedManually(item);
  });
  const doRetry = (item: DistributionItem) => withRow(async () => { await retryChannel(item); });

  const withRow = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      setItems(await ensureDistributionQueue(eventId));
      setHistory(await listDistributionHistory(eventId).catch(() => []));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const ordered = DISTRIBUTION_CHANNELS
    .map((c) => items.find((i) => i.channel === c))
    .filter(Boolean) as DistributionItem[];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-3xl my-6 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-dark-700 sticky top-0 bg-dark-800 rounded-t-2xl z-10">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-fed-red-500" /> Diffusion multicanale
            </h2>
            <p className="text-xs text-light-400 mt-0.5 truncate">{title ?? 'Événement'} · Phase A — aucune publication automatique</p>
          </div>
          <button onClick={onClose} className="p-2 text-light-400 hover:text-white shrink-0"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-2 text-xs rounded-lg p-3 bg-accent-blue-400/10 text-accent-blue-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            « Diffuser » marque les canaux cochés comme <b>Prêts</b> et les autres comme <b>Ignorés</b>, et journalise — <b>sans rien publier</b>.
            Réseaux : copiez le texte et publiez à la main, puis « Marquer comme publié ». Newsletter : envoi séparé avec confirmation (page Newsletters).
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-fed-red-500" /></div>
          ) : (
            <ul className="space-y-3">
              {ordered.map((item) => {
                const badge = DISTRIBUTION_STATUS_LABELS[item.status];
                const isNewsletter = item.channel === 'newsletter';
                return (
                  <li key={item.id} className="bg-dark-900 border border-dark-700 rounded-xl p-3">
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-2 cursor-pointer min-w-0">
                        <input type="checkbox" className="accent-fed-red-500"
                          checked={selected.has(item.channel)}
                          disabled={item.status === 'published'}
                          onChange={() => toggle(item.channel)} />
                        <span className="text-sm font-medium text-white inline-flex items-center gap-1.5">
                          {isNewsletter && <Mail className="h-3.5 w-3.5 text-fed-gold-500" />}
                          {DISTRIBUTION_CHANNEL_LABELS[item.channel]}
                        </span>
                      </label>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${badge.cls}`}>{badge.label}</span>
                    </div>

                    {item.content_preview ? (
                      <p className="text-light-300 text-xs mt-2 whitespace-pre-wrap line-clamp-4">{item.content_preview}</p>
                    ) : (
                      <p className="text-light-500 text-xs mt-2 italic">
                        Aucun contenu {isNewsletter ? 'newsletter (créez la campagne via la Revue)' : 'généré pour ce canal'}.
                      </p>
                    )}
                    {item.error_message && <p className="text-fed-red-400 text-xs mt-1">{item.error_message}</p>}

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {item.content_preview && (
                        <button onClick={() => copyText(item)} className="inline-flex items-center text-xs text-light-300 bg-dark-700 px-2.5 py-1.5 rounded-lg hover:text-white">
                          {copied === item.id ? <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />} Copier
                        </button>
                      )}
                      {item.status !== 'published' && (
                        <button onClick={() => doManualPublish(item)} disabled={busy}
                          className="inline-flex items-center text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg hover:bg-emerald-500/20 disabled:opacity-50">
                          <Check className="h-3.5 w-3.5 mr-1.5" /> Marquer comme publié
                        </button>
                      )}
                      {(item.status === 'failed' || item.status === 'skipped') && (
                        <button onClick={() => doRetry(item)} disabled={busy}
                          className="inline-flex items-center text-xs text-fed-gold-500 bg-fed-gold-500/10 px-2.5 py-1.5 rounded-lg hover:bg-fed-gold-500/20 disabled:opacity-50">
                          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Réessayer
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Historique */}
          <div className="border-t border-dark-700 pt-3">
            <button onClick={() => setShowHistory((v) => !v)} className="text-xs text-light-400 hover:text-white inline-flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" /> Historique de diffusion ({history.length})
            </button>
            {showHistory && (
              <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {history.length === 0 && <li className="text-xs text-light-500">Aucun historique.</li>}
                {history.map((h) => (
                  <li key={h.id} className="text-xs text-light-400">
                    <span className="text-light-200">{ACTION_LABELS[h.action] ?? h.action}</span>
                    {h.channel ? ` · ${h.channel}` : ''} · {new Date(h.created_at).toLocaleString('fr-FR')}
                    {h.performed_by_email ? ` · ${h.performed_by_email}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 p-5 border-t border-dark-700 sticky bottom-0 bg-dark-800 rounded-b-2xl">
          <span className="text-xs text-light-500">{selected.size} canal/canaux sélectionné(s)</span>
          <div className="flex-1" />
          <button onClick={onClose} className="px-3 py-2 text-sm text-light-300 bg-dark-700 rounded-lg hover:text-white">Fermer</button>
          <button onClick={handleDistribute} disabled={busy || loading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-fed-red-500 rounded-lg hover:bg-fed-red-600 disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />} Diffuser sur les canaux sélectionnés
          </button>
        </div>
      </div>
    </div>
  );
};

export default DistributionPanel;
