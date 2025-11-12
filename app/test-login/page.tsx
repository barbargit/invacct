'use client';

import { useState } from 'react';
import { authAPI } from '@/lib/api';

export default function TestLoginPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('Testing login...');
      
      const data = await authAPI.login('admin', 'admin123');
      setResult(data);
      if (data && data.success) {
        alert('Login berhasil!');
      } else {
        setError('Login gagal: ' + (data?.message || 'unknown'));
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const testHealth = async () => {
    try {
      const response = await fetch('http://localhost:8080/health');
      const data = await response.json();
      console.log('Health check:', data);
      alert('Backend is running! Status: ' + data.status);
    } catch (err: any) {
      alert('Backend connection failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Test Login Page</h1>
      
      <div className="space-y-4 max-w-2xl">
        <div>
          <button
            onClick={testHealth}
            className="px-4 py-2 bg-green-600 text-white rounded mr-2"
          >
            Test Backend Health
          </button>
          
          <button
            onClick={testLogin}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Login (admin/admin123)'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-100 border border-green-400 rounded">
            <h3 className="font-bold mb-2">Result:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Open browser console (F12)</li>
            <li>Click "Test Backend Health" to check if backend is running</li>
            <li>Click "Test Login" to test login API</li>
            <li>Check console logs for details</li>
          </ol>
        </div>

        <div className="p-4 bg-blue-50 rounded">
          <h3 className="font-bold mb-2">Backend Info:</h3>
          <ul className="text-sm space-y-1">
            <li><strong>API URL:</strong> http://localhost:8080/api</li>
            <li><strong>Health:</strong> http://localhost:8080/health</li>
            <li><strong>Login:</strong> http://localhost:8080/api/auth/login</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
