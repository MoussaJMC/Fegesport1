import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Database, Users, CheckCircle, XCircle, RefreshCw, Eye } from 'lucide-react';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  member_type: 'player' | 'club' | 'partner';
  status: 'pending' | 'active' | 'suspended' | 'expired';
  membership_start?: string;
  membership_end?: string;
  created_at: string;
  updated_at: string;
}

const TestDatabasePage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [testResults, setTestResults] = useState<{
    connection: boolean;
    read: boolean;
    write: boolean;
    policies: boolean;
  }>({
    connection: false,
    read: false,
    write: false,
    policies: false
  });

  useEffect(() => {
    runDatabaseTests();
  }, []);

  const runDatabaseTests = async () => {
    setLoading(true);
    setConnectionStatus('testing');
    
    const results = {
      connection: false,
      read: false,
      write: false,
      policies: false
    };

    try {
      // Test 1: Database Connection
      console.log('Testing database connection...');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('members')
        .select('count')
        .limit(1);
      
      if (!connectionError) {
        results.connection = true;
        console.log('✅ Database connection successful');
      } else {
        console.error('❌ Database connection failed:', connectionError);
      }

      // Test 2: Read Access
      console.log('Testing read access...');
      const { data: readTest, error: readError } = await supabase
        .from('members')
        .select('*')
        .limit(5);
      
      if (!readError) {
        results.read = true;
        setMembers(readTest || []);
        console.log('✅ Read access successful, found', readTest?.length || 0, 'members');
      } else {
        console.error('❌ Read access failed:', readError);
      }

      // Test 3: Write Access (Insert Test)
      console.log('Testing write access...');
      const testMember = {
        first_name: 'Test',
        last_name: 'User',
        email: `test-${Date.now()}@example.com`,
        phone: '+224123456789',
        birth_date: '1990-01-01',
        address: 'Test Address',
        city: 'Conakry',
        member_type: 'player' as const,
        status: 'pending' as const,
        membership_start: new Date().toISOString().split('T')[0],
        membership_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const { data: writeTest, error: writeError } = await supabase
        .from('members')
        .insert([testMember])
        .select()
        .single();

      if (!writeError && writeTest) {
        results.write = true;
        console.log('✅ Write access successful, inserted test member:', writeTest);
        
        // Clean up test data
        await supabase
          .from('members')
          .delete()
          .eq('id', writeTest.id);
        console.log('✅ Test data cleaned up');
      } else {
        console.error('❌ Write access failed:', writeError);
      }

      // Test 4: RLS Policies
      console.log('Testing RLS policies...');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        results.policies = true;
        console.log('✅ RLS policies working - user authenticated');
      } else {
        console.log('⚠️ No authenticated user - RLS policies may restrict access');
      }

      setTestResults(results);
      setConnectionStatus(results.connection && results.read ? 'success' : 'error');

    } catch (error) {
      console.error('❌ Database test failed:', error);
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const refreshMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching members:', error);
        toast.error('Erreur lors du chargement des membres');
      } else {
        setMembers(data || []);
        toast.success(`${data?.length || 0} membres chargés`);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="text-green-500" size={20} />
    ) : (
      <XCircle className="text-red-500" size={20} />
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'player': return 'bg-blue-100 text-blue-800';
      case 'club': return 'bg-purple-100 text-purple-800';
      case 'partner': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Database className="mr-2" />
            Test de Base de Données - Inscriptions Membres
          </h1>
          <p className="text-gray-600">Vérification de l'intégrité des données d'inscription</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={runDatabaseTests}
            disabled={loading}
            className="btn bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Database className="w-4 h-4 mr-2" />
            )}
            Tester la DB
          </button>
          <button
            onClick={refreshMembers}
            disabled={loading}
            className="btn bg-green-600 hover:bg-green-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Database className="mr-2" />
          État de la Connexion Base de Données
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon(testResults.connection)}
            <div>
              <div className="font-medium">Connexion</div>
              <div className="text-sm text-gray-500">
                {testResults.connection ? 'Connecté' : 'Échec'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {getStatusIcon(testResults.read)}
            <div>
              <div className="font-medium">Lecture</div>
              <div className="text-sm text-gray-500">
                {testResults.read ? 'Autorisé' : 'Refusé'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {getStatusIcon(testResults.write)}
            <div>
              <div className="font-medium">Écriture</div>
              <div className="text-sm text-gray-500">
                {testResults.write ? 'Autorisé' : 'Refusé'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {getStatusIcon(testResults.policies)}
            <div>
              <div className="font-medium">Politiques RLS</div>
              <div className="text-sm text-gray-500">
                {testResults.policies ? 'Actives' : 'Problème'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Members Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{members.length}</div>
          <div className="text-sm text-gray-600">Total Membres</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {members.filter(m => m.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Actifs</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">
            {members.filter(m => m.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">En Attente</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">
            {members.filter(m => m.member_type === 'player').length}
          </div>
          <div className="text-sm text-gray-600">Joueurs</div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <Users className="mr-2" />
            Membres Inscrits ({members.length})
          </h2>
        </div>

        {members.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.first_name} {member.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.city}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.email}</div>
                      <div className="text-sm text-gray-500">{member.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(member.member_type)}`}>
                        {member.member_type === 'player' ? 'Joueur' : 
                         member.member_type === 'club' ? 'Club' : 'Partenaire'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(member.status)}`}>
                        {member.status === 'active' ? 'Actif' :
                         member.status === 'pending' ? 'En attente' :
                         member.status === 'suspended' ? 'Suspendu' : 'Expiré'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(member.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun membre trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {loading ? 'Chargement en cours...' : 'Aucune inscription n\'a été trouvée dans la base de données.'}
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-blue-800">
          Comment tester l'inscription des membres
        </h2>
        <div className="space-y-2 text-blue-700">
          <p><strong>1. Aller sur la page d'adhésion:</strong></p>
          <p className="ml-4">Visitez <code>/membership</code> et remplissez le formulaire d'inscription</p>
          
          <p><strong>2. Vérifier l'insertion en base:</strong></p>
          <p className="ml-4">Après soumission, les données doivent apparaître dans le tableau ci-dessus</p>
          
          <p><strong>3. Vérifier les logs:</strong></p>
          <p className="ml-4">Ouvrez la console du navigateur pour voir les logs détaillés</p>
          
          <p><strong>4. Statuts attendus:</strong></p>
          <ul className="ml-4 list-disc">
            <li>Statut initial: "pending" (en attente)</li>
            <li>Après paiement: "active" (actif)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestDatabasePage;