'use client';

import { Building2 } from 'lucide-react';

interface CompanyHeaderProps {
  company: {
    name: string;
    npwp: string;
    address: string;
    phone: string;
    email: string;
    logo_url?: string;
  };
  className?: string;
}

export default function CompanyHeader({ company, className = '' }: CompanyHeaderProps) {
  return (
    <div className={`border-b-2 border-gray-300 pb-4 mb-6 ${className}`}>
      <div className="flex items-start justify-between">
        {/* Logo & Company Name */}
        <div className="flex items-center gap-4">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.name}
              className="w-16 h-16 object-contain"
            />
          ) : (
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-10 h-10 text-blue-600" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-sm text-gray-600">NPWP: {company.npwp}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-right text-sm text-gray-600">
          <p className="font-medium">{company.address}</p>
          <p>Tel: {company.phone}</p>
          <p>Email: {company.email}</p>
        </div>
      </div>
    </div>
  );
}
