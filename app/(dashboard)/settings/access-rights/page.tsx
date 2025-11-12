'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { userAPI } from '@/lib/api';
import { Shield, Edit, Users, CheckCircle, XCircle } from 'lucide-react';

interface UserGroup {
  id: number;
  name: string;
  description: string;
  permissions: string;
  is_active: boolean;
  created_at: string;
}

interface Module {
  id: number;
  module_code: string;
  module_name: string;
  category: string;
}

export default function AccessRightsPage() {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsRes, modulesRes] = await Promise.all([
        userAPI.getUserGroups(),
        userAPI.getModules()
      ]);

      if (groupsRes.success) {
        setGroups(groupsRes.data || []);
      } else {
        setError(groupsRes.message || 'Failed to load user groups');
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

  const getGroupPermissions = (group: UserGroup) => {
    if (!group.permissions) return [];
    return group.permissions.split(',').map(p => p.trim());
  };

  const hasPermission = (group: UserGroup, moduleCode: string, action: string) => {
    const permissions = getGroupPermissions(group);
    return permissions.includes(`${moduleCode.toLowerCase()}:${action}`);
  };

  const getModulePermissionCount = (group: UserGroup, moduleCode: string) => {
    const actions = ['read', 'create', 'update', 'delete', 'approve'];
    return actions.filter(action => hasPermission(group, moduleCode, action)).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Hak Akses...</p>
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
              <Shield className="w-8 h-8 mr-3 text-blue-600" />
              Hak Akses
            </h1>
            <p className="text-gray-600 mt-1">Kelola hak akses untuk setiap grup pengguna</p>
          </div>
          <Link
            href="/settings/user-groups"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Users className="w-5 h-5" />
            Kelola Grup Pengguna
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

      {/* Access Rights Matrix */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grup Pengguna
                </th>
                {modules.map((module) => (
                  <th key={module.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {module.module_name}
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={modules.length + 2} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada grup pengguna ditemukan
                  </td>
                </tr>
              ) : (
                groups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{group.name}</div>
                        <div className="text-sm text-gray-500">{group.description}</div>
                        <div className="flex items-center mt-1">
                          {group.is_active ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Nonaktif
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    {modules.map((module) => {
                      const permissionCount = getModulePermissionCount(group, module.module_code);
                      const totalActions = 5; // read, create, update, delete, approve

                      return (
                        <td key={module.id} className="px-4 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {permissionCount}/{totalActions}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(permissionCount / totalActions) * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              hak akses
                            </div>
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Link
                        href={`/settings/user-groups/${group.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Edit Hak Akses"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-800">
              <strong>{groups.length}</strong> grup pengguna • <strong>{modules.length}</strong> modul aplikasi
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Klik ikon edit untuk mengatur hak akses detail setiap grup pengguna
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-600">
              Total Permissions: {groups.length * modules.length * 5}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}