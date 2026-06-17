import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Rss, Loader2, Plus, Pencil, Trash2, ArrowLeft, Check, X, AlertTriangle } from 'lucide-react';
import { listSources, saveSource, deleteSource } from '../../../lib/mediaCenterService';
import type { NewsSource } from '../../../types/mediaCenter';

const inputCls = 'w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white placeholder-light-500';
const emptyForm: Partial<NewsSource> = { name: '', organization: '', website_url: '', feed_url: '', source_type: 'rss', is_active: true };

const MediaSourcesPage = () => {
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<NewsSource> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setSources(await listSources());
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form?.name?.trim()) { toast.error('Le nom est obligatoire'); return; }
    setSaving(true);
    try {
      await saveSource({ ...form, name: form.name.trim(), feed_url: form.feed_url || null } as Partial<NewsSource> & { name: string });
      toast.success('Source enregistrée');
      setForm(null);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (source: NewsSource) => {
    if (!window.confirm(`Supprimer la source « ${source.name} » ?`)) return;
    try {
      await deleteSource(source.id);
      setSources((prev) => prev.filter((s) => s.id !== source.id));
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const toggleActive = async (source: NewsSource) => {
    await saveSource({ id: source.id, name: source.name, is_active: !source.is_active });
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/media/watch" className="p-2 bg-dark-800 border border-dark-700 rounded-lg text-light-300 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
              <Rss className="h-6 w-6 text-fed-red-500" /> Sources de veille
            </h1>
            <p className="text-light-400 mt-0.5 text-sm">Seules les sources avec un flux RSS/Atom sont scannées automatiquement.</p>
          </div>
        </div>
        <button onClick={() => setForm(emptyForm)} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-fed-red-500 rounded-lg hover:bg-fed-red-600">
          <Plus className="h-4 w-4 mr-1.5" /> Ajouter une source
        </button>
      </div>

      {form && (
        <div className="bg-dark-800 border border-fed-red-500/30 rounded-xl p-5 space-y-4">
          <h2 className="font-bold text-white font-heading text-sm">{form.id ? 'Modifier la source' : 'Nouvelle source'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input className={inputCls} placeholder="Nom *" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={inputCls} placeholder="Organisation" value={form.organization ?? ''} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
            <input className={inputCls} placeholder="Site web (https://…)" value={form.website_url ?? ''} onChange={(e) => setForm({ ...form, website_url: e.target.value })} />
            <input className={inputCls} placeholder="Flux RSS/Atom (https://…/feed)" value={form.feed_url ?? ''} onChange={(e) => setForm({ ...form, feed_url: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center px-4 py-2 text-sm text-white bg-fed-red-500 rounded-lg disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Check className="h-4 w-4 mr-1.5" />} Enregistrer
            </button>
            <button onClick={() => setForm(null)} className="inline-flex items-center px-4 py-2 text-sm text-light-300 bg-dark-700 rounded-lg hover:text-white">
              <X className="h-4 w-4 mr-1.5" /> Annuler
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-fed-red-500" /></div>
      ) : (
        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
          <ul className="divide-y divide-dark-700">
            {sources.map((source) => (
              <li key={source.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium truncate">{source.name}</p>
                    {!source.is_active && <span className="text-[10px] bg-dark-700 text-light-400 px-2 py-0.5 rounded-full">inactive</span>}
                    {source.last_fetch_status === 'error' && (
                      <span className="text-[10px] bg-fed-red-500/10 text-fed-red-400 px-2 py-0.5 rounded-full inline-flex items-center gap-1" title={source.fetch_error ?? ''}>
                        <AlertTriangle className="h-3 w-3" /> erreur
                      </span>
                    )}
                  </div>
                  <p className="text-light-400 text-xs mt-0.5 truncate">
                    {source.feed_url ? `RSS : ${source.feed_url}` : 'Pas de flux RSS — scan manuel uniquement'}
                    {source.last_fetched_at ? ` · dernier scan : ${new Date(source.last_fetched_at).toLocaleString('fr-FR')}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 ml-4 shrink-0">
                  <button onClick={() => toggleActive(source)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg ${source.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-dark-700 text-light-400'}`}>
                    {source.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => setForm(source)} className="p-2 text-light-400 hover:text-white"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(source)} className="p-2 text-light-400 hover:text-fed-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MediaSourcesPage;
