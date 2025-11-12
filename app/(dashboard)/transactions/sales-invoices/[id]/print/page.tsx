'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { masterAPI, companyAPI } from '@/lib/api';

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

interface Company {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export default function SIPrintPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<SI | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchInvoiceDetail();
      fetchCompanyData();
    }
  }, [params.id]);

  const fetchInvoiceDetail = async () => {
    try {
      const result = await masterAPI.getSalesInvoiceById(params.id as string);
      if (!result || !result.success) throw new Error((result && result.message) || 'Failed to fetch invoice detail');
      setInvoice(result.data);
    } catch (error) {
      console.error('Error fetching invoice detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyData = async () => {
    try {
      const result = await companyAPI.getCompany();
      if (!result || !result.success) throw new Error((result && result.message) || 'Failed to fetch company data');
      setCompany(result.data);
    } catch (error) {
      console.error('Error fetching company data:', error);
      // Don't show error toast for company data, use default
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-600">Invoice not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">
      {/* Action Buttons */}
      <div className="mb-6 print:hidden flex gap-4">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          ← Back
        </button>
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🖨️ Print Invoice
        </button>
      </div>

      {/* Company Header */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{company?.name || 'PT. INVENT ACCT GO'}</h1>
        <p className="text-sm text-gray-600">{company?.address || 'Jl. Contoh No. 123, Jakarta'}</p>
        <p className="text-sm text-gray-600">
          Telp: {company?.phone || '(021) 12345678'} | Email: {company?.email || 'info@inventacctgo.com'}
        </p>
      </div>

      {/* Invoice Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">SALES INVOICE</h2>
            <div className="space-y-1">
              <p className="text-sm"><strong>Invoice No:</strong> {invoice.code}</p>
              <p className="text-sm"><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString('id-ID')}</p>
              <p className="text-sm"><strong>Due Date:</strong> {new Date(invoice.due_date).toLocaleDateString('id-ID')}</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bill To:</h3>
            <div className="text-sm space-y-1">
              <p className="font-medium">{invoice.sales_order.customer.name}</p>
              <p>{invoice.sales_order.customer.address || '-'}</p>
              <p>{invoice.sales_order.customer.phone || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SO Reference */}
      <div className="mb-6">
        <p className="text-sm"><strong>Sales Order Reference:</strong> {invoice.sales_order.code}</p>
        <p className="text-sm"><strong>SO Date:</strong> {new Date(invoice.sales_order.date).toLocaleDateString('id-ID')}</p>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Item Code</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium">Description</th>
              <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium">Unit</th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium">Qty</th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium">Price</th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.sales_order.details.map((detail, index) => (
              <tr key={detail.id}>
                <td className="border border-gray-300 px-4 py-2 text-sm">{detail.item.code}</td>
                <td className="border border-gray-300 px-4 py-2 text-sm">{detail.item.name}</td>
                <td className="border border-gray-300 px-4 py-2 text-center text-sm">{detail.item.unit}</td>
                <td className="border border-gray-300 px-4 py-2 text-right text-sm">{detail.qty}</td>
                <td className="border border-gray-300 px-4 py-2 text-right text-sm">Rp {detail.price.toLocaleString('id-ID')}</td>
                <td className="border border-gray-300 px-4 py-2 text-right text-sm">Rp {detail.subtotal.toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="space-y-2">
            <div className="flex justify-between text-sm border-b border-gray-300 pb-1">
              <span>Subtotal:</span>
              <span>Rp {invoice.total.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm border-b border-gray-300 pb-1">
              <span>Tax Amount:</span>
              <span>Rp {invoice.tax_amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2">
              <span>Total:</span>
              <span>Rp {invoice.total_after_tax.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Notes:</h4>
          <p className="text-sm text-gray-700">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-4">
        <div className="flex justify-between items-end">
          <div className="text-xs text-gray-600">
            <p>Generated on: {new Date().toLocaleDateString('id-ID')} {new Date().toLocaleTimeString('id-ID')}</p>
            <p>Status: {invoice.status.toUpperCase()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">Authorized Signature</p>
            <div className="mt-8 border-b border-gray-400 w-32 mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            font-size: 12px;
          }
          table {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}