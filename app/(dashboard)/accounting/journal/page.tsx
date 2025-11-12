'use client';

import { useEffect, useState } from 'react';
import { accountingAPI } from '@/lib/api';
import { BookText, Plus, Calendar, FileText, Download, FileDown, Eye, X } from 'lucide-react';

export default function JournalPage() {
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedJournal, setSelectedJournal] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Set default date range to current month on component mount
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setFromDate(firstDay.toISOString().split('T')[0]);
    setToDate(lastDay.toISOString().split('T')[0]);
  }, []);

  const fetchJournals = async (applyFilters = false) => {
    setLoading(true);
    setError(null);
    try {
      // Always apply filters if dates are set (for initial load with default dates)
      const shouldApplyFilters = applyFilters || (fromDate && toDate);

      console.log('Fetching Journals:', {
        applyFilters,
        shouldApplyFilters,
        fromDate,
        toDate,
      });

      const response = await accountingAPI.getJournals(1, 50, shouldApplyFilters ? fromDate : undefined, shouldApplyFilters ? toDate : undefined);
      if (response.success) {
        setJournals(response.data || []);
      } else {
        setError(response.message || 'Failed to load journals');
      }
    } catch (err: any) {
      console.error('Failed to fetch journals:', err);
      setError('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchJournals(true);
  };

  const handleViewDetails = async (journal: any) => {
    setDetailsLoading(true);
    setSelectedJournal(journal);
    setShowDetailsModal(true);

    try {
      // Load journal details if not already loaded
      if (!journal.details) {
        const response = await accountingAPI.getJournalById(journal.id);
        if (response.success) {
          setSelectedJournal(response.data);
        }
      }
    } catch (error) {
      console.error('Failed to load journal details:', error);
      alert('Failed to load journal details. Please try again.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (journals.length === 0) {
      alert('No data to export');
      return;
    }

    setExportLoading(true);
    try {
      // Create Excel data
      const excelData = journals.map(journal => ({
        'Date': new Date(journal.date).toLocaleDateString('id-ID'),
        'Journal No': journal.reference || journal.journal_no || '-',
        'Description': journal.description || '',
        'Type': journal.journal_type || 'auto',
        'Total Debit': journal.total_debit || 0,
        'Total Credit': journal.total_credit || 0,
        'Status': (journal.total_debit === journal.total_credit) ? 'Balanced' : 'Unbalanced'
      }));

      // Create and download Excel file
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Journal Entries');

      // Auto-size columns
      const colWidths = [
        { wch: 12 }, // Date
        { wch: 15 }, // Journal No
        { wch: 40 }, // Description
        { wch: 10 }, // Type
        { wch: 15 }, // Total Debit
        { wch: 15 }, // Total Credit
        { wch: 12 }  // Status
      ];
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `Journal_Entries_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Failed to export Excel:', error);
      alert('Failed to export Excel. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, [fromDate, toDate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading journal entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BookText className="w-8 h-8 mr-3 text-blue-600" />
              Journal Entries
            </h1>
            <p className="text-gray-600 mt-1">View and manage accounting journal entries</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              disabled={exportLoading || journals.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {exportLoading ? 'Exporting...' : 'Export Excel'}
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Journal
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-blue-900 font-semibold mb-1">Automated Journal Entries</h3>
            <p className="text-blue-800 text-sm">
              Most journal entries are automatically generated from transactions (invoices, payments, returns).
              You can create manual journal entries for adjustments and corrections.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => fetchJournals()}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Journals Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Journal No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Debit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Credit
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {journals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No journal entries found. Journals are automatically created from transactions.
                  </td>
                </tr>
              ) : (
                journals.map((journal) => (
                  <tr key={journal.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(journal.date).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {journal.reference || journal.journal_no || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={journal.description}>
                        {journal.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        journal.journal_type === 'manual' ? 'bg-yellow-100 text-yellow-800' :
                        journal.journal_type === 'sales' ? 'bg-green-100 text-green-800' :
                        journal.journal_type === 'purchase' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {journal.journal_type || 'auto'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      Rp {(journal.total_debit || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      Rp {(journal.total_credit || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {journal.total_debit === journal.total_credit ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Balanced
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ⚠ Unbalanced
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(journal)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        title="View Account Details"
                      >
                        <Eye className="w-4 h-4" />
                        View ({journal.details?.length || 0})
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {journals.length > 0 && (
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-right text-sm text-gray-700">
                    Total:
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-gray-900">
                    Rp {journals.reduce((sum, j) => sum + (j.total_debit || 0), 0).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-gray-900">
                    Rp {journals.reduce((sum, j) => sum + (j.total_credit || 0), 0).toLocaleString('id-ID')}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Entries</p>
          <p className="text-2xl font-bold text-gray-900">{journals.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-700">Total Debit</p>
          <p className="text-2xl font-bold text-green-900">
            Rp {journals.reduce((sum, j) => sum + (j.total_debit || 0), 0).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4">
          <p className="text-sm text-red-700">Total Credit</p>
          <p className="text-2xl font-bold text-red-900">
            Rp {journals.reduce((sum, j) => sum + (j.total_credit || 0), 0).toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Journal Details Modal */}
      {showDetailsModal && selectedJournal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Journal Details</h3>
                <p className="text-sm text-gray-600">
                  {selectedJournal.reference || selectedJournal.journal_no || 'No Reference'} - {new Date(selectedJournal.date).toLocaleDateString('id-ID')}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {detailsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading details...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Journal Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Journal Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Description:</span>
                        <p className="font-medium">{selectedJournal.description || 'No description'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <p className="font-medium capitalize">{selectedJournal.journal_type || 'auto'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Debit:</span>
                        <p className="font-medium text-green-600">Rp {(selectedJournal.total_debit || 0).toLocaleString('id-ID')}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Credit:</span>
                        <p className="font-medium text-red-600">Rp {(selectedJournal.total_credit || 0).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Account Details</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Code</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Name</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedJournal.details && selectedJournal.details.length > 0 ? (
                            selectedJournal.details.map((detail: any, index: number) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {detail.coa?.code || detail.account_code || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {detail.coa?.name || detail.account_name || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                                  {detail.debit > 0 ? `Rp ${detail.debit.toLocaleString('id-ID')}` : '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                                  {detail.credit > 0 ? `Rp ${detail.credit.toLocaleString('id-ID')}` : '-'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                No account details found
                              </td>
                            </tr>
                          )}
                        </tbody>
                        {selectedJournal.details && selectedJournal.details.length > 0 && (
                          <tfoot className="bg-gray-50 font-semibold">
                            <tr>
                              <td colSpan={2} className="px-4 py-3 text-right text-sm text-gray-700">
                                Total:
                              </td>
                              <td className="px-4 py-3 text-sm text-right text-green-600">
                                Rp {selectedJournal.details.reduce((sum: number, d: any) => sum + (d.debit || 0), 0).toLocaleString('id-ID')}
                              </td>
                              <td className="px-4 py-3 text-sm text-right text-red-600">
                                Rp {selectedJournal.details.reduce((sum: number, d: any) => sum + (d.credit || 0), 0).toLocaleString('id-ID')}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
