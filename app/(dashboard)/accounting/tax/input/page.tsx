'use client';

import { useEffect, useState } from 'react';
import { accountingAPI, companyAPI } from '@/lib/api';
import { Receipt, Download, FileDown, Building2, Calendar } from 'lucide-react';

export default function TaxInputPage() {
  const [taxData, setTaxData] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchTaxData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [taxRes, companyRes] = await Promise.all([
        accountingAPI.getTaxInput(startDate, endDate),
        companyAPI.getCompany()
      ]);

      if (taxRes.success) {
        setTaxData(taxRes.data || []);
        setError(null); // Clear any previous error
      } else {
        setError(taxRes.message || 'Failed to load tax input data');
        console.error('Tax input API error:', taxRes);
      }

      if (companyRes.success) {
        setCompany(companyRes.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch tax input:', err);
      setError('Failed to load tax input data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxData();
  }, [startDate, endDate]);

  const handleExportExcel = async () => {
    if (taxData.length === 0) {
      alert('No data to export');
      return;
    }

    setExportLoading(true);
    try {
      const excelData = taxData.map(item => ({
        'Tanggal': new Date(item.date).toLocaleDateString('id-ID'),
        'No. Faktur': item.invoice_no || '-',
        'Supplier': item.supplier_name || '-',
        'DPP': item.dpp || 0,
        'PPN': item.ppn || 0,
        'Total': item.total || 0,
        'Status': item.status || 'Unpaid'
      }));

      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'PPN Masukan');

      const colWidths = [
        { wch: 12 }, // Tanggal
        { wch: 15 }, // No. Faktur
        { wch: 25 }, // Supplier
        { wch: 15 }, // DPP
        { wch: 15 }, // PPN
        { wch: 15 }, // Total
        { wch: 12 }  // Status
      ];
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `PPN_Masukan_${startDate}_to_${endDate}.xlsx`);
    } catch (error) {
      console.error('Failed to export Excel:', error);
      alert('Failed to export Excel. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const totalDPP = taxData.reduce((sum, item) => sum + (item.dpp || 0), 0);
  const totalPPN = taxData.reduce((sum, item) => sum + (item.ppn || 0), 0);
  const totalAmount = taxData.reduce((sum, item) => sum + (item.total || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading PPN Masukan...</p>
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
              <Receipt className="w-8 h-8 mr-3 text-blue-600" />
              PPN Masukan
            </h1>
            <p className="text-gray-600 mt-1">Laporan Pajak Pertambahan Nilai Masukan</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              disabled={exportLoading || taxData.length === 0}
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
            onClick={fetchTaxData}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tax Input Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. Faktur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DPP
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PPN
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {taxData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data PPN Masukan untuk periode yang dipilih
                  </td>
                </tr>
              ) : (
                taxData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.date).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.invoice_no || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.supplier_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      Rp {(item.dpp || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      Rp {(item.ppn || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      Rp {(item.total || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'paid' ? 'bg-green-100 text-green-800' :
                        item.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status === 'paid' ? 'Lunas' :
                         item.status === 'partial' ? 'Sebagian' : 'Belum Bayar'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {taxData.length > 0 && (
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right text-sm text-gray-700">
                    Total:
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-gray-900">
                    Rp {totalDPP.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-gray-900">
                    Rp {totalPPN.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-gray-900">
                    Rp {totalAmount.toLocaleString('id-ID')}
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
          <p className="text-sm text-gray-600">Total DPP</p>
          <p className="text-2xl font-bold text-gray-900">
            Rp {totalDPP.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <p className="text-sm text-blue-700">Total PPN</p>
          <p className="text-2xl font-bold text-blue-900">
            Rp {totalPPN.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-700">Total Amount</p>
          <p className="text-2xl font-bold text-green-900">
            Rp {totalAmount.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    </div>
  );
}