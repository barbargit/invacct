'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { masterAPI } from '@/lib/api';

interface SR {
  id: number;
  code: string;
  sales_invoice: {
    id: number;
    code: string;
    customer: {
      id: number;
      name: string;
    };
  };
  date: string;
  status: string;
  total: number;
  tax_amount: number;
  total_after_tax: number;
  reason: string;
  created_at: string;
}

export default function SalesReturnsPage() {
  const [srs, setSRs] = useState<SR[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSRs();
  }, []);

  const fetchSRs = async () => {
    try {
      const result = await masterAPI.getSalesReturns();
      setSRs(result.data?.data || result.data || []);
    } catch (error) {
      console.error('Error fetching SRs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSRs = srs.filter(sr => {
    const matchesSearch =
      sr.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sr.sales_invoice?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sr.sales_invoice?.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || sr.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
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
          <h1 className="text-3xl font-bold text-gray-900">Sales Returns</h1>
          <p className="text-gray-600 mt-1">Manage sales return transactions</p>
        </div>
        <Link
          href="/transactions/sales-returns/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create SR
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search by SR code, SI code, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SR Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SI Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSRs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' ? 'No sales returns found matching your filters' : 'No sales returns yet. Create your first SR!'}
                  </td>
                </tr>
              ) : (
                filteredSRs.map((sr) => (
                  <tr key={sr.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{sr.code}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{sr.sales_invoice?.code || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{sr.sales_invoice?.customer?.name || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {new Date(sr.date).toLocaleDateString('id-ID')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-gray-900">
                        Rp {sr.total_after_tax?.toLocaleString('id-ID') || '0'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(sr.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <Link
                        href={`/transactions/sales-returns/${sr.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        👁️
                      </Link>
                      <Link
                        href={`/transactions/sales-returns/${sr.id}/print`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        🖨️
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredSRs.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              Showing {filteredSRs.length} of {srs.length} sales returns
            </span>
          </div>
        )}
      </div>
    </div>
  );
}