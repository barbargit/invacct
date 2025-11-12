'use client';

import { useEffect, useState } from 'react';
import { companyAPI } from '@/lib/api';
import { CompanyForm } from './CompanyForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CompanyProfilePage() {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await companyAPI.getCompany();
      if (response.success) {
        setCompany(response.data);
      } else {
        setError(response.message || 'Failed to load company profile');
      }
    } catch (err: any) {
      console.error('Failed to fetch company:', err);
      setError('Failed to load company profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (updatedData: any) => {
    try {
      const response = await companyAPI.updateCompany(updatedData.id, updatedData);
      if (response.success) {
        setCompany(response.data);
        alert('✅ Company profile updated successfully!');
      } else {
        alert('❌ Error: ' + (response.message || 'Update failed'));
      }
    } catch (err: any) {
      console.error('Update failed:', err);
      alert('❌ Update failed: ' + (err.message || 'Unknown error'));
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Company Profile</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchCompany}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
        <p className="text-gray-600 mt-1">
          Manage your company information for invoices and financial reports
        </p>
      </div>

      {/* Company Form Card */}
      <div className="bg-white shadow-lg rounded-xl p-8">
        {company ? (
          <CompanyForm company={company} onSave={updateCompany} />
        ) : (
          <div className="text-center text-gray-500 py-8">
            No company profile found. Please contact administrator.
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-blue-900 font-semibold mb-2">ℹ️ Information</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• This information will be displayed on invoices and financial reports</li>
          <li>• NPWP (Tax ID) is required for tax reporting</li>
          <li>• Only Admin and Superadmin can update company profile</li>
          <li>• Logo image will be used in document headers</li>
        </ul>
      </div>
    </div>
  );
}
