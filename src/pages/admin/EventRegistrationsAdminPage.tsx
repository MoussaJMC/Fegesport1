import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Users, Search, Filter, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Registration {
  id: string;
  event_id: string;
  member_id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'pending' | 'completed' | 'failed';
  payment_amount?: number;
  payment_date?: string;
  registration_date: string;
  event?: {
    title: string;
    date: string;
  };
  member?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const EventRegistrationsAdminPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          event:events(title, date),
          member:members(first_name, last_name, email)
        `)
        .order('registration_date', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Erreur lors du chargement des inscriptions');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success('Statut mis à jour');
      fetchRegistrations();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const updatePaymentStatus = async (id: string, newStatus: string) => {
    try {
      const updates: any = { payment_status: newStatus };
      if (newStatus === 'completed') {
        updates.payment_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('event_registrations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Paiement mis à jour');
      fetchRegistrations();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const exportRegistrations = () => {
    const csv = [
      ['Événement', 'Participant', 'Email', 'Statut', 'Paiement', 'Montant', 'Date inscription'].join(','),
      ...filteredRegistrations.map(reg => [
        reg.event?.title || '-',
        `${reg.member?.first_name} ${reg.member?.last_name}`,
        reg.member?.email || '-',
        reg.status,
        reg.payment_status,
        reg.payment_amount || 0,
        format(new Date(reg.registration_date), 'dd/MM/yyyy')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inscriptions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch =
      reg.event?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.member?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.member?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.member?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || reg.status === filterStatus;
    const matchesPayment = !filterPayment || reg.payment_status === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmé',
      cancelled: 'Annulé'
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
      {labels[status as keyof typeof labels]}
    </span>;
  };

  const getPaymentBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    const labels = {
      pending: 'En attente',
      completed: 'Payé',
      failed: 'Échoué'
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
      {labels[status as keyof typeof labels]}
    </span>;
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Inscriptions aux Événements</h1>
          <p className="text-gray-600">{filteredRegistrations.length} inscriptions</p>
        </div>
        <button
          onClick={exportRegistrations}
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
            placeholder="Rechercher..."
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
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmé</option>
          <option value="cancelled">Annulé</option>
        </select>
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="rounded-md border-gray-300"
        >
          <option value="">Tous les paiements</option>
          <option value="pending">En attente</option>
          <option value="completed">Payé</option>
          <option value="failed">Échoué</option>
        </select>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Événement</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paiement</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRegistrations.map((reg) => (
              <tr key={reg.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{reg.event?.title}</div>
                  <div className="text-sm text-gray-500">
                    {reg.event?.date && format(new Date(reg.event.date), 'dd MMM yyyy', { locale: fr })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {reg.member?.first_name} {reg.member?.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{reg.member?.email}</div>
                </td>
                <td className="px-6 py-4">{getStatusBadge(reg.status)}</td>
                <td className="px-6 py-4">{getPaymentBadge(reg.payment_status)}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {reg.payment_amount ? `${reg.payment_amount.toLocaleString()} GNF` : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {format(new Date(reg.registration_date), 'dd MMM yyyy', { locale: fr })}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    {reg.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(reg.id, 'confirmed')}
                        className="text-green-600 hover:text-green-900"
                        title="Confirmer"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {reg.payment_status === 'pending' && (
                      <button
                        onClick={() => updatePaymentStatus(reg.id, 'completed')}
                        className="text-blue-600 hover:text-blue-900"
                        title="Marquer comme payé"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Aucune inscription trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistrationsAdminPage;
