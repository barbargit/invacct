'use client';

import { useState } from 'react';
import { masterAPI } from '@/lib/api';

export default function TestAPIPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testPOApproved = async () => {
    setLoading(true);
    try {
      const res = await masterAPI.getPurchaseOrders(1, 100, 'approved');
      setResult({
        endpoint: '/api/purchase-orders?status=approved',
        status: res?.status || (res?.success ? 200 : 500),
        data: res,
      });
    } catch (error: any) {
      setResult({
        endpoint: '/api/purchase-orders?status=approved',
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const testPOAll = async () => {
    setLoading(true);
    try {
      const res = await masterAPI.getPurchaseOrders();
      setResult({ endpoint: '/api/purchase-orders (all)', status: res?.status || (res?.success ? 200 : 500), data: res });
    } catch (error: any) {
      setResult({
        endpoint: '/api/purchase-orders (all)',
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const testSOApproved = async () => {
    setLoading(true);
    try {
      const res = await masterAPI.getSalesOrders(1, 100, 'approved');
      setResult({ endpoint: '/api/sales-orders?status=approved', status: res?.status || (res?.success ? 200 : 500), data: res });
    } catch (error: any) {
      setResult({
        endpoint: '/api/sales-orders?status=approved',
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const testSOAll = async () => {
    setLoading(true);
    try {
      const res = await masterAPI.getSalesOrders();
      setResult({ endpoint: '/api/sales-orders (all)', status: res?.status || (res?.success ? 200 : 500), data: res });
    } catch (error: any) {
      setResult({
        endpoint: '/api/sales-orders (all)',
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-semibold">Purchase Orders</h2>
        <div className="flex gap-4">
          <button
            onClick={testPOAll}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Test All POs
          </button>
          <button
            onClick={testPOApproved}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Approved POs Only
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-semibold">Sales Orders</h2>
        <div className="flex gap-4">
          <button
            onClick={testSOAll}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Test All SOs
          </button>
          <button
            onClick={testSOApproved}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Approved SOs Only
          </button>
        </div>
      </div>

      {loading && <p className="text-gray-600">Loading...</p>}

      {result && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h3 className="font-bold mb-2">Result:</h3>
          <p className="text-sm"><strong>Endpoint:</strong> {result.endpoint}</p>
          {result.status && <p className="text-sm"><strong>Status:</strong> {result.status}</p>}
          <pre className="mt-4 p-4 bg-white rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
