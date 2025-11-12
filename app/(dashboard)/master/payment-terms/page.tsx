'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { masterAPI, API_BASE_URL } from '@/lib/api';

interface PaymentTerm {
  id: number;
  name: string;
  days: number;
  description: string;
  is_active: boolean;
  created_at: string;
}

export default function PaymentTermsPage() {
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentTerms();
  }, []);

  const fetchPaymentTerms = async () => {
    try {
      const data = await masterAPI.getPaymentTerms(1, 100);
      if (data && data.success) {
        setPaymentTerms(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching payment terms:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const data = await masterAPI.updatePaymentTerm(id, { is_active: !currentStatus });
      if (data && data.success) {
        fetchPaymentTerms();
      } else {
        throw new Error((data && data.message) || 'Failed to update payment term');
      }
    } catch (error) {
      console.error('Error updating payment term:', error);
      alert('Failed to update payment term status');
    }
  };

  const deletePaymentTerm = async (id: number) => {
    if (!confirm('Are you sure you want to delete this payment term?')) return;

    try {
      const data = await masterAPI.deletePaymentTerm(id);
      if (data && data.success) {
        fetchPaymentTerms();
      } else {
        throw new Error((data && data.message) || 'Failed to delete payment term');
      }
    } catch (error) {
      console.error('Error deleting payment term:', error);
      alert('Failed to delete payment term');
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Payment Terms</h1>
          <p className="text-gray-600 mt-1">Manage payment terms for invoices</p>
        </div>
        <Link
          href="/master/payment-terms/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Payment Term
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentTerms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No payment terms yet. <Link href="/master/payment-terms/create" className="text-blue-600 hover:text-blue-800">Create your first one</Link>!
                  </td>
                </tr>
              ) : (
                paymentTerms.map((term) => (
                  <tr key={term.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{term.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{term.days} days</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{term.description || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => toggleActive(term.id, term.is_active)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          term.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {term.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <Link
                        href={`/master/payment-terms/${term.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deletePaymentTerm(term.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {paymentTerms.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              Showing {paymentTerms.length} payment terms
            </span>
          </div>
        )}
      </div>
    </div>
  );
}