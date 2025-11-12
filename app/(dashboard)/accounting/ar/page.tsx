'use client';

import { useEffect, useState } from 'react';
import { accountingAPI } from '@/lib/api';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

export default function ARPage() {
  const [arData, setArData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAR, setSelectedAR] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNotes, setPaymentNotes] = useState('');

  const fetchAR = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await accountingAPI.getARs(1, 100);
      if (response.success) {
        setArData(response.data || []);
      } else {
        setError(response.message || 'Failed to load accounts receivable');
      }
    } catch (err: any) {
      console.error('Failed to fetch AR:', err);
      setError('Failed to load accounts receivable data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (ar: any) => {
    setSelectedAR(ar);
    setPaymentAmount(ar.balance?.toString() || '0');
    setPaymentMethod('cash');
    setPaymentNotes('');
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedAR || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > selectedAR.balance) {
      alert('Invalid payment amount');
      return;
    }

    try {
      const response = await accountingAPI.createPayment({
        reference_id: selectedAR.id,
        type: 'AR',
        amount: amount,
        payment_method: paymentMethod,
        notes: paymentNotes,
      });

      if (response.success) {
        alert('Payment recorded successfully!');
        setShowPaymentModal(false);
        fetchAR(); // Refresh data
      } else {
        alert('Failed to record payment: ' + response.message);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert('Failed to record payment');
    }
  };

  useEffect(() => {
    fetchAR();
  }, []);

  const totalAmount = arData.reduce((sum, ar) => sum + (ar.amount || 0), 0);
  const totalPaid = arData.reduce((sum, ar) => sum + (ar.paid_amount || 0), 0);
  const totalBalance = arData.reduce((sum, ar) => sum + (ar.balance || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading accounts receivable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="w-8 h-8 mr-3 text-green-600" />
          Accounts Receivable (AR)
        </h1>
        <p className="text-gray-600 mt-1">Manage customer invoices and receivables</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{arData.length}</p>
            </div>
            <Users className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Total Amount</p>
              <p className="text-xl font-bold text-green-900">
                Rp {totalAmount.toLocaleString('id-ID')}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Total Paid</p>
              <p className="text-xl font-bold text-blue-900">
                Rp {totalPaid.toLocaleString('id-ID')}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700">Outstanding</p>
              <p className="text-xl font-bold text-orange-900">
                Rp {totalBalance.toLocaleString('id-ID')}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchAR}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* AR Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {arData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No receivables found. AR entries are created from sales invoices.
                  </td>
                </tr>
              ) : (
                arData.map((ar) => {
                  const isPaid = ar.status === 'paid';
                  const isOverdue = ar.status === 'overdue';
                  const isPartial = ar.status === 'partial';

                  return (
                    <tr key={ar.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {ar.invoice?.date ? new Date(ar.invoice.date).toLocaleDateString('id-ID') : new Date(ar.date).toLocaleDateString('id-ID')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ar.invoice?.code || ar.invoice?.invoice_no || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {ar.customer?.name || ar.customer_name || 'Unknown Customer'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {ar.due_date ? new Date(ar.due_date).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        Rp {(ar.amount || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                        Rp {(ar.paid_amount || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-orange-600">
                        Rp {(ar.balance || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isPaid ? 'bg-green-100 text-green-800' :
                            isOverdue ? 'bg-red-100 text-red-800' :
                            isPartial ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ar.status || 'unpaid'}
                          </span>
                          {!isPaid && (
                            <button
                              onClick={() => handlePayment(ar)}
                              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                              title="Record Payment"
                            >
                              💰 Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {arData.length > 0 && (
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-right text-sm text-gray-700">
                    Total:
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-gray-900">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-green-600">
                    Rp {totalPaid.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-orange-600 font-bold">
                    Rp {totalBalance.toLocaleString('id-ID')}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedAR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Record Payment</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice: {selectedAR.invoice?.code || selectedAR.invoice?.invoice_no || selectedAR.invoice_no || 'N/A'}
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer: {selectedAR.customer?.name || selectedAR.customer_name || 'N/A'}
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outstanding Balance: Rp {selectedAR.balance?.toLocaleString('id-ID')}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter payment amount"
                  min="0"
                  max={selectedAR.balance}
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="credit_card">Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Payment notes..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPayment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
