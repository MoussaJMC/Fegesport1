import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { X, Save, Eye, Globe2, Loader2, History, AlertTriangle, FileText } from 'lucide-react';
import {
  saveArticleEdit, updatePublishedArticle, listArticleHistory,
  ArticleEditableFields,
} from '../../../lib/mediaCenterService';
import type { GeneratedArticle, PublicationLog } from '../../../types/mediaCenter';
import { TARGET_LABELS } from '../../../types/mediaCenter';

interface Props {
  article: GeneratedArticle;
  onClose: () => void;
  onSaved: (updated: GeneratedArticle) => void;
}

const inputCls = 'w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white placeholder-light-500 focus:outline-none focus:border-fed-red-500/50';
const labelCls = 'block text-xs text-light-300 mb-1';

// Le statut "published" n'est PAS proposé manuellement : la publication passe par le
// bouton dédié (qui crée/maj la ligne news) pour éviter toute désynchronisation.
const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'pending_review', label: 'À valider (brouillon)' },
  { value: 'approved', label: 'Approuvé' },
  { value: 'rejected', label: 'Rejeté' },
];

const ACTION_LABELS: Record<string, string> = {
  edited: 'Modification', published: 'Publication', published_update: 'Mise à jour publication',
  approved: 'Approbation', rejected: 'Rejet', generated: 'Génération IA',
  regenerated: 'Régénération IA', synced_from_news: 'Synchro depuis news',
};

