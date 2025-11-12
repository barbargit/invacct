'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import ToastContainer from '@/components/ui/ToastContainer';
import { useToast } from '@/hooks/useToast';
import { masterAPI, API_BASE_URL } from '@/lib/api';

interface Warehouse {
  id: number;
  name: string;
  location: string;
}

export default function WarehousesPage() {
  const { toasts, success, error: showError, removeToast } = useToast();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', location: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      // Use shared API helper so base URL respects NEXT_PUBLIC_API_URL
      const data = await masterAPI.getWarehouses(1, 100);

      if (data && data.success) {
        const warehousesData = Array.isArray(data.data) ? data.data : [];
        setWarehouses(warehousesData);
      } else {
        showError((data && data.message) || 'Failed to fetch warehouses');
      }
    } catch (err: any) {
      showError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) {
      return;
    }

    setDeleteId(id);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        success('Warehouse deleted successfully!');
        fetchWarehouses();
      } else {
        showError(data.message || 'Failed to delete warehouse');
      }
    } catch (err: any) {
      showError(err.message || 'An error occurred');
    } finally {
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const url = editingId 
        ? `${API_BASE_URL}/warehouses/${editingId}`
        : `${API_BASE_URL}/warehouses`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        success(editingId ? 'Warehouse updated successfully!' : 'Warehouse created successfully!');
        setShowModal(false);
        setFormData({ name: '', location: '' });
        setEditingId(null);
        fetchWarehouses();
      } else {
        showError(data.message || 'Failed to save warehouse');
      }
    } catch (err: any) {
      showError(err.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditingId(warehouse.id);
    setFormData({ name: warehouse.name, location: warehouse.location || '' });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ name: '', location: '' });
    setShowModal(true);
  };

  const filteredWarehouses = warehouses.filter(warehouse => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const name = warehouse.name?.toLowerCase() || '';
    const location = warehouse.location?.toLowerCase() || '';
    
    return name.includes(query) || location.includes(query);
  });

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Master Warehouses</h1>
            <p className="text-gray-600 mt-1">Manage your warehouses</p>
          </div>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Warehouse
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or location..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading warehouses...</p>
            </div>
          ) : filteredWarehouses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? 'No warehouses found matching your search' : 'No warehouses yet. Create your first warehouse!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Warehouse Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWarehouses.map((warehouse) => (
                    <tr key={warehouse.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{warehouse.name || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{warehouse.location || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(warehouse)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Warehouse"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(warehouse.id)}
                            disabled={deleteId === warehouse.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Warehouse"
                          >
                            {deleteId === warehouse.id ? (
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
        {!loading && filteredWarehouses.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredWarehouses.length} of {warehouses.length} warehouses
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Edit Warehouse' : 'Add New Warehouse'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: '', location: '' });
                    setEditingId(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
