'use client';

import { useState, useEffect } from 'react';
import { masterAPI, API_BASE_URL } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X, Search } from 'lucide-react';
import ToastContainer from '@/components/ui/ToastContainer';
import { useToast } from '@/hooks/useToast';

interface Supplier {
  id: number;
  name: string;
}

interface Warehouse {
  id: number;
  name: string;
}

interface Item {
  id: number;
  code: string;
  name: string;
  unit: string;
  price: number;
  cost: number;
}

interface POItem {
  item_id: number;
  item_name: string;
  item_code: string;
  unit: string;
  qty: number;
  price: number;
  subtotal: number;
}

interface Tax {
  id: number;
  name: string;
  rate: number;
}

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const { toasts, success, error: showError, removeToast } = useToast();
  
  const [formData, setFormData] = useState({
    supplier_id: 0,
    warehouse_id: 0,
    date: new Date().toISOString().split('T')[0],
    is_tax_inclusive: true,
    notes: ''
  });
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [activeTax, setActiveTax] = useState<Tax | null>(null);
  const [poItems, setPOItems] = useState<POItem[]>([]);
  
  const [showItemSearch, setShowItemSearch] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (itemSearchQuery.length >= 2) {
      const filtered = items.filter(item => 
        item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(itemSearchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
  }, [itemSearchQuery, items]);

  const fetchMasterData = async () => {
    const token = localStorage.getItem('token');
    
    try {
      // Fetch suppliers, warehouses, items and active tax using API helpers
      const suppliersData = await masterAPI.getSuppliers(1, 100);
      if (suppliersData && suppliersData.success) {
        setSuppliers(Array.isArray(suppliersData.data) ? suppliersData.data : []);
      }

      const warehousesData = await masterAPI.getWarehouses(1, 100);
      if (warehousesData && warehousesData.success) {
        setWarehouses(Array.isArray(warehousesData.data) ? warehousesData.data : []);
      }

      const itemsData = await masterAPI.getItems(1, 1000, false);
      if (itemsData && itemsData.success) {
        setItems(Array.isArray(itemsData.data) ? itemsData.data : []);
      }

      const taxData = await masterAPI.getActiveTax(formData.date);
      if (taxData && taxData.success && taxData.data) {
        setActiveTax(taxData.data);
      }
    } catch (err: any) {
      showError('Failed to load master data: ' + err.message);
    }
  };

  const handleAddItem = (item: Item) => {
    const existing = poItems.find(i => i.item_id === item.id);
    if (existing) {
      showError('Item already added');
      return;
    }

    const newItem: POItem = {
      item_id: item.id,
      item_name: item.name,
      item_code: item.code,
      unit: item.unit,
      qty: 1,
      price: item.cost || 0,
      subtotal: item.cost || 0
    };

    setPOItems([...poItems, newItem]);
    setItemSearchQuery('');
    setShowItemSearch(false);
  };

  const handleUpdateItem = (index: number, field: 'qty' | 'price', value: number) => {
    const updated = [...poItems];
    updated[index][field] = value;
    updated[index].subtotal = updated[index].qty * updated[index].price;
    setPOItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setPOItems(poItems.filter((_, i) => i !== index));
  };

  // Calculate totals
  const subtotal = poItems.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = formData.is_tax_inclusive && activeTax 
    ? (subtotal * activeTax.rate) / 100 
    : 0;
  const total = subtotal + taxAmount;

  const handleSubmit = async (status: 'draft' | 'submitted') => {
    // Validation
    if (formData.supplier_id === 0) {
      showError('Please select a supplier');
      return;
    }
    if (formData.warehouse_id === 0) {
      showError('Please select a warehouse');
      return;
    }
    if (poItems.length === 0) {
      showError('Please add at least one item');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        supplier_id: formData.supplier_id,
        warehouse_id: formData.warehouse_id,
        date: new Date(formData.date).toISOString(),
        is_tax_inclusive: formData.is_tax_inclusive,
        tax_id: formData.is_tax_inclusive && activeTax ? activeTax.id : null,
        notes: formData.notes,
        status: status,
        details: poItems.map(item => ({
          item_id: item.item_id,
          qty: item.qty,
          price: item.price,
          subtotal: item.subtotal
        }))
      };

      const data = await masterAPI.createPurchaseOrder(payload);

      if (data && data.success) {
        success(`Purchase order ${status === 'draft' ? 'saved as draft' : 'submitted'} successfully!`);
        setTimeout(() => {
          router.push('/transactions/purchase-orders');
        }, 1500);
      } else {
        showError((data && data.message) || 'Failed to create purchase order');
      }
    } catch (err: any) {
      showError(err.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Purchase Order</h1>
          <p className="text-gray-600 mt-1">Create a new purchase order from supplier</p>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier *
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({...formData, supplier_id: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value={0}>Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warehouse *
              </label>
              <select
                value={formData.warehouse_id}
                onChange={(e) => setFormData({...formData, warehouse_id: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value={0}>Select Warehouse</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Items</h2>
            <button
              onClick={() => setShowItemSearch(!showItemSearch)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {/* Item Search Box */}
          {showItemSearch && (
            <div className="mb-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={itemSearchQuery}
                  onChange={(e) => setItemSearchQuery(e.target.value)}
                  placeholder="Search item by name or code... (min 2 characters)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setShowItemSearch(false);
                    setItemSearchQuery('');
                  }}
                  className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Results */}
              {itemSearchQuery.length >= 2 && (
                <div className="max-h-60 overflow-y-auto bg-white rounded-lg border">
                  {filteredItems.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No items found
                    </div>
                  ) : (
                    filteredItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleAddItem(item)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            Code: {item.code} | Unit: {item.unit}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Rp {item.cost.toLocaleString('id-ID')}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Items Table */}
          {poItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
              No items added yet. Click "Add Item" to start.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {poItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{item.item_name}</div>
                        <div className="text-xs text-gray-500">{item.item_code}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.unit}</td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleUpdateItem(index, 'qty', Number(e.target.value))}
                          min="1"
                          step="1"
                          className="w-24 px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleUpdateItem(index, 'price', Number(e.target.value))}
                          min="0"
                          step="100"
                          className="w-32 px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        Rp {item.subtotal.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            
            {/* PPN Checkbox */}
            <div className="flex justify-between items-center border-t pt-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_tax_inclusive}
                  onChange={(e) => setFormData({...formData, is_tax_inclusive: e.target.checked})}
                  className="mr-3 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-900">
                  Include PPN {activeTax && `(${activeTax.rate}%)`}
                </span>
              </label>
              
              {formData.is_tax_inclusive && activeTax && (
                <span className="font-medium text-blue-600">
                  Rp {taxAmount.toLocaleString('id-ID')}
                </span>
              )}
            </div>
            
            <div className="flex justify-between text-xl font-bold border-t-2 pt-3">
              <span>TOTAL:</span>
              <span className="text-blue-600">
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Notes</h2>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Add any additional notes or remarks..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit('draft')}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            disabled={saving || poItems.length === 0}
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            onClick={() => handleSubmit('submitted')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={saving || poItems.length === 0}
          >
            {saving ? 'Submitting...' : 'Submit PO'}
          </button>
        </div>
      </div>
    </>
  );
}
