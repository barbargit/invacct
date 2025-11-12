'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { masterAPI } from '@/lib/api';

interface SODetail {
  id: number;
  code: string;
  customer: {
    id: number;
    name: string;
    code: string;
    address: string;
    phone: string;
  };
  warehouse: {
    id: number;
    name: string;
    code: string;
  };
  date: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  is_tax_inclusive: boolean;
  tax_rate: number;
  status: string;
  notes: string;
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
  created_at: string;
}

export default function SalesOrderPrintPage() {
  const params = useParams();
  const router = useRouter();
  const [so, setSo] = useState<SODetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSODetail();
  }, [params.id]);

  const fetchSODetail = async () => {
    try {
      const id = params.id as string;
      const result = await masterAPI.getSalesOrderById(parseInt(id));
      setSo(result.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load sales order');
      router.push('/transactions/sales-orders');
    } finally {
      setLoading(false);
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

  if (!so) return null;

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
        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">SALES ORDER</h1>
          <p className="text-sm text-gray-600 mt-1">Inventory & Accounting System</p>
        </div>

        {/* SO Info and Customer Info */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Left: SO Info */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-3">SO INFORMATION</h2>
            <table className="text-sm">
              <tbody>
                <tr>
                  <td className="py-1 text-gray-600 w-24">SO Number</td>
                  <td className="py-1">: <span className="font-semibold">{so.code}</span></td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Date</td>
                  <td className="py-1">: {new Date(so.date).toLocaleDateString('id-ID', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Status</td>
                  <td className="py-1">: <span className="font-semibold uppercase">{so.status}</span></td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Warehouse</td>
                  <td className="py-1">: {so.warehouse.name}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right: Customer Info */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-3">CUSTOMER</h2>
            <div className="text-sm">
              <p className="font-semibold text-gray-900">{so.customer.name}</p>
              <p className="text-gray-600 mt-1">{so.customer.code}</p>
              {so.customer.address && (
                <p className="text-gray-600 mt-1">{so.customer.address}</p>
              )}
              {so.customer.phone && (
                <p className="text-gray-600 mt-1">Phone: {so.customer.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">No</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Item Code</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Description</th>
                <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold">Unit</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold">Qty</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold">Unit Price</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {so.details?.map((detail, index) => (
                <tr key={detail.id}>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{index + 1}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{detail.item.code}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{detail.item.name}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm">{detail.item.unit}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-sm">{detail.qty}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-sm">
                    Rp {detail.price.toLocaleString('id-ID')}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-sm font-medium">
                    Rp {detail.subtotal.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-t border-gray-300">
                  <td className="py-2 text-gray-600">Subtotal:</td>
                  <td className="py-2 text-right font-medium">Rp {(so.subtotal || 0).toLocaleString('id-ID')}</td>
                </tr>
                {so.is_tax_inclusive && (
                  <tr className="border-t border-gray-300">
                    <td className="py-2 text-gray-600">PPN ({so.tax_rate}%):</td>
                    <td className="py-2 text-right font-medium">Rp {(so.tax_amount || 0).toLocaleString('id-ID')}</td>
                  </tr>
                )}
                <tr className="border-t-2 border-gray-800">
                  <td className="py-2 text-gray-900 font-bold">TOTAL:</td>
                  <td className="py-2 text-right text-lg font-bold">Rp {(so.total || 0).toLocaleString('id-ID')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {so.notes && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">NOTES:</h3>
            <p className="text-sm text-gray-700">{so.notes}</p>
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
