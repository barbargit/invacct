'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import FormField from '@/components/forms/FormField';
import FormSelect from '@/components/forms/FormSelect';
import { ImageUploader } from '@/components/forms/ImageUploader';
import FormCheckbox from '@/components/forms/FormCheckbox';
import FormButton from '@/components/forms/FormButton';
import ToastContainer from '@/components/ui/ToastContainer';
import { useToast } from '@/hooks/useToast';
import { masterAPI, API_BASE_URL } from '@/lib/api';

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const { toasts, success, error: showError, removeToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category_id: '',
    unit: 'PCS',
    cost: 0,
    price: 0,
    stock: 0,
    is_vat_applicable: true,
    image_url: '',
  });
  const [categories, setCategories] = useState<any[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchItem();
    fetchCategories();
  }, [params.id]);

  const fetchCategories = async () => {
    try {
      const data = await masterAPI.getItemCategories();
      if (data && data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchItem = async () => {
    try {
      const id = Number(params.id);
      const data = await masterAPI.getItemById(id);

      if (data && data.success) {
        const d = data.data || {};
        setFormData({
          code: d.code || '',
          name: d.name || '',
          category_id: d.category_id || '',
          unit: d.unit || 'PCS',
          cost: d.cost || 0,
          price: d.price || 0,
          stock: d.stock || 0,
          is_vat_applicable: d.is_vat_applicable ?? true,
          image_url: d.image_url || '',
        });
      } else {
        showError((data && data.message) || 'Failed to fetch item details');
      }
    } catch (err: any) {
      showError(err.message || 'An error occurred');
    } finally {
      setFetching(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    if (formData.cost < 0) {
      newErrors.cost = 'Cost must be positive';
    }
    if (formData.price < 0) {
      newErrors.price = 'Price must be positive';
    }
    if (formData.stock < 0) {
      newErrors.stock = 'Stock must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showError('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Convert category_id to number if it's not empty
      const submitData = {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
      };
      console.log('Sending form data:', submitData);
      const id = Number(params.id);
      // Use shared API helper which includes auth headers
      const data = await masterAPI.updateItem(id, submitData);

      console.log('Update response data:', data);

      if (data && data.success) {
        success('Item updated successfully!');
        setTimeout(() => {
          router.push('/master/items');
        }, 1000);
      } else {
        showError((data && data.message) || 'Failed to update item');
      }
    } catch (err: any) {
      console.error('Update error:', err);
      showError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading item details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/master/items')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Items List
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Item</h1>
            <p className="text-gray-600 mt-1">Update item information</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Item Code & Name */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Item Code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                disabled={true}
                required
              />
              <FormField
                label="Item Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="e.g., Laptop Dell XPS 13"
                required
              />
            </div>

            {/* Category */}
            <FormSelect
              label="Category"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              options={[
                { value: '', label: 'Select Category' },
                ...categories.map((category) => ({
                  value: category.id.toString(),
                  label: `${category.name} (${category.code})`
                }))
              ]}
            />
            <p className="text-xs text-gray-500 mt-1">
              Choose a category for this item (optional)
            </p>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Purchase Cost"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleChange}
                error={errors.cost}
                min={0}
                step="0.01"
                placeholder="0.00"
              />
              <FormField
                label="Selling Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                error={errors.price}
                min={0}
                step="0.01"
                placeholder="0.00"
              />
            </div>

            {/* Stock */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Current Stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                error={errors.stock}
                min={0}
                placeholder="0"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PCS">PCS (Pieces)</option>
                  <option value="BOX">BOX</option>
                  <option value="KG">KG (Kilogram)</option>
                  <option value="LITER">LITER</option>
                  <option value="METER">METER</option>
                  <option value="PACK">PACK</option>
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <ImageUploader
              imageUrl={formData.image_url}
              onChange={(imageUrl) => setFormData(prev => ({ ...prev, image_url: imageUrl }))}
              maxSizeMB={1}
              acceptedTypes={['.jpg', '.jpeg', '.png']}
            />

            {/* Taxable */}
            <FormCheckbox
              label="Subject to VAT (PPN)"
              name="is_vat_applicable"
              checked={formData.is_vat_applicable}
              onChange={handleCheckbox}
            />

            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t">
              <FormButton
                type="button"
                variant="ghost"
                onClick={() => router.push('/master/items')}
                disabled={loading}
              >
                Cancel
              </FormButton>
              <FormButton
                type="submit"
                variant="primary"
                loading={loading}
              >
                {loading ? 'Updating...' : 'Update Item'}
              </FormButton>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
