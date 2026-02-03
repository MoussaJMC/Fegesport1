import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Save, X, Trophy, Users, Target } from 'lucide-react';

interface Discipline {
  id: string;
  name: string;
  games: string[];
  icon: string;
  color: string;
  is_active: boolean;
  sort_order: number;
}

interface Club {
  id: string;
  name: string;
  city: string;
  region: string;
  leader_name: string;
  leader_title: string;
  leader_photo?: string;
  leader_quote?: string;
  latitude?: number;
  longitude?: number;
  color: string;
  logo?: string;
  trophies: number;
  stream_viewers: number;
  win_rate: number;
  rank: number;
  discord_url?: string;
  twitch_url?: string;
  twitter_url?: string;
  is_active: boolean;
}

export default function LEGAdminPage() {
  const [activeTab, setActiveTab] = useState<'disciplines' | 'clubs'>('disciplines');
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [showDisciplineForm, setShowDisciplineForm] = useState(false);
  const [showClubForm, setShowClubForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [disciplinesRes, clubsRes] = await Promise.all([
        supabase.from('leg_disciplines').select('*').order('sort_order'),
        supabase.from('leg_clubs').select('*').order('rank')
      ]);

      if (disciplinesRes.error) throw disciplinesRes.error;
      if (clubsRes.error) throw clubsRes.error;

      setDisciplines(disciplinesRes.data || []);
      setClubs(clubsRes.data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des données');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDiscipline = async (discipline: Partial<Discipline>) => {
    try {
      if (discipline.id) {
        const { error } = await supabase
          .from('leg_disciplines')
          .update(discipline)
          .eq('id', discipline.id);
        if (error) throw error;
        toast.success('Discipline mise à jour');
      } else {
        const { error } = await supabase
          .from('leg_disciplines')
          .insert([discipline]);
        if (error) throw error;
        toast.success('Discipline créée');
      }
      setShowDisciplineForm(false);
      setEditingDiscipline(null);
      fetchData();
    } catch (error: any) {
      toast.error('Erreur lors de l\'enregistrement');
      console.error(error);
    }
  };

  const handleDeleteDiscipline = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette discipline ?')) return;

    try {
      const { error } = await supabase
        .from('leg_disciplines')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Discipline supprimée');
      fetchData();
    } catch (error: any) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    }
  };

  const handleSaveClub = async (club: Partial<Club>) => {
    try {
      if (club.id) {
        const { error } = await supabase
          .from('leg_clubs')
          .update(club)
          .eq('id', club.id);
        if (error) throw error;
        toast.success('Club mis à jour');
      } else {
        const { error } = await supabase
          .from('leg_clubs')
          .insert([club]);
        if (error) throw error;
        toast.success('Club créé');
      }
      setShowClubForm(false);
      setEditingClub(null);
      fetchData();
    } catch (error: any) {
      toast.error('Erreur lors de l\'enregistrement');
      console.error(error);
    }
  };

  const handleDeleteClub = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce club ?')) return;

    try {
      const { error } = await supabase
        .from('leg_clubs')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Club supprimé');
      fetchData();
    } catch (error: any) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestion eLeague</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('disciplines')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'disciplines'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Target className="inline-block w-5 h-5 mr-2" />
              Disciplines
            </button>
            <button
              onClick={() => setActiveTab('clubs')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'clubs'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="inline-block w-5 h-5 mr-2" />
              Clubs
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'disciplines' && (
            <DisciplinesTab
              disciplines={disciplines}
              showForm={showDisciplineForm}
              setShowForm={setShowDisciplineForm}
              editing={editingDiscipline}
              setEditing={setEditingDiscipline}
              onSave={handleSaveDiscipline}
              onDelete={handleDeleteDiscipline}
            />
          )}

          {activeTab === 'clubs' && (
            <ClubsTab
              clubs={clubs}
              showForm={showClubForm}
              setShowForm={setShowClubForm}
              editing={editingClub}
              setEditing={setEditingClub}
              onSave={handleSaveClub}
              onDelete={handleDeleteClub}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DisciplinesTab({
  disciplines,
  showForm,
  setShowForm,
  editing,
  setEditing,
  onSave,
  onDelete
}: any) {
  const [formData, setFormData] = useState<Partial<Discipline>>({
    name: '',
    games: [],
    icon: '',
    color: '#6B7280',
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    if (editing) {
      setFormData(editing);
    } else {
      setFormData({
        name: '',
        games: [],
        icon: '',
        color: '#6B7280',
        is_active: true,
        sort_order: 0
      });
    }
  }, [editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Disciplines</h2>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle discipline
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icône (emoji)
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="🎮"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couleur
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordre
              </label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jeux (séparés par des virgules)
            </label>
            <input
              type="text"
              value={formData.games?.join(', ')}
              onChange={(e) => setFormData({ ...formData, games: e.target.value.split(',').map(g => g.trim()) })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="League of Legends, Dota 2"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">Active</label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              className="btn-secondary"
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {disciplines.map((discipline: Discipline) => (
          <div key={discipline.id} className="border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl">{discipline.icon}</div>
              <div>
                <h3 className="font-semibold">{discipline.name}</h3>
                <p className="text-sm text-gray-600">{discipline.games.join(', ')}</p>
              </div>
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: discipline.color }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(discipline);
                  setShowForm(true);
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(discipline.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClubsTab({
  clubs,
  showForm,
  setShowForm,
  editing,
  setEditing,
  onSave,
  onDelete
}: any) {
  const [formData, setFormData] = useState<Partial<Club>>({
    name: '',
    city: '',
    region: '',
    leader_name: '',
    leader_title: '',
    color: '#6B7280',
    trophies: 0,
    stream_viewers: 0,
    win_rate: 0,
    rank: 0,
    is_active: true
  });

  useEffect(() => {
    if (editing) {
      setFormData(editing);
    } else {
      setFormData({
        name: '',
        city: '',
        region: '',
        leader_name: '',
        leader_title: '',
        color: '#6B7280',
        trophies: 0,
        stream_viewers: 0,
        win_rate: 0,
        rank: 0,
        is_active: true
      });
    }
  }, [editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Clubs</h2>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau club
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du club *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Région *
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couleur
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du leader *
              </label>
              <input
                type="text"
                value={formData.leader_name}
                onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du leader
              </label>
              <input
                type="text"
                value={formData.leader_title}
                onChange={(e) => setFormData({ ...formData, leader_title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Représentant Fédéral"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trophées
              </label>
              <input
                type="number"
                value={formData.trophies}
                onChange={(e) => setFormData({ ...formData, trophies: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Viewers stream
              </label>
              <input
                type="number"
                value={formData.stream_viewers}
                onChange={(e) => setFormData({ ...formData, stream_viewers: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taux de victoire (%)
              </label>
              <input
                type="number"
                value={formData.win_rate}
                onChange={(e) => setFormData({ ...formData, win_rate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classement
              </label>
              <input
                type="number"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                value={formData.latitude || ''}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                step="0.0001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                value={formData.longitude || ''}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                step="0.0001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Discord
              </label>
              <input
                type="url"
                value={formData.discord_url}
                onChange={(e) => setFormData({ ...formData, discord_url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Twitch
              </label>
              <input
                type="url"
                value={formData.twitch_url}
                onChange={(e) => setFormData({ ...formData, twitch_url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Twitter
              </label>
              <input
                type="url"
                value={formData.twitter_url}
                onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Logo
              </label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Citation du leader
            </label>
            <textarea
              value={formData.leader_quote}
              onChange={(e) => setFormData({ ...formData, leader_quote: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={2}
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm text-gray-700">Actif</label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              className="btn-secondary"
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {clubs.map((club: Club) => (
          <div key={club.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{club.name}</h3>
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: club.color }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>📍 {club.city}, {club.region}</div>
                  <div>👤 {club.leader_name}</div>
                  <div><Trophy className="inline w-4 h-4" /> {club.trophies} trophées</div>
                  <div>🏆 Classement: #{club.rank}</div>
                  <div>📊 Victoires: {club.win_rate}%</div>
                  <div>👥 {club.stream_viewers} viewers</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(club);
                    setShowForm(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(club.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
