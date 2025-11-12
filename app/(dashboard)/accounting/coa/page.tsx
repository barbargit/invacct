'use client';

import { useEffect, useState } from 'react';
import { accountingAPI, companyAPI } from '@/lib/api';
import { BookOpen, Plus, Search, Filter, FileDown, Download, Edit } from 'lucide-react';
import Link from 'next/link';
import { generateCOAExcel } from '@/lib/export/excelGenerator';

export default function COAPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const [accountsRes, companyRes] = await Promise.all([
        accountingAPI.getCOAs(1, 100),
        companyAPI.getCompany()
      ]);
      
      if (accountsRes.success) {
        setAccounts(accountsRes.data || []);
      } else {
        setError(accountsRes.message || 'Failed to load accounts');
      }
      
      if (companyRes.success) {
        setCompany(companyRes.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch COA:', err);
      setError('Failed to load chart of accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!company || accounts.length === 0) {
      alert('No data to export');
      return;
    }
    
    try {
      await generateCOAExcel(company, filteredAccounts);
    } catch (error) {
      console.error('Failed to generate Excel:', error);
      alert('Failed to generate Excel. Please try again.');
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          acc.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || acc.type === filterType;
    return matchesSearch && matchesType;
  });

  const accountTypes = ['all', 'asset', 'liability', 'equity', 'revenue', 'expense'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chart of accounts...</p>
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
              <BookOpen className="w-8 h-8 mr-3 text-blue-600" />
              Chart of Accounts
            </h1>
            <p className="text-gray-600 mt-1">Manage your accounting structure</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
            <Link
              href="/accounting/coa/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Account
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Type */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {accountTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchAccounts}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Accounts Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Normal Balance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || filterType !== 'all'
                      ? 'No accounts found matching your filters'
                      : 'No accounts available. Add your first account to get started.'}
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {account.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        account.type === 'asset' ? 'bg-green-100 text-green-800' :
                        account.type === 'liability' ? 'bg-red-100 text-red-800' :
                        account.type === 'equity' ? 'bg-blue-100 text-blue-800' :
                        account.type === 'revenue' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {account.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {account.account_group || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {account.normal_balance === 'debit' ? '🔵 Debit' : '🔴 Credit'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      Rp {(account.balance || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Link
                        href={`/accounting/coa/${account.id}/edit`}
                        className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-800">
              <strong>{filteredAccounts.length}</strong> accounts
              {(searchTerm || filterType !== 'all') && ` (filtered from ${accounts.length} total)`}
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
