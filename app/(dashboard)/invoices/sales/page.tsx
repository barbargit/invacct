'use client';

import { useEffect, useState } from 'react';
import { companyAPI, masterAPI } from '@/lib/api';
import { Receipt, Plus, Search, Calendar, Users, DollarSign, Download, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface SalesInvoice {
  id: number;
  invoice_no: string;
  invoice_date: string;
  customer_id: number;
  customer_name?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  due_date: string;
  status: string;
  created_at: string;
}

export default function SalesInvoicePage() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch invoices from API via masterAPI
      const res = await masterAPI.getSalesInvoices();
      setInvoices(res.data?.data || res.data || []);

      // Fetch company info
      const companyRes = await companyAPI.getCompany();
      if (companyRes.success) {
        setCompany(companyRes.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch invoices:', err);
      setError('Failed to load sales invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const totalTax = filteredInvoices.reduce((sum, inv) => sum + (inv.tax_amount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Receipt className="w-8 h-8 mr-3 text-green-600" />
              Sales Invoices
            </h1>
            <p className="text-gray-600 mt-1">Manage customer invoices and payments</p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{filteredInvoices.length}</p>
            </div>
            <Receipt className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Total Revenue</p>
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
              <p className="text-sm text-blue-700">Total Tax</p>
              <p className="text-xl font-bold text-blue-900">
                Rp {totalTax.toLocaleString('id-ID')}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">Customers</p>
              <p className="text-2xl font-bold text-purple-900">
                {new Set(filteredInvoices.map(inv => inv.customer_id)).size}
              </p>
            </div>
            <Users className="w-10 h-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by invoice number or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchInvoices}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Invoices Table */}
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
                  Subtotal
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No sales invoices found. Create your first invoice to get started.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoice_no || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {invoice.customer_name || `Customer #${invoice.customer_id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {invoice.due_date ? format(new Date(invoice.due_date), 'MMM dd, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      Rp {(invoice.subtotal || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-medium">
                      Rp {(invoice.tax_amount || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                      Rp {(invoice.total_amount || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.status || 'draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/invoices/sales/${invoice.id}`}
                          className="text-green-600 hover:text-green-800"
                          title="View Invoice"
                        >
                          <Receipt className="w-4 h-4" />
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-800"
                          title="Export PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredInvoices.length > 0 && (
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-right text-sm text-gray-700">
                    Total:
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-gray-900">
                    Rp {filteredInvoices.reduce((sum, inv) => sum + (inv.subtotal || 0), 0).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-blue-600">
                    Rp {totalTax.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-gray-900 font-bold">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
