'use client';

import { useState } from 'react';

export default function SimpleLoginPage() {
  const [status, setStatus] = useState('Ready');
  const [response, setResponse] = useState<any>(null);

  const handleLogin = async () => {
    setStatus('Logging in...');
    setResponse(null);

    try {
      console.log('=== START LOGIN ===');
      
      const url = 'http://localhost:8080/api/auth/login';
      console.log('URL:', url);
      
      const body = {
        username: 'admin',
        password: 'admin123'
      };
      console.log('Body:', body);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('Response received');
      console.log('Status:', response.status);
      console.log('OK:', response.ok);

      const data = await response.json();
      console.log('Data:', data);

      setResponse(data);

      if (data.success && data.data && data.data.token) {
        setStatus('SUCCESS! Token received');
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        console.log('Token saved to localStorage');
        console.log('Redirecting to dashboard...');
        
        // Wait 1 second then redirect
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        setStatus('Login failed: ' + (data.message || 'Unknown error'));
      }

    } catch (error: any) {
      console.error('ERROR:', error);
      setStatus('Error: ' + error.message);
      setResponse({ error: error.message });
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Simple Login Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-100 rounded">
            <h3 className="font-bold mb-2">Status:</h3>
            <p className="text-lg">{status}</p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full px-6 py-4 bg-blue-600 text-white text-xl font-bold rounded-lg hover:bg-blue-700"
          >
            LOGIN (admin/admin123)
          </button>

          {response && (
            <div className="p-4 bg-green-100 rounded">
              <h3 className="font-bold mb-2">Response:</h3>
              <pre className="text-xs overflow-auto bg-white p-2 rounded">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}

          <div className="p-4 bg-yellow-50 rounded border-2 border-yellow-400">
            <h3 className="font-bold mb-2 text-yellow-800">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li className="font-bold">BUKA CONSOLE DULU! (Tekan F12, pilih tab "Console")</li>
              <li>Click button "LOGIN" di atas</li>
              <li>Lihat status berubah di kotak biru</li>
              <li>Lihat response di kotak hijau</li>
              <li>Lihat console logs (F12)</li>
              <li>Kalau success, akan auto-redirect ke /dashboard dalam 1 detik</li>
            </ol>
          </div>

          <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-bold mb-2">Console Check:</h3>
            <p className="text-sm mb-2">After clicking login, you should see these logs in console (F12):</p>
            <ul className="text-xs space-y-1 font-mono bg-black text-green-400 p-2 rounded">
              <li>=== START LOGIN ===</li>
              <li>URL: http://localhost:8080/api/auth/login</li>
              <li>Body: {'{username: "admin", password: "admin123"}'}</li>
              <li>Response received</li>
              <li>Status: 200</li>
              <li>OK: true</li>
              <li>Data: {'{success: true, ...}'}</li>
              <li>Token saved to localStorage</li>
              <li>Redirecting to dashboard...</li>
            </ul>
          </div>

          <div className="p-4 bg-red-50 rounded border-2 border-red-400">
            <h3 className="font-bold mb-2 text-red-800">Troubleshooting:</h3>
            <ul className="text-sm space-y-1">
              <li>❌ <strong>Tidak ada yang terjadi?</strong> → Check console (F12) for errors</li>
              <li>❌ <strong>Status stuck "Logging in..."?</strong> → Network error, check backend</li>
              <li>❌ <strong>Response shows error?</strong> → Read error message</li>
              <li>✅ <strong>Status shows "SUCCESS!"?</strong> → Wait 1 second for redirect</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
