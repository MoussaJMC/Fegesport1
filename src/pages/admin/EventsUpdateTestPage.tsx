import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  status: string;
  updated_at: string;
}

const EventsUpdateTestPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchEvents();
  }, []);

  const addLog = (message: string) => {
    console.log(message);
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        addLog(`❌ Erreur auth: ${error.message}`);
        return;
      }

      if (!session) {
        addLog('❌ Pas de session active');
        return;
      }

      addLog(`✅ Session active: ${session.user.email}`);
      setCurrentUser(session.user);

      // Test is_admin()
      const { data: adminCheck, error: adminError } = await supabase
        .rpc('is_admin');

      if (adminError) {
        addLog(`❌ Erreur is_admin(): ${adminError.message}`);
      } else {
        addLog(`✅ is_admin() = ${adminCheck}`);
      }
    } catch (error: any) {
      addLog(`❌ Exception auth: ${error.message}`);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, status, updated_at')
        .limit(5);

      if (error) {
        addLog(`❌ Erreur fetch: ${error.message}`);
        toast.error('Erreur chargement');
        return;
      }

      addLog(`✅ ${data?.length || 0} événements chargés`);
      setEvents(data || []);
    } catch (error: any) {
      addLog(`❌ Exception fetch: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testUpdateStatus = async (eventId: string, newStatus: string) => {
    addLog(`\n🔄 Test mise à jour: ${eventId} -> ${newStatus}`);

    try {
      // Méthode 1: Update simple
      const { data, error } = await supabase
        .from('events')
        .update({ status: newStatus })
        .eq('id', eventId)
        .select();

      if (error) {
        addLog(`❌ Erreur update: ${error.message}`);
        addLog(`   Code: ${error.code}`);
        addLog(`   Détails: ${JSON.stringify(error.details)}`);
        toast.error(`Erreur: ${error.message}`);
        return false;
      }

      if (!data || data.length === 0) {
        addLog('⚠️  Update réussi mais aucune ligne retournée');
        addLog('   Cela peut indiquer un problème RLS');
        toast.warning('Mise à jour incertaine');
        return false;
      }

      addLog(`✅ Mise à jour réussie`);
      addLog(`   Données: ${JSON.stringify(data[0])}`);
      toast.success('Statut mis à jour');

      // Recharger les événements
      await fetchEvents();
      return true;

    } catch (error: any) {
      addLog(`❌ Exception update: ${error.message}`);
      toast.error('Exception lors de la mise à jour');
      return false;
    }
  };

  const testRLSPolicies = async () => {
    addLog('\n🔍 Test des politiques RLS...');

    try {
      // Test SELECT
      const { data: selectData, error: selectError } = await supabase
        .from('events')
        .select('id')
        .limit(1);

      if (selectError) {
        addLog(`❌ SELECT échoué: ${selectError.message}`);
      } else {
        addLog(`✅ SELECT autorisé (${selectData?.length || 0} lignes)`);
      }

      // Test UPDATE (on ne l'exécute pas vraiment)
      if (events.length > 0) {
        const testEvent = events[0];
        const { data: updateData, error: updateError } = await supabase
          .from('events')
          .update({ status: testEvent.status })
          .eq('id', testEvent.id)
          .select();

        if (updateError) {
          addLog(`❌ UPDATE échoué: ${updateError.message}`);
          addLog(`   Code: ${updateError.code}`);
        } else {
          addLog(`✅ UPDATE autorisé`);
        }
      }

    } catch (error: any) {
      addLog(`❌ Exception RLS test: ${error.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Test de Mise à Jour des Événements</h1>

        {/* User Info */}
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <h2 className="font-semibold mb-2">Utilisateur actuel:</h2>
          {currentUser ? (
            <div>
              <p>Email: {currentUser.email}</p>
              <p>ID: {currentUser.id}</p>
            </div>
          ) : (
            <p className="text-red-600">Non connecté</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={checkAuth}
            className="btn bg-blue-600 hover:bg-blue-700 text-white"
          >
            Vérifier Auth
          </button>
          <button
            onClick={fetchEvents}
            className="btn bg-green-600 hover:bg-green-700 text-white"
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Recharger Événements
          </button>
          <button
            onClick={testRLSPolicies}
            className="btn bg-purple-600 hover:bg-purple-700 text-white"
          >
            Test RLS
          </button>
        </div>

        {/* Events List */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Événements ({events.length})</h2>

          {events.length === 0 ? (
            <p className="text-gray-500">Aucun événement</p>
          ) : (
            <div className="space-y-2">
              {events.map(event => (
                <div key={event.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-gray-500">
                        Statut actuel: <span className="font-semibold">{event.status}</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        Mis à jour: {new Date(event.updated_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => testUpdateStatus(event.id, 'upcoming')}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                      >
                        → À venir
                      </button>
                      <button
                        onClick={() => testUpdateStatus(event.id, 'ongoing')}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                      >
                        → En cours
                      </button>
                      <button
                        onClick={() => testUpdateStatus(event.id, 'completed')}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                      >
                        → Terminé
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logs */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Logs</h2>
            <button
              onClick={() => setTestResults([])}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Effacer
            </button>
          </div>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">Aucun log</p>
            ) : (
              testResults.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsUpdateTestPage;
