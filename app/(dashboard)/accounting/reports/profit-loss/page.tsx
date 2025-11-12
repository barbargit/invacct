'use client';

import { useEffect, useState } from 'react';
import { accountingAPI, companyAPI } from '@/lib/api';
import { TrendingUp, Printer, Download, Building2, Calendar, FileDown } from 'lucide-react';
import { generateProfitLossPDF } from '@/lib/export/pdfGenerator';
import { generateProfitLossExcel } from '@/lib/export/excelGenerator';

export default function ProfitLossPage() {
  const [report, setReport] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Default to current month
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch company and report data in parallel
      const [companyRes, reportRes] = await Promise.all([
        companyAPI.getCompany(),
        accountingAPI.getProfitLoss(startDate, endDate)
      ]);

      if (companyRes.success) {
        setCompany(companyRes.data);
      }

      if (reportRes.success) {
        setReport(reportRes.data);
      } else {
        setError(reportRes.message || 'Failed to load profit & loss statement');
      }
    } catch (err: any) {
      console.error('Failed to fetch profit & loss:', err);
      setError('Failed to load profit & loss statement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!company || !report) {
      alert('Please wait for data to load');
      return;
    }
    
    try {
      await generateProfitLossPDF(company, report, startDate, endDate);
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
      await generateProfitLossExcel(company, report, startDate, endDate);
    } catch (error) {
      console.error('Failed to generate Excel:', error);
      alert('Failed to generate Excel. Please try again.');
    }
  };

  const netIncome = (report?.total_revenue || 0) - (report?.total_expense || 0);
  const isProfitable = netIncome > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profit & loss statement...</p>
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
              <TrendingUp className="w-7 h-7 mr-2 text-green-600" />
              Profit & Loss Statement
            </h1>
            <p className="text-gray-600 text-sm mt-1">Income statement and financial performance</p>
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
              <h3 className="text-xl font-semibold text-gray-800">PROFIT & LOSS STATEMENT</h3>
              <p className="text-gray-600">
                Period: {new Date(startDate).toLocaleDateString('id-ID')} - {new Date(endDate).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
        )}

        {/* Revenue Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 bg-green-50 px-4 py-2 rounded">
            REVENUE
          </h3>
          <table className="w-full">
            <tbody>
              {Array.isArray(report?.revenue) && report?.revenue?.map((item: any, index: number) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2 px-4 text-gray-900">{item.account_name}</td>
                  <td className="py-2 px-4 text-right font-medium text-gray-900">
                    Rp {(item.amount || 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={2} className="py-4 px-4 text-center text-gray-500">
                    No revenue accounts found
                  </td>
                </tr>
              )}
              <tr className="bg-green-50 font-bold">
                <td className="py-3 px-4 text-gray-900">Total Revenue</td>
                <td className="py-3 px-4 text-right text-gray-900">
                  Rp {(report?.total_revenue || 0).toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Expense Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 bg-red-50 px-4 py-2 rounded">
            EXPENSES
          </h3>
          <table className="w-full">
            <tbody>
              {Array.isArray(report?.expenses) && report?.expenses?.map((item: any, index: number) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2 px-4 text-gray-900">{item.account_name}</td>
                  <td className="py-2 px-4 text-right font-medium text-gray-900">
                    Rp {(item.amount || 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={2} className="py-4 px-4 text-center text-gray-500">
                    No expense accounts found
                  </td>
                </tr>
              )}
              <tr className="bg-red-50 font-bold">
                <td className="py-3 px-4 text-gray-900">Total Expenses</td>
                <td className="py-3 px-4 text-right text-gray-900">
                  Rp {(report?.total_expense || 0).toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Net Income */}
        <div className="border-t-4 border-gray-800 pt-4">
          <table className="w-full">
            <tbody>
              <tr className={`${isProfitable ? 'bg-green-600' : 'bg-red-600'} text-white font-bold text-lg`}>
                <td className="py-4 px-4">
                  {isProfitable ? 'NET PROFIT' : 'NET LOSS'}
                </td>
                <td className="py-4 px-4 text-right">
                  Rp {Math.abs(netIncome).toLocaleString('id-ID')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Performance Indicators */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 font-semibold">Gross Margin</p>
            <p className="text-2xl font-bold text-green-900">
              {report?.total_revenue > 0 
                ? ((report?.total_revenue / report?.total_revenue) * 100).toFixed(2) 
                : 0}%
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isProfitable ? 'bg-blue-50' : 'bg-red-50'}`}>
            <p className={`text-sm font-semibold ${isProfitable ? 'text-blue-700' : 'text-red-700'}`}>
              Net Margin
            </p>
            <p className={`text-2xl font-bold ${isProfitable ? 'text-blue-900' : 'text-red-900'}`}>
              {report?.total_revenue > 0 
                ? ((netIncome / report?.total_revenue) * 100).toFixed(2) 
                : 0}%
            </p>
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
