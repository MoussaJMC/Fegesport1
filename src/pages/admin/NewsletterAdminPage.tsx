import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Mail, Search, Filter, Download, Trash2, UserCheck, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Subscriber {
  id: string;
  email: string;
  whatsapp?: string;
  status: 'active' | 'unsubscribed';
  created_at: string;
  updated_at: string;
}

const NewsletterAdminPage: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Erreur lors du chargement des abonnés');
    } finally {
      setLoading(false);
    }
  };

  const deleteSubscriber = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet abonné ?')) return;

    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Abonné supprimé avec succès');
      fetchSubscribers();
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'unsubscribed' : 'active';
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success('Statut mis à jour');
      fetchSubscribers();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const exportSubscribers = () => {
    const csv = [
      ['Email', 'WhatsApp', 'Statut', 'Date inscription'].join(','),
      ...filteredSubscribers.map(sub =>
        [sub.email, sub.whatsapp || '', sub.status, format(new Date(sub.created_at), 'dd/MM/yyyy')].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.whatsapp?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || sub.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Abonnés Newsletter</h1>
          <p className="text-gray-600">{filteredSubscribers.length} abonnés</p>
        </div>
        <button
          onClick={exportSubscribers}
          className="btn bg-green-600 hover:bg-green-700 text-white"
        >
          <Download size={20} className="mr-2" />
          Exporter CSV
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par email ou WhatsApp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-md border-gray-300"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border-gray-300"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="unsubscribed">Désabonné</option>
        </select>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">WhatsApp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date inscription</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubscribers.map((subscriber) => (
              <tr key={subscriber.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Mail size={16} className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{subscriber.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {subscriber.whatsapp || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    subscriber.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {subscriber.status === 'active' ? 'Actif' : 'Désabonné'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(subscriber.created_at), 'dd MMM yyyy', { locale: fr })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => toggleStatus(subscriber.id, subscriber.status)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    title={subscriber.status === 'active' ? 'Désabonner' : 'Réactiver'}
                  >
                    {subscriber.status === 'active' ? <UserX size={18} /> : <UserCheck size={18} />}
                  </button>
                  <button
                    onClick={() => deleteSubscriber(subscriber.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSubscribers.length === 0 && (
          <div className="text-center py-12">
            <Mail size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Aucun abonné trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterAdminPage;
