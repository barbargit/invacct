'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { accountingAPI } from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditCOAPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'asset',
    is_active: true,
  });

  const accountTypes = [
    { value: 'asset', label: 'Asset', description: 'Resources owned by the company' },
    { value: 'liability', label: 'Liability', description: 'Debts and obligations' },
    { value: 'equity', label: 'Equity', description: 'Owner\'s investment and retained earnings' },
    { value: 'revenue', label: 'Revenue', description: 'Income from operations' },
    { value: 'expense', label: 'Expense', description: 'Costs incurred in operations' },
  ];

  useEffect(() => {
    fetchAccount();
  }, [id]);

  const fetchAccount = async () => {
    try {
      const response = await accountingAPI.getCOAById(parseInt(id));

      if (response.success && response.data) {
        setFormData({
          code: response.data.code || '',
          name: response.data.name || '',
          type: response.data.type || 'asset',
          is_active: response.data.is_active !== false,
        });
      } else {
        toast.error('Failed to load account details');
        router.push('/accounting/coa');
      }
    } catch (error: any) {
      console.error('Fetch account error:', error);
      toast.error('Failed to load account details');
      router.push('/accounting/coa');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      toast.error('Account code is required');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Account name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await accountingAPI.updateCOA(parseInt(id), formData);

      if (response.success) {
        toast.success('Chart of account updated successfully!');
        router.push('/accounting/coa');
      } else {
        toast.error(response.message || 'Failed to update account');
      }
    } catch (error: any) {
      console.error('Update COA error:', error);
      toast.error(error.message || 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading account details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/accounting/coa"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Chart of Accounts
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">Edit Account</h1>
        <p className="text-gray-600 mt-1">Update account information</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Account Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 1-100, 2-200, 5-100"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use a unique code following your accounting structure
            </p>
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Cash, Accounts Receivable, Sales Revenue"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a descriptive name for the account
            </p>
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Account Type <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {accountTypes.map((type) => (
                <div key={type.value} className="flex items-start">
                  <input
                    type="radio"
                    id={type.value}
                    name="accountType"
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor={type.value} className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{type.label}</div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Active Account
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/accounting/coa"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Updating...' : 'Update Account'}
          </button>
        </div>
      </form>
    </div>
  );
}