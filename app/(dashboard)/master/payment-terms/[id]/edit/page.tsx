'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { masterAPI } from '@/lib/api';

interface PaymentTerm {
  id: number;
  name: string;
  days: number;
  description: string;
  is_active: boolean;
}

export default function EditPaymentTermPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    days: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    fetchPaymentTerm();
  }, []);

  const fetchPaymentTerm = async () => {
    try {
      const id = Number(params.id);
      const result = await masterAPI.getPaymentTermById(id);
      const term = result.data;

      setFormData({
        name: term.name,
        days: term.days.toString(),
        description: term.description || '',
        is_active: term.is_active,
      });
    } catch (error) {
      console.error('Error fetching payment term:', error);
      toast.error('Failed to load payment term');
      router.push('/master/payment-terms');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!formData.days || parseInt(formData.days) < 0) {
      toast.error('Days must be a positive number');
      return;
    }

    setLoading(true);
    try {
      const id = Number(params.id);

      const payload: any = {
        name: formData.name.trim(),
        days: parseInt(formData.days),
        is_active: formData.is_active,
      };

      // Only include description if it's not empty
      if (formData.description.trim()) {
        payload.description = formData.description.trim();
      }

      await masterAPI.updatePaymentTerm(id, payload);

      toast.success('Payment term updated successfully!');
      router.push('/master/payment-terms');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update payment term');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-2"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Payment Term</h1>
        <p className="text-gray-600 mt-1">Update payment term details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Net 30, Cash on Delivery"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="days"
                value={formData.days}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 30"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Number of days to add to invoice date for due date</p>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional description..."
            />
          </div>

          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Payment Term'}
          </button>
        </div>
      </form>
    </div>
  );
}