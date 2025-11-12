'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { masterAPI } from '@/lib/api';

interface SI {
  id: number;
  code: string;
  customer: {
    id: number;
    name: string;
  };
  total: number;
  tax_amount: number;
  total_after_tax: number;
  status: string;
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
}

interface SRItem {
  item_id: number;
  item_name: string;
  item_code: string;
  item_unit: string;
  available_qty: number;
  return_qty: number;
  price: number;
  subtotal: number;
  batch_no: string;
  serial_no: string;
  expiry_date: string;
  return_reason: string;
}

export default function CreateSRPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sis, setSIs] = useState<SI[]>([]);
  const [selectedSI, setSelectedSI] = useState<SI | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<SRItem[]>([]);

  useEffect(() => {
    fetchPaidSIs();
  }, []);

  const fetchPaidSIs = async () => {
    try {
      const result = await masterAPI.getSalesInvoices(1, 100, 'paid');
      setSIs(result.data?.data || result.data || []);
    } catch (error) {
      console.error('Error fetching SIs:', error);
      toast.error('Failed to load sales invoices');
    }
  };

  const handleSISelect = (siId: string) => {
    const si = sis.find(s => s.id === parseInt(siId));
    setSelectedSI(si || null);

    if (si) {
      const srItems: SRItem[] = si.details.map(detail => ({
        item_id: detail.item.id,
        item_name: detail.item.name,
        item_code: detail.item.code,
        item_unit: detail.item.unit,
        available_qty: detail.qty, // This would be actual stock, but for now using sold qty
        return_qty: 0,
        price: detail.price,
        subtotal: 0,
        batch_no: '',
        serial_no: '',
        expiry_date: '',
        return_reason: '',
      }));
      setItems(srItems);
    } else {
      setItems([]);
    }
  };

  const updateReturnQty = (index: number, qty: number) => {
    const newItems = [...items];
    newItems[index].return_qty = qty;
    newItems[index].subtotal = qty * newItems[index].price;
    setItems(newItems);
  };

  const updateItemField = (index: number, field: keyof SRItem, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSI) {
      toast.error('Please select a sales invoice');
      return;
    }

    if (items.length === 0) {
      toast.error('No items to return');
      return;
    }

    if (items.some(item => item.return_qty <= 0)) {
      toast.error('All return quantities must be greater than 0');
      return;
    }

    if (items.some(item => item.return_qty > item.available_qty)) {
      toast.error('Return quantity cannot exceed available quantity');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const payload = {
        invoice_id: selectedSI.id,
        date: date,
        reason: reason,
        notes: notes,
        details: items.filter(item => item.return_qty > 0).map(item => ({
          item_id: item.item_id,
          qty: item.return_qty,
          price: item.price,
          subtotal: item.subtotal,
          batch_no: item.batch_no,
          serial_no: item.serial_no,
          expiry_date: item.expiry_date || undefined,
          return_reason: item.return_reason,
        })),
      };

      const res = await masterAPI.createSalesReturn(payload);
      if (!(res && res.success)) {
        throw new Error(res?.message || 'Failed to create sales return');
      }

      toast.success('Sales return created successfully!');
      router.push('/transactions/sales-returns');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create sales return');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create Sales Return</h1>
        <p className="text-gray-600 mt-1">Create retur penjualan for customer</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sales Invoice <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSI?.id || ''}
                onChange={(e) => handleSISelect(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Sales Invoice</option>
                {sis.map(si => (
                  <option key={si.id} value={si.id}>
                    {si.code} - {si.customer.name} (Rp {si.total_after_tax?.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Only paid invoices are shown</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Reason for return..."
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes..."
            />
          </div>
        </div>

        {/* Items */}
        {selectedSI && items.length > 0 && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Return Items</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Available Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Return Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Reason</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.item_code}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.item_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">{item.item_unit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{item.available_qty}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <input
                          type="number"
                          value={item.return_qty}
                          onChange={(e) => updateReturnQty(index, parseFloat(e.target.value) || 0)}
                          min="0"
                          max={item.available_qty}
                          step="0.01"
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        Rp {item.price?.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        Rp {item.subtotal?.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={item.batch_no}
                          onChange={(e) => updateItemField(index, 'batch_no', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="Batch No"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={item.serial_no}
                          onChange={(e) => updateItemField(index, 'serial_no', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="Serial No"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="date"
                          value={item.expiry_date}
                          onChange={(e) => updateItemField(index, 'expiry_date', e.target.value)}
                          className="w-32 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={item.return_reason}
                          onChange={(e) => updateItemField(index, 'return_reason', e.target.value)}
                          className="w-32 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="Return reason"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !selectedSI || items.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Sales Return'}
          </button>
        </div>
      </form>
    </div>
  );
}