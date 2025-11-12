'use client';

import { useEffect, useState } from 'react';
import { accountingAPI } from '@/lib/api';
import { TrendingDown, Building2, DollarSign, Calendar } from 'lucide-react';

export default function APPage() {
  const [apData, setApData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAP, setSelectedAP] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNotes, setPaymentNotes] = useState('');

  const fetchAP = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await accountingAPI.getAPs(1, 100);
      if (response.success) {
        setApData(response.data || []);
      } else {
        setError(response.message || 'Failed to load accounts payable');
      }
    } catch (err: any) {
      console.error('Failed to fetch AP:', err);
      setError('Failed to load accounts payable data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (ap: any) => {
    setSelectedAP(ap);
    setPaymentAmount(ap.balance?.toString() || '0');
    setPaymentMethod('cash');
    setPaymentNotes('');
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedAP || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > selectedAP.balance) {
      alert('Invalid payment amount');
      return;
    }

    try {
      const response = await accountingAPI.createPayment({
        reference_id: selectedAP.id,
        type: 'AP',
        amount: amount,
        payment_method: paymentMethod,
        notes: paymentNotes,
      });

      if (response.success) {
        alert('Payment recorded successfully!');
        setShowPaymentModal(false);
        fetchAP(); // Refresh data
      } else {
        alert('Failed to record payment: ' + response.message);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      alert('Failed to record payment');
    }
  };

  useEffect(() => {
    fetchAP();
  }, []);

  const totalAmount = apData.reduce((sum, ap) => sum + (ap.amount || 0), 0);
  const totalPaid = apData.reduce((sum, ap) => sum + (ap.paid_amount || 0), 0);
  const totalBalance = apData.reduce((sum, ap) => sum + (ap.balance || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading accounts payable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <TrendingDown className="w-8 h-8 mr-3 text-red-600" />
          Accounts Payable (AP)
        </h1>
        <p className="text-gray-600 mt-1">Manage supplier invoices and payables</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{apData.length}</p>
            </div>
            <Building2 className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Total Amount</p>
              <p className="text-xl font-bold text-red-900">
                Rp {totalAmount.toLocaleString('id-ID')}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-red-600" />
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
            onClick={fetchAP}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* AP Table */}
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
                  Supplier
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
              {apData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No payables found. AP entries are created from purchase invoices.
                  </td>
                </tr>
              ) : (
                apData.map((ap) => {
                  const isPaid = ap.status === 'paid';
                  const isOverdue = ap.status === 'overdue';
                  const isPartial = ap.status === 'partial';

                  return (
                    <tr key={ap.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {ap.invoice?.date ? new Date(ap.invoice.date).toLocaleDateString('id-ID') : new Date(ap.date).toLocaleDateString('id-ID')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ap.invoice?.code || ap.invoice?.invoice_no || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {ap.supplier?.name || ap.supplier_name || 'Unknown Supplier'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {ap.due_date ? new Date(ap.due_date).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        Rp {(ap.amount || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                        Rp {(ap.paid_amount || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-orange-600">
                        Rp {(ap.balance || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isPaid ? 'bg-green-100 text-green-800' :
                            isOverdue ? 'bg-red-100 text-red-800' :
                            isPartial ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ap.status || 'unpaid'}
                          </span>
                          {!isPaid && (
                            <button
                              onClick={() => handlePayment(ap)}
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
            {apData.length > 0 && (
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
      {showPaymentModal && selectedAP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Record Payment</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice: {selectedAP.invoice?.code || selectedAP.invoice?.invoice_no || selectedAP.invoice_no || 'N/A'}
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier: {selectedAP.supplier?.name || selectedAP.supplier_name || 'N/A'}
                </label>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outstanding Balance: Rp {selectedAP.balance?.toLocaleString('id-ID')}
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
                  max={selectedAP.balance}
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
