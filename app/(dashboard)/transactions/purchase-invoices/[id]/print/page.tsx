'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { masterAPI, companyAPI } from '@/lib/api';

interface PIDetail {
  id: number;
  code: string;
  purchase_order: {
    id: number;
    code: string;
    supplier: {
      id: number;
      name: string;
      code: string;
      address: string;
      phone: string;
    };
  };
  date: string;
  due_date: string;
  subtotal: number;
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

export default function PurchaseInvoicePrintPage() {
  const params = useParams();
  const router = useRouter();
  const [pi, setPi] = useState<PIDetail | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchPIDetail();
      fetchCompanyData();
    }
  }, [params.id]);

  const fetchPIDetail = async () => {
    try {
      const result = await masterAPI.getPurchaseInvoiceById(params.id as string);
      if (!result || !result.success) throw new Error((result && result.message) || 'Failed to fetch PI detail');
      setPi(result.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load purchase invoice');
      router.push('/transactions/purchase-invoices');
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!pi) return null;

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area,
          #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Print Button (Hidden on Print) */}
      <div className="no-print fixed top-4 right-4 flex gap-2 z-10">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          ← Back
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🖨️ Print
        </button>
      </div>

      {/* Printable Area */}
      <div id="printable-area" className="max-w-4xl mx-auto p-8 bg-white">
        {/* Company Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{company?.name || 'PT. INVENT ACCT GO'}</h1>
          <p className="text-sm text-gray-600">{company?.address || 'Jl. Contoh No. 123, Jakarta'}</p>
          <p className="text-sm text-gray-600">
            Telp: {company?.phone || '(021) 12345678'} | Email: {company?.email || 'info@inventacctgo.com'}
          </p>
        </div>

        {/* Invoice Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">PURCHASE INVOICE</h2>
        </div>

        {/* PI Info and Supplier Info */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Left: PI Info */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-3">INVOICE INFORMATION</h2>
            <table className="text-sm">
              <tbody>
                <tr>
                  <td className="py-1 text-gray-600 w-24">Invoice No</td>
                  <td className="py-1">: <span className="font-semibold">{pi.code}</span></td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Date</td>
                  <td className="py-1">: {new Date(pi.date).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Due Date</td>
                  <td className="py-1">: {new Date(pi.due_date).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Status</td>
                  <td className="py-1">: <span className="font-semibold uppercase">{pi.status}</span></td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">PO Code</td>
                  <td className="py-1">: {pi.purchase_order.code}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right: Supplier Info */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-3">SUPPLIER</h2>
            <div className="text-sm">
              <p className="font-semibold text-gray-900">{pi.purchase_order.supplier.name}</p>
              <p className="text-gray-600 mt-1">{pi.purchase_order.supplier.code}</p>
              {pi.purchase_order.supplier.address && (
                <p className="text-gray-600 mt-1">{pi.purchase_order.supplier.address}</p>
              )}
              {pi.purchase_order.supplier.phone && (
                <p className="text-gray-600 mt-1">Phone: {pi.purchase_order.supplier.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-600 mb-3">INVOICE SUMMARY</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600">Subtotal</p>
              <p className="text-xl font-bold text-gray-900">Rp {(pi.subtotal || 0).toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600">Tax Amount</p>
              <p className="text-xl font-bold text-gray-900">Rp {(pi.tax_amount || 0).toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-blue-600">Total Amount</p>
              <p className="text-xl font-bold text-blue-900">Rp {(pi.total_after_tax || 0).toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {pi.notes && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">NOTES:</h3>
            <p className="text-sm text-gray-700">{pi.notes}</p>
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-16">Prepared By,</p>
            <div className="border-t border-gray-800 pt-2">
              <p className="text-sm font-semibold">(_________________)</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-16">Reviewed By,</p>
            <div className="border-t border-gray-800 pt-2">
              <p className="text-sm font-semibold">(_________________)</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-16">Approved By,</p>
            <div className="border-t border-gray-800 pt-2">
              <p className="text-sm font-semibold">(_________________)</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>This is a computer-generated document. No signature required.</p>
          <p className="mt-1">Printed on: {new Date().toLocaleString('id-ID')}</p>
        </div>
      </div>
    </>
  );
}
