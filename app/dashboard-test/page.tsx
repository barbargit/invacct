'use client';

import { useEffect, useState } from 'react';

export default function DashboardTestPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('Token from localStorage:', storedToken);
    console.log('User from localStorage:', storedUser);
    
    setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">🎉 DASHBOARD TEST PAGE</h1>
        
        {token ? (
          <div className="space-y-6">
            <div className="bg-green-100 border-4 border-green-500 p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-green-800 mb-4">
                ✅ SUCCESS! You are logged in!
              </h2>
              <p className="text-lg">This means login worked perfectly!</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">User Info:</h3>
              {user && (
                <div className="space-y-2">
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Username:</strong> {user.username}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{user.role}</span></p>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-bold mb-4">Token (first 100 chars):</h3>
              <code className="block bg-gray-100 p-3 rounded text-xs break-all">
                {token.substring(0, 100)}...
              </code>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-lg hover:bg-blue-700"
              >
                Go to Real Dashboard
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                }}
                className="px-8 py-4 bg-red-600 text-white text-xl font-bold rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-red-100 border-4 border-red-500 p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-red-800 mb-4">
                ❌ NOT LOGGED IN
              </h2>
              <p className="text-lg">No token found. Please login first.</p>
            </div>

            <button
              onClick={() => window.location.href = '/login'}
              className="px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-lg hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
