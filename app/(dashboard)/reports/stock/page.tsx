'use client';

import { useEffect, useState } from 'react';
import { masterAPI, companyAPI } from '@/lib/api';
import { Package, Download, Building2, FileDown } from 'lucide-react';
import { generateStockReportExcel } from '@/lib/export/excelGenerator';

interface StockItem {
  id: number;
  code: string;
  name: string;
  category?: string;
  unit: string;
  current_stock: number;
  min_stock?: number;
  warehouse_name?: string;
  location?: string;
  purchase_price?: number;
  cost?: number;
}

export default function StockReportPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterWarehouse, filterCategory, lowStockOnly]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsRes, companyRes] = await Promise.all([
        masterAPI.getItems(1, 1000, true), // Get all active items
        companyAPI.getCompany()
      ]);

      if (itemsRes.success) {
        // Transform items to flatten category object to string and map fields
        let transformedItems = (itemsRes.data || []).map((item: any) => ({
          ...item,
          category: item.category?.name || '',
          current_stock: item.stock || 0,
          purchase_price: item.cost || 0,
        }));
        let filteredItems = transformedItems;

        // Apply filters
        if (filterWarehouse) {
          filteredItems = filteredItems.filter((item: any) => item.warehouse_name === filterWarehouse);
        }

        if (filterCategory) {
          filteredItems = filteredItems.filter((item: any) => item.category === filterCategory);
        }

        if (lowStockOnly) {
          filteredItems = filteredItems.filter((item: any) =>
            item.min_stock && item.current_stock <= item.min_stock
          );
        }

        setItems(filteredItems);
      } else {
        setError(itemsRes.message || 'Failed to load stock data');
      }

      if (companyRes.success) {
        setCompany(companyRes.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch stock data:', err);
      setError('Failed to load stock report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!company || items.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      await generateStockReportExcel(company, items, {
        warehouse: filterWarehouse,
        category: filterCategory,
        lowStockOnly
      });
    } catch (error) {
      console.error('Failed to generate Excel:', error);
      alert('Failed to generate Excel. Please try again.');
    }
  };

  // Get unique warehouses and categories for filters
  const warehouses = [...new Set(items.map(item => item.warehouse_name).filter(Boolean))];
  const categories = [...new Set(items.map(item => item.category).filter(Boolean))];

  const totalItems = items.length;
  const lowStockItems = items.filter(item => item.min_stock && item.current_stock <= item.min_stock).length;
  const outOfStockItems = items.filter(item => item.current_stock === 0).length;
  const totalValue = items.reduce((sum, item) => sum + (item.current_stock * (item.cost || 0)), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stock report...</p>
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
              <Package className="w-8 h-8 mr-3 text-blue-600" />
              Stock Report
            </h1>
            <p className="text-gray-600 mt-1">Current inventory status and stock levels</p>
          </div>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">{lowStockItems}</div>
          <div className="text-sm text-gray-600">Low Stock Items</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-orange-600">{outOfStockItems}</div>
          <div className="text-sm text-gray-600">Out of Stock</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">Rp {totalValue.toLocaleString('id-ID')}</div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
            <select
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Warehouses</option>
              {warehouses.map(warehouse => (
                <option key={warehouse} value={warehouse}>{warehouse}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Low Stock Only</span>
            </label>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterWarehouse('');
                setFilterCategory('');
                setLowStockOnly(false);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stock Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Warehouse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Stock
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    {filterWarehouse || filterCategory || lowStockOnly
                      ? 'No items found matching your filters'
                      : 'No items available'}
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isLowStock = item.min_stock && item.current_stock <= item.min_stock;
                  const isOutOfStock = item.current_stock === 0;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.category || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.warehouse_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {item.current_stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                        {item.min_stock || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isOutOfStock
                            ? 'bg-red-100 text-red-800'
                            : isLowStock
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}