'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { userAPI } from '@/lib/api';
import { ArrowLeft, Save, User, Mail, Lock, Shield } from 'lucide-react';
import Link from 'next/link';

interface Role {
  id: number;
  role_name: string;
  description: string;
  is_active: boolean;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role_id: '',
    is_active: true,
  });

  useEffect(() => {
    fetchUser();
    fetchRoles();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await userAPI.getUserById(parseInt(id));
      if (response.success && response.data) {
        console.log('User data from API:', response.data);
        console.log('User role_id:', response.data.role_id);
        console.log('User role_name:', response.data.role_name);
        setFormData({
          username: response.data.username || '',
          email: response.data.email || '',
          password: '', // Don't populate password for security
          role_id: response.data.role_id ? response.data.role_id.toString() : '',
          is_active: response.data.is_active !== false,
        });
      } else {
        toast.error('Failed to load user details');
        router.push('/settings/users');
      }
    } catch (error: any) {
      console.error('Fetch user error:', error);
      toast.error('Failed to load user details');
      router.push('/settings/users');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await userAPI.getRoles();
      if (response.success) {
        console.log('Roles from API:', response.data);
        setRoles(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
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
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!formData.role_id) {
      toast.error('Role is required');
      return;
    }

    setLoading(true);
    try {
      const submitData: any = {
        username: formData.username,
        email: formData.email,
        role_id: parseInt(formData.role_id),
        is_active: formData.is_active,
      };

      // Only include password if it's provided (not empty)
      console.log('formData.password:', formData.password);
      console.log('formData.password type:', typeof formData.password);
      console.log('formData.password trim:', formData.password?.trim());
      console.log('formData.password length:', formData.password?.length);

      if (formData.password !== undefined && formData.password !== null && formData.password.trim() !== '') {
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          return;
        }
        submitData.password = formData.password;
        console.log('Password included in submitData:', submitData.password);
      } else {
        console.log('Password NOT included in submitData');
      }

      console.log('Final submitData:', submitData);

      const response = await userAPI.updateUser(parseInt(id), submitData);

      if (response.success) {
        toast.success('User updated successfully!');
        router.push('/settings/users');
      } else {
        toast.error(response.message || 'Failed to update user');
      }
    } catch (error: any) {
      console.error('Update user error:', error);
      toast.error(error.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/settings/users"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
        <p className="text-gray-600 mt-1">Update user information and permissions</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter username"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Unique username for login
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email address"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Valid email address for notifications
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Leave empty to keep current password"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to keep current password. Minimum 6 characters if changing.
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role_id}
              onChange={(e) => {
                console.log('Selected role value:', e.target.value);
                console.log('Selected role text:', e.target.options[e.target.selectedIndex]?.text);
                handleInputChange('role_id', e.target.value);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.role_name} (ID: {role.id})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the role that determines user permissions
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
              Active User
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/settings/users"
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
            {loading ? 'Updating...' : 'Update User'}
          </button>
        </div>
      </form>
    </div>
  );
}