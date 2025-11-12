'use client';

import { useEffect, useState } from 'react';
import { Package, Warehouse, TrendingUp, TrendingDown, RotateCcw, AlertTriangle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { systemAPI, masterAPI } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchStats();
  }, []);

  const summaryData = [
    {
      title: 'Total Penjualan Hari Ini',
      value: `Rp ${(stats?.today_sales || 0).toLocaleString('id-ID')}`,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: 'Penjualan hari ini',
    },
    {
      title: 'DO Akan Dikirim',
      value: stats?.pending_delivery_orders || '0',
      icon: Package,
      color: 'bg-blue-500',
      change: 'Delivery order pending',
    },
    {
      title: 'Jatuh Tempo Vendor',
      value: stats?.overdue_accounts_payable || '0',
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: 'AP overdue',
    },
    {
      title: 'Jatuh Tempo Customer',
      value: stats?.overdue_accounts_receivable || '0',
      icon: DollarSign,
      color: 'bg-orange-500',
      change: 'AR overdue',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryData.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{item.title}</p>
                <h3 className="text-3xl font-bold text-gray-800">{item.value}</h3>
                <p className="text-xs text-gray-500 mt-2">{item.change}</p>
              </div>
              <div className={`${item.color} p-3 rounded-lg`}>
                <item.icon size={24} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Backend API</span>
              <span className="status-badge status-approved">Connected</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Database</span>
              <span className="status-badge status-approved">PostgreSQL 18</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Authentication</span>
              <span className="status-badge status-approved">JWT Active</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Purchase Invoices</span>
              <span className="text-sm font-semibold text-gray-800">{stats?.purchase_invoices || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Sales Invoices</span>
              <span className="text-sm font-semibold text-gray-800">{stats?.sales_invoices || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Total Items</span>
              <span className="text-sm font-semibold text-gray-800">{stats?.items || 0}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
