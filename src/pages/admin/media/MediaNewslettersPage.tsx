import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Loader2, Send, Eye, FlaskConical, Users, RefreshCw } from 'lucide-react';
import {
  listCampaigns, sendCampaign, sendCampaignTest, countActiveSubscribers,
  countSubscribersBySegment, updateCampaign,
} from '../../../lib/mediaCenterService';
import type { NewsletterCampaign, CampaignType, SubscriberSegment } from '../../../types/mediaCenter';
import { CAMPAIGN_TYPE_LABELS, SEGMENT_LABELS } from '../../../types/mediaCenter';

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Brouillon', cls: 'bg-dark-700 text-light-300' },
  pending_review: { label: 'À valider', cls: 'bg-fed-gold-500/10 text-fed-gold-500' },
  approved: { label: 'Approuvée', cls: 'bg-accent-blue-400/10 text-accent-blue-400' },
  scheduled: { label: 'Programmée', cls: 'bg-purple-500/10 text-purple-400' },
  sending: { label: 'Envoi…', cls: 'bg-fed-gold-500/10 text-fed-gold-500' },
  sent: { label: 'Envoyée', cls: 'bg-emerald-500/10 text-emerald-400' },
  failed: { label: 'Échec', cls: 'bg-fed-red-500/10 text-fed-red-400' },
};

const MediaNewslettersPage = () => {
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [subscribers, setSubscribers] = useState(0);
  const [segmentCounts, setSegmentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [preview, setPreview] = useState<NewsletterCampaign | null>(null);
  const [searchParams] = useSearchParams();
  const highlight = searchParams.get('campaign');

  const load = async () => {
    setLoading(true);
    try {
      const [list, count, segments] = await Promise.all([
        listCampaigns(), countActiveSubscribers(), countSubscribersBySegment(),
      ]);
      setCampaigns(list);
      setSubscribers(count);
      setSegmentCounts(segments);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSend = async (campaign: NewsletterCampaign) => {
    if (!window.confirm(`Envoyer « ${campaign.subject} » à ${subscribers} abonné(s) actif(s) ? Cette action est irréversible.`)) return;
    setBusyId(campaign.id);
    try {
      const result = await sendCampaign(campaign.id);
      if (result.success) toast.success(`Newsletter envoyée à ${result.sent} / ${result.recipients} abonnés.`);
      else toast.error(`Envoi en échec : ${result.errors.join(' | ')}`);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const handleTest = async (campaign: NewsletterCampaign) => {
    const email = window.prompt('Adresse email pour le test :');
    if (!email) return;
    setBusyId(campaign.id);
    try {
      const result = await sendCampaignTest(campaign.id, email);
      toast.success(result.message);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
            <Mail className="h-6 w-6 text-fed-red-500" /> Newsletters
          </h1>
          <p className="text-light-400 mt-0.5 text-sm">
            Campagnes générées par l'IA et envoyées via Resend. Les campagnes naissent dans la revue d'un événement.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-2 text-sm text-light-300 bg-dark-800 border border-dark-700 rounded-lg">
            <Users className="h-4 w-4 mr-1.5 text-emerald-400" /> {subscribers} abonné(s) actif(s)
          </span>
          <button onClick={load} className="inline-flex items-center px-3 py-2 text-sm text-light-300 bg-dark-800 border border-dark-700 rounded-lg hover:bg-dark-700 hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-fed-red-500" /></div>
      ) : campaigns.length === 0 ? (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center text-light-400 text-sm">
          Aucune campagne. Approuvez une newsletter générée dans la revue d'un événement, puis créez la campagne.
        </div>
      ) : (
        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
          <ul className="divide-y divide-dark-700">
            {campaigns.map((campaign) => {
              const badge = STATUS_BADGE[campaign.status] ?? STATUS_BADGE.draft;
              const busy = busyId === campaign.id;
              return (
                <li key={campaign.id} className={`p-4 ${highlight === campaign.id ? 'bg-fed-red-500/5' : ''}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{campaign.subject}</p>
                      <p className="text-light-400 text-xs mt-0.5">
                        {campaign.sent_at
                          ? `Envoyée le ${new Date(campaign.sent_at).toLocaleString('fr-FR')} à ${campaign.recipients_count} abonnés`
                          : `Créée le ${new Date(campaign.created_at).toLocaleDateString('fr-FR')}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-dark-700 text-light-300">
                        {CAMPAIGN_TYPE_LABELS[campaign.campaign_type] ?? campaign.campaign_type}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                    </div>
                  </div>

                  {['approved', 'draft', 'pending_review'].includes(campaign.status) && (
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <select
                        className="bg-dark-900 border border-dark-700 rounded-lg px-2 py-1 text-xs text-white"
                        value={campaign.campaign_type}
                        onChange={async (e) => {
                          await updateCampaign(campaign.id, { campaign_type: e.target.value as CampaignType });
                          await load();
                        }}>
                        {Object.entries(CAMPAIGN_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <div className="flex flex-wrap gap-1.5">
                        {(Object.keys(SEGMENT_LABELS) as SubscriberSegment[]).map((segment) => {
                          const selected = (campaign.target_segments ?? ['general']).includes(segment);
                          return (
                            <button key={segment}
                              onClick={async () => {
                                const current = campaign.target_segments ?? ['general'];
                                const next = selected ? current.filter((s) => s !== segment) : [...current, segment];
                                await updateCampaign(campaign.id, { target_segments: next.length ? next : ['general'] });
                                await load();
                              }}
                              className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                                selected
                                  ? 'bg-fed-red-500/15 border-fed-red-500/40 text-fed-red-400'
                                  : 'bg-dark-900 border-dark-700 text-light-400 hover:text-white'
                              }`}>
                              {SEGMENT_LABELS[segment]} ({segmentCounts[segment] ?? 0})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {campaign.status === 'sent' && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
                      {[
                        { label: 'Destinataires', value: campaign.recipients_count },
                        { label: 'Délivrés', value: campaign.delivered_count },
                        { label: 'Ouvertures', value: campaign.opens_count },
                        { label: 'Clics', value: campaign.clicks_count },
                        { label: 'Bounces', value: campaign.bounces_count },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-dark-900 rounded-lg p-2.5 text-center">
                          <p className="text-white font-bold text-sm">{stat.value}</p>
                          <p className="text-light-500 text-[10px] uppercase tracking-wide">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {campaign.error_message && (
                    <p className="text-fed-red-400 text-xs mt-2">{campaign.error_message}</p>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <button onClick={() => setPreview(preview?.id === campaign.id ? null : campaign)}
                      className="inline-flex items-center text-xs text-light-300 bg-dark-700 px-2.5 py-1.5 rounded-lg hover:text-white">
                      <Eye className="h-3.5 w-3.5 mr-1.5" /> Aperçu
                    </button>
                    <button onClick={() => handleTest(campaign)} disabled={busy}
                      className="inline-flex items-center text-xs text-light-300 bg-dark-700 px-2.5 py-1.5 rounded-lg hover:text-white disabled:opacity-50">
                      <FlaskConical className="h-3.5 w-3.5 mr-1.5" /> Email de test
                    </button>
                    {['approved', 'draft', 'pending_review'].includes(campaign.status) && (
                      <button onClick={() => handleSend(campaign)} disabled={busy || subscribers === 0}
                        className="inline-flex items-center text-xs font-medium text-white bg-fed-red-500 px-3 py-1.5 rounded-lg hover:bg-fed-red-600 disabled:opacity-50">
                        {busy ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
                        Envoyer à {subscribers} abonné(s)
                      </button>
                    )}
                  </div>

                  {preview?.id === campaign.id && (
                    <div className="bg-white rounded-lg overflow-hidden mt-3">
                      <iframe title="Aperçu newsletter" srcDoc={campaign.html_content} className="w-full h-[420px] border-0" sandbox="" />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MediaNewslettersPage;
