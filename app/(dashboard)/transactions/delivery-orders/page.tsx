'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { masterAPI } from '@/lib/api';

interface DO {
  id: number;
  code: string;
  sales_order: {
    id: number;
    code: string;
    customer: {
      id: number;
      name: string;
    };
  };
  date: string;
  status: string;
  notes: string;
  created_at: string;
}

export default function DeliveryOrdersPage() {
  const router = useRouter();
  const [dos, setDos] = useState<DO[]>([]);
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
    fetchDOs();
  }, [fromDate, toDate, statusFilter]);

  const fetchDOs = async (applyFilters = false) => {
    try {
      setLoading(true);
      const statusParam = statusFilter === 'all' ? '' : statusFilter;

      // Always apply filters if dates are set (for initial load with default dates)
      const shouldApplyFilters = applyFilters || (fromDate && toDate && fromDate.trim() !== '' && toDate.trim() !== '');

      console.log('Fetching Delivery Orders:', {
        applyFilters,
        shouldApplyFilters,
        statusParam,
        fromDate,
        toDate,
      });

      const result = await masterAPI.getDeliveryOrders(1, 100, statusParam, shouldApplyFilters ? fromDate : undefined, shouldApplyFilters ? toDate : undefined);
      const dosData = result.data?.data || result.data || [];
      setDos(dosData);
    } catch (error) {
      console.error('Error fetching DOs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchDOs(true);
  };

  const filteredDOs = dos.filter(d => {
    const matchesSearch = 
      d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.sales_order?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.sales_order?.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
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
          <h1 className="text-3xl font-bold text-gray-900">Delivery Orders</h1>
          <p className="text-gray-600 mt-1">Manage delivery orders (Surat Jalan)</p>
        </div>
        <Link
          href="/transactions/delivery-orders/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create DO
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search by DO code, SO code, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DO Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SO Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDOs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' ? 'No delivery orders found matching your filters' : 'No delivery orders yet. Create your first DO!'}
                  </td>
                </tr>
              ) : (
                filteredDOs.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{d.code}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{d.sales_order?.code || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{d.sales_order?.customer?.name || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {new Date(d.date).toLocaleDateString('id-ID')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(d.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => router.push(`/transactions/delivery-orders/${d.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="View Detail"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => router.push(`/transactions/delivery-orders/${d.id}/print`)}
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

        {filteredDOs.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              Showing {filteredDOs.length} of {dos.length} delivery orders
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
