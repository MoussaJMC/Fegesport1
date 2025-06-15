import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, XCircle, AlertCircle, Database, User, Shield, Key } from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const DiagnosticPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: DiagnosticResult[] = [];

    // 1. Check Supabase Connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      results.push({
        name: 'Connexion Supabase',
        status: error ? 'error' : 'success',
        message: error ? `Erreur: ${error.message}` : 'Connexion établie',
        details: { data, error }
      });
    } catch (error: any) {
      results.push({
        name: 'Connexion Supabase',
        status: 'error',
        message: `Erreur de connexion: ${error.message}`,
        details: error
      });
    }

    // 2. Check User Authentication
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      results.push({
        name: 'Authentification Utilisateur',
        status: currentUser ? 'success' : 'warning',
        message: currentUser ? `Utilisateur connecté: ${currentUser.email}` : 'Aucun utilisateur connecté',
        details: { user: currentUser, error }
      });
    } catch (error: any) {
      results.push({
        name: 'Authentification Utilisateur',
        status: 'error',
        message: `Erreur d'authentification: ${error.message}`,
        details: error
      });
    }

    // 3. Check Admin Role
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const isAdmin = currentUser?.user_metadata?.role === 'admin';
      results.push({
        name: 'Rôle Administrateur',
        status: isAdmin ? 'success' : 'warning',
        message: isAdmin ? 'Rôle admin confirmé' : 'Rôle admin non détecté',
        details: { 
          userMetadata: currentUser?.user_metadata,
          appMetadata: currentUser?.app_metadata 
        }
      });
    } catch (error: any) {
      results.push({
        name: 'Rôle Administrateur',
        status: 'error',
        message: `Erreur de vérification du rôle: ${error.message}`,
        details: error
      });
    }

    // 4. Test is_admin() Function
    try {
      const { data, error } = await supabase.rpc('is_admin');
      results.push({
        name: 'Fonction is_admin()',
        status: error ? 'error' : (data ? 'success' : 'warning'),
        message: error ? `Erreur: ${error.message}` : (data ? 'Fonction retourne true' : 'Fonction retourne false'),
        details: { data, error }
      });
    } catch (error: any) {
      results.push({
        name: 'Fonction is_admin()',
        status: 'error',
        message: `Erreur d'exécution: ${error.message}`,
        details: error
      });
    }

    // 5. Test Table Access (News)
    try {
      const { data, error } = await supabase.from('news').select('id, title').limit(5);
      results.push({
        name: 'Accès Table News',
        status: error ? 'error' : 'success',
        message: error ? `Erreur: ${error.message}` : `${data?.length || 0} enregistrements accessibles`,
        details: { data, error }
      });
    } catch (error: any) {
      results.push({
        name: 'Accès Table News',
        status: 'error',
        message: `Erreur d'accès: ${error.message}`,
        details: error
      });
    }

    // 6. Test Table Access (Events)
    try {
      const { data, error } = await supabase.from('events').select('id, title').limit(5);
      results.push({
        name: 'Accès Table Events',
        status: error ? 'error' : 'success',
        message: error ? `Erreur: ${error.message}` : `${data?.length || 0} enregistrements accessibles`,
        details: { data, error }
      });
    } catch (error: any) {
      results.push({
        name: 'Accès Table Events',
        status: 'error',
        message: `Erreur d'accès: ${error.message}`,
        details: error
      });
    }

    // 7. Test Table Access (Members)
    try {
      const { data, error } = await supabase.from('members').select('id, first_name, last_name').limit(5);
      results.push({
        name: 'Accès Table Members',
        status: error ? 'error' : 'success',
        message: error ? `Erreur: ${error.message}` : `${data?.length || 0} enregistrements accessibles`,
        details: { data, error }
      });
    } catch (error: any) {
      results.push({
        name: 'Accès Table Members',
        status: 'error',
        message: `Erreur d'accès: ${error.message}`,
        details: error
      });
    }

    // 8. Test Insert Permission (Contact Messages)
    try {
      const testMessage = {
        name: 'Test Diagnostic',
        email: 'test@diagnostic.com',
        subject: 'Test de diagnostic',
        message: 'Message de test pour vérifier les permissions'
      };
      
      const { data, error } = await supabase.from('contact_messages').insert([testMessage]).select();
      
      if (!error && data && data.length > 0) {
        // Clean up test data
        await supabase.from('contact_messages').delete().eq('id', data[0].id);
      }
      
      results.push({
        name: 'Permission Insert',
        status: error ? 'error' : 'success',
        message: error ? `Erreur: ${error.message}` : 'Insert/Delete réussi',
        details: { data, error }
      });
    } catch (error: any) {
      results.push({
        name: 'Permission Insert',
        status: 'error',
        message: `Erreur d'insertion: ${error.message}`,
        details: error
      });
    }

    setDiagnostics(results);
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <XCircle className="text-red-500" size={20} />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={20} />;
      default:
        return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Database className="mr-2" />
          Diagnostic Supabase & Admin
        </h1>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="btn bg-primary-600 hover:bg-primary-700 text-white"
        >
          {loading ? 'Diagnostic en cours...' : 'Relancer le diagnostic'}
        </button>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <User className="mr-2" />
          Informations Utilisateur
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <strong>Authentifié:</strong> {isAuthenticated ? 'Oui' : 'Non'}
          </div>
          <div>
            <strong>Email:</strong> {user?.email || 'N/A'}
          </div>
          <div>
            <strong>ID:</strong> {user?.id || 'N/A'}
          </div>
          <div>
            <strong>Rôle (metadata):</strong> {user?.user_metadata?.role || 'N/A'}
          </div>
        </div>
      </div>

      {/* Diagnostic Results */}
      <div className="space-y-4">
        {diagnostics.map((diagnostic, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getStatusColor(diagnostic.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {getStatusIcon(diagnostic.status)}
                <h3 className="ml-2 font-semibold">{diagnostic.name}</h3>
              </div>
            </div>
            <p className="text-gray-700 mb-2">{diagnostic.message}</p>
            {diagnostic.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  Voir les détails
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(diagnostic.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="mr-2" />
          Actions Rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={async () => {
              try {
                const { data, error } = await supabase.auth.getSession();
                console.log('Session actuelle:', data);
                if (error) console.error('Erreur session:', error);
              } catch (error) {
                console.error('Erreur:', error);
              }
            }}
            className="btn bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Key className="mr-2" size={16} />
            Vérifier Session (Console)
          </button>
          
          <button
            onClick={async () => {
              try {
                const { data, error } = await supabase.auth.refreshSession();
                console.log('Session rafraîchie:', data);
                if (error) console.error('Erreur refresh:', error);
                runDiagnostics();
              } catch (error) {
                console.error('Erreur:', error);
              }
            }}
            className="btn bg-green-600 hover:bg-green-700 text-white"
          >
            <Database className="mr-2" size={16} />
            Rafraîchir Session
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-blue-800">
          Instructions pour créer l'utilisateur admin
        </h2>
        <div className="space-y-2 text-blue-700">
          <p><strong>1. Via Supabase Dashboard:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Allez dans Authentication → Users</li>
            <li>Cliquez "Add user"</li>
            <li>Email: admin@fegesport.org</li>
            <li>Mot de passe: Admin@2025!</li>
            <li>Dans "User Metadata", ajoutez: {`{"role": "admin"}`}</li>
          </ul>
          
          <p className="mt-4"><strong>2. Via SQL (si vous avez accès superuser):</strong></p>
          <pre className="bg-blue-100 p-2 rounded text-xs overflow-auto">
{`-- Créer l'utilisateur admin
INSERT INTO auth.users (
  email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at
) VALUES (
  'admin@fegesport.org',
  crypt('Admin@2025!', gen_salt('bf')),
  now(),
  '{"role": "admin"}'::jsonb,
  now(), now()
);`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage;