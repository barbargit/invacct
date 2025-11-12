"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { masterAPI } from '@/lib/api';

interface PODetail {
  id: number;
  code: string;
  supplier: {
    id: number;
    name: string;
    code: string;
  };
  warehouse: {
    id: number;
    name: string;
    code: string;
  };
  date: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  is_tax_inclusive: boolean;
  tax_rate: number;
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
    price: number;
    subtotal: number;
  }>;
  created_at: string;
  updated_at: string;
}

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [po, setPo] = useState<PODetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');

  useEffect(() => {
    fetchPODetail();
  }, [params.id]);

  const fetchPODetail = async () => {
    try {
      const result = await masterAPI.getPurchaseOrderById(params.id as string);
      if (!result || !result.success) throw new Error((result && result.message) || 'Failed to fetch PO detail');
      setPo(result.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load purchase order');
      router.push('/transactions/purchase-orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string, notes?: string) => {
    setUpdating(true);
    try {
      const result = await masterAPI.updatePurchaseOrderStatus(params.id as string, {
        status: newStatus,
        notes: notes || '',
      });

      if (!result || !result.success) throw new Error((result && result.message) || 'Failed to update status');

      setPo(result.data);
      toast.success(`Purchase order ${newStatus} successfully!`);
      setShowRejectModal(false);
      setRejectNotes('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleApprove = () => {
    if (confirm('Are you sure you want to approve this purchase order?')) {
      updateStatus('approved');
    }
  };

  const handleReject = () => {
    if (!rejectNotes.trim()) {
      toast.error('Please provide rejection reason');
      return;
    }
    updateStatus('rejected', rejectNotes);
  };

  const handleSubmit = () => {
    if (confirm('Are you sure you want to submit this purchase order for approval?')) {
      updateStatus('submitted');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
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

  if (!po) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Purchase order not found</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Purchase Order Detail</h1>
        </div>
        <div className="flex gap-2">
          {/* Status-based Action Buttons */}
          {po.status === 'draft' && (
            <button
              onClick={handleSubmit}
              disabled={updating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {updating ? 'Submitting...' : 'Submit for Approval'}
            </button>
          )}

          {po.status === 'submitted' && (
            <>
              <button
                onClick={handleApprove}
                disabled={updating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {updating ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={updating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </>
          )}

          <button
            onClick={() => router.push(`/transactions/purchase-orders/${params.id}/print`)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* PO Info Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="text-sm text-gray-600">PO Code</label>
            <p className="font-semibold text-gray-900">{po.code}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Status</label>
            <div className="mt-1">{getStatusBadge(po.status)}</div>
          </div>
          <div>
            <label className="text-sm text-gray-600">Date</label>
            <p className="font-semibold text-gray-900">
              {new Date(po.date).toLocaleDateString('id-ID')}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Created At</label>
            <p className="text-sm text-gray-900">
              {new Date(po.created_at).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
          <div>
            <label className="text-sm text-gray-600">Supplier</label>
            <p className="font-semibold text-gray-900">{po.supplier.name}</p>
            <p className="text-sm text-gray-600">{po.supplier.code}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Warehouse</label>
            <p className="font-semibold text-gray-900">{po.warehouse.name}</p>
            <p className="text-sm text-gray-600">{po.warehouse.code}</p>
          </div>
        </div>

        {po.notes && (
          <div className="mt-6 pt-6 border-t">
            <label className="text-sm text-gray-600">Notes</label>
            <p className="text-gray-900 mt-1">{po.notes}</p>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {po.details?.map((detail, index) => (
                <tr key={detail.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.item.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{detail.item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">{detail.item.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{detail.qty}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    Rp {detail.price.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    Rp {detail.subtotal.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">Rp {(po.subtotal || 0).toLocaleString('id-ID')}</span>
              </div>
              
              {po.is_tax_inclusive && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">PPN ({po.tax_rate}%):</span>
                  <span className="font-medium text-gray-900">Rp {(po.tax_amount || 0).toLocaleString('id-ID')}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span className="text-gray-900">TOTAL:</span>
                <span className="text-gray-900">Rp {(po.total || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject Purchase Order</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this purchase order:
            </p>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={4}
              placeholder="Enter rejection reason..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectNotes('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={updating || !rejectNotes.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {updating ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
