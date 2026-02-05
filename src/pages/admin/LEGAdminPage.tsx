import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Save, X, Trophy, Users, Target, Link as LinkIcon, Flame, Gamepad2 } from 'lucide-react';

interface Discipline {
  id: string;
  name: string;
  games: string[];
  icon: string;
  color: string;
  image?: string;
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

interface ClubDiscipline {
  id: string;
  club_id: string;
  discipline_id: string;
  roster: string[];
  achievements: string[];
  stats: any;
  club?: Club;
  discipline?: Discipline;
}

interface Tournament {
  id: string;
  title: string;
  discipline_id: string;
  description?: string;
  start_date: string;
  end_date?: string;
  prize_pool?: number;
  format: string;
  max_teams: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  is_active: boolean;
}

interface Stream {
  id: string;
  title: string;
  platform: 'youtube' | 'twitch';
  stream_id: string;
  description?: string;
  is_live: boolean;
  scheduled_for?: string;
  thumbnail_url?: string;
}

export default function LEGAdminPage() {
  const [activeTab, setActiveTab] = useState<'disciplines' | 'clubs' | 'rankings' | 'tournaments'>('disciplines');
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubDisciplines, setClubDisciplines] = useState<ClubDiscipline[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [editingClubDiscipline, setEditingClubDiscipline] = useState<ClubDiscipline | null>(null);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [showDisciplineForm, setShowDisciplineForm] = useState(false);
  const [showClubForm, setShowClubForm] = useState(false);
  const [showClubDisciplineForm, setShowClubDisciplineForm] = useState(false);
  const [showTournamentForm, setShowTournamentForm] = useState(false);
  const [showStreamForm, setShowStreamForm] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    fetchData();
    checkUserEmail();
  }, []);

  const checkUserEmail = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      setUserEmail(user.email);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [disciplinesRes, clubsRes, clubDisciplinesRes, tournamentsRes, streamsRes] = await Promise.all([
        supabase.from('leg_disciplines').select('*').order('sort_order'),
        supabase.from('leg_clubs').select('*').order('rank'),
        supabase.from('leg_club_disciplines').select('*, club:leg_clubs(*), discipline:leg_disciplines(*)'),
        supabase.from('events').select('*').eq('category', 'LEG').order('date', { ascending: false }),
        supabase.from('streams').select('*').order('created_at', { ascending: false })
      ]);

      if (disciplinesRes.error) throw disciplinesRes.error;
      if (clubsRes.error) throw clubsRes.error;
      if (clubDisciplinesRes.error) throw clubDisciplinesRes.error;

      setDisciplines(disciplinesRes.data || []);
      setClubs(clubsRes.data || []);
      setClubDisciplines(clubDisciplinesRes.data || []);
      setTournaments(tournamentsRes.data || []);
      setStreams(streamsRes.data || []);
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
      console.error('Erreur discipline:', error);
      if (error.code === '42501' || error.message?.includes('policy')) {
        toast.error(`Permission refusée. Votre email (${userEmail}) n'a pas les droits admin.`);
      } else {
        toast.error(`Erreur: ${error.message || 'Échec de l\'enregistrement'}`);
      }
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
      console.error('Erreur suppression discipline:', error);
      if (error.code === '42501' || error.message?.includes('policy')) {
        toast.error(`Permission refusée. Votre email (${userEmail}) n'a pas les droits admin.`);
      } else {
        toast.error(`Erreur: ${error.message || 'Échec de la suppression'}`);
      }
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
      console.error('Erreur club:', error);
      if (error.code === '42501' || error.message?.includes('policy')) {
        toast.error(`Permission refusée. Votre email (${userEmail}) n'a pas les droits admin.`);
      } else {
        toast.error(`Erreur: ${error.message || 'Échec de l\'enregistrement'}`);
      }
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
      console.error('Erreur suppression club:', error);
      if (error.code === '42501' || error.message?.includes('policy')) {
        toast.error(`Permission refusée. Votre email (${userEmail}) n'a pas les droits admin.`);
      } else {
        toast.error(`Erreur: ${error.message || 'Échec de la suppression'}`);
      }
    }
  };

  const handleSaveClubDiscipline = async (clubDiscipline: Partial<ClubDiscipline>) => {
    try {
      if (clubDiscipline.id) {
        const { error } = await supabase
          .from('leg_club_disciplines')
          .update({
            roster: clubDiscipline.roster,
            achievements: clubDiscipline.achievements,
            stats: clubDiscipline.stats
          })
          .eq('id', clubDiscipline.id);
        if (error) throw error;
        toast.success('Discipline du club mise à jour');
      } else {
        const { error } = await supabase
          .from('leg_club_disciplines')
          .insert([{
            club_id: clubDiscipline.club_id,
            discipline_id: clubDiscipline.discipline_id,
            roster: clubDiscipline.roster || [],
            achievements: clubDiscipline.achievements || [],
            stats: clubDiscipline.stats || {}
          }]);
        if (error) throw error;
        toast.success('Discipline du club créée');
      }
      setShowClubDisciplineForm(false);
      setEditingClubDiscipline(null);
      fetchData();
    } catch (error: any) {
      console.error('Erreur club discipline:', error);
      if (error.code === '42501' || error.message?.includes('policy')) {
        toast.error(`Permission refusée. Votre email (${userEmail}) n'a pas les droits admin.`);
      } else if (error.code === '23505') {
        toast.error('Cette association club-discipline existe déjà');
      } else {
        toast.error(`Erreur: ${error.message || 'Échec de l\'enregistrement'}`);
      }
    }
  };

  const handleDeleteClubDiscipline = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette association ?')) return;

    try {
      const { error } = await supabase
        .from('leg_club_disciplines')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Association supprimée');
      fetchData();
    } catch (error: any) {
      console.error('Erreur suppression club discipline:', error);
      if (error.code === '42501' || error.message?.includes('policy')) {
        toast.error(`Permission refusée. Votre email (${userEmail}) n'a pas les droits admin.`);
      } else {
        toast.error(`Erreur: ${error.message || 'Échec de la suppression'}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleSaveTournament = async (tournament: Partial<any>) => {
    try {
      const eventData = {
        title: tournament.title,
        description: tournament.description,
        date: tournament.start_date,
        category: 'LEG',
        type: 'online',
        status: tournament.status || 'upcoming',
        max_participants: tournament.max_teams,
        price: tournament.prize_pool,
        image_url: tournament.image_url
      };

      if (tournament.id) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', tournament.id);
        if (error) throw error;
        toast.success('Tournoi mis à jour');
      } else {
        const { error } = await supabase
          .from('events')
          .insert([eventData]);
        if (error) throw error;
        toast.success('Tournoi créé');
      }
      setShowTournamentForm(false);
      setEditingTournament(null);
      fetchData();
    } catch (error: any) {
      console.error('Erreur tournoi:', error);
      if (error.code === '42501' || error.message?.includes('policy')) {
        toast.error(`Permission refusée. Votre email (${userEmail}) n'a pas les droits admin.`);
      } else {
        toast.error(`Erreur: ${error.message || 'Échec de l\'enregistrement'}`);
      }
    }
  };

  const handleDeleteTournament = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tournoi ?')) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      toast.success('Tournoi supprimé');
      fetchData();
    } catch (error: any) {
      console.error('Erreur suppression tournoi:', error);
      if (error.code === '42501' || error.message?.includes('policy')) {
        toast.error(`Permission refusée. Votre email (${userEmail}) n'a pas les droits admin.`);
      } else {
        toast.error(`Erreur: ${error.message || 'Échec de la suppression'}`);
      }
    }
  };

  const handleSaveStream = async (stream: Partial<Stream>) => {
    try {
      if (stream.id) {
        const { error } = await supabase
          .from('streams')
          .update(stream)
          .eq('id', stream.id);
        if (error) throw error;
        toast.success('Stream mis à jour');
      } else {
        const { error } = await supabase
          .from('streams')
          .insert([stream]);
        if (error) throw error;
        toast.success('Stream créé');
      }
      setShowStreamForm(false);
      setEditingStream(null);
      fetchData();
    } catch (error: any) {
      console.error('Erreur stream:', error);
      if (error.code === '42501' || error.message?.includes('policy')) {
        toast.error(`Permission refusée. Votre email (${userEmail}) n'a pas les droits admin.`);
      } else {
        toast.error(`Erreur: ${error.message || 'Échec de l\'enregistrement'}`);
      }
    }
  };

  const handleDeleteStream = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce stream ?')) return;
    try {
      const { error } = await supabase.from('streams').delete().eq('id', id);
      if (error) throw error;
      toast.success('Stream supprimé');
      fetchData();
    } catch (error: any) {
      console.error('Erreur suppression stream:', error);
      if (error.code === '42501' || error.message?.includes('policy')) {
        toast.error(`Permission refusée. Votre email (${userEmail}) n'a pas les droits admin.`);
      } else {
        toast.error(`Erreur: ${error.message || 'Échec de la suppression'}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion eLeague (LEG)</h1>
          <p className="text-gray-600 mt-1">League eSport de Guinée - 8 Clubs, 5 Disciplines</p>
        </div>
      </div>

      {userEmail && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900">Utilisateur connecté</h3>
              <p className="text-sm text-blue-700 mt-1">
                Email: <span className="font-mono font-semibold">{userEmail}</span>
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Les droits de modification sont réservés aux emails admin autorisés:
                test@example.com, admin@fegesport.org, contact@fegesport.org
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab('disciplines')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'disciplines'
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Target className="inline-block w-5 h-5 mr-2" />
              5 Disciplines de Combat
            </button>
            <button
              onClick={() => setActiveTab('clubs')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'clubs'
                  ? 'border-b-2 border-yellow-500 text-yellow-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Trophy className="inline-block w-5 h-5 mr-2" />
              Les 8 Clubs Légendaires
            </button>
            <button
              onClick={() => setActiveTab('rankings')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'rankings'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Flame className="inline-block w-5 h-5 mr-2" />
              Classements Live
            </button>
            <button
              onClick={() => setActiveTab('tournaments')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'tournaments'
                  ? 'border-b-2 border-red-500 text-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Gamepad2 className="inline-block w-5 h-5 mr-2" />
              Tournois & Lives
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

          {activeTab === 'rankings' && (
            <RankingsTab
              clubs={clubs}
              clubDisciplines={clubDisciplines}
              disciplines={disciplines}
              showForm={showClubDisciplineForm}
              setShowForm={setShowClubDisciplineForm}
              editing={editingClubDiscipline}
              setEditing={setEditingClubDiscipline}
              onSave={handleSaveClubDiscipline}
              onDelete={handleDeleteClubDiscipline}
            />
          )}

          {activeTab === 'tournaments' && (
            <TournamentsTab
              tournaments={tournaments}
              streams={streams}
              disciplines={disciplines}
              showTournamentForm={showTournamentForm}
              setShowTournamentForm={setShowTournamentForm}
              showStreamForm={showStreamForm}
              setShowStreamForm={setShowStreamForm}
              editingTournament={editingTournament}
              setEditingTournament={setEditingTournament}
              editingStream={editingStream}
              setEditingStream={setEditingStream}
              onSaveTournament={handleSaveTournament}
              onDeleteTournament={handleDeleteTournament}
              onSaveStream={handleSaveStream}
              onDeleteStream={handleDeleteStream}
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
    image: '',
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
        image: '',
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de l'image
            </label>
            <input
              type="url"
              value={formData.image || ''}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://images.pexels.com/photos/..."
            />
            {formData.image && (
              <div className="mt-2 relative h-32 rounded-lg overflow-hidden">
                <img
                  src={formData.image}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
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
              {discipline.image && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                  <img
                    src={discipline.image}
                    alt={discipline.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo du leader (URL)
            </label>
            <input
              type="url"
              value={formData.leader_photo}
              onChange={(e) => setFormData({ ...formData, leader_photo: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
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

function RankingsTab({
  clubs,
  clubDisciplines,
  disciplines,
  showForm,
  setShowForm,
  editing,
  setEditing,
  onSave,
  onDelete
}: any) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          <Flame className="inline-block w-6 h-6 mr-2 text-orange-500" />
          Classements Live
        </h2>
        <p className="text-gray-700 mb-4">
          Gérez les performances et statistiques de chaque club par discipline. Ces données alimentent le classement en temps réel de la LEG.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white rounded-lg p-4 border-2 border-green-300">
            <div className="text-3xl font-black text-green-600">{clubs.length}</div>
            <div className="text-sm text-gray-600">Clubs actifs</div>
          </div>
          <div className="bg-white rounded-lg p-4 border-2 border-yellow-300">
            <div className="text-3xl font-black text-yellow-600">{disciplines.length}</div>
            <div className="text-sm text-gray-600">Disciplines</div>
          </div>
          <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
            <div className="text-3xl font-black text-blue-600">{clubDisciplines.length}</div>
            <div className="text-sm text-gray-600">Associations</div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Gestion des Statistiques par Club-Discipline</h3>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle association
        </button>
      </div>

      {showForm && (
        <ClubDisciplineForm
          editing={editing}
          clubs={clubs}
          disciplines={disciplines}
          onSave={onSave}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      <div className="grid gap-4">
        {clubDisciplines.map((cd: any) => (
          <div key={cd.id} className="border-2 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{cd.discipline?.icon}</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">
                      {cd.club?.name || 'Club inconnu'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {cd.discipline?.name} - {cd.club?.city}, {cd.club?.region}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {cd.roster && cd.roster.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-xs font-semibold text-blue-900 mb-2 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Roster ({cd.roster.length} joueurs)
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {cd.roster.slice(0, 5).map((player: string, idx: number) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {player}
                          </span>
                        ))}
                        {cd.roster.length > 5 && (
                          <span className="text-xs text-blue-600">+{cd.roster.length - 5}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {cd.achievements && cd.achievements.length > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <p className="text-xs font-semibold text-yellow-900 mb-2 flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        Achievements
                      </p>
                      <ul className="text-xs text-yellow-800 space-y-1">
                        {cd.achievements.slice(0, 3).map((achievement: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-yellow-500">•</span>
                            {achievement}
                          </li>
                        ))}
                        {cd.achievements.length > 3 && (
                          <li className="text-yellow-600">+{cd.achievements.length - 3} autres</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {cd.stats && Object.keys(cd.stats).length > 0 && (
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <p className="text-xs font-semibold text-green-900 mb-2 flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        Statistiques
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(cd.stats).slice(0, 4).map(([key, value]) => (
                          <div key={key} className="bg-green-100 rounded px-2 py-1">
                            <div className="text-xs text-green-600">{key}</div>
                            <div className="text-sm font-bold text-green-900">{String(value)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => {
                    setEditing(cd);
                    setShowForm(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(cd.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {clubDisciplines.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Aucune association club-discipline créée</p>
            <p className="text-sm mt-2">Cliquez sur "Nouvelle association" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TournamentsTab({
  tournaments,
  streams,
  disciplines,
  showTournamentForm,
  setShowTournamentForm,
  showStreamForm,
  setShowStreamForm,
  editingTournament,
  setEditingTournament,
  editingStream,
  setEditingStream,
  onSaveTournament,
  onDeleteTournament,
  onSaveStream,
  onDeleteStream
}: any) {
  const [activeSubTab, setActiveSubTab] = useState<'tournaments' | 'streams'>('tournaments');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          <Gamepad2 className="inline-block w-6 h-6 mr-2 text-red-500" />
          Tournois & Lives
        </h2>
        <p className="text-gray-700">
          Gérez les tournois LEG et les streams en direct. Créez des événements e-sport pour engager la communauté.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white rounded-lg p-4 border-2 border-red-300">
            <div className="text-3xl font-black text-red-600">{tournaments.length}</div>
            <div className="text-sm text-gray-600">Tournois créés</div>
          </div>
          <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
            <div className="text-3xl font-black text-purple-600">{streams.filter((s: any) => s.is_live).length}</div>
            <div className="text-sm text-gray-600">Streams en direct</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab('tournaments')}
          className={`px-4 py-2 font-medium ${
            activeSubTab === 'tournaments'
              ? 'border-b-2 border-red-500 text-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Trophy className="inline-block w-4 h-4 mr-2" />
          Tournois
        </button>
        <button
          onClick={() => setActiveSubTab('streams')}
          className={`px-4 py-2 font-medium ${
            activeSubTab === 'streams'
              ? 'border-b-2 border-purple-500 text-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Gamepad2 className="inline-block w-4 h-4 mr-2" />
          Streams Live
        </button>
      </div>

      {activeSubTab === 'tournaments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Gestion des Tournois</h3>
            <button
              onClick={() => {
                setEditingTournament(null);
                setShowTournamentForm(true);
              }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau tournoi
            </button>
          </div>

          {showTournamentForm && (
            <TournamentForm
              editing={editingTournament}
              disciplines={disciplines}
              onSave={onSaveTournament}
              onCancel={() => {
                setShowTournamentForm(false);
                setEditingTournament(null);
              }}
            />
          )}

          <div className="grid gap-4">
            {tournaments.map((tournament: any) => (
              <div key={tournament.id} className="border-2 rounded-lg p-6 bg-gradient-to-r from-red-50 to-white hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  {tournament.image_url && (
                    <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={tournament.image_url}
                        alt={tournament.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-bold text-gray-900">{tournament.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        tournament.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tournament.status === 'upcoming' ? 'À venir' :
                         tournament.status === 'ongoing' ? 'En cours' : 'Terminé'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{tournament.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">Date</p>
                        <p className="font-semibold">{new Date(tournament.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">Équipes max</p>
                        <p className="font-semibold">{tournament.max_participants || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">Prize Pool</p>
                        <p className="font-semibold text-yellow-600">{tournament.price ? `${tournament.price.toLocaleString()} GNF` : 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">Type</p>
                        <p className="font-semibold">{tournament.type || 'Online'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingTournament(tournament);
                        setShowTournamentForm(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTournament(tournament.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {tournaments.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Aucun tournoi créé</p>
                <p className="text-sm mt-2">Cliquez sur "Nouveau tournoi" pour commencer</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'streams' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Gestion des Streams</h3>
            <button
              onClick={() => {
                setEditingStream(null);
                setShowStreamForm(true);
              }}
              className="btn-primary bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau stream
            </button>
          </div>

          {showStreamForm && (
            <StreamForm
              editing={editingStream}
              onSave={onSaveStream}
              onCancel={() => {
                setShowStreamForm(false);
                setEditingStream(null);
              }}
            />
          )}

          <div className="grid gap-4">
            {streams.map((stream: any) => (
              <div key={stream.id} className="border-2 rounded-lg p-6 bg-gradient-to-r from-purple-50 to-white hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  {stream.thumbnail_url && (
                    <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={stream.thumbnail_url}
                        alt={stream.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-bold text-gray-900">{stream.title}</h4>
                      {stream.is_live && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white animate-pulse flex items-center gap-1">
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                          LIVE
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        stream.platform === 'twitch' ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {stream.platform === 'twitch' ? 'Twitch' : 'YouTube'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{stream.description}</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-gray-500">Stream ID</p>
                        <p className="font-mono text-xs">{stream.stream_id}</p>
                      </div>
                      {stream.scheduled_for && (
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-gray-500">Programmé pour</p>
                          <p className="font-semibold">{new Date(stream.scheduled_for).toLocaleString('fr-FR')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingStream(stream);
                        setShowStreamForm(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteStream(stream.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {streams.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Gamepad2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Aucun stream créé</p>
                <p className="text-sm mt-2">Cliquez sur "Nouveau stream" pour commencer</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ClubDisciplineForm({ editing, clubs, disciplines, onSave, onCancel }: any) {
  const [formData, setFormData] = useState<any>({
    club_id: '',
    discipline_id: '',
    roster: [],
    achievements: [],
    stats: {}
  });

  const [rosterInput, setRosterInput] = useState('');
  const [achievementsInput, setAchievementsInput] = useState('');
  const [statsInput, setStatsInput] = useState('{}');

  useEffect(() => {
    if (editing) {
      setFormData(editing);
      setRosterInput(editing.roster?.join('\n') || '');
      setAchievementsInput(editing.achievements?.join('\n') || '');
      setStatsInput(JSON.stringify(editing.stats || {}, null, 2));
    }
  }, [editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const statsObj = JSON.parse(statsInput);
      onSave({
        ...formData,
        roster: rosterInput.split('\n').filter(s => s.trim()),
        achievements: achievementsInput.split('\n').filter(s => s.trim()),
        stats: statsObj
      });
    } catch (error) {
      toast.error('Format JSON invalide pour les statistiques');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border-2 border-gray-200 p-6 rounded-lg space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Club *</label>
          <select
            value={formData.club_id}
            onChange={(e) => setFormData({ ...formData, club_id: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
            disabled={!!editing}
          >
            <option value="">Sélectionner un club</option>
            {clubs.map((club: any) => (
              <option key={club.id} value={club.id}>{club.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Discipline *</label>
          <select
            value={formData.discipline_id}
            onChange={(e) => setFormData({ ...formData, discipline_id: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
            disabled={!!editing}
          >
            <option value="">Sélectionner une discipline</option>
            {disciplines.map((discipline: any) => (
              <option key={discipline.id} value={discipline.id}>
                {discipline.icon} {discipline.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Roster (un joueur par ligne)</label>
        <textarea
          value={rosterInput}
          onChange={(e) => setRosterInput(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
          rows={5}
          placeholder="ProGamer_GN&#10;StratMaster&#10;LegendKry"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Achievements (un par ligne)</label>
        <textarea
          value={achievementsInput}
          onChange={(e) => setAchievementsInput(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
          rows={5}
          placeholder="Champion National 2024&#10;Top 3 West Africa"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Statistiques (format JSON)</label>
        <textarea
          value={statsInput}
          onChange={(e) => setStatsInput(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
          rows={6}
          placeholder='{"winRate": 78, "matches": 45}'
        />
        <p className="text-xs text-gray-500 mt-1">
          Exemple: {JSON.stringify({ winRate: 78, matches: 45, kd: 1.8 })}
        </p>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">
          <Save className="w-4 h-4 mr-2" />
          Enregistrer
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          <X className="w-4 h-4 mr-2" />
          Annuler
        </button>
      </div>
    </form>
  );
}

function TournamentForm({ editing, disciplines, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    prize_pool: 0,
    format: '',
    max_teams: 8,
    status: 'upcoming',
    image_url: ''
  });

  useEffect(() => {
    if (editing) {
      setFormData({
        ...editing,
        start_date: editing.date,
        image_url: editing.image_url || ''
      });
    }
  }, [editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border-2 border-red-200 p-6 rounded-lg space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre du tournoi *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
            placeholder="CS:GO National Cup"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prize Pool (GNF)</label>
          <input
            type="number"
            value={formData.prize_pool}
            onChange={(e) => setFormData({ ...formData, prize_pool: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="5000000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'équipes max</label>
          <input
            type="number"
            value={formData.max_teams}
            onChange={(e) => setFormData({ ...formData, max_teams: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
          <input
            type="text"
            value={formData.format}
            onChange={(e) => setFormData({ ...formData, format: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Single Elimination"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="upcoming">À venir</option>
            <option value="ongoing">En cours</option>
            <option value="completed">Terminé</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          rows={3}
          placeholder="Description du tournoi..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL de l'image
        </label>
        <input
          type="url"
          value={formData.image_url || ''}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="https://images.pexels.com/photos/..."
        />
        {formData.image_url && (
          <div className="mt-2 relative h-32 rounded-lg overflow-hidden">
            <img
              src={formData.image_url}
              alt="Aperçu"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">
          <Save className="w-4 h-4 mr-2" />
          Enregistrer
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          <X className="w-4 h-4 mr-2" />
          Annuler
        </button>
      </div>
    </form>
  );
}

function StreamForm({ editing, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    title: '',
    platform: 'twitch',
    stream_id: '',
    description: '',
    is_live: false,
    scheduled_for: '',
    thumbnail_url: ''
  });

  useEffect(() => {
    if (editing) {
      setFormData(editing);
    }
  }, [editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border-2 border-purple-200 p-6 rounded-lg space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre du stream *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
            placeholder="Match de qualification LEG"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plateforme *</label>
          <select
            value={formData.platform}
            onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="twitch">Twitch</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID du stream *</label>
          <input
            type="text"
            value={formData.stream_id}
            onChange={(e) => setFormData({ ...formData, stream_id: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
            placeholder="channel_name ou video_id"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Programmé pour</label>
          <input
            type="datetime-local"
            value={formData.scheduled_for}
            onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">URL de la miniature</label>
          <input
            type="url"
            value={formData.thumbnail_url}
            onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="https://..."
          />
          {formData.thumbnail_url && (
            <div className="mt-2 relative h-32 rounded-lg overflow-hidden">
              <img
                src={formData.thumbnail_url}
                alt="Aperçu miniature"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          rows={3}
          placeholder="Description du stream..."
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.is_live}
          onChange={(e) => setFormData({ ...formData, is_live: e.target.checked })}
          className="mr-2"
          id="is_live"
        />
        <label htmlFor="is_live" className="text-sm text-gray-700 font-medium">
          Stream en direct actuellement
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary bg-purple-600 hover:bg-purple-700">
          <Save className="w-4 h-4 mr-2" />
          Enregistrer
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          <X className="w-4 h-4 mr-2" />
          Annuler
        </button>
      </div>
    </form>
  );
}

function ClubDisciplinesTab({
  clubDisciplines,
  clubs,
  disciplines,
  showForm,
  setShowForm,
  editing,
  setEditing,
  onSave,
  onDelete
}: any) {
  const [formData, setFormData] = useState<Partial<ClubDiscipline>>({
    club_id: '',
    discipline_id: '',
    roster: [],
    achievements: [],
    stats: {}
  });

  const [rosterInput, setRosterInput] = useState('');
  const [achievementsInput, setAchievementsInput] = useState('');
  const [statsInput, setStatsInput] = useState('{}');

  useEffect(() => {
    if (editing) {
      setFormData(editing);
      setRosterInput(editing.roster?.join('\n') || '');
      setAchievementsInput(editing.achievements?.join('\n') || '');
      setStatsInput(JSON.stringify(editing.stats || {}, null, 2));
    } else {
      setFormData({
        club_id: '',
        discipline_id: '',
        roster: [],
        achievements: [],
        stats: {}
      });
      setRosterInput('');
      setAchievementsInput('');
      setStatsInput('{}');
    }
  }, [editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const statsObj = JSON.parse(statsInput);
      onSave({
        ...formData,
        roster: rosterInput.split('\n').filter(s => s.trim()),
        achievements: achievementsInput.split('\n').filter(s => s.trim()),
        stats: statsObj
      });
    } catch (error) {
      toast.error('Format JSON invalide pour les statistiques');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Disciplines par Club</h2>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle association
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Club *
              </label>
              <select
                value={formData.club_id}
                onChange={(e) => setFormData({ ...formData, club_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
                disabled={!!editing}
              >
                <option value="">Sélectionner un club</option>
                {clubs.map((club: Club) => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discipline *
              </label>
              <select
                value={formData.discipline_id}
                onChange={(e) => setFormData({ ...formData, discipline_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
                disabled={!!editing}
              >
                <option value="">Sélectionner une discipline</option>
                {disciplines.map((discipline: Discipline) => (
                  <option key={discipline.id} value={discipline.id}>
                    {discipline.icon} {discipline.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roster (un joueur par ligne)
            </label>
            <textarea
              value={rosterInput}
              onChange={(e) => setRosterInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
              rows={5}
              placeholder="ProGamer_GN&#10;StratMaster&#10;LegendKry"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Achievements (un par ligne)
            </label>
            <textarea
              value={achievementsInput}
              onChange={(e) => setAchievementsInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
              rows={5}
              placeholder="Champion National 2024&#10;Top 3 West Africa"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statistiques (format JSON)
            </label>
            <textarea
              value={statsInput}
              onChange={(e) => setStatsInput(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
              rows={6}
              placeholder='{"winRate": 78, "matches": 45}'
            />
            <p className="text-xs text-gray-500 mt-1">
              Exemple: {JSON.stringify({ winRate: 78, matches: 45, kd: 1.8 })}
            </p>
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
        {clubDisciplines.map((cd: ClubDiscipline) => (
          <div key={cd.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-semibold text-lg">
                    {cd.club?.name || 'Club inconnu'}
                  </h3>
                  <span className="text-2xl">{cd.discipline?.icon}</span>
                  <span className="text-gray-600">{cd.discipline?.name}</span>
                </div>
                <div className="space-y-2">
                  {cd.roster && cd.roster.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Roster:</p>
                      <p className="text-sm text-gray-600">{cd.roster.join(', ')}</p>
                    </div>
                  )}
                  {cd.achievements && cd.achievements.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Achievements:</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {cd.achievements.map((achievement, idx) => (
                          <li key={idx}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {cd.stats && Object.keys(cd.stats).length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Stats:</p>
                      <div className="text-sm text-gray-600 flex flex-wrap gap-3">
                        {Object.entries(cd.stats).map(([key, value]) => (
                          <span key={key} className="bg-gray-100 px-2 py-1 rounded">
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(cd);
                    setShowForm(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(cd.id)}
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
