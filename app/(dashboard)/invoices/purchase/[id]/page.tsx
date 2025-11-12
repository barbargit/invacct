'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { companyAPI } from '@/lib/api';
import { ArrowLeft, Printer, FileDown, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import CompanyHeader from '@/components/invoice/CompanyHeader';

interface InvoiceDetail {
  id: number;
  invoice_no: string;
  invoice_date: string;
  supplier_id: number;
  supplier_name?: string;
  supplier_address?: string;
  supplier_npwp?: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  tax_rate: number;
  total_amount: number;
  status: string;
  notes?: string;
  po_number?: string;
  details: InvoiceItem[];
}

interface InvoiceItem {
  id: number;
  item_code?: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
}

export default function PurchaseInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Purchase-Invoice-${invoice?.invoice_no}`,
  });

  const fetchInvoiceDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch invoice detail and company in parallel
      const [invoiceRes, companyRes] = await Promise.all([
        fetch(`http://localhost:8080/api/purchase-invoices/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        companyAPI.getCompany()
      ]);

      if (!invoiceRes.ok) {
        throw new Error('Failed to fetch invoice detail');
      }

      const invoiceData = await invoiceRes.json();
      setInvoice(invoiceData.data);

      if (companyRes.success) {
        setCompany(companyRes.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch invoice detail:', err);
      setError('Failed to load invoice detail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchInvoiceDetail();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold mb-2">Error</h2>
            <p className="text-red-600">{error || 'Invoice not found'}</p>
            <button
              onClick={() => router.push('/invoices/purchase')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Action Buttons */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={() => router.push('/invoices/purchase')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Invoice Content (Printable) */}
      <div ref={printRef} className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
        {/* Company Header */}
        {company && <CompanyHeader company={company} />}

        {/* Invoice Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">PURCHASE INVOICE</h2>
          <p className="text-lg font-semibold text-gray-700">{invoice.invoice_no}</p>
          {invoice.po_number && (
            <p className="text-sm text-gray-600">PO Reference: {invoice.po_number}</p>
          )}
        </div>

        {/* Invoice Info Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
          {/* Supplier Info */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">FROM:</h3>
            <p className="font-medium text-gray-900">{invoice.supplier_name || `Supplier #${invoice.supplier_id}`}</p>
            {invoice.supplier_npwp && (
              <p className="text-gray-600">NPWP: {invoice.supplier_npwp}</p>
            )}
            {invoice.supplier_address && (
              <p className="text-gray-600 mt-1">{invoice.supplier_address}</p>
            )}
          </div>

          {/* Invoice Details */}
          <div className="text-right">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Invoice Date:</span>
                <span className="text-gray-900">{format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Due Date:</span>
                <span className="text-gray-900">{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {invoice.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-y-2 border-gray-300">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Item Code</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Qty</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Unit Price</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Discount</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.details?.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3 px-4 text-sm text-gray-600">{item.item_code || '-'}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{item.item_name}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900">{item.quantity}</td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900">
                    Rp {item.unit_price.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-900">
                    {item.discount > 0 ? `Rp ${item.discount.toLocaleString('id-ID')}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">
                    Rp {item.subtotal.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-80 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium text-gray-900">
                Rp {invoice.subtotal.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Tax ({invoice.tax_rate || 11}%):</span>
              <span className="font-medium text-gray-900">
                Rp {invoice.tax_amount.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t-2 border-gray-300">
              <span className="text-lg font-bold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-gray-900">
                Rp {invoice.total_amount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Notes:</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 border-t border-gray-300 text-center text-sm text-gray-500">
          <p>This is a computer-generated invoice and is valid without signature.</p>
          <p className="mt-2">Please make payment before the due date to avoid late fees.</p>
        </div>
      </div>
    </div>
  );
}
