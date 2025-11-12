'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authAPI, userAPI } from '@/lib/api';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Users,
  UserCircle,
  ShoppingCart,
  RotateCcw,
  ArrowLeftRight,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronRight,
  LogOut,
  Settings,
  Calculator,
  FileText,
  Receipt
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface MenuItem {
  title: string;
  icon: any;
  href?: string;
  submenu?: { title: string; href: string; permission?: string }[];
  permission?: string;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    title: 'Master Data',
    icon: Package,
    submenu: [
      { title: 'Barang', href: '/master/items', permission: 'items:read' },
      { title: 'Kategori Barang', href: '/master/item-categories', permission: 'item-categories:read' },
      { title: 'Gudang', href: '/master/warehouses', permission: 'warehouses:read' },
      { title: 'Supplier', href: '/master/suppliers', permission: 'suppliers:read' },
      { title: 'Customer', href: '/master/customers', permission: 'customers:read' },
      { title: 'Payment Terms', href: '/master/payment-terms', permission: 'payment-terms:read' },
    ],
  },
  {
    title: 'Transactions',
    icon: ArrowLeftRight,
    submenu: [
      { title: 'Purchase Orders', href: '/transactions/purchase-orders', permission: 'purchase-orders:read' },
      { title: 'Goods Receipts', href: '/transactions/goods-receipts', permission: 'goods-receipts:read' },
      { title: 'Purchase Invoices', href: '/transactions/purchase-invoices', permission: 'purchase-invoices:read' },
      { title: 'Purchase Returns', href: '/transactions/purchase-returns', permission: 'purchase-returns:read' },
      { title: 'Sales Orders', href: '/transactions/sales-orders', permission: 'sales-orders:read' },
      { title: 'Delivery Orders', href: '/transactions/delivery-orders', permission: 'delivery-orders:read' },
      { title: 'Sales Invoices', href: '/transactions/sales-invoices', permission: 'sales-invoices:read' },
      { title: 'Sales Returns', href: '/transactions/sales-returns', permission: 'sales-returns:read' },
    ],
  },
  {
    title: 'Laporan',
    icon: BarChart3,
    submenu: [
      { title: 'Stok Barang', href: '/reports/stock', permission: 'reports:read' },
      { title: 'Penjualan', href: '/reports/sales', permission: 'reports:read' },
      { title: 'Pembelian', href: '/reports/purchases', permission: 'reports:read' },
      { title: 'Retur', href: '/reports/returns', permission: 'reports:read' },
    ],
  },
  {
    title: 'Accounting',
    icon: Calculator,
    submenu: [
      { title: 'Chart of Accounts', href: '/accounting/coa', permission: 'accounting:read' },
      { title: 'Journal Entries', href: '/accounting/journal', permission: 'journals:read' },
      { title: 'Accounts Receivable', href: '/accounting/ar', permission: 'accounting:read' },
      { title: 'Accounts Payable', href: '/accounting/ap', permission: 'accounting:read' },
      { title: 'PPN Masukan', href: '/accounting/tax/input', permission: 'accounting:read' },
      { title: 'PPN Keluaran', href: '/accounting/tax/output', permission: 'accounting:read' },
      { title: 'Balance Sheet', href: '/accounting/reports/balance-sheet', permission: 'reports:read' },
      { title: 'Profit & Loss', href: '/accounting/reports/profit-loss', permission: 'reports:read' },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    submenu: [
      { title: 'Company Profile', href: '/settings/company', permission: 'company:read' },
      { title: 'Users', href: '/settings/users', permission: 'users:read' },
      { title: 'Roles & Permissions', href: '/settings/roles', permission: 'roles:read' },
      { title: 'System', href: '/settings/system', permission: 'system:read' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Master Data', 'Transactions', 'Laporan', 'Accounting', 'Settings']);

  useEffect(() => {
    const currentUser = authAPI.getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      fetchUserMenu();
    }
  }, []);

  const fetchUserMenu = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUserMenu();
      if (response.success) {
        setMenuItems(response.data || []);
        console.log('Loaded user menu:', response.data);
      } else {
        console.error('API returned error:', response);
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch user menu:', error);
      // Fallback to empty menu
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    router.push('/login');
  };

  const toggleExpand = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title) ? prev.filter(item => item !== title) : [...prev, title]
    );
  };

  const isActive = (href: string) => pathname === href;

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      LayoutDashboard,
      Package,
      Warehouse,
      Users,
      UserCircle,
      ShoppingCart,
      RotateCcw,
      ArrowLeftRight,
      TrendingUp,
      BarChart3,
      Settings,
      Calculator,
      FileText,
      Receipt
    };
    const IconComponent = icons[iconName];
    return IconComponent ? <IconComponent size={20} /> : <LayoutDashboard size={20} />;
  };

  // Get user role for display purposes
  let userRole = '';
  if (user) {
    userRole = user.role;
    if (!userRole && user.Role) {
      userRole = user.Role.role_name || user.Role.name;
    }
    if (!userRole && user.role_name) {
      userRole = user.role_name;
    }

    // Do not infer role from username. Role must come from the user object (token / backend).
  }

  return (
    <aside className="sidebar w-64 min-h-screen bg-white shadow-md p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-primary-700">Inventory System</h1>
        <p className="text-xs text-gray-500">Management Dashboard</p>
      </div>

      <nav className="space-y-1">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-xs text-gray-500 mt-2">Loading menu...</p>
          </div>
        ) : (
          menuItems.map((item: any) => (
            <div key={item.title}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`sidebar-item ${isActive(item.href) ? 'active' : ''}`}
                >
                  <span className="text-lg mr-3">{getIcon(item.icon)}</span>
                  <span>{item.title}</span>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleExpand(item.title)}
                    className="w-full sidebar-item"
                  >
                    <span className="text-lg mr-3">{getIcon(item.icon)}</span>
                    <span className="flex-1 text-left">{item.title}</span>
                    {expandedItems.includes(item.title) ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                  {expandedItems.includes(item.title) && item.submenu && (
                    <div className="sidebar-submenu">
                      {item.submenu.map((subitem: any) => (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className={`sidebar-item ${isActive(subitem.href) ? 'active' : ''}`}
                        >
                          <span>{subitem.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </nav>
      
      <div className="mt-auto pt-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
