'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { masterAPI } from '@/lib/api';

interface SI {
  id: number;
  code: string;
  sales_order: {
    id: number;
    code: string;
    customer: {
      id: number;
      name: string;
      address: string;
      phone: string;
    };
    date: string;
    subtotal: number;
    tax_amount: number;
    total: number;
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
  };
  date: string;
  due_date: string;
  total: number;
  tax_amount: number;
  total_after_tax: number;
  status: string;
  notes: string;
  created_at: string;
}

export default function SIDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [invoice, setInvoice] = useState<SI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchInvoiceDetail();
    }
  }, [params.id]);

  const fetchInvoiceDetail = async () => {
    try {
      const result = await masterAPI.getSalesInvoiceById(params.id as string);
      if (!result || !result.success) throw new Error((result && result.message) || 'Failed to fetch invoice detail');
      setInvoice(result.data);
    } catch (error: any) {
      console.error('Error fetching invoice detail:', error);
      toast.error(error.message || 'Failed to fetch invoice detail');
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
          <p className="mt-4 text-gray-600">Loading invoice detail...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-600">Invoice not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
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
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Sales Invoice Detail</h1>
          <p className="text-gray-600 mt-1">Invoice: {invoice.code}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/transactions/sales-invoices/${invoice.id}/print`)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Code</label>
            <p className="text-lg font-semibold text-gray-900">{invoice.code}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <p className="text-sm text-gray-900">{new Date(invoice.date).toLocaleDateString('id-ID')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <p className="text-sm text-gray-900">{new Date(invoice.due_date).toLocaleDateString('id-ID')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            {getStatusBadge(invoice.status)}
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <p className="text-sm text-gray-900">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Customer & SO Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="text-sm text-gray-900">{invoice.sales_order.customer.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <p className="text-sm text-gray-900">{invoice.sales_order.customer.address || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="text-sm text-gray-900">{invoice.sales_order.customer.phone || '-'}</p>
            </div>
          </div>
        </div>

        {/* SO Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sales Order Information</h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">SO Code</label>
              <p className="text-sm text-gray-900">{invoice.sales_order.code}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">SO Date</label>
              <p className="text-sm text-gray-900">{new Date(invoice.sales_order.date).toLocaleDateString('id-ID')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Invoice Items</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.sales_order.details.map((detail) => (
                <tr key={detail.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.item.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{detail.item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">{detail.item.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{detail.qty}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">Rp {detail.price.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">Rp {detail.subtotal.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">Rp {invoice.total.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax Amount:</span>
              <span className="text-gray-900">Rp {invoice.tax_amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span className="text-gray-900">Total:</span>
              <span className="text-gray-900">Rp {invoice.total_after_tax.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}