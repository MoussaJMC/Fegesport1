import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Save, Sparkles, Upload, Trash2, FileText, Image as ImageIcon, Film,
  ArrowLeft, Loader2, Plus, X,
} from 'lucide-react';
import {
  getMediaEvent, saveMediaEvent, listEventFiles, uploadEventFile,
  deleteEventFile, generateContent,
} from '../../../lib/mediaCenterService';
import type { MediaEvent, MediaEventFile, MediaFileType, EventResult } from '../../../types/mediaCenter';

const CATEGORIES = [
  { value: 'tournoi', label: 'Tournoi' },
  { value: 'formation', label: 'Formation' },
  { value: 'partenariat', label: 'Partenariat' },
  { value: 'institutionnel', label: 'Institutionnel' },
  { value: 'communaute', label: 'Communauté' },
  { value: 'international', label: 'International' },
  { value: 'autre', label: 'Autre' },
];

const FILE_TYPES: { value: MediaFileType; label: string; accept: string; icon: typeof ImageIcon }[] = [
  { value: 'photo', label: 'Photos', accept: 'image/*', icon: ImageIcon },
  { value: 'poster', label: 'Affiches', accept: 'image/*', icon: ImageIcon },
  { value: 'pdf', label: 'PDF', accept: 'application/pdf', icon: FileText },
  { value: 'video', label: 'Vidéos', accept: 'video/mp4,video/webm', icon: Film },
];

const inputCls = 'w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white placeholder-light-500 focus:outline-none focus:border-fed-red-500/50';
const labelCls = 'block text-sm text-light-300 mb-1.5';

const MediaEventFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<MediaEventFile[]>([]);
  const [clubInput, setClubInput] = useState('');

  const [form, setForm] = useState<Partial<MediaEvent>>({
    title: '',
    event_date: '',
    event_time: '',
    location: '',
    description: '',
    organizer: 'FEGESPORT',
    category: 'tournoi',
    participants_count: null,
    clubs: [],
    results: [],
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [event, eventFiles] = await Promise.all([getMediaEvent(id), listEventFiles(id)]);
        setForm(event);
        setFiles(eventFiles);
      } catch (e) {
        toast.error(`Événement introuvable : ${(e as Error).message}`);
        navigate('/admin/media');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const set = (key: keyof MediaEvent, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const canSave = useMemo(() => !!form.title?.trim() && !!form.description?.trim(), [form.title, form.description]);

  const handleSave = async (): Promise<MediaEvent | null> => {
    if (!canSave) {
      toast.error('Le titre et la description sont obligatoires.');
      return null;
    }
    setSaving(true);
    try {
      const saved = await saveMediaEvent({
        ...form,
        title: form.title!.trim(),
        description: form.description!.trim(),
        event_date: form.event_date || null,
        participants_count: form.participants_count || null,
      } as Partial<MediaEvent> & { title: string; description: string });
      toast.success(isEdit ? 'Événement mis à jour' : 'Événement créé');
      if (!isEdit) navigate(`/admin/media/events/${saved.id}/edit`, { replace: true });
      return saved;
    } catch (e) {
      toast.error(`Enregistrement impossible : ${(e as Error).message}`);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    const saved = await handleSave();
    if (!saved) return;
    setGenerating(true);
    toast.info('Génération IA lancée (analyse + 6 contenus). Cela peut prendre 1 à 2 minutes…');
    try {
      await generateContent(saved.id);
      toast.success('Contenus générés ! Place à la validation humaine.');
      navigate(`/admin/media/events/${saved.id}/review`);
    } catch (e) {
      toast.error(`Génération échouée : ${(e as Error).message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleUpload = async (fileList: FileList | null, type: MediaFileType) => {
    if (!fileList?.length || !id) return;
    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        const uploaded = await uploadEventFile(id, file, type);
        setFiles((prev) => [...prev, uploaded]);
      }
      toast.success(`${fileList.length} fichier(s) ajouté(s)`);
    } catch (e) {
      toast.error(`Upload échoué : ${(e as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (file: MediaEventFile) => {
    try {
      await deleteEventFile(file);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (e) {
      toast.error(`Suppression impossible : ${(e as Error).message}`);
    }
  };

  const addClub = () => {
    const club = clubInput.trim();
    if (!club) return;
    set('clubs', [...(form.clubs ?? []), club]);
    setClubInput('');
  };

  const updateResult = (index: number, patch: Partial<EventResult>) => {
    const results = [...(form.results ?? [])];
    results[index] = { ...results[index], ...patch };
    set('results', results);
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-fed-red-500" /></div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-dark-800 border border-dark-700 rounded-lg text-light-300 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-2xl font-bold text-white font-heading">
            {isEdit ? 'Modifier l\'événement' : 'Nouvel événement'}
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving || !canSave}
            className="inline-flex items-center px-4 py-2 text-sm text-light-300 bg-dark-800 border border-dark-700 rounded-lg hover:bg-dark-700 hover:text-white transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />} Enregistrer
          </button>
          <button onClick={handleGenerate} disabled={generating || !canSave}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-fed-red-500 rounded-lg hover:bg-fed-red-600 transition-colors disabled:opacity-50">
            {generating ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
            {generating ? 'Génération…' : 'Générer avec l\'IA'}
          </button>
        </div>
      </div>

      <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 space-y-5">
        <h2 className="font-bold text-white font-heading text-sm uppercase tracking-wide">Informations événement</h2>
        <div>
          <label className={labelCls}>Titre *</label>
          <input className={inputCls} value={form.title ?? ''} onChange={(e) => set('title', e.target.value)}
            placeholder="Ex : Tournoi National FC26" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" className={inputCls} value={form.event_date ?? ''} onChange={(e) => set('event_date', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Heure</label>
            <input className={inputCls} value={form.event_time ?? ''} onChange={(e) => set('event_time', e.target.value)} placeholder="14h00" />
          </div>
          <div>
            <label className={labelCls}>Lieu</label>
            <input className={inputCls} value={form.location ?? ''} onChange={(e) => set('location', e.target.value)} placeholder="Conakry" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Organisateur</label>
            <input className={inputCls} value={form.organizer ?? ''} onChange={(e) => set('organizer', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Catégorie</label>
            <select className={inputCls} value={form.category ?? 'tournoi'} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Participants</label>
            <input type="number" min={0} className={inputCls} value={form.participants_count ?? ''}
              onChange={(e) => set('participants_count', e.target.value ? Number(e.target.value) : null)} placeholder="32" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Description * <span className="text-light-500">(seule source de vérité pour l'IA — soyez factuel et complet)</span></label>
          <textarea className={`${inputCls} min-h-[140px]`} value={form.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Déroulé de l'événement, contexte, moments forts, personnalités présentes…" />
        </div>

        <div>
          <label className={labelCls}>Clubs présents</label>
          <div className="flex gap-2">
            <input className={inputCls} value={clubInput} onChange={(e) => setClubInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addClub(); } }}
              placeholder="Nom du club puis Entrée" />
            <button onClick={addClub} className="px-3 bg-dark-700 rounded-lg text-light-300 hover:text-white"><Plus className="h-4 w-4" /></button>
          </div>
          {(form.clubs ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {(form.clubs ?? []).map((club, i) => (
                <span key={`${club}-${i}`} className="inline-flex items-center gap-1.5 text-xs bg-dark-700 text-light-200 px-2.5 py-1 rounded-full">
                  {club}
                  <button onClick={() => set('clubs', (form.clubs ?? []).filter((_, j) => j !== i))} className="text-light-400 hover:text-fed-red-500"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm text-light-300">Résultats</label>
            <button onClick={() => set('results', [...(form.results ?? []), { rank: (form.results?.length ?? 0) + 1, name: '', prize: '' }])}
              className="text-xs text-fed-gold-500 hover:text-fed-gold-400 inline-flex items-center"><Plus className="h-3.5 w-3.5 mr-1" /> Ajouter</button>
          </div>
          {(form.results ?? []).map((result, i) => (
            <div key={i} className="grid grid-cols-[70px_1fr_1fr_36px] gap-2 mb-2">
              <input type="number" min={1} className={inputCls} value={result.rank}
                onChange={(e) => updateResult(i, { rank: Number(e.target.value) })} placeholder="#" />
              <input className={inputCls} value={result.name} onChange={(e) => updateResult(i, { name: e.target.value })} placeholder="Joueur / équipe" />
              <input className={inputCls} value={result.prize ?? ''} onChange={(e) => updateResult(i, { prize: e.target.value })} placeholder="Dotation (optionnel)" />
              <button onClick={() => set('results', (form.results ?? []).filter((_, j) => j !== i))}
                className="text-light-400 hover:text-fed-red-500"><Trash2 className="h-4 w-4 mx-auto" /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-dark-800 rounded-xl border border-dark-700 p-6 space-y-4">
        <h2 className="font-bold text-white font-heading text-sm uppercase tracking-wide">Médias</h2>
        {!isEdit ? (
          <p className="text-light-400 text-sm">Enregistrez d'abord l'événement pour ajouter photos, affiches, PDF et vidéos.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {FILE_TYPES.map((ft) => (
                <label key={ft.value} className="flex flex-col items-center justify-center gap-2 p-4 bg-dark-900 border border-dashed border-dark-600 rounded-xl cursor-pointer hover:border-fed-red-500/40 transition-colors">
                  <ft.icon className="h-5 w-5 text-light-400" />
                  <span className="text-xs text-light-300">{ft.label}</span>
                  <input type="file" multiple className="hidden" accept={ft.accept} disabled={uploading}
                    onChange={(e) => { handleUpload(e.target.files, ft.value); e.target.value = ''; }} />
                </label>
              ))}
            </div>
            {uploading && <p className="text-fed-gold-500 text-sm flex items-center gap-2"><Upload className="h-4 w-4 animate-pulse" /> Upload en cours…</p>}
            {files.length > 0 && (
              <ul className="divide-y divide-dark-700 border border-dark-700 rounded-lg overflow-hidden">
                {files.map((file) => (
                  <li key={file.id} className="flex items-center justify-between px-4 py-2.5 bg-dark-900/50">
                    <div className="flex items-center gap-3 min-w-0">
                      {(file.file_type === 'photo' || file.file_type === 'poster') ? (
                        <img src={file.public_url} alt="" className="h-9 w-9 rounded object-cover" />
                      ) : (
                        <FileText className="h-5 w-5 text-light-400" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{file.file_name}</p>
                        <p className="text-xs text-light-500">{file.file_type}{file.file_size ? ` · ${Math.round(file.file_size / 1024)} Ko` : ''}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteFile(file)} className="text-light-400 hover:text-fed-red-500 p-1.5"><Trash2 className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MediaEventFormPage;
