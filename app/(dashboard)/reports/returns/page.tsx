'use client';

import { useEffect, useState } from 'react';
import { FileText, Download, FileDown, Building2, Calendar, RotateCcw } from 'lucide-react';

export default function ReturnsReportPage() {
  const [returnData, setReturnData] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchReturnData = async () => {
    setLoading(true);
    setError(null);
    try {
      // For now, use mock data since the backend might not have return reports yet
      // In production, this would call an API endpoint
      const mockData = [
        {
          date: '2025-11-01',
          return_no: 'RTN-001',
          type: 'Sales Return',
          customer_supplier: 'PT. ABC Indonesia',
          total: 1500000,
          reason: 'Damaged goods',
          status: 'approved'
        },
        {
          date: '2025-11-03',
          return_no: 'RTN-002',
          type: 'Purchase Return',
          customer_supplier: 'CV. Supplier Makmur',
          total: 750000,
          reason: 'Wrong item',
          status: 'pending'
        }
      ];

      setReturnData(mockData);
      setCompany({ name: 'PT. Inventory Accounting System', address: 'Jl. Example No. 123', phone: '021-12345678', email: 'info@company.com', npwp: '01.234.567.8-901.000' });
    } catch (err: any) {
      console.error('Failed to fetch return data:', err);
      setError('Failed to load return data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnData();
  }, [startDate, endDate]);

  const handleExportExcel = async () => {
    if (returnData.length === 0) {
      alert('No data to export');
      return;
    }

    setExportLoading(true);
    try {
      const excelData = returnData.map(item => ({
        'Tanggal': new Date(item.date).toLocaleDateString('id-ID'),
        'No. Retur': item.return_no || '-',
        'Tipe': item.type || '-',
        'Customer/Supplier': item.customer_supplier || '-',
        'Total': item.total || 0,
        'Alasan': item.reason || '-',
        'Status': item.status || 'pending'
      }));

      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Laporan Retur');

      const colWidths = [
        { wch: 12 }, // Tanggal
        { wch: 15 }, // No. Retur
        { wch: 15 }, // Tipe
        { wch: 25 }, // Customer/Supplier
        { wch: 15 }, // Total
        { wch: 20 }, // Alasan
        { wch: 12 }  // Status
      ];
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `Laporan_Retur_${startDate}_to_${endDate}.xlsx`);
    } catch (error) {
      console.error('Failed to export Excel:', error);
      alert('Failed to export Excel. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const totalReturns = returnData.reduce((sum, item) => sum + (item.total || 0), 0);
  const salesReturns = returnData.filter(item => item.type === 'Sales Return').reduce((sum, item) => sum + (item.total || 0), 0);
  const purchaseReturns = returnData.filter(item => item.type === 'Purchase Return').reduce((sum, item) => sum + (item.total || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Laporan Retur...</p>
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
              <RotateCcw className="w-8 h-8 mr-3 text-orange-600" />
              Laporan Retur
            </h1>
            <p className="text-gray-600 mt-1">Ringkasan retur penjualan dan pembelian</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              disabled={exportLoading || returnData.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {exportLoading ? 'Exporting...' : 'Export Excel'}
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <div className="flex items-center gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-gray-500 pt-6">to</span>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchReturnData}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Retur</p>
          <p className="text-2xl font-bold text-gray-900">
            Rp {totalReturns.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <p className="text-sm text-blue-700">Retur Penjualan</p>
          <p className="text-2xl font-bold text-blue-900">
            Rp {salesReturns.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg shadow p-4">
          <p className="text-sm text-orange-700">Retur Pembelian</p>
          <p className="text-2xl font-bold text-orange-900">
            Rp {purchaseReturns.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. Retur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer/Supplier
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alasan
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {returnData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data retur untuk periode yang dipilih
                  </td>
                </tr>
              ) : (
                returnData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.return_no || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.type || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.customer_supplier || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      Rp {(item.total || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.reason || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'approved' ? 'bg-green-100 text-green-800' :
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status === 'approved' ? 'Disetujui' :
                         item.status === 'pending' ? 'Pending' : 'Ditolak'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {returnData.length > 0 && (
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-right text-sm text-gray-700">
                    Total:
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-gray-900">
                    Rp {totalReturns.toLocaleString('id-ID')}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}