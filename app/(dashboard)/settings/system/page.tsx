'use client';

import { useEffect, useState } from 'react';
import { systemAPI } from '@/lib/api';
import { Database, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SystemSettingsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await systemAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleResetData = async () => {
    setResetLoading(true);
    try {
      const response = await systemAPI.resetData();
      if (response.success) {
        toast.success('All transaction data has been reset successfully!');
        setShowResetConfirm(false);
        // Refresh stats after reset
        await fetchStats();
      } else {
        toast.error(response.message || 'Failed to reset data');
      }
    } catch (error: any) {
      console.error('Reset data error:', error);
      toast.error(error.message || 'Failed to reset data');
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading system statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Database className="w-8 h-8 mr-3 text-blue-600" />
          System Settings
        </h1>
        <p className="text-gray-600 mt-1">System management and data reset</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                Rp {(stats?.today_sales || 0).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <RefreshCw className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending DO</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.pending_delivery_orders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue AP</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.overdue_accounts_payable || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue AR</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.overdue_accounts_receivable || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Reset Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Trash2 className="w-6 h-6 mr-2 text-red-600" />
              Reset Transaction Data
            </h2>
            <p className="text-gray-600 mt-1">
              Reset all transaction-related data while preserving master data (items, customers, suppliers, warehouses, etc.)
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
              <p className="text-sm text-yellow-700 mt-1">
                This action will permanently delete all transaction data including:
              </p>
              <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside space-y-1">
                <li>Purchase Orders & Sales Orders</li>
                <li>Goods Receipts & Delivery Orders</li>
                <li>Purchase Invoices & Sales Invoices</li>
                <li>Journal Entries & Payments</li>
                <li>Accounts Receivable & Accounts Payable</li>
                <li>All transaction history</li>
              </ul>
              <p className="text-sm text-yellow-700 mt-2">
                <strong>Master data (items, customers, suppliers, chart of accounts, etc.) will be preserved.</strong>
              </p>
            </div>
          </div>
        </div>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Reset All Transaction Data
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">
                Are you sure you want to reset all transaction data?
              </p>
              <p className="text-red-700 text-sm mt-1">
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleResetData}
                disabled={resetLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {resetLoading ? 'Resetting...' : 'Confirm Reset'}
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                disabled={resetLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}