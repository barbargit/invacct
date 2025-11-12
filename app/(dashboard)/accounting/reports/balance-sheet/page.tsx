'use client';

import { useEffect, useState } from 'react';
import { accountingAPI, companyAPI } from '@/lib/api';
import { FileText, Printer, Download, Building2, FileDown, Calendar } from 'lucide-react';
import { generateBalanceSheetPDF } from '@/lib/export/pdfGenerator';
import { generateBalanceSheetExcel } from '@/lib/export/excelGenerator';

export default function BalanceSheetPage() {
  const [report, setReport] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Default to current month like Profit & Loss
  const [fromDate, setFromDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch company and report data in parallel
      const [companyRes, reportRes] = await Promise.all([
        companyAPI.getCompany(),
        accountingAPI.getBalanceSheet(fromDate, toDate)
      ]);

      if (companyRes.success) {
        setCompany(companyRes.data);
      }

      if (reportRes.success) {
        setReport(reportRes.data);
      } else {
        setError(reportRes.message || 'Failed to load balance sheet');
      }
    } catch (err: any) {
      console.error('Failed to fetch balance sheet:', err);
      setError('Failed to load balance sheet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!company || !report) {
      alert('Please wait for data to load');
      return;
    }

    try {
      await generateBalanceSheetPDF(company, report, fromDate, toDate);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleExportExcel = async () => {
    if (!company || !report) {
      alert('Please wait for data to load');
      return;
    }

    try {
      await generateBalanceSheetExcel(company, report, fromDate, toDate);
    } catch (error) {
      console.error('Failed to generate Excel:', error);
      alert('Failed to generate Excel. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading balance sheet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Actions */}
      <div className="mb-6 print:hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="w-7 h-7 mr-2 text-blue-600" />
              Balance Sheet
            </h1>
            <p className="text-gray-600 text-sm mt-1">Financial position statement</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <div className="flex items-center gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Start Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-gray-500 pt-6">to</span>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">End Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 print:hidden">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Report Container */}
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-5xl mx-auto">
        {/* Company Header */}
        {company && (
          <div className="text-center mb-8 border-b pb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
            </div>
            <p className="text-gray-600 text-sm">NPWP: {company.npwp}</p>
            <p className="text-gray-600 text-sm">{company.address}</p>
            <p className="text-gray-600 text-sm">Tel: {company.phone} | Email: {company.email}</p>
            <div className="mt-4">
              <h3 className="text-xl font-semibold text-gray-800">BALANCE SHEET</h3>
              <p className="text-gray-600">From {fromDate ? new Date(fromDate).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Beginning'} To {new Date(toDate).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
            </div>
          </div>
        )}

        {/* Assets Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 bg-blue-50 px-4 py-2 rounded">
            ASSETS
          </h3>
          <table className="w-full">
            <tbody>
              {Array.isArray(report?.assets) && report?.assets?.map((item: any, index: number) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2 px-4 text-gray-900">{item.account_name}</td>
                  <td className="py-2 px-4 text-right font-medium text-gray-900">
                    Rp {(item.balance || 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={2} className="py-4 px-4 text-center text-gray-500">
                    No asset accounts found
                  </td>
                </tr>
              )}
              <tr className="bg-blue-50 font-bold">
                <td className="py-3 px-4 text-gray-900">Total Assets</td>
                <td className="py-3 px-4 text-right text-gray-900">
                  Rp {(report?.total_assets || 0).toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Liabilities Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 bg-red-50 px-4 py-2 rounded">
            LIABILITIES
          </h3>
          <table className="w-full">
            <tbody>
              {Array.isArray(report?.liabilities) && report?.liabilities?.map((item: any, index: number) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2 px-4 text-gray-900">{item.account_name}</td>
                  <td className="py-2 px-4 text-right font-medium text-gray-900">
                    Rp {(item.balance || 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={2} className="py-4 px-4 text-center text-gray-500">
                    No liability accounts found
                  </td>
                </tr>
              )}
              <tr className="bg-red-50 font-bold">
                <td className="py-3 px-4 text-gray-900">Total Liabilities</td>
                <td className="py-3 px-4 text-right text-gray-900">
                  Rp {(report?.total_liabilities || 0).toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Equity Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 bg-green-50 px-4 py-2 rounded">
            EQUITY
          </h3>
          <table className="w-full">
            <tbody>
              {Array.isArray(report?.equity) && report?.equity?.map((item: any, index: number) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2 px-4 text-gray-900">{item.account_name}</td>
                  <td className="py-2 px-4 text-right font-medium text-gray-900">
                    Rp {(item.balance || 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={2} className="py-4 px-4 text-center text-gray-500">
                    No equity accounts found
                  </td>
                </tr>
              )}
              <tr className="bg-green-50 font-bold">
                <td className="py-3 px-4 text-gray-900">Total Equity</td>
                <td className="py-3 px-4 text-right text-gray-900">
                  Rp {(report?.total_equity || 0).toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total Liabilities + Equity */}
        <div className="border-t-4 border-gray-800 pt-4">
          <table className="w-full">
            <tbody>
              <tr className="bg-gray-800 text-white font-bold text-lg">
                <td className="py-4 px-4">TOTAL LIABILITIES + EQUITY</td>
                <td className="py-4 px-4 text-right">
                  Rp {((report?.total_liabilities || 0) + (report?.total_equity || 0)).toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Balance Check */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800">Balance Check:</span>
            <span className={`font-bold ${
              report?.total_assets === (report?.total_liabilities || 0) + (report?.total_equity || 0)
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {report?.total_assets === (report?.total_liabilities || 0) + (report?.total_equity || 0)
                ? '✓ Balanced'
                : '⚠ Unbalanced'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
          <p>Generated on {new Date().toLocaleString('id-ID')}</p>
          <p className="mt-1">This is a system-generated report</p>
        </div>
      </div>
    </div>
  );
}
