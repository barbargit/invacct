import React from 'react';

interface FormCheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

export default function FormCheckbox({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  className = '',
}: FormCheckboxProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
      />
      <label 
        htmlFor={name} 
        className={`ml-2 text-sm text-gray-700 ${disabled ? 'opacity-50' : ''}`}
      >
        {label}
      </label>
    </div>
  );
}
