'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { masterAPI } from '@/lib/api';

interface PO {
  id: number;
  code: string;
  supplier: {
    id: number;
    name: string;
  };
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
  }>;
}

interface GRNItem {
  item_id: number;
  item_name: string;
  item_code: string;
  item_unit: string;
  ordered_qty: number;
  received_qty: number;
}

export default function CreateGRNPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pos, setPOs] = useState<PO[]>([]);
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<GRNItem[]>([]);

  useEffect(() => {
    fetchApprovedPOs();
  }, []);

  const fetchApprovedPOs = async () => {
    try {
      const result = await masterAPI.getPurchaseOrders(1, 100, 'approved');
      setPOs(result.data?.data || result.data || []);
    } catch (error) {
      console.error('Error fetching POs:', error);
      toast.error('Failed to load purchase orders');
    }
  };

  const handlePOSelect = (poId: string) => {
    const po = pos.find(p => p.id === parseInt(poId));
    setSelectedPO(po || null);
    
    if (po) {
      const grnItems: GRNItem[] = po.details.map(detail => ({
        item_id: detail.item.id,
        item_name: detail.item.name,
        item_code: detail.item.code,
        item_unit: detail.item.unit,
        ordered_qty: detail.qty,
        received_qty: detail.qty, // Default to full quantity
      }));
      setItems(grnItems);
    } else {
      setItems([]);
    }
  };

  const updateReceivedQty = (index: number, qty: number) => {
    const newItems = [...items];
    newItems[index].received_qty = qty;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPO) {
      toast.error('Please select a purchase order');
      return;
    }

    if (items.length === 0) {
      toast.error('No items to receive');
      return;
    }

    if (items.some(item => item.received_qty <= 0)) {
      toast.error('All received quantities must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Format date to RFC3339 format (YYYY-MM-DDTHH:MM:SSZ)
      const formattedDate = new Date(date).toISOString();
      
      const payload = {
        po_id: selectedPO.id,
        date: formattedDate,
        notes: notes,
        details: items.map(item => ({
          item_id: item.item_id,
          qty: parseFloat(item.received_qty.toString()),
        })),
      };

      console.log('Sending payload:', JSON.stringify(payload, null, 2));

      const res = await masterAPI.createGoodsReceipt(payload);
      if (!(res && res.success)) {
        throw new Error(res?.message || 'Failed to create goods receipt');
      }

      toast.success('Goods receipt created successfully!');
      router.push('/transactions/goods-receipts');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create goods receipt');
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
        <h1 className="text-3xl font-bold text-gray-900">Create Goods Receipt</h1>
        <p className="text-gray-600 mt-1">Record received goods from supplier</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Order <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedPO?.id || ''}
                onChange={(e) => handlePOSelect(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Purchase Order</option>
                {pos.map(po => (
                  <option key={po.id} value={po.id}>
                    {po.code} - {po.supplier.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Only approved POs are shown</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Date <span className="text-red-500">*</span>
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
        {selectedPO && items.length > 0 && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Received Items</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ordered Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Received Qty</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.item_code}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.item_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">{item.item_unit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{item.ordered_qty}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <input
                          type="number"
                          value={item.received_qty}
                          onChange={(e) => updateReceivedQty(index, parseFloat(e.target.value) || 0)}
                          min="0"
                          max={item.ordered_qty}
                          step="0.01"
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500"
                          required
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
            disabled={loading || !selectedPO || items.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Goods Receipt'}
          </button>
        </div>
      </form>
    </div>
  );
}
