import React, { useState, useEffect } from 'react';
import { Mail, Send, AlertCircle, CheckCircle, Clock, RefreshCw, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import { emailService } from '../../lib/emailService';
import { format } from 'date-fns';

interface EmailQueueItem {
  id: string;
  to_email: string;
  to_name: string;
  from_email: string;
  from_name: string;
  subject: string;
  html_content: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  priority: number;
  attempts: number;
  max_attempts: number;
  error_message?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

const EmailAdminPage: React.FC = () => {
  const [emails, setEmails] = useState<EmailQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailQueueItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    sent: 0,
    failed: 0,
  });

  useEffect(() => {
    fetchEmails();
  }, [statusFilter]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const filter = statusFilter === 'all' ? undefined : statusFilter;
      const data = await emailService.getEmailQueue(filter);
      setEmails(data);

      const statsData = {
        total: data.length,
        pending: data.filter((e: EmailQueueItem) => e.status === 'pending').length,
        sent: data.filter((e: EmailQueueItem) => e.status === 'sent').length,
        failed: data.filter((e: EmailQueueItem) => e.status === 'failed').length,
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast.error('Erreur lors du chargement des emails');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessQueue = async () => {
    try {
      setProcessing(true);
      const result = await emailService.processEmailQueue();

      if (result.success) {
        toast.success(result.message || 'File d\'attente traitée avec succès');
        fetchEmails();
      } else {
        toast.error(result.error || 'Erreur lors du traitement');
      }
    } catch (error) {
      console.error('Error processing queue:', error);
      toast.error('Erreur lors du traitement de la file d\'attente');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'sending':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'sending':
        return <RefreshCw size={16} className="animate-spin" />;
      case 'failed':
        return <AlertCircle size={16} />;
      default:
        return <Mail size={16} />;
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return 'Haute';
      case 2:
        return 'Normale';
      case 3:
        return 'Basse';
      default:
        return 'Normale';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Gestion des Emails</h1>
          <p className="text-gray-600 mt-1">
            Suivez et gérez tous les emails envoyés par la plateforme
          </p>
        </div>
        <button
          onClick={handleProcessQueue}
          disabled={processing}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? (
            <>
              <RefreshCw size={18} className="mr-2 animate-spin" />
              Traitement en cours...
            </>
          ) : (
            <>
              <Send size={18} className="mr-2" />
              Traiter la file d'attente
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
            </div>
            <Mail size={32} className="text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock size={32} className="text-yellow-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Envoyés</p>
              <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
            </div>
            <CheckCircle size={32} className="text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Échecs</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <AlertCircle size={32} className="text-red-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filtrer par statut:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="sending">En cours d'envoi</option>
              <option value="sent">Envoyés</option>
              <option value="failed">Échecs</option>
            </select>
            <button
              onClick={fetchEmails}
              className="ml-auto flex items-center px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <RefreshCw size={18} className="mr-2" />
              Actualiser
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw size={32} className="mx-auto text-gray-400 animate-spin mb-2" />
              <p className="text-gray-600">Chargement des emails...</p>
            </div>
          ) : emails.length === 0 ? (
            <div className="p-8 text-center">
              <Mail size={48} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-600">Aucun email trouvé</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destinataire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sujet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priorité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tentatives
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {emails.map((email) => (
                  <tr key={email.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}>
                        {getStatusIcon(email.status)}
                        <span className="ml-1 capitalize">{email.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{email.to_name || email.to_email}</div>
                      <div className="text-sm text-gray-500">{email.to_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{email.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{getPriorityLabel(email.priority)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {email.attempts} / {email.max_attempts}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(email.created_at), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedEmail(email)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-secondary-900">Détails de l'email</h2>
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedEmail.status)}`}>
                    {getStatusIcon(selectedEmail.status)}
                    <span className="ml-2 capitalize">{selectedEmail.status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">De</label>
                    <p className="text-sm text-gray-900">{selectedEmail.from_name} ({selectedEmail.from_email})</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">À</label>
                    <p className="text-sm text-gray-900">{selectedEmail.to_name || selectedEmail.to_email}</p>
                    <p className="text-sm text-gray-500">{selectedEmail.to_email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                  <p className="text-sm text-gray-900">{selectedEmail.subject}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                    <p className="text-sm text-gray-900">{getPriorityLabel(selectedEmail.priority)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tentatives</label>
                    <p className="text-sm text-gray-900">{selectedEmail.attempts} / {selectedEmail.max_attempts}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Créé le</label>
                    <p className="text-sm text-gray-900">
                      {format(new Date(selectedEmail.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                </div>

                {selectedEmail.sent_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Envoyé le</label>
                    <p className="text-sm text-gray-900">
                      {format(new Date(selectedEmail.sent_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                )}

                {selectedEmail.error_message && (
                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-1">Message d'erreur</label>
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{selectedEmail.error_message}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aperçu du contenu</label>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                    <iframe
                      srcDoc={selectedEmail.html_content}
                      className="w-full h-96 border-0"
                      title="Email preview"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedEmail(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailAdminPage;
