'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { masterAPI } from '@/lib/api';
import { ArrowLeft, Save, Tag } from 'lucide-react';
import Link from 'next/link';

export default function EditItemCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      const response = await masterAPI.getItemCategoryById(parseInt(id));

      if (response.success && response.data) {
        setFormData({
          code: response.data.code || '',
          name: response.data.name || '',
          description: response.data.description || '',
          is_active: response.data.is_active !== false,
        });
      } else {
        toast.error('Failed to load item category details');
        router.push('/master/item-categories');
      }
    } catch (error: any) {
      console.error('Fetch item category error:', error);
      toast.error('Failed to load item category details');
      router.push('/master/item-categories');
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

    // Validation
    if (!formData.code.trim()) {
      toast.error('Category code is required');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (formData.code.length < 2) {
      toast.error('Category code must be at least 2 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await masterAPI.updateItemCategory(parseInt(id), formData);

      if (response.success) {
        toast.success('Item category updated successfully!');
        router.push('/master/item-categories');
      } else {
        toast.error(response.message || 'Failed to update item category');
      }
    } catch (error: any) {
      console.error('Update item category error:', error);
      toast.error(error.message || 'Failed to update item category');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading item category details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/master/item-categories"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Item Categories
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Tag className="w-8 h-8 mr-3 text-blue-600" />
          Edit Item Category
        </h1>
        <p className="text-gray-600 mt-1">Update item category information</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Category Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., ELEC, CLOTH, FOOD"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use a unique code (2-20 characters) to identify the category
            </p>
          </div>

          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Electronics, Clothing, Food & Beverage"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a descriptive name for the category
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe what types of items belong to this category..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide additional details about this category
            </p>
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
              Active Category
            </label>
            <p className="text-xs text-gray-500 ml-4">
              Inactive categories won't be available for new items
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/master/item-categories"
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
            {loading ? 'Updating...' : 'Update Category'}
          </button>
        </div>
      </form>
    </div>
  );
}