'use client';

import { useState, useEffect } from 'react';
import { masterAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Plus, Eye, FileText, Search } from 'lucide-react';
import Link from 'next/link';
import ToastContainer from '@/components/ui/ToastContainer';
import { useToast } from '@/hooks/useToast';

interface SalesOrder {
  id: number;
  code: string;
  customer_id: number;
  customer?: {
    id: number;
    name: string;
  };
  warehouse_id: number;
  warehouse?: {
    id: number;
    name: string;
  };
  date: string;
  subtotal: number;
  is_tax_inclusive: boolean;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: string;
  notes: string;
  created_at: string;
}

export default function SalesOrdersPage() {
  const router = useRouter();
  const { toasts, success, error: showError, removeToast } = useToast();
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchSalesOrders();
  }, [fromDate, toDate, statusFilter]);

  // Set default date range to current month on component mount
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setFromDate(firstDay.toISOString().split('T')[0]);
    setToDate(lastDay.toISOString().split('T')[0]);
  }, []);

  const fetchSalesOrders = async (applyFilters = false) => {
    try {
      setLoading(true);
      const statusParam = statusFilter === 'all' ? '' : statusFilter;

      // Always apply filters if dates are set (for initial load with default dates)
      const shouldApplyFilters = applyFilters || (fromDate && toDate && fromDate.trim() !== '' && toDate.trim() !== '');

      console.log('Fetching Sales Orders:', {
        applyFilters,
        shouldApplyFilters,
        statusParam,
        fromDate,
        toDate,
      });

      const data = await masterAPI.getSalesOrders(1, 100, statusParam, shouldApplyFilters ? fromDate : undefined, shouldApplyFilters ? toDate : undefined);

      if (data && data.success) {
        const sosData = Array.isArray(data.data) ? data.data : [];
        setSalesOrders(sosData);
      } else {
        showError((data && data.message) || 'Failed to fetch sales orders');
      }
    } catch (err: any) {
      showError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchSalesOrders(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      submitted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Submitted' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const filteredOrders = salesOrders.filter(so => {
    const matchesSearch = 
      so.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      so.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || so.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
            <p className="text-gray-600 mt-1">Manage sales orders to customers</p>
          </div>
          <Link
            href="/transactions/sales-orders/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create SO
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-4 flex gap-4 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SO code or customer..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Apply
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading sales orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery || statusFilter !== 'all' 
                ? 'No sales orders found matching your filters' 
                : 'No sales orders yet. Create your first SO!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SO Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PPN
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
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
                  {filteredOrders.map((so) => (
                    <tr key={so.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{so.code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{so.customer?.name || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {new Date(so.date).toLocaleDateString('id-ID')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm text-gray-900">
                          Rp {(so.subtotal || 0).toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {so.is_tax_inclusive ? (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                            {so.tax_rate || 0}%
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            No Tax
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-gray-900">
                          Rp {(so.total || 0).toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusBadge(so.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/transactions/sales-orders/${so.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => window.open(`/transactions/sales-orders/${so.id}/print`, '_blank')}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Print SO"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {!loading && filteredOrders.length > 0 && (
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {filteredOrders.length} of {salesOrders.length} sales orders
            </span>
            <div className="flex gap-4">
              <span>
                Total Value: <strong>Rp {filteredOrders.reduce((sum, so) => sum + (so.total || 0), 0).toLocaleString('id-ID')}</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
