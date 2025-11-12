'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { masterAPI } from '@/lib/api';

interface PI {
  id: number;
  code: string;
  purchase_order: {
    id: number;
    code: string;
    supplier: {
      id: number;
      name: string;
    };
  };
  date: string;
  due_date: string;
  total: number;
  tax_amount: number;
  total_after_tax: number;
  status: string;
  notes: string;
  created_at: string;
}

export default function PurchaseInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<PI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Set default date range to current month on component mount
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setFromDate(firstDay.toISOString().split('T')[0]);
    setToDate(lastDay.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fromDate, toDate, statusFilter]);

  const fetchInvoices = async (applyFilters = false) => {
    try {
      setLoading(true);
      const statusParam = statusFilter === 'all' ? '' : statusFilter;

      // Always apply filters if dates are set (for initial load with default dates)
      const shouldApplyFilters = applyFilters || (fromDate && toDate && fromDate.trim() !== '' && toDate.trim() !== '');

      console.log('Fetching Purchase Invoices:', {
        applyFilters,
        shouldApplyFilters,
        statusParam,
        fromDate,
        toDate,
      });

      const result = await masterAPI.getPurchaseInvoices(1, 100, statusParam, shouldApplyFilters ? fromDate : undefined, shouldApplyFilters ? toDate : undefined);
      setInvoices(result.data?.data || result.data || []);
    } catch (error) {
      console.error('Error fetching PIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchInvoices(true);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.purchase_order?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.purchase_order?.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Invoices</h1>
          <p className="text-gray-600 mt-1">Manage supplier invoices for payment</p>
        </div>
        <Link
          href="/transactions/purchase-invoices/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create Invoice
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search by invoice code, PO code, or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 mr-2">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 mr-2">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' ? 'No purchase invoices found matching your filters' : 'No purchase invoices yet. Create your first invoice!'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{inv.code}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{inv.purchase_order?.code || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{inv.purchase_order?.supplier?.name || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {new Date(inv.date).toLocaleDateString('id-ID')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {new Date(inv.due_date).toLocaleDateString('id-ID')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-gray-900">
                        Rp {(inv.total_after_tax || 0).toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => router.push(`/transactions/purchase-invoices/${inv.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="View Detail"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => router.push(`/transactions/purchase-invoices/${inv.id}/print`)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Print"
                      >
                        🖨️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              Showing {filteredInvoices.length} of {invoices.length} purchase invoices
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
