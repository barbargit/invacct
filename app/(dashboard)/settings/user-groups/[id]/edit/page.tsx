'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { userAPI } from '@/lib/api';
import { ArrowLeft, Save, Shield, FileText, CheckSquare, Square } from 'lucide-react';
import Link from 'next/link';

interface Permission {
  id: number;
  resource: string;
  action: string;
  description: string;
}

interface Module {
  id: number;
  module_code: string;
  module_name: string;
  category: string;
}

export default function EditUserGroupPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    is_active: true,
  });

  useEffect(() => {
    fetchGroup();
    fetchPermissions();
    fetchModules();
  }, [id]);

  const fetchGroup = async () => {
    try {
      const response = await userAPI.getUserGroupById(parseInt(id));
      if (response.success && response.data) {
        // Parse permissions string into array
        let permissionsArray: string[] = [];
        if (response.data.permissions) {
          try {
            // If it's already an array, use it; if string, split by comma
            if (Array.isArray(response.data.permissions)) {
              permissionsArray = response.data.permissions;
            } else if (typeof response.data.permissions === 'string') {
              permissionsArray = response.data.permissions.split(',').map((p: string) => p.trim());
            }
          } catch (e) {
            permissionsArray = [];
          }
        }

        setFormData({
          name: response.data.name || '',
          description: response.data.description || '',
          permissions: permissionsArray,
          is_active: response.data.is_active !== false,
        });
      } else {
        toast.error('Failed to load user group details');
        router.push('/settings/user-groups');
      }
    } catch (error: any) {
      console.error('Fetch user group error:', error);
      toast.error('Failed to load user group details');
      router.push('/settings/user-groups');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await userAPI.getPermissions();
      if (response.success) {
        setPermissions(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await userAPI.getModules();
      if (response.success) {
        setModules(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionToggle = (permissionKey: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionKey)
        ? prev.permissions.filter(p => p !== permissionKey)
        : [...prev.permissions, permissionKey]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    setLoading(true);
    try {
      // Convert permissions array to comma-separated string for backend
      const submitData = {
        ...formData,
        permissions: formData.permissions.join(',')
      };

      const response = await userAPI.updateUserGroup(parseInt(id), submitData);

      if (response.success) {
        toast.success('User group updated successfully!');
        router.push('/settings/user-groups');
      } else {
        toast.error(response.message || 'Failed to update user group');
      }
    } catch (error: any) {
      console.error('Update user group error:', error);
      toast.error(error.message || 'Failed to update user group');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user group details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/settings/user-groups"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to User Groups
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">Edit User Group</h1>
        <p className="text-gray-600 mt-1">Update user group information</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter group name"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Unique name for the user group
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter group description (optional)"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Optional: Describe the purpose of this group
            </p>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Access Rights <span className="text-gray-500">(optional)</span>
            </label>
            <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
              {modules.length === 0 ? (
                <p className="text-sm text-gray-500">No modules available</p>
              ) : (
                <div className="space-y-4">
                  {modules.map((module) => {
                    // Get permissions for this module
                    const modulePermissions = permissions.filter(p => p.resource.toLowerCase() === module.module_code.toLowerCase());

                    return (
                      <div key={module.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{module.module_name}</h4>
                            <p className="text-xs text-gray-500">{module.category}</p>
                          </div>
                          {/* Select All for this module */}
                          <button
                            type="button"
                            onClick={() => {
                              const allModulePermissions = modulePermissions.map(p => `${p.resource}:${p.action}`);
                              const hasAll = allModulePermissions.every(p => formData.permissions.includes(p));
                              if (hasAll) {
                                // Remove all
                                setFormData(prev => ({
                                  ...prev,
                                  permissions: prev.permissions.filter(p => !allModulePermissions.includes(p))
                                }));
                              } else {
                                // Add all
                                setFormData(prev => ({
                                  ...prev,
                                  permissions: [...new Set([...prev.permissions, ...allModulePermissions])]
                                }));
                              }
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {modulePermissions.every(p => formData.permissions.includes(`${p.resource}:${p.action}`)) ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>

                        {modulePermissions.length === 0 ? (
                          <p className="text-sm text-gray-500">No permissions defined for this module</p>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {modulePermissions.map((permission) => {
                              const permissionKey = `${permission.resource}:${permission.action}`;
                              const isChecked = formData.permissions.includes(permissionKey);

                              return (
                                <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handlePermissionToggle(permissionKey)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700 capitalize">{permission.action}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Configure access rights for this user group by selecting appropriate permissions for each module
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
              Active Group
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/settings/user-groups"
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
            {loading ? 'Updating...' : 'Update Group'}
          </button>
        </div>
      </form>
    </div>
  );
}