'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { userAPI } from '@/lib/api';
import { ArrowLeft, Save, Shield, CheckSquare, Square, Settings } from 'lucide-react';
import Link from 'next/link';

interface Module {
  id: number;
  module_code: string;
  module_name: string;
  category: string;
}

interface RolePermission {
  id: number;
  role_id: number;
  module_id: number;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  module: Module;
}

export default function CreateRolePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);
  const [permissions, setPermissions] = useState<{[moduleId: number]: RolePermission}>({});
  const [formData, setFormData] = useState({
    role_name: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setFetchLoading(true);
      const modulesRes = await userAPI.getModules();

      if (modulesRes.success) {
        setModules(modulesRes.data || []);
      } else {
        toast.error('Failed to load modules');
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error('Failed to load modules');
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

  const handlePermissionChange = (moduleId: number, action: keyof RolePermission, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [action]: value,
        module_id: moduleId,
        role_id: 0, // Will be set when role is created
        id: prev[moduleId]?.id || 0,
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.role_name.trim()) {
      toast.error('Role name is required');
      return;
    }

    setLoading(true);
    try {
      // Create role first
      const roleRes = await userAPI.createRole(formData);
      if (!roleRes.success) {
        toast.error(roleRes.message || 'Failed to create role');
        return;
      }

      const newRoleId = roleRes.data.id;

      // Create permissions for the new role
      for (const module of modules) {
        const perm = permissions[module.id];
        if (perm && (perm.can_view || perm.can_add || perm.can_edit || perm.can_delete || perm.can_approve)) {
          const permData = {
            role_id: newRoleId,
            module_id: module.id,
            can_view: perm.can_view || false,
            can_add: perm.can_add || false,
            can_edit: perm.can_edit || false,
            can_delete: perm.can_delete || false,
            can_approve: perm.can_approve || false,
          };

          await userAPI.createRolePermission(permData);
        }
      }

      toast.success('Role and permissions created successfully!');
      router.push('/settings/roles');
    } catch (error: any) {
      console.error('Create error:', error);
      toast.error(error.message || 'Failed to create role and permissions');
    } finally {
      setLoading(false);
    }
  };

  const toggleAllForModule = (moduleId: number) => {
    const currentPerm = permissions[moduleId];
    const allEnabled = currentPerm?.can_view && currentPerm?.can_add && currentPerm?.can_edit && currentPerm?.can_delete && currentPerm?.can_approve;

    const newValue = !allEnabled;
    handlePermissionChange(moduleId, 'can_view', newValue);
    handlePermissionChange(moduleId, 'can_add', newValue);
    handlePermissionChange(moduleId, 'can_edit', newValue);
    handlePermissionChange(moduleId, 'can_delete', newValue);
    handlePermissionChange(moduleId, 'can_approve', newValue);
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/settings/roles"
          className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Roles
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">Create New Role</h1>
        <p className="text-gray-600 mt-1">Configure role details and module permissions</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Role Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.role_name}
                  onChange={(e) => handleInputChange('role_name', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter role name"
                  required
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Active Role
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter role description (optional)"
            />
          </div>

          {/* Module Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Module Permissions
            </label>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {modules.map((module) => {
                const perm = permissions[module.id] || {
                  can_view: false,
                  can_add: false,
                  can_edit: false,
                  can_delete: false,
                  can_approve: false,
                };

                const hasAnyPermission = perm.can_view || perm.can_add || perm.can_edit || perm.can_delete || perm.can_approve;

                return (
                  <div key={module.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{module.module_name}</h4>
                        <p className="text-sm text-gray-600">{module.category}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleAllForModule(module.id)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          hasAnyPermission
                            ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {hasAnyPermission ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {[
                        { key: 'can_view', label: 'View', icon: '👁️' },
                        { key: 'can_add', label: 'Add', icon: '➕' },
                        { key: 'can_edit', label: 'Edit', icon: '✏️' },
                        { key: 'can_delete', label: 'Delete', icon: '🗑️' },
                        { key: 'can_approve', label: 'Approve', icon: '✅' },
                      ].map(({ key, label, icon }) => (
                        <label key={key} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(perm[key as keyof typeof perm])}
                            onChange={(e) => handlePermissionChange(module.id, key as keyof RolePermission, e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">
                            {icon} {label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-4">
          <Link
            href="/settings/roles"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create Role'}
          </button>
        </div>
      </form>
    </div>
  );
}