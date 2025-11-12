'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { masterAPI, API_BASE_URL } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface PaymentTerm {
  id: number;
  name: string;
  days: number;
}

interface PO {
  id: number;
  code: string;
  supplier: {
    id: number;
    name: string;
  };
  subtotal: number;
  tax_amount: number;
  total: number;
}

export default function CreatePIPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pos, setPOs] = useState<PO[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState<PaymentTerm | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchApprovedPOs();
    fetchPaymentTerms();
  }, []);

  const fetchApprovedPOs = async () => {
    try {
      const data = await masterAPI.getPurchaseOrders(1, 100, 'approved');
      if (data && data.success) {
        setPOs(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching POs:', error);
      toast.error('Failed to load purchase orders');
    }
  };

  const fetchPaymentTerms = async () => {
    try {
      const data = await masterAPI.getPaymentTerms(1, 100, true);
      if (data && data.success) {
        setPaymentTerms(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching payment terms:', error);
      toast.error('Failed to load payment terms');
    }
  };

  const handlePOSelect = (poId: string) => {
    const po = pos.find(p => p.id === parseInt(poId));
    setSelectedPO(po || null);
  };

  const handlePaymentTermSelect = (paymentTermId: string) => {
    const paymentTerm = paymentTerms.find(pt => pt.id === parseInt(paymentTermId));
    setSelectedPaymentTerm(paymentTerm || null);

    // Auto-calculate due date based on selected payment term
    if (paymentTerm) {
      const invoiceDate = new Date(date);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(invoiceDate.getDate() + paymentTerm.days);
      setDueDate(dueDate.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPO) {
      toast.error('Please select a purchase order');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        po_id: selectedPO.id,
        date: date,
        due_date: dueDate,
        notes: notes,
      };

      if (selectedPaymentTerm) {
        payload.payment_term_id = selectedPaymentTerm.id;
      }

      const res = await masterAPI.createPurchaseInvoice(payload);
      if (!(res && res.success)) {
        throw new Error(res?.message || 'Failed to create purchase invoice');
      }

      toast.success('Purchase invoice created successfully!');
      router.push('/transactions/purchase-invoices');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create purchase invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create Purchase Invoice</h1>
        <p className="text-gray-600 mt-1">Create invoice for supplier payment</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Order <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedPO?.id || ''}
                onChange={(e) => handlePOSelect(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Purchase Order</option>
                {pos.map(po => (
                  <option key={po.id} value={po.id}>
                    {po.code} - {po.supplier.name} - Rp {po.total.toLocaleString('id-ID')}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Only approved POs are shown</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms
              </label>
              <select
                value={selectedPaymentTerm?.id || ''}
                onChange={(e) => handlePaymentTermSelect(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Payment Terms (Optional)</option>
                {paymentTerms.map(pt => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name} ({pt.days} days)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {selectedPaymentTerm && (
                <p className="text-xs text-gray-500 mt-1">
                  Auto-calculated based on {selectedPaymentTerm.name} ({selectedPaymentTerm.days} days from invoice date)
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Payment terms, bank details, etc..."
            />
          </div>
        </div>

        {/* Invoice Summary */}
        {selectedPO && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Supplier:</span>
                <span className="font-semibold text-gray-900">{selectedPO.supplier.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">PO Code:</span>
                <span className="font-medium text-gray-900">{selectedPO.code}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">Rp {(selectedPO.subtotal || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">Tax Amount:</span>
                  <span className="font-medium text-gray-900">Rp {(selectedPO.tax_amount || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <span className="text-lg font-bold text-gray-900">Total Invoice:</span>
                  <span className="text-lg font-bold text-gray-900">Rp {(selectedPO.total || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !selectedPO}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
