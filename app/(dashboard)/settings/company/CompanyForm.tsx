'use client';

import { useState } from 'react';
import { LogoUploader } from './components/LogoUploader';
import { Building2, Mail, Phone, Globe, FileText, MapPin } from 'lucide-react';

interface CompanyFormProps {
  company: any;
  onSave: (data: any) => void;
}

export function CompanyForm({ company, onSave }: CompanyFormProps) {
  const [formData, setFormData] = useState(company);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo Section */}
      <div className="pb-6 border-b">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Company Logo</h3>
        <LogoUploader
          logoUrl={formData.logo_url}
          onChange={(url: string) => setFormData({ ...formData, logo_url: url })}
        />
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Building2 className="w-5 h-5 mr-2" />
          Basic Information
        </h3>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="PT. Your Company Name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            NPWP (Tax ID) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="npwp"
            value={formData.npwp || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="00.000.000.0-000.000"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Format: 00.000.000.0-000.000</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Address
          </label>
          <textarea
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Full company address"
            rows={3}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(021) 000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="info@company.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://www.company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Tax Office
            </label>
            <input
              type="text"
              name="tax_office"
              value={formData.tax_office || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="KPP Pratama Jakarta Selatan"
            />
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="pt-4 border-t">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-semibold">Created:</span>{' '}
            {new Date(formData.created_at).toLocaleString('id-ID')}
          </div>
          <div>
            <span className="font-semibold">Last Updated:</span>{' '}
            {new Date(formData.updated_at).toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6 flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {isSubmitting ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Saving...
            </>
          ) : (
            <>💾 Save Changes</>
          )}
        </button>

        <button
          type="button"
          onClick={() => setFormData(company)}
          className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
