'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { masterAPI } from '@/lib/api';

interface PIDetail {
  id: number;
  code: string;
  purchase_order: {
    id: number;
    code: string;
    supplier: {
      id: number;
      name: string;
      code: string;
    };
  };
  date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_after_tax: number;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function PurchaseInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [pi, setPi] = useState<PIDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPIDetail();
  }, [params.id]);

  const fetchPIDetail = async () => {
    try {
      const result = await masterAPI.getPurchaseInvoiceById(params.id as string);
      if (!result || !result.success) throw new Error((result && result.message) || 'Failed to fetch PI detail');
      setPi(result.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load purchase invoice');
      router.push('/transactions/purchase-invoices');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
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

  if (!pi) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Purchase invoice not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
          >
            ← Back to List
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Invoice Detail</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/transactions/purchase-invoices/${params.id}/print`)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* PI Info Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="text-sm text-gray-600">Invoice Code</label>
            <p className="font-semibold text-gray-900">{pi.code}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Status</label>
            <div className="mt-1">{getStatusBadge(pi.status)}</div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Date</label>
            <p className="font-semibold text-gray-900">
              {new Date(pi.date).toLocaleDateString('id-ID')}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Due Date</label>
            <p className="font-semibold text-gray-900">
              {new Date(pi.due_date).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
          <div>
            <label className="text-sm text-gray-600">PO Code</label>
            <p className="font-semibold text-gray-900">{pi.purchase_order.code}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Supplier</label>
            <p className="font-semibold text-gray-900">{pi.purchase_order.supplier.name}</p>
            <p className="text-sm text-gray-600">{pi.purchase_order.supplier.code}</p>
          </div>
        </div>

        {pi.notes && (
          <div className="mt-6 pt-6 border-t">
            <label className="text-sm text-gray-600">Notes</label>
            <p className="text-gray-900 mt-1">{pi.notes}</p>
          </div>
        )}
      </div>

      {/* Summary Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Subtotal</p>
            <p className="text-2xl font-bold text-gray-900">
              Rp {(pi.subtotal || 0).toLocaleString('id-ID')}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Tax Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              Rp {(pi.tax_amount || 0).toLocaleString('id-ID')}
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600">Total Amount</p>
            <p className="text-2xl font-bold text-blue-900">
              Rp {(pi.total_after_tax || 0).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
