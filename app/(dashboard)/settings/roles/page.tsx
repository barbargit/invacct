'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { userAPI } from '@/lib/api';
import { Shield, Edit, Plus, Users, Settings, CheckSquare, Square } from 'lucide-react';

interface Role {
  id: number;
  role_name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

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

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [rolePermissions, setRolePermissions] = useState<{[roleId: number]: RolePermission[]}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, modulesRes] = await Promise.all([
        userAPI.getRoles(),
        userAPI.getModules()
      ]);

      if (rolesRes.success) {
        setRoles(rolesRes.data || []);
        // Fetch permissions for each role
        const permissions: {[roleId: number]: RolePermission[]} = {};
        for (const role of rolesRes.data || []) {
          try {
            const permRes = await userAPI.getRolePermissions(role.id);
            if (permRes.success) {
              permissions[role.id] = permRes.data || [];
            }
          } catch (err) {
            console.error(`Failed to fetch permissions for role ${role.id}:`, err);
          }
        }
        setRolePermissions(permissions);
      } else {
        setError(rolesRes.message || 'Failed to load roles');
      }

      if (modulesRes.success) {
        setModules(modulesRes.data || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getRolePermissionCount = (roleId: number) => {
    const permissions = rolePermissions[roleId] || [];
    let count = 0;
    permissions.forEach(perm => {
      if (perm.can_view) count++;
      if (perm.can_add) count++;
      if (perm.can_edit) count++;
      if (perm.can_delete) count++;
      if (perm.can_approve) count++;
    });
    return count;
  };

  const getTotalPossiblePermissions = () => {
    return modules.length * 5; // 5 actions per module
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Roles & Permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="w-8 h-8 mr-3 text-purple-600" />
              Roles & Permissions
            </h1>
            <p className="text-gray-600 mt-1">Kelola peran dan hak akses modul aplikasi</p>
          </div>
          <Link
            href="/settings/roles/create"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Role
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Roles Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No roles found. Create your first role to get started.
                  </td>
                </tr>
              ) : (
                roles.map((role) => {
                  const permissionCount = getRolePermissionCount(role.id);
                  const totalPossible = getTotalPossiblePermissions();

                  return (
                    <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {role.role_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {role.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          role.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {role.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {permissionCount}/{totalPossible}
                          </div>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${totalPossible > 0 ? (permissionCount / totalPossible) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Link
                          href={`/settings/roles/${role.id}/edit`}
                          className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                          title="Edit Role & Permissions"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-800">
              <strong>{roles.length}</strong> roles • <strong>{modules.length}</strong> modules • <strong>{getTotalPossiblePermissions()}</strong> total permissions
            </p>
            <p className="text-xs text-purple-600 mt-1">
              Klik ikon edit untuk mengatur permissions detail setiap role
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/settings/access-rights"
              className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
            >
              <Users className="w-4 h-4" />
              Hak Akses Grup →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}