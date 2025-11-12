'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      console.log('Dashboard layout: checking auth...');
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (!token) {
        console.log('No token, redirecting to login');
        router.push('/login');
        return;
      }

      console.log('Token found, showing dashboard');
      setIsAuthenticated(true);
      setLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Sidebar />
      <main className="main-content flex-1">
        {children}
      </main>
    </div>
  );
}
