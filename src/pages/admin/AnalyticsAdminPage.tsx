import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CreditCard as Edit2, Save, X, TrendingUp, Users, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  id: string;
  year: number;
  month: number;
  unique_visitors: number;
  total_visits: number;
  page_views: number | null;
  bounce_rate: number | null;
  avg_session_duration: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface EditingData {
  unique_visitors: string;
  total_visits: string;
  page_views: string;
  bounce_rate: string;
  avg_session_duration: string;
  notes: string;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export default function AnalyticsAdminPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [previousYear, setPreviousYear] = useState(new Date().getFullYear() - 1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditingData>({
    unique_visitors: '0',
    total_visits: '0',
    page_views: '0',
    bounce_rate: '0',
    avg_session_duration: '0',
    notes: ''
  });

  useEffect(() => {
    fetchAnalytics();
  }, [selectedYear, previousYear]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('website_analytics')
        .select('*')
        .in('year', [selectedYear, previousYear])
        .order('year', { ascending: false })
        .order('month', { ascending: true });

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: AnalyticsData) => {
    setEditingId(item.id);
    setEditData({
      unique_visitors: item.unique_visitors.toString(),
      total_visits: item.total_visits.toString(),
      page_views: item.page_views?.toString() || '0',
      bounce_rate: item.bounce_rate?.toString() || '0',
      avg_session_duration: item.avg_session_duration?.toString() || '0',
      notes: item.notes || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({
      unique_visitors: '0',
      total_visits: '0',
      page_views: '0',
      bounce_rate: '0',
      avg_session_duration: '0',
      notes: ''
    });
  };

  const saveEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('website_analytics')
        .update({
          unique_visitors: parseInt(editData.unique_visitors) || 0,
          total_visits: parseInt(editData.total_visits) || 0,
          page_views: editData.page_views ? parseInt(editData.page_views) : null,
          bounce_rate: editData.bounce_rate ? parseFloat(editData.bounce_rate) : null,
          avg_session_duration: editData.avg_session_duration ? parseInt(editData.avg_session_duration) : null,
          notes: editData.notes || null
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Statistiques mises à jour avec succès');
      setEditingId(null);
      fetchAnalytics();
    } catch (error) {
      console.error('Error updating analytics:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const exportToCSV = () => {
    const currentYearData = analytics.filter(a => a.year === selectedYear);
    const previousYearData = analytics.filter(a => a.year === previousYear);

    const rows = [
      ['Mois', `Visiteurs Uniques ${selectedYear}`, `Visiteurs Uniques ${previousYear}`, `Visites ${selectedYear}`, `Visites ${previousYear}`]
    ];

    for (let month = 1; month <= 12; month++) {
      const current = currentYearData.find(a => a.month === month);
      const previous = previousYearData.find(a => a.month === month);

      rows.push([
        MONTHS[month - 1],
        current?.unique_visitors.toString() || '0',
        previous?.unique_visitors.toString() || '0',
        current?.total_visits.toString() || '0',
        previous?.total_visits.toString() || '0'
      ]);
    }

    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics_${selectedYear}_vs_${previousYear}.csv`;
    link.click();

    toast.success('Export CSV réussi');
  };

  const getDataForMonth = (month: number, year: number): AnalyticsData | undefined => {
    return analytics.find(a => a.month === month && a.year === year);
  };

  const calculateTotals = (year: number) => {
    const yearData = analytics.filter(a => a.year === year);
    return {
      visitors: yearData.reduce((sum, a) => sum + a.unique_visitors, 0),
      visits: yearData.reduce((sum, a) => sum + a.total_visits, 0)
    };
  };

  const currentTotals = calculateTotals(selectedYear);
  const previousTotals = calculateTotals(previousYear);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Statistiques de Trafic Web</h1>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Année Actuelle</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {[2026, 2025, 2024, 2023, 2022].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Année Précédente</label>
            <select
              value={previousYear}
              onChange={(e) => setPreviousYear(parseInt(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {[2025, 2024, 2023, 2022, 2021].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visiteurs {selectedYear}</p>
                <p className="text-3xl font-bold text-blue-600">{currentTotals.visitors.toLocaleString()}</p>
              </div>
              <Users className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Visites {selectedYear}</p>
                <p className="text-3xl font-bold text-green-600">{currentTotals.visits.toLocaleString()}</p>
              </div>
              <Eye className="h-12 w-12 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mois
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visiteurs Uniques {selectedYear}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visiteurs Uniques {previousYear}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visites {selectedYear}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visites {previousYear}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {MONTHS.map((monthName, index) => {
                const month = index + 1;
                const currentData = getDataForMonth(month, selectedYear);
                const previousData = getDataForMonth(month, previousYear);
                const isEditing = editingId === currentData?.id;

                return (
                  <tr key={month} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {monthName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editData.unique_visitors}
                          onChange={(e) => setEditData({ ...editData, unique_visitors: e.target.value })}
                          className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="0"
                        />
                      ) : (
                        currentData?.unique_visitors.toLocaleString() || '0'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {previousData?.unique_visitors.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editData.total_visits}
                          onChange={(e) => setEditData({ ...editData, total_visits: e.target.value })}
                          className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="0"
                        />
                      ) : (
                        currentData?.total_visits.toLocaleString() || '0'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {previousData?.total_visits.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {currentData && (
                        isEditing ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEdit(currentData.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Save className="h-5 w-5" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="text-red-600 hover:text-red-900"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(currentData)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-100 font-bold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  TOTAL
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {currentTotals.visitors.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {previousTotals.visitors.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {currentTotals.visits.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {previousTotals.visits.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900">Comment utiliser cette page</h3>
            <p className="mt-1 text-sm text-blue-700">
              Cliquez sur l'icône d'édition pour modifier les statistiques d'un mois. Les données peuvent être
              importées depuis Google Analytics ou tout autre outil d'analyse web. Utilisez le bouton "Exporter CSV"
              pour générer un rapport au format CSV.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