const ArticleEditor = ({ article, onClose, onSaved }: Props) => {
  const isNewsletter = article.content_type === 'newsletter';
  const isPublished = !!article.published_news_id;

  const [form, setForm] = useState({
    title: article.title ?? '',
    excerpt: article.excerpt ?? '',
    content: article.content ?? '',
    slug: article.slug ?? '',
    meta_title: article.meta_title ?? '',
    meta_description: article.meta_description ?? '',
    keywords: (article.keywords ?? []).join(', '),
    og_image: article.og_image ?? '',
    status: ['pending_review', 'approved', 'rejected'].includes(article.status) ? article.status : 'pending_review',
  });
  const [current, setCurrent] = useState<GeneratedArticle>(article);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [history, setHistory] = useState<PublicationLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    listArticleHistory(article.id).then(setHistory).catch(() => {});
  }, [article.id]);

  const buildUpdates = (overrideStatus?: string): ArticleEditableFields => ({
    title: form.title.trim(),
    excerpt: form.excerpt.trim() || null,
    content: form.content,
    slug: form.slug.trim() || null,
    meta_title: form.meta_title.trim() || null,
    meta_description: form.meta_description.trim() || null,
    keywords: form.keywords.split(',').map((k) => k.trim()).filter(Boolean),
    og_image: form.og_image.trim() || null,
    status: (overrideStatus ?? form.status) as GeneratedArticle['status'],
  });

  const dirty = useMemo(() => (
    form.title !== (current.title ?? '') ||
    form.excerpt !== (current.excerpt ?? '') ||
    form.content !== (current.content ?? '') ||
    form.slug !== (current.slug ?? '') ||
    form.meta_title !== (current.meta_title ?? '') ||
    form.meta_description !== (current.meta_description ?? '') ||
    form.keywords !== (current.keywords ?? []).join(', ') ||
    form.og_image !== (current.og_image ?? '') ||
    form.status !== current.status
  ), [form, current]);

  const refreshHistory = () => listArticleHistory(article.id).then(setHistory).catch(() => {});

  const doSave = async (overrideStatus?: string, successMsg = 'Modifications enregistrées') => {
    if (!form.title.trim()) { toast.error('Le titre est obligatoire.'); return null; }
    if (!form.content.trim()) { toast.error('Le contenu est obligatoire.'); return null; }
    setSaving(true);
    try {
      const updated = await saveArticleEdit(current, buildUpdates(overrideStatus));
      setCurrent(updated);
      onSaved(updated);
      await refreshHistory();
      toast.success(successMsg);
      return updated;
    } catch (e) {
      toast.error(`Échec de l'enregistrement : ${(e as Error).message}`);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePublication = async () => {
    // Toujours enregistrer le brouillon d'abord (source de vérité), puis pousser vers le site.
    const saved = await doSave(undefined, 'Brouillon enregistré');
    if (!saved) return;
    if (!window.confirm('Mettre à jour la version PUBLIQUE de cet article sur le site ?')) return;
    setSaving(true);
    try {
      await updatePublishedArticle(saved);
      await refreshHistory();
      toast.success('Version publique mise à jour sur le site.');
    } catch (e) {
      toast.error(`Échec de la mise à jour publique : ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-3xl my-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-700 sticky top-0 bg-dark-800 rounded-t-2xl z-10">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white font-heading truncate flex items-center gap-2">
              <FileText className="h-5 w-5 text-fed-red-500" /> Éditer — {TARGET_LABELS[article.content_type]}
            </h2>
            <p className="text-xs text-light-400 mt-0.5">
              {isPublished ? 'Article publié sur le site' : 'Brouillon / en revue'} · la version éditée fait foi
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-light-400 hover:text-white shrink-0"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {isPublished && (
            <div className="flex items-start gap-2 text-xs rounded-lg p-3 bg-accent-blue-400/10 text-accent-blue-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Article en ligne. « Enregistrer » met à jour le brouillon ; « Mettre à jour la publication » pousse vers le site (même URL).
            </div>
          )}

          <div>
            <label className={labelCls}>Titre *</label>
            <input className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Chapô / résumé</label>
            <textarea className={`${inputCls} min-h-[60px]`} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Contenu principal * {isNewsletter ? '(HTML)' : '(markdown)'}</label>
            <textarea className={`${inputCls} min-h-[280px] font-mono text-xs`} value={form.content} onChange={(e) => set('content', e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Slug (SEO — n'affecte pas l'URL)</label>
              <input className={inputCls} value={form.slug} onChange={(e) => set('slug', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Image principale (URL)</label>
              <input className={inputCls} value={form.og_image} onChange={(e) => set('og_image', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Meta title</label>
              <input className={inputCls} value={form.meta_title} onChange={(e) => set('meta_title', e.target.value)} maxLength={70} />
            </div>
            <div>
              <label className={labelCls}>Statut</label>
              <select className={inputCls} value={form.status} onChange={(e) => set('status', e.target.value)} disabled={isPublished}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                {isPublished && <option value="published">Publié</option>}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Meta description</label>
              <input className={inputCls} value={form.meta_description} onChange={(e) => set('meta_description', e.target.value)} maxLength={160} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Mots-clés SEO (séparés par des virgules)</label>
              <input className={inputCls} value={form.keywords} onChange={(e) => set('keywords', e.target.value)} />
            </div>
          </div>

          {/* Aperçu */}
          {showPreview && (
            isNewsletter ? (
              <div className="bg-white rounded-lg overflow-hidden">
                <iframe title="Aperçu" srcDoc={form.content} className="w-full h-[360px] border-0" sandbox="" />
              </div>
            ) : (
              <div className="bg-dark-900 rounded-lg p-4 text-light-200 text-sm whitespace-pre-wrap max-h-[360px] overflow-y-auto">
                <p className="text-white font-bold mb-2">{form.title}</p>
                {form.excerpt && <p className="italic text-light-400 mb-2">{form.excerpt}</p>}
                {form.content}
              </div>
            )
          )}

          {/* Historique */}
          <div className="border-t border-dark-700 pt-3">
            <button onClick={() => setShowHistory((v) => !v)} className="text-xs text-light-400 hover:text-white inline-flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" /> Historique ({history.length})
            </button>
            {showHistory && (
              <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {history.length === 0 && <li className="text-xs text-light-500">Aucun historique.</li>}
                {history.map((h) => (
                  <li key={h.id} className="text-xs text-light-400">
                    <span className="text-light-200">{ACTION_LABELS[h.action] ?? h.action}</span>
                    {' · '}{new Date(h.created_at).toLocaleString('fr-FR')}
                    {h.performed_by_email ? ` · ${h.performed_by_email}` : ''}
                    {(h.details as { old_status?: string; new_status?: string })?.new_status &&
                     (h.details as { old_status?: string }).old_status !== (h.details as { new_status?: string }).new_status
                      ? ` · ${(h.details as { old_status?: string }).old_status} → ${(h.details as { new_status?: string }).new_status}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 p-5 border-t border-dark-700 sticky bottom-0 bg-dark-800 rounded-b-2xl">
          <button onClick={() => setShowPreview((v) => !v)} className="inline-flex items-center px-3 py-2 text-sm text-light-300 bg-dark-700 rounded-lg hover:text-white">
            <Eye className="h-4 w-4 mr-1.5" /> {showPreview ? 'Masquer' : 'Aperçu'}
          </button>
          <div className="flex-1" />
          <button onClick={onClose} className="px-3 py-2 text-sm text-light-300 bg-dark-700 rounded-lg hover:text-white">Fermer</button>
          {!isPublished && (
            <button onClick={() => doSave('pending_review', 'Enregistré comme brouillon')} disabled={saving}
              className="inline-flex items-center px-3.5 py-2 text-sm text-light-200 bg-dark-700 rounded-lg hover:text-white disabled:opacity-50">
              Brouillon
            </button>
          )}
          <button onClick={() => doSave()} disabled={saving || !dirty}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-fed-red-500 rounded-lg hover:bg-fed-red-600 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />} Enregistrer
          </button>
          {isPublished && (
            <button onClick={handleUpdatePublication} disabled={saving}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:opacity-50">
              <Globe2 className="h-4 w-4 mr-1.5" /> Mettre à jour la publication
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;
