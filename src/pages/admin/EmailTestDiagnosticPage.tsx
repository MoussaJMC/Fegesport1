import React, { useState } from 'react';
import { Mail, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
      )}
    </div>
  );
};

export default EmailTestDiagnosticPage;
