import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  TrendingUp, Loader2, Sparkles, Briefcase, Users, Globe2, ShieldCheck,
  FileBarChart, Lightbulb, Play, ExternalLink,
} from 'lucide-react';
import {
  runGrowthAgent, getExecutiveKpi, getLatestInsight, listProspects,
  listEcosystemProfiles, listSponsorshipReports, listOpportunityAlerts,
  getLatestReputation, updateProspectStatus, updateProfileStatus, updateAlertStatus,
} from '../../../lib/mediaCenterService';
import type {
  ExecutiveKpiMonthly, GrowthInsight, Prospect, EcosystemProfile,
  SponsorshipReport, OpportunityAlert, ReputationSnapshot,
} from '../../../types/mediaCenter';
import { PROSPECT_SECTOR_LABELS, GROWTH_OBJECTIVE_LABELS } from '../../../types/mediaCenter';

type Tab = 'insights' | 'prospects' | 'ecosystem' | 'opportunities' | 'sponsorship' | 'reputation';

const TABS: { key: Tab; label: string; icon: typeof Lightbulb; agent: string }[] = [
  { key: 'insights', label: 'Recommandations', icon: Lightbulb, agent: 'Agent 10 — Community Growth' },
  { key: 'prospects', label: 'Prospects', icon: Briefcase, agent: 'Agent 11 — Partnership Intelligence' },
  { key: 'ecosystem', label: 'Écosystème', icon: Users, agent: 'Agent 12 — Athlete & Club Detector' },
  { key: 'sponsorship', label: 'Dossiers sponsors', icon: FileBarChart, agent: 'Agent 13 — Sponsorship Content' },
  { key: 'opportunities', label: 'Opportunités intl.', icon: Globe2, agent: 'Agent 14 — International Relations' },
  { key: 'reputation', label: 'Réputation', icon: ShieldCheck, agent: 'Agent 15 — Reputation Monitor' },
];

const PROFILE_TYPE_LABELS: Record<string, string> = {
  player: 'Joueur', club: 'Club', organizer: 'Organisateur', creator: 'Créateur',
};

const scoreCls = (s: number | null) =>
  s == null ? 'text-light-500' : s >= 70 ? 'text-emerald-400' : s >= 40 ? 'text-fed-gold-500' : 'text-fed-red-400';

const MediaGrowthPage = () => {
  const [kpi, setKpi] = useState<ExecutiveKpiMonthly[]>([]);
  const [insight, setInsight] = useState<GrowthInsight | null>(null);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [profiles, setProfiles] = useState<EcosystemProfile[]>([]);
  const [reports, setReports] = useState<SponsorshipReport[]>([]);
  const [alerts, setAlerts] = useState<OpportunityAlert[]>([]);
  const [reputation, setReputation] = useState<ReputationSnapshot | null>(null);
  const [tab, setTab] = useState<Tab>('insights');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [openReport, setOpenReport] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const safe = <T,>(p: Promise<T>, fallback: T) => p.catch(() => fallback);
    const [k, i, p, pr, r, a, rep] = await Promise.all([
      safe(getExecutiveKpi(), [] as ExecutiveKpiMonthly[]),
      safe(getLatestInsight(), null),
      safe(listProspects(), [] as Prospect[]),
      safe(listEcosystemProfiles(), [] as EcosystemProfile[]),
      safe(listSponsorshipReports(), [] as SponsorshipReport[]),
      safe(listOpportunityAlerts(), [] as OpportunityAlert[]),
      safe(getLatestReputation(), null),
    ]);
    setKpi(k); setInsight(i); setProspects(p); setProfiles(pr);
    setReports(r); setAlerts(a); setReputation(rep);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const run = async (action: 'insights' | 'prospects' | 'detect' | 'sponsorship' | 'opportunities' | 'reputation', label: string) => {
    setRunning(action);
    toast.info(`${label} en cours d'exécution…`);
    try {
      await runGrowthAgent(action);
      toast.success(`${label} terminé.`);
      await load();
    } catch (e) {
      toast.error(`${label} : ${(e as Error).message}`);
    } finally {
      setRunning(null);
    }
  };

  const runActionForTab: Record<Tab, { action: 'insights' | 'prospects' | 'detect' | 'sponsorship' | 'opportunities' | 'reputation'; label: string }> = {
    insights: { action: 'insights', label: 'Analyse des performances' },
    prospects: { action: 'prospects', label: 'Détection de prospects' },
    ecosystem: { action: 'detect', label: 'Détection joueurs & clubs' },
    sponsorship: { action: 'sponsorship', label: 'Génération du dossier sponsor' },
    opportunities: { action: 'opportunities', label: 'Scan des opportunités internationales' },
    reputation: { action: 'reputation', label: 'Analyse de réputation' },
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-fed-red-500" /></div>;
  }

  const last = kpi[0];
  const prev = kpi[1];
  const delta = (a: number, b: number | undefined) => b === undefined ? '' : a - b >= 0 ? ` (+${a - b})` : ` (${a - b})`;
  const activeTab = TABS.find((t) => t.key === tab)!;
  const runCfg = runActionForTab[tab];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-fed-red-500" /> Croissance — Tableau de bord DG
        </h1>
        <p className="text-light-400 mt-0.5 text-sm">
          Chaque contenu sert un objectif : recruter (joueurs, clubs, partenaires, sponsors, journalistes,
          bénévoles, abonnés), rayonner à l'international, renforcer la crédibilité institutionnelle.
        </p>
      </div>

      {/* KPI exécutifs — mois en cours vs mois précédent */}
      {last && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'Joueurs', value: last.new_players, d: prev?.new_players },
            { label: 'Clubs', value: last.new_clubs, d: prev?.new_clubs },
            { label: 'Partenaires', value: last.new_partners, d: prev?.new_partners },
            { label: 'Sponsors', value: last.new_sponsors, d: prev?.new_sponsors },
            { label: 'Abonnés NL', value: last.new_subscribers, d: prev?.new_subscribers },
            { label: 'Articles', value: last.articles_published, d: prev?.articles_published },
            { label: 'Posts sociaux', value: last.social_posts, d: prev?.social_posts },
            { label: 'Vues site', value: last.site_page_views, d: prev?.site_page_views },
          ].map((c) => (
            <div key={c.label} className="bg-dark-800 border border-dark-700 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-white font-heading">
                {c.value}<span className="text-xs text-light-500 font-normal">{delta(c.value, c.d)}</span>
              </p>
              <p className="text-[10px] uppercase tracking-wide text-light-400 mt-0.5">{c.label} / mois</p>
            </div>
          ))}
        </div>
      )}

      {/* Onglets agents */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        <div className="flex overflow-x-auto border-b border-dark-700">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 inline-flex items-center gap-1.5 transition-colors ${
                tab === t.key ? 'border-fed-red-500 text-white font-medium' : 'border-transparent text-light-400 hover:text-white'
              }`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-fed-gold-500 font-bold uppercase tracking-wide">{activeTab.agent}</p>
            <button onClick={() => run(runCfg.action, runCfg.label)} disabled={!!running}
              className="inline-flex items-center px-3.5 py-2 text-sm font-medium text-white bg-fed-red-500 rounded-lg hover:bg-fed-red-600 disabled:opacity-50">
              {running === runCfg.action ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Play className="h-4 w-4 mr-1.5" />}
              Lancer l'agent
            </button>
          </div>

          {/* AGENT 10 — Recommandations */}
          {tab === 'insights' && (!insight ? (
            <p className="text-light-400 text-sm py-6 text-center">Aucune analyse. Lancez l'agent pour obtenir les recommandations.</p>
          ) : (
            <div className="space-y-4 text-sm">
              <p className="text-light-500 text-xs">Période analysée : {insight.period_start} → {insight.period_end}</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-dark-900 rounded-lg p-4">
                  <h3 className="text-white font-bold text-xs uppercase mb-2">Recommandations</h3>
                  <ul className="space-y-2">
                    {insight.recommendations.map((r, i) => (
                      <li key={i} className="text-light-300">
                        <Sparkles className="h-3.5 w-3.5 text-fed-gold-500 inline mr-1.5" />
                        {r.recommendation}
                        <span className="block text-xs text-light-500 ml-5">
                          {r.rationale} · objectif : {GROWTH_OBJECTIVE_LABELS[r.objective as keyof typeof GROWTH_OBJECTIVE_LABELS] ?? r.objective}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <div className="bg-dark-900 rounded-lg p-4">
                    <h3 className="text-white font-bold text-xs uppercase mb-2">Top sujets</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {insight.top_topics.map((t, i) => <span key={i} className="text-xs bg-dark-700 text-light-200 px-2 py-0.5 rounded-full">{t}</span>)}
                    </div>
                    <h3 className="text-white font-bold text-xs uppercase mt-3 mb-2">Top hashtags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {insight.top_hashtags.map((t, i) => <span key={i} className="text-xs text-accent-blue-400">{t}</span>)}
                    </div>
                  </div>
                  <div className="bg-dark-900 rounded-lg p-4">
                    <h3 className="text-white font-bold text-xs uppercase mb-2">Meilleurs créneaux</h3>
                    {insight.best_times.map((b, i) => (
                      <p key={i} className="text-light-300 text-xs">{b.slot} — <span className="text-light-500">{b.rationale}</span></p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* AGENT 11 — Prospects */}
          {tab === 'prospects' && (prospects.length === 0 ? (
            <p className="text-light-400 text-sm py-6 text-center">Aucun prospect. Lancez l'agent Partnership Intelligence.</p>
          ) : (
            <ul className="divide-y divide-dark-700">
              {prospects.map((p) => (
                <li key={p.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium">
                      {p.name}
                      <span className="text-xs text-light-500 ml-2">{PROSPECT_SECTOR_LABELS[p.sector] ?? p.sector} · {p.country}</span>
                      {p.website && <a href={p.website} target="_blank" rel="noreferrer" className="ml-2 text-fed-gold-500"><ExternalLink className="h-3 w-3 inline" /></a>}
                    </p>
                    <p className="text-light-400 text-xs mt-1">{(p.contact_reasons ?? []).join(' · ')}</p>
                    {(p.opportunities ?? []).length > 0 && (
                      <p className="text-light-500 text-xs mt-0.5">Opportunités : {(p.opportunities ?? []).join(' · ')}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`text-sm font-bold ${scoreCls(p.compatibility_score)}`}>{p.compatibility_score ?? '—'} / 100</span>
                    <select value={p.status} onChange={async (e) => { await updateProspectStatus(p.id, e.target.value); await load(); }}
                      className="bg-dark-900 border border-dark-700 rounded-lg px-2 py-1 text-xs text-white">
                      {['new', 'qualified', 'contacted', 'in_discussion', 'partner', 'declined', 'dormant'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </li>
              ))}
            </ul>
          ))}

          {/* AGENT 12 — Écosystème */}
          {tab === 'ecosystem' && (profiles.length === 0 ? (
            <p className="text-light-400 text-sm py-6 text-center">Aucun profil détecté. L'agent scanne les entités extraites des événements.</p>
          ) : (
            <ul className="divide-y divide-dark-700">
              {profiles.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium">
                      {p.name}
                      <span className="text-xs bg-dark-700 text-light-300 px-2 py-0.5 rounded-full ml-2">{PROFILE_TYPE_LABELS[p.profile_type]}</span>
                    </p>
                    <p className="text-light-500 text-xs mt-0.5">
                      Activité : {p.activity_score} · {p.mentions_count} mention(s) · {p.suggested_action ?? ''}
                    </p>
                  </div>
                  <select value={p.status} onChange={async (e) => { await updateProfileStatus(p.id, e.target.value); await load(); }}
                    className="bg-dark-900 border border-dark-700 rounded-lg px-2 py-1 text-xs text-white shrink-0">
                    {['new', 'watch', 'contacted', 'member', 'ignored'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </li>
              ))}
            </ul>
          ))}

          {/* AGENT 13 — Dossiers sponsors */}
          {tab === 'sponsorship' && (reports.length === 0 ? (
            <p className="text-light-400 text-sm py-6 text-center">Aucun dossier sponsor. Lancez l'agent pour générer un argumentaire basé sur les métriques réelles.</p>
          ) : (
            <ul className="divide-y divide-dark-700">
              {reports.map((r) => (
                <li key={r.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white text-sm font-medium">{r.title}</p>
                      <p className="text-light-500 text-xs mt-0.5">
                        {r.period_start} → {r.period_end} · valeur média : {r.media_value_estimate ?? '—'}
                      </p>
                    </div>
                    <button onClick={() => setOpenReport(openReport === r.id ? null : r.id)}
                      className="text-xs text-light-300 bg-dark-700 px-2.5 py-1.5 rounded-lg hover:text-white shrink-0">
                      {openReport === r.id ? 'Fermer' : 'Lire'}
                    </button>
                  </div>
                  {openReport === r.id && (
                    <div className="bg-dark-900 rounded-lg p-4 mt-2 text-light-200 text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {r.content}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ))}

          {/* AGENT 14 — Opportunités internationales */}
          {tab === 'opportunities' && (alerts.length === 0 ? (
            <p className="text-light-400 text-sm py-6 text-center">Aucune alerte. L'agent scanne la veille des organisations (IESF, ACES, GEF, WESCO, FIFAe, EWC).</p>
          ) : (
            <ul className="divide-y divide-dark-700">
              {alerts.map((a) => (
                <li key={a.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium">
                      {a.priority === 'urgent' && <span className="text-fed-red-400 mr-1.5">●</span>}
                      {a.title}
                      <span className="text-xs text-light-500 ml-2">{a.source_org} · {a.alert_type}</span>
                      {a.url && <a href={a.url} target="_blank" rel="noreferrer" className="ml-2 text-fed-gold-500"><ExternalLink className="h-3 w-3 inline" /></a>}
                    </p>
                    {a.ai_summary && <p className="text-light-400 text-xs mt-1">{a.ai_summary}</p>}
                    {a.deadline && <p className="text-fed-gold-500 text-xs mt-0.5">Échéance : {new Date(a.deadline).toLocaleDateString('fr-FR')}</p>}
                  </div>
                  <select value={a.status} onChange={async (e) => { await updateAlertStatus(a.id, e.target.value); await load(); }}
                    className="bg-dark-900 border border-dark-700 rounded-lg px-2 py-1 text-xs text-white shrink-0">
                    {['new', 'in_progress', 'applied', 'won', 'missed', 'dismissed'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </li>
              ))}
            </ul>
          ))}

          {/* AGENT 15 — Réputation */}
          {tab === 'reputation' && (!reputation ? (
            <p className="text-light-400 text-sm py-6 text-center">Aucun instantané. Lancez l'agent pour analyser la réputation sur 30 jours.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Réputation', value: reputation.reputation_score },
                  { label: 'Visibilité', value: reputation.visibility_score },
                  { label: 'Confiance', value: reputation.trust_score },
                ].map((s) => (
                  <div key={s.label} className="bg-dark-900 rounded-lg p-4 text-center">
                    <p className={`text-2xl font-bold font-heading ${scoreCls(s.value)}`}>{s.value ?? '—'}</p>
                    <p className="text-xs text-light-400 mt-1">{s.label} / 100</p>
                  </div>
                ))}
              </div>
              <p className="text-light-400 text-xs">
                Mentions (30 j) : <span className="text-emerald-400">{reputation.mentions_positive} positives</span> ·{' '}
                <span className="text-fed-red-400">{reputation.mentions_negative} négatives</span> ·{' '}
                {reputation.mentions_neutral} neutres — instantané du {new Date(reputation.created_at).toLocaleDateString('fr-FR')}
              </p>
              {reputation.controversies.length > 0 && (
                <div className="bg-fed-red-500/10 rounded-lg p-3 text-xs text-fed-red-400">
                  {reputation.controversies.map((c, i) => <p key={i}>⚠ {c.topic} ({c.severity}) — {c.recommendation}</p>)}
                </div>
              )}
              {reputation.communication_opportunities.length > 0 && (
                <div className="bg-dark-900 rounded-lg p-3 text-xs text-light-300 space-y-1">
                  {reputation.communication_opportunities.map((o, i) => (
                    <p key={i}><Sparkles className="h-3 w-3 text-fed-gold-500 inline mr-1" /> {o.opportunity} → {o.action}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaGrowthPage;
