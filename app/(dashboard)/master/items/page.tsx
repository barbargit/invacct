'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Link from 'next/link';
import ToastContainer from '@/components/ui/ToastContainer';
import { useToast } from '@/hooks/useToast';
import { masterAPI, API_BASE_URL } from '@/lib/api';

interface Item {
  id: number;
  code: string;
  name: string;
  category_id: number | null;
  category: {
    id: number;
    code: string;
    name: string;
  } | null;
  unit: string;
  stock: number;
  cost: number;
  price: number;
  is_vat_applicable: boolean;
  image?: string;
}

export default function ItemsPage() {
  const router = useRouter();
  const { toasts, success, error: showError, removeToast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      // Use shared API helper so the base URL respects NEXT_PUBLIC_API_URL
      const data = await masterAPI.getItems(1, 100, false);
      console.log('Fetched items data (via masterAPI):', data);

      if (data && data.success) {
        const itemsData = Array.isArray(data.data) ? data.data : [];
        console.log('Items with categories:', itemsData);
        setItems(itemsData);
      } else {
        showError((data && data.message) || 'Failed to fetch items');
      }
    } catch (err: any) {
      showError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setDeleteId(id);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        success('Item deleted successfully!');
        fetchItems(); // Refresh list
      } else {
        showError(data.message || 'Failed to delete item');
      }
    } catch (err: any) {
      showError(err.message || 'An error occurred');
    } finally {
      setDeleteId(null);
    }
  };

  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const code = item.code?.toLowerCase() || '';
    const name = item.name?.toLowerCase() || '';
    const category = item.category?.name?.toLowerCase() || '';

    return code.includes(query) || name.includes(query) || category.includes(query);
  });

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Master Items</h1>
            <p className="text-gray-600 mt-1">Manage your inventory items</p>
          </div>
          <Link
            href="/master/items/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Item
          </Link>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code, name, or category..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? 'No items found matching your search' : 'No items yet. Create your first item!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name || 'Item'}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-400">No Image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{item.code || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{item.name || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {item.category ? `${item.category.name} (${item.category.code})` : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{item.unit || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-sm font-medium ${
                          (item.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.stock || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm text-gray-900">
                          Rp {(item.price || 0).toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/master/items/${item.id}/edit`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Item"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteId === item.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Item"
                          >
                            {deleteId === item.id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {!loading && filteredItems.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredItems.length} of {items.length} items
          </div>
        )}
      </div>
    </>
  );
}
