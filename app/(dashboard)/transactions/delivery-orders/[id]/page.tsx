'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { masterAPI } from '@/lib/api';

interface DODetail {
  id: number;
  code: string;
  sales_order: {
    id: number;
    code: string;
    customer: {
      id: number;
      name: string;
      code: string;
    };
    warehouse: {
      id: number;
      name: string;
      code: string;
    };
  };
  date: string;
  status: string;
  notes: string;
  details: Array<{
    id: number;
    item: {
      id: number;
      name: string;
      code: string;
      unit: string;
    };
    qty: number;
  }>;
  created_at: string;
  updated_at: string;
}

export default function DeliveryOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [do_detail, setDoDetail] = useState<DODetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDODetail();
  }, [params.id]);

  const fetchDODetail = async () => {
    try {
      const result = await masterAPI.getDeliveryOrderById(params.id as string);
      if (!result || !result.success) throw new Error((result && result.message) || 'Failed to fetch DO detail');
      setDoDetail(result.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load delivery order');
      router.push('/transactions/delivery-orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
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

  if (!do_detail) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Delivery order not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
          >
            ← Back to List
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Delivery Order Detail</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/transactions/delivery-orders/${params.id}/print`)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* DO Info Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="text-sm text-gray-600">DO Code</label>
            <p className="font-semibold text-gray-900">{do_detail.code}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Status</label>
            <div className="mt-1">{getStatusBadge(do_detail.status)}</div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Delivery Date</label>
            <p className="font-semibold text-gray-900">
              {new Date(do_detail.date).toLocaleDateString('id-ID')}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Created At</label>
            <p className="text-sm text-gray-900">
              {new Date(do_detail.created_at).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t">
          <div>
            <label className="text-sm text-gray-600">Reference SO</label>
            <p className="font-semibold text-gray-900">{do_detail.sales_order.code}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Customer</label>
            <p className="font-semibold text-gray-900">{do_detail.sales_order.customer.name}</p>
            <p className="text-sm text-gray-600">{do_detail.sales_order.customer.code}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Warehouse</label>
            <p className="font-semibold text-gray-900">{do_detail.sales_order.warehouse.name}</p>
            <p className="text-sm text-gray-600">{do_detail.sales_order.warehouse.code}</p>
          </div>
        </div>

        {do_detail.notes && (
          <div className="mt-6 pt-6 border-t">
            <label className="text-sm text-gray-600">Notes</label>
            <p className="text-gray-900 mt-1">{do_detail.notes}</p>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Delivered Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty Delivered</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {do_detail.details?.map((detail, index) => (
                <tr key={detail.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.item.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{detail.item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">{detail.item.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">{detail.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
