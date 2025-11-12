'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { masterAPI } from '@/lib/api';

interface DODetail {
  id: number;
  code: string;
  sales_order: {
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
  };
  date: string;
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
  }>;
  created_at: string;
}

export default function DeliveryOrderPrintPage() {
  const params = useParams();
  const router = useRouter();
  const [do_detail, setDoDetail] = useState<DODetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDODetail();
  }, [params.id]);

  const fetchDODetail = async () => {
    try {
      const result = await masterAPI.getDeliveryOrderById(params.id as string);
      if (!result || !result.success) throw new Error((result && result.message) || 'Failed to fetch DO detail');
      setDoDetail(result.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load delivery order');
      router.push('/transactions/delivery-orders');
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

  if (!do_detail) return null;

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
          <h1 className="text-3xl font-bold text-gray-900">DELIVERY ORDER</h1>
          <p className="text-sm text-gray-600 mt-1">Surat Jalan - Inventory & Accounting System</p>
        </div>

        {/* DO Info and Customer Info */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          {/* Left: DO Info */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-3">DELIVERY INFORMATION</h2>
            <table className="text-sm">
              <tbody>
                <tr>
                  <td className="py-1 text-gray-600 w-32">DO Number</td>
                  <td className="py-1">: <span className="font-semibold">{do_detail.code}</span></td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Delivery Date</td>
                  <td className="py-1">: {new Date(do_detail.date).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Reference SO</td>
                  <td className="py-1">: <span className="font-semibold">{do_detail.sales_order.code}</span></td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Status</td>
                  <td className="py-1">: <span className="font-semibold uppercase">{do_detail.status}</span></td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Warehouse</td>
                  <td className="py-1">: {do_detail.sales_order.warehouse.name}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right: Customer Info */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-3">CUSTOMER</h2>
            <div className="text-sm">
              <p className="font-semibold text-gray-900">{do_detail.sales_order.customer.name}</p>
              <p className="text-gray-600 mt-1">{do_detail.sales_order.customer.code}</p>
              {do_detail.sales_order.customer.address && (
                <p className="text-gray-600 mt-1">{do_detail.sales_order.customer.address}</p>
              )}
              {do_detail.sales_order.customer.phone && (
                <p className="text-gray-600 mt-1">Phone: {do_detail.sales_order.customer.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-600 mb-3">DELIVERED ITEMS</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">No</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Item Code</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold">Description</th>
                <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold">Unit</th>
                <th className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold">Qty Delivered</th>
              </tr>
            </thead>
            <tbody>
              {do_detail.details?.map((detail, index) => (
                <tr key={detail.id}>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{index + 1}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{detail.item.code}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{detail.item.name}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center text-sm">{detail.item.unit}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right text-sm font-medium">{detail.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {do_detail.notes && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">NOTES:</h3>
            <p className="text-sm text-gray-700">{do_detail.notes}</p>
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-16">Delivered By,</p>
            <div className="border-t border-gray-800 pt-2">
              <p className="text-sm font-semibold">(_________________)</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-16">Received By,</p>
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
