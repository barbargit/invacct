'use client';

import { useEffect, useState } from 'react';

export default function ManualDashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    setToken(storedToken);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Manual Dashboard Access</h1>
        
        <div className="space-y-4">
          {token ? (
            <div className="bg-green-100 border border-green-400 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-green-800 mb-4">✅ You are logged in!</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">User Info:</h3>
                  <pre className="bg-white p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>

                <div>
                  <h3 className="font-bold mb-2">Token:</h3>
                  <div className="bg-white p-3 rounded text-xs break-all">
                    {token.substring(0, 50)}...
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
                  >
                    Go to Dashboard
                  </button>

                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.location.href = '/login';
                    }}
                    className="w-full px-6 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-100 border border-red-400 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-red-800 mb-4">❌ Not logged in</h2>
              <p className="mb-4">No token found in localStorage</p>
              
              <button
                onClick={() => window.location.href = '/login'}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
              >
                Go to Login
              </button>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-400 p-6 rounded-lg">
            <h3 className="font-bold mb-2">Quick Debug:</h3>
            <div className="space-y-2 text-sm">
              <p>✅ If you see green box above: Login worked, token saved</p>
              <p>❌ If you see red box: Login didn't save token, try again</p>
              <p>📝 After login, come to this page to verify: <code className="bg-white px-2 py-1 rounded">/manual-dashboard</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
