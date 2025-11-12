import React from 'react';

interface FormButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
}

export default function FormButton({
  children,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  fullWidth = false,
}: FormButtonProps) {
  const baseClasses = 'px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
    ghost: 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
