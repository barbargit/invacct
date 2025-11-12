'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { masterAPI, API_BASE_URL } from '@/lib/api';

interface SO {
  id: number;
  code: string;
  customer: {
    id: number;
    name: string;
  };
  date: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  status: string;
}

interface PaymentTerm {
  id: number;
  name: string;
  days: number;
}

export default function CreateSIPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sos, setSOs] = useState<SO[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [selectedSO, setSelectedSO] = useState<SO | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchApprovedSOs();
    fetchPaymentTerms();
  }, []);

  const fetchApprovedSOs = async () => {
    try {
      const data = await masterAPI.getSalesOrders(1, 100, 'approved');
      if (data && data.success) {
        setSOs(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching SOs:', error);
      toast.error('Failed to load sales orders');
    }
  };

  const fetchPaymentTerms = async () => {
    try {
      const data = await masterAPI.getPaymentTerms(1, 100);
      if (data && data.success) {
        setPaymentTerms(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching payment terms:', error);
    }
  };

  const handleSOSelect = (soId: string) => {
    const so = sos.find(s => s.id === parseInt(soId));
    setSelectedSO(so || null);
  };

  const handlePaymentTermSelect = (paymentTermId: string) => {
    setSelectedPaymentTerm(paymentTermId);
    if (paymentTermId && date) {
      const term = paymentTerms.find(pt => pt.id === parseInt(paymentTermId));
      if (term) {
        const invoiceDate = new Date(date);
        const calculatedDueDate = new Date(invoiceDate);
        calculatedDueDate.setDate(invoiceDate.getDate() + term.days);
        setDueDate(calculatedDueDate.toISOString().split('T')[0]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSO) {
      toast.error('Please select a sales order');
      return;
    }

    if (!dueDate) {
      toast.error('Please set a due date');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const payload = {
        so_id: selectedSO.id,
        date: date,
        due_date: dueDate,
        payment_term_id: selectedPaymentTerm ? parseInt(selectedPaymentTerm) : null,
        notes: notes,
      };

      const response = await fetch(`${API_BASE_URL}/sales-invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create sales invoice');
      }

      toast.success('Sales invoice created successfully!');
      router.push('/transactions/sales-invoices');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create sales invoice');
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
        <h1 className="text-3xl font-bold text-gray-900">Create Sales Invoice</h1>
        <p className="text-gray-600 mt-1">Create invoice for customer payment collection</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sales Order <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSO?.id || ''}
                onChange={(e) => handleSOSelect(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Sales Order</option>
                {sos.map(so => (
                  <option key={so.id} value={so.id}>
                    {so.code} - {so.customer.name} (Rp {so.total.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Only approved SOs are shown</p>
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
                Payment Term
              </label>
              <select
                value={selectedPaymentTerm}
                onChange={(e) => handlePaymentTermSelect(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Payment Term</option>
                {paymentTerms.map(term => (
                  <option key={term.id} value={term.id}>
                    {term.name} ({term.days} days)
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
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes..."
            />
          </div>
        </div>

        {/* SO Summary */}
        {selectedSO && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales Order Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <p className="text-sm text-gray-900">{selectedSO.customer.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                <p className="text-sm text-gray-900">Rp {selectedSO.subtotal.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount</label>
                <p className="text-sm text-gray-900">Rp {selectedSO.tax_amount.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                <p className="text-sm font-semibold text-gray-900">Rp {selectedSO.total.toLocaleString('id-ID')}</p>
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
            disabled={loading || !selectedSO}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Sales Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}