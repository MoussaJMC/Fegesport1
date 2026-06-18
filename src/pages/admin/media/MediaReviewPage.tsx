import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft, Check, X, RefreshCw, Pencil, Globe2, Mail, Copy,
  Loader2, Sparkles, AlertTriangle, ShieldCheck, Send, SlidersHorizontal, Megaphone,
} from 'lucide-react';
import {
  getMediaEvent, listGeneratedArticles, listSocialPosts, generateContent,
  approveArticle, rejectArticle, approveSocialPost, rejectSocialPost,
  updateGeneratedArticle, updateSocialPost, publishArticleToSite,
  markSocialPostReady, createCampaignFromArticle,
} from '../../../lib/mediaCenterService';
import type {
  MediaEvent, GeneratedArticle, SocialPost, GenerationTarget,
} from '../../../types/mediaCenter';
import { TARGET_LABELS } from '../../../types/mediaCenter';
import ArticleEditor from '../../../components/admin/media/ArticleEditor';
import DistributionPanel from '../../../components/admin/media/DistributionPanel';

const STATUS_BADGE: Record<string, string> = {
  pending_review: 'bg-fed-gold-500/10 text-fed-gold-500',
  approved: 'bg-accent-blue-400/10 text-accent-blue-400',
  rejected: 'bg-fed-red-500/10 text-fed-red-500',
  published: 'bg-emerald-500/10 text-emerald-400',
  ready: 'bg-emerald-500/10 text-emerald-400',
};

const STATUS_LABEL: Record<string, string> = {
  pending_review: 'À valider',
  approved: 'Approuvé',
  rejected: 'Rejeté',
  published: 'Publié',
  ready: 'Prêt à publier',
};

type ReviewItem =
  | { kind: 'article'; target: GenerationTarget; data: GeneratedArticle }
  | { kind: 'social'; target: GenerationTarget; data: SocialPost };

const MediaReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<MediaEvent | null>(null);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [activeTarget, setActiveTarget] = useState<GenerationTarget>('press_article');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [regenInstructions, setRegenInstructions] = useState('');
  const [showRegen, setShowRegen] = useState(false);
  const [fullEditor, setFullEditor] = useState<GeneratedArticle | null>(null);
  const [showDistribute, setShowDistribute] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [ev, articles, posts] = await Promise.all([
        getMediaEvent(id),
        listGeneratedArticles({ event_id: id }),
        listSocialPosts({ event_id: id }),
      ]);
      setEvent(ev);
      const list: ReviewItem[] = [
        ...articles.map((a) => ({ kind: 'article' as const, target: a.content_type as GenerationTarget, data: a })),
        ...posts.map((p) => ({ kind: 'social' as const, target: p.platform as GenerationTarget, data: p })),
      ];
      setItems(list);
      if (list.length && !list.some((i) => i.target === activeTarget)) {
        setActiveTarget(list[0].target);
      }
    } catch (e) {
      toast.error((e as Error).message);
      navigate('/admin/media/drafts');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, activeTarget]);

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const active = items.find((i) => i.target === activeTarget) ?? null;

  const withBusy = async (fn: () => Promise<void>, successMsg?: string) => {
    setBusy(true);
    try {
      await fn();
      if (successMsg) toast.success(successMsg);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleApprove = () => active && withBusy(async () => {
    if (active.kind === 'article') await approveArticle(active.data.id);
    else await approveSocialPost(active.data.id);
  }, 'Contenu approuvé');

  const handleReject = () => {
    if (!active) return;
    const reason = window.prompt('Motif du rejet (optionnel) :') ?? undefined;
    withBusy(async () => {
      if (active.kind === 'article') await rejectArticle(active.data.id, reason);
      else await rejectSocialPost(active.data.id, reason);
    }, 'Contenu rejeté');
  };

  const handleRegenerate = () => {
    if (!id || !active) return;
    setShowRegen(false);
    withBusy(async () => {
      toast.info(`Régénération de « ${TARGET_LABELS[active.target]} »…`);
      await generateContent(id, [active.target], regenInstructions || undefined);
      setRegenInstructions('');
    }, 'Contenu régénéré');
  };

  const startEdit = () => {
    if (!active) return;
    setEditValue(active.data.content);
    setEditTitle(active.kind === 'article' ? active.data.title : '');
    setEditing(true);
  };

  const saveEdit = () => active && withBusy(async () => {
    if (active.kind === 'article') {
      await updateGeneratedArticle(active.data.id, { content: editValue, ...(editTitle ? { title: editTitle } : {}) });
    } else {
      await updateSocialPost(active.data.id, { content: editValue });
    }
    setEditing(false);
  }, 'Modifications enregistrées');

  const handlePublish = () => {
    if (!active) return;
    if (active.kind === 'article' && active.data.content_type !== 'newsletter') {
      withBusy(async () => { await publishArticleToSite(active.data as GeneratedArticle); }, 'Article publié sur le site !');
    } else if (active.kind === 'article' && active.data.content_type === 'newsletter') {
      withBusy(async () => {
        const campaign = await createCampaignFromArticle(active.data as GeneratedArticle);
        toast.success('Campagne créée — direction Newsletters pour l\'envoyer.');
        navigate(`/admin/media/newsletters?campaign=${campaign.id}`);
      });
    } else {
      withBusy(async () => { await markSocialPostReady(active.data.id, active.target); }, 'Post marqué prêt à publier');
    }
  };

  const copyContent = () => {
    if (!active) return;
    const text = active.kind === 'social'
      ? `${active.data.content}\n\n${(active.data.hashtags ?? []).join(' ')}`
      : active.data.content;
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papiers');
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-fed-red-500" /></div>;
  }
  if (!event) return null;

  const activeArticle = active?.kind === 'article' ? (active.data as GeneratedArticle) : null;
  const editorCheck = activeArticle ? (activeArticle.fact_check ?? activeArticle.editor_check) : null;
  const mandatoryReview = !!activeArticle?.needs_mandatory_review && activeArticle.status === 'pending_review';

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/admin/media/drafts" className="p-2 bg-dark-800 border border-dark-700 rounded-lg text-light-300 hover:text-white shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white font-heading truncate">{event.title}</h1>
            <p className="text-light-400 text-xs">Validation humaine obligatoire avant toute publication</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link to={`/admin/media/events/${event.id}/edit`} className="inline-flex items-center px-3 py-2 text-sm text-light-300 bg-dark-800 border border-dark-700 rounded-lg hover:bg-dark-700 hover:text-white">
            <Pencil className="h-4 w-4 mr-1.5" /> Événement
          </Link>
          {items.length > 0 && (
            <button onClick={() => setShowDistribute(true)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-fed-red-500 rounded-lg hover:bg-fed-red-600">
              <Megaphone className="h-4 w-4 mr-1.5" /> Diffuser
            </button>
          )}
          {items.length === 0 && (
            <button onClick={() => id && withBusy(async () => { await generateContent(id); }, 'Contenus générés')} disabled={busy}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-fed-red-500 rounded-lg hover:bg-fed-red-600 disabled:opacity-50">
              {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />} Générer avec l'IA
            </button>
          )}
        </div>
      </div>

      {event.ai_summary && (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-fed-gold-500 font-bold mb-1">Analyse IA</p>
          <p className="text-light-300 text-sm">{event.ai_summary}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[...(event.ai_keywords ?? []), ...(event.ai_seo_tags ?? [])].slice(0, 12).map((k, i) => (
              <span key={`${k}-${i}`} className="text-xs bg-dark-700 text-light-300 px-2 py-0.5 rounded-full">{k}</span>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-12 text-center text-light-400 text-sm">
          Aucun contenu généré pour cet événement. Lancez la génération IA.
        </div>
      ) : (
        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
          <div className="flex overflow-x-auto border-b border-dark-700">
            {items.map((item) => (
              <button key={item.target} onClick={() => { setActiveTarget(item.target); setEditing(false); setShowRegen(false); }}
                className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                  item.target === activeTarget
                    ? 'border-fed-red-500 text-white font-medium'
                    : 'border-transparent text-light-400 hover:text-white'
                }`}>
                {TARGET_LABELS[item.target]}
                <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_BADGE[item.data.status] ?? ''}`}>
                  {STATUS_LABEL[item.data.status] ?? item.data.status}
                </span>
              </button>
            ))}
          </div>

          {active && (
            <div className="p-5 space-y-4">
              {mandatoryReview && (
                <div className="flex items-center gap-2 text-sm font-bold rounded-lg p-3 bg-fed-red-500/15 text-fed-red-400 border border-fed-red-500/30">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  RELECTURE OBLIGATOIRE — score de confiance {activeArticle?.fact_check_score ?? 0} / 100 (&lt; 70).
                  Vérifiez chaque fait avant d'approuver.
                </div>
              )}
              {editorCheck && (
                <div className={`text-xs rounded-lg p-3 space-y-1.5 ${
                  editorCheck.hallucination_risk === 'high' || mandatoryReview
                    ? 'bg-fed-red-500/10 text-fed-red-400'
                    : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  <div className="flex items-start gap-2">
                    {editorCheck.hallucination_risk === 'high' ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <ShieldCheck className="h-4 w-4 shrink-0" />}
                    <span>
                      Fact Checker — confiance {activeArticle?.fact_check_score ?? editorCheck.confidence ?? '?'} / 100 ·
                      qualité {editorCheck.quality_score ?? '?'} / 100 ·
                      hallucination : {editorCheck.hallucination_risk ?? 'n/a'}
                      {editorCheck.issues?.length ? ` · ${editorCheck.issues.join(' ; ')}` : ' · aucun problème détecté'}
                    </span>
                  </div>
                  {(editorCheck.checked_facts ?? []).length > 0 && (
                    <details className="ml-6 text-light-400">
                      <summary className="cursor-pointer">Faits vérifiés ({editorCheck.checked_facts!.length})</summary>
                      <ul className="mt-1 space-y-0.5 list-disc list-inside">
                        {editorCheck.checked_facts!.map((f, i) => (
                          <li key={i}>
                            {f.claim} — <span className={f.confidence >= 70 ? 'text-emerald-400' : 'text-fed-red-400'}>
                              source : {f.source} · confiance : {f.confidence}{f.date ? ` · date : ${f.date}` : ''}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              )}

              {active.data.status === 'rejected' && active.data.rejection_reason && (
                <p className="text-xs text-fed-red-400">Rejeté : {active.data.rejection_reason}</p>
              )}

              {editing ? (
                <div className="space-y-3">
                  {active.kind === 'article' && (
                    <input className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white"
                      value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  )}
                  <textarea className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white min-h-[320px] font-mono"
                    value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={busy} className="inline-flex items-center px-4 py-2 text-sm text-white bg-fed-red-500 rounded-lg hover:bg-fed-red-600 disabled:opacity-50">
                      <Check className="h-4 w-4 mr-1.5" /> Enregistrer
                    </button>
                    <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-light-300 bg-dark-700 rounded-lg hover:text-white">Annuler</button>
                  </div>
                </div>
              ) : (
                <>
                  {active.kind === 'article' && (
                    <div>
                      <h2 className="text-lg font-bold text-white font-heading">{(active.data as GeneratedArticle).title}</h2>
                      {(active.data as GeneratedArticle).excerpt && (
                        <p className="text-light-400 text-sm mt-1 italic">{(active.data as GeneratedArticle).excerpt}</p>
                      )}
                    </div>
                  )}
                  {active.kind === 'article' && (active.data as GeneratedArticle).content_type === 'newsletter' ? (
                    <div className="bg-white rounded-lg overflow-hidden">
                      <iframe title="Aperçu newsletter" srcDoc={active.data.content} className="w-full h-[480px] border-0" sandbox="" />
                    </div>
                  ) : (
                    <div className="bg-dark-900 rounded-lg p-4 text-light-200 text-sm whitespace-pre-wrap max-h-[480px] overflow-y-auto leading-relaxed">
                      {active.data.content}
                      {active.kind === 'social' && (active.data as SocialPost).hashtags?.length > 0 && (
                        <p className="mt-3 text-accent-blue-400">{(active.data as SocialPost).hashtags.join(' ')}</p>
                      )}
                    </div>
                  )}
                  {active.kind === 'social' && ((active.data as SocialPost).cta || (active.data as SocialPost).visual_suggestion) && (
                    <div className="text-xs text-light-400 border-t border-dark-700 pt-3 space-y-0.5">
                      {(active.data as SocialPost).cta && <p><span className="text-fed-gold-500">CTA :</span> {(active.data as SocialPost).cta}</p>}
                      {(active.data as SocialPost).visual_suggestion && <p><span className="text-fed-gold-500">Visuel suggéré :</span> {(active.data as SocialPost).visual_suggestion}</p>}
                    </div>
                  )}
                  {active.kind === 'article' && (active.data as GeneratedArticle).meta_description && (
                    <div className="text-xs text-light-500 border-t border-dark-700 pt-3 space-y-0.5">
                      <p><span className="text-light-400">SEO slug :</span> {(active.data as GeneratedArticle).slug}</p>
                      <p><span className="text-light-400">Meta :</span> {(active.data as GeneratedArticle).meta_description}</p>
                      <p><span className="text-light-400">Mots-clés :</span> {((active.data as GeneratedArticle).keywords ?? []).join(', ')}</p>
                    </div>
                  )}
                </>
              )}

              {showRegen && (
                <div className="bg-dark-900 border border-dark-700 rounded-lg p-3 space-y-2">
                  <label className="text-xs text-light-400">Consignes pour la régénération (optionnel)</label>
                  <input className="w-full bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white"
                    value={regenInstructions} onChange={(e) => setRegenInstructions(e.target.value)}
                    placeholder="Ex : ton plus institutionnel, insister sur la jeunesse guinéenne…" />
                  <div className="flex gap-2">
                    <button onClick={handleRegenerate} disabled={busy} className="inline-flex items-center px-3 py-1.5 text-xs text-white bg-fed-red-500 rounded-lg disabled:opacity-50">
                      <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${busy ? 'animate-spin' : ''}`} /> Lancer
                    </button>
                    <button onClick={() => setShowRegen(false)} className="px-3 py-1.5 text-xs text-light-300 bg-dark-700 rounded-lg">Annuler</button>
                  </div>
                </div>
              )}

              {!editing && (
                <div className="flex flex-wrap gap-2 border-t border-dark-700 pt-4">
                  <button onClick={startEdit} disabled={busy} className="inline-flex items-center px-3.5 py-2 text-sm text-light-300 bg-dark-700 rounded-lg hover:text-white disabled:opacity-50">
                    <Pencil className="h-4 w-4 mr-1.5" /> Modifier
                  </button>
                  {active.kind === 'article' && (
                    <button onClick={() => setFullEditor(active.data as GeneratedArticle)} disabled={busy}
                      className="inline-flex items-center px-3.5 py-2 text-sm text-light-300 bg-dark-700 rounded-lg hover:text-white disabled:opacity-50">
                      <SlidersHorizontal className="h-4 w-4 mr-1.5" /> Éditeur complet
                    </button>
                  )}
                  <button onClick={() => setShowRegen((v) => !v)} disabled={busy} className="inline-flex items-center px-3.5 py-2 text-sm text-light-300 bg-dark-700 rounded-lg hover:text-white disabled:opacity-50">
                    <RefreshCw className="h-4 w-4 mr-1.5" /> Régénérer
                  </button>
                  <button onClick={copyContent} className="inline-flex items-center px-3.5 py-2 text-sm text-light-300 bg-dark-700 rounded-lg hover:text-white">
                    <Copy className="h-4 w-4 mr-1.5" /> Copier
                  </button>
                  <div className="flex-1" />
                  {active.data.status === 'pending_review' && (
                    <>
                      <button onClick={handleReject} disabled={busy} className="inline-flex items-center px-3.5 py-2 text-sm text-fed-red-400 bg-fed-red-500/10 rounded-lg hover:bg-fed-red-500/20 disabled:opacity-50">
                        <X className="h-4 w-4 mr-1.5" /> Rejeter
                      </button>
                      <button onClick={handleApprove} disabled={busy} className="inline-flex items-center px-3.5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50">
                        <Check className="h-4 w-4 mr-1.5" /> Approuver
                      </button>
                    </>
                  )}
                  {active.data.status === 'approved' && (
                    <button onClick={handlePublish} disabled={busy}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-fed-red-500 rounded-lg hover:bg-fed-red-600 disabled:opacity-50">
                      {active.kind === 'article' && (active.data as GeneratedArticle).content_type === 'newsletter'
                        ? <><Mail className="h-4 w-4 mr-1.5" /> Créer la campagne</>
                        : active.kind === 'article'
                          ? <><Globe2 className="h-4 w-4 mr-1.5" /> Publier sur le site</>
                          : <><Send className="h-4 w-4 mr-1.5" /> Marquer prêt à publier</>}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {fullEditor && (
        <ArticleEditor
          article={fullEditor}
          onClose={() => setFullEditor(null)}
          onSaved={() => { load(); }}
        />
      )}

      {showDistribute && (
        <DistributionPanel
          eventId={event.id}
          title={event.title}
          onClose={() => setShowDistribute(false)}
        />
      )}
    </div>
  );
};

export default MediaReviewPage;
