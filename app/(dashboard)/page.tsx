'use client';

import { Package, Warehouse, TrendingUp, TrendingDown, RotateCcw, Users, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { systemAPI } from '@/lib/api';

interface DashboardStats {
  today_sales: number;
  yesterday_sales: number;
  pending_delivery_orders: number;
  total_customer_outstanding: number;
  total_supplier_outstanding: number;
  cash_bank_balance: number;
  alerts: any[];
}

const summaryData = [
  {
    title: 'Total Barang',
    value: '8',
    icon: Package,
    color: 'bg-blue-500',
    change: '+2 bulan ini',
  },
  {
    title: 'Total Gudang',
    value: '4',
    icon: Warehouse,
    color: 'bg-green-500',
    change: 'Aktif semua',
  },
  {
    title: '📦 Barang Hampir Habis',
    value: '3',
    icon: Package,
    color: 'bg-orange-500',
    change: 'Min stock tercapai',
  },
  {
    title: '🏦 Total Kas & Bank',
    value: 'Rp 150.000.000',
    icon: Warehouse,
    color: 'bg-green-500',
    change: 'Saldo terkini',
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await systemAPI.getStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const dynamicSummaryData = [
    {
      title: 'Total Hutang Customer',
      value: loading ? '...' : formatCurrency(stats?.total_customer_outstanding || 0),
      icon: Users,
      color: 'bg-red-500',
      change: 'Outstanding balance',
    },
    {
      title: 'Total Hutang ke Supplier',
      value: loading ? '...' : formatCurrency(stats?.total_supplier_outstanding || 0),
      icon: Truck,
      color: 'bg-orange-500',
      change: 'Outstanding balance',
    },
    {
      title: 'Penjualan Hari Ini',
      value: loading ? '...' : formatCurrency(stats?.today_sales || 0),
      icon: TrendingUp,
      color: 'bg-green-500',
      change: 'Hari ini',
    },
    {
      title: '🏦 Total Kas & Bank',
      value: loading ? '...' : formatCurrency(stats?.cash_bank_balance || 0),
      icon: Warehouse,
      color: 'bg-blue-500',
      change: 'Saldo terkini',
    },
  ];

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dynamicSummaryData.map((item, index) => (
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
          <h3 className="text-lg font-semibold mb-4">Transaksi Terbaru</h3>
          <div className="space-y-3">
            {[
              { type: 'Purchase Order', no: 'PO004', date: '2025-10-28', status: 'Draft' },
              { type: 'Sales Return', no: 'SRT003', date: '2025-11-01', status: 'Disetujui' },
              { type: 'Purchase Return', no: 'PRT002', date: '2025-10-29', status: 'Menunggu' },
              { type: 'Sales Order', no: 'SO004', date: '2025-10-29', status: 'Draft' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.type}</p>
                  <p className="text-xs text-gray-500">{item.no} - {item.date}</p>
                </div>
                <span className={`status-badge ${
                  item.status === 'Disetujui' ? 'status-approved' :
                  item.status === 'Menunggu' ? 'status-pending' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold mb-4">⚠️ Peringatan Penting</h3>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <span className="text-red-600 mr-2">🚨</span>
                <div>
                  <p className="text-sm font-medium text-red-800">3 invoice jatuh tempo belum dibayar</p>
                  <p className="text-xs text-red-600">Total: Rp 42.000.000</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start">
                <span className="text-orange-600 mr-2">📦</span>
                <div>
                  <p className="text-sm font-medium text-orange-800">3 produk stok hampir habis</p>
                  <p className="text-xs text-orange-600">Perlu restock segera</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <span className="text-blue-600 mr-2">🚚</span>
                <div>
                  <p className="text-sm font-medium text-blue-800">2 delivery order menunggu</p>
                  <p className="text-xs text-blue-600">Siap untuk dikirim</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
