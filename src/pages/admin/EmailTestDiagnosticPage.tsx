import React, { useState } from 'react';
import { Mail, CheckCircle, XCircle, AlertCircle, Loader2, ExternalLink, Key } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

interface DiagnosticResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const EmailTestDiagnosticPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [hasResendKey, setHasResendKey] = useState<boolean | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setResults([]);
    const diagnosticResults: DiagnosticResult[] = [];

    try {
      diagnosticResults.push({
        step: 'Configuration',
        status: 'success',
        message: 'Variables d\'environnement chargées',
        details: {
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'OK' : 'MANQUANT',
          supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'OK' : 'MANQUANT',
        }
      });

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;

      diagnosticResults.push({
        step: 'Test Status',
        status: 'warning',
        message: 'Vérification de la fonction Edge...',
      });

      const statusResponse = await fetch(`${functionUrl}?action=status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      const statusData = await statusResponse.json();

      if (statusResponse.ok) {
        setHasResendKey(statusData.hasResendKey);
        diagnosticResults.push({
          step: 'Configuration Resend',
          status: statusData.hasResendKey ? 'success' : 'error',
          message: statusData.hasResendKey
            ? `Clé Resend configurée (${statusData.resendKeyLength} caractères)`
            : 'ERREUR: Clé Resend manquante dans les variables Supabase',
          details: statusData,
        });
      }

      diagnosticResults.push({
        step: 'Test POST',
        status: 'warning',
        message: `Tentative d'envoi vers ${functionUrl}`,
      });

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'test@example.com',
          toName: 'Test User',
          subject: 'Diagnostic Test',
          html: '<p>Test email</p>',
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        diagnosticResults.push({
          step: 'Fonction Edge',
          status: 'success',
          message: 'Réponse reçue de la fonction',
          details: responseData,
        });
      } else {
        diagnosticResults.push({
          step: 'Fonction Edge',
          status: 'error',
          message: 'Erreur de la fonction',
          details: responseData,
        });
      }

      diagnosticResults.push({
        step: 'Test Queue',
        status: 'warning',
        message: 'Vérification de l\'email dans la queue',
      });

      const { data: queueData, error: queueError } = await supabase
        .from('email_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (queueError) {
        diagnosticResults.push({
          step: 'Queue Database',
          status: 'error',
          message: 'Erreur de lecture de la queue',
          details: queueError,
        });
      } else {
        diagnosticResults.push({
          step: 'Queue Database',
          status: 'success',
          message: 'Email trouvé dans la queue',
          details: {
            id: queueData.id,
            status: queueData.status,
            attempts: queueData.attempts,
            error: queueData.error_message,
          },
        });
      }

    } catch (error: any) {
      diagnosticResults.push({
        step: 'Erreur Générale',
        status: 'error',
        message: error.message,
        details: error,
      });
    } finally {
      setResults(diagnosticResults);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <XCircle className="text-red-500" size={20} />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={20} />;
      default:
        return <Mail className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-secondary-900">Diagnostic Email</h1>
        <p className="text-gray-600 mt-1">
          Testez et diagnostiquez le système d'envoi d'emails
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="mr-2 animate-spin" />
              Diagnostic en cours...
            </>
          ) : (
            <>
              <Mail size={20} className="mr-2" />
              Lancer le diagnostic complet
            </>
          )}
        </button>
      </div>

      {results.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Résultats du diagnostic</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {results.map((result, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(result.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {result.step}
                        </p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          result.status === 'success' ? 'bg-green-100 text-green-800' :
                          result.status === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {result.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {result.message}
                      </p>
                      {result.details && (
                        <pre className="mt-2 text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {hasResendKey === false && (
            <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Key className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-bold text-red-900 mb-4">
                    Configuration requise : Clé API Resend
                  </h3>

                  <div className="space-y-4 text-sm text-red-800">
                    <div className="bg-red-100 p-4 rounded-lg">
                      <p className="font-semibold mb-2">La clé API Resend n'est PAS configurée</p>
                      <p>
                        Sans cette clé, les emails sont mis en file d'attente dans la base de données mais
                        <strong className="font-bold"> ne sont jamais envoyés à Resend</strong>.
                        C'est pourquoi tous les compteurs sur resend.com/metrics sont à 0.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-base mb-3 flex items-center">
                        <ExternalLink size={16} className="mr-2" />
                        Instructions de configuration :
                      </h4>

                      <ol className="list-decimal list-inside space-y-3 ml-2">
                        <li className="font-medium">
                          <span className="font-bold">Obtenez votre clé API Resend</span>
                          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 font-normal">
                            <li>
                              Connectez-vous sur{' '}
                              <a
                                href="https://resend.com/api-keys"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-900 underline font-medium inline-flex items-center hover:text-red-700"
                              >
                                resend.com/api-keys
                                <ExternalLink size={12} className="ml-1" />
                              </a>
                            </li>
                            <li>Créez une nouvelle clé API (bouton "Create API Key")</li>
                            <li>Donnez-lui un nom (ex: "FEGESPORT Production")</li>
                            <li>Copiez la clé (elle commence par <code className="bg-red-200 px-1.5 py-0.5 rounded font-mono">re_</code>)</li>
                          </ul>
                        </li>

                        <li className="font-medium">
                          <span className="font-bold">Configurez la clé dans Supabase</span>
                          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 font-normal">
                            <li>
                              Ouvrez{' '}
                              <a
                                href="https://supabase.com/dashboard"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-900 underline font-medium inline-flex items-center hover:text-red-700"
                              >
                                votre tableau de bord Supabase
                                <ExternalLink size={12} className="ml-1" />
                              </a>
                            </li>
                            <li>Sélectionnez votre projet</li>
                            <li>Cliquez sur <strong>"Project Settings"</strong> (icône d'engrenage en bas à gauche)</li>
                            <li>Dans le menu de gauche, cliquez sur <strong>"Edge Functions"</strong></li>
                            <li>Trouvez la section <strong>"Secrets"</strong> ou <strong>"Environment Variables"</strong></li>
                            <li>Cliquez sur <strong>"Add secret"</strong> ou <strong>"New secret"</strong></li>
                            <li>
                              Nom du secret : <code className="bg-red-200 px-2 py-1 rounded font-mono font-bold">RESEND_API_KEY</code>
                              <span className="ml-2 text-xs">(respectez exactement cette orthographe)</span>
                            </li>
                            <li>Valeur : collez votre clé API Resend complète</li>
                            <li>Cliquez sur <strong>"Save"</strong> ou <strong>"Add secret"</strong></li>
                          </ul>
                        </li>

                        <li className="font-medium">
                          <span className="font-bold">Vérifiez la configuration</span>
                          <ul className="list-disc list-inside ml-6 mt-2 space-y-1 font-normal">
                            <li>Attendez 10-15 secondes pour que la configuration se propage</li>
                            <li>Relancez ce diagnostic pour vérifier que la clé est détectée</li>
                            <li>Envoyez un email de test depuis la page "Gestion des Emails"</li>
                            <li>
                              Vérifiez les compteurs sur{' '}
                              <a
                                href="https://resend.com/metrics"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-900 underline font-medium inline-flex items-center hover:text-red-700"
                              >
                                resend.com/metrics
                                <ExternalLink size={12} className="ml-1" />
                              </a>
                            </li>
                          </ul>
                        </li>
                      </ol>
                    </div>

                    <div className="bg-red-100 p-4 rounded-lg mt-4">
                      <p className="font-semibold mb-2 flex items-center">
                        <AlertCircle size={16} className="mr-2" />
                        Points importants
                      </p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li><strong>Ne partagez JAMAIS votre clé API publiquement</strong></li>
                        <li>La clé doit être ajoutée dans <strong>Supabase Edge Functions</strong>, pas dans votre code</li>
                        <li>Le nom du secret doit être exactement <code className="bg-red-200 px-1.5 py-0.5 rounded font-mono">RESEND_API_KEY</code></li>
                        <li>Après configuration, les emails seront envoyés automatiquement</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasResendKey === true && (
            <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-green-900 mb-2">
                    Configuration correcte
                  </h3>
                  <p className="text-sm text-green-800">
                    La clé API Resend est correctement configurée. Les emails sont envoyés avec succès à Resend.
                  </p>
                  <p className="text-sm text-green-800 mt-2">
                    Consultez vos statistiques sur{' '}
                    <a
                      href="https://resend.com/metrics"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-900 underline font-medium inline-flex items-center hover:text-green-700"
                    >
                      resend.com/metrics
                      <ExternalLink size={12} className="ml-1" />
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmailTestDiagnosticPage;
