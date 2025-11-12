'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { userAPI } from '@/lib/api';
import { UserPlus, Edit, Trash2, Users, Shield } from 'lucide-react';

interface UserGroup {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export default function UserGroupsPage() {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUserGroups();
      if (response.success) {
        setGroups(response.data || []);
      } else {
        setError(response.message || 'Failed to load user groups');
      }
    } catch (err: any) {
      console.error('Failed to fetch user groups:', err);
      setError('Failed to load user groups');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" group?`)) {
      return;
    }

    try {
      await userAPI.deleteUserGroup(id);
      setGroups(groups.filter(g => g.id !== id));
    } catch (err: any) {
      console.error('Failed to delete user group:', err);
      alert('Failed to delete user group');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user groups...</p>
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
              User Groups
            </h1>
            <p className="text-gray-600 mt-1">Manage user groups and permissions</p>
          </div>
          <Link
            href="/settings/user-groups/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Add Group
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchGroups}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Groups Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No user groups found. Create your first group to get started.
                  </td>
                </tr>
              ) : (
                groups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {group.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {group.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        group.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {group.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(group.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/settings/user-groups/${group.id}/edit`}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit Group"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete Group"
                          onClick={() => handleDelete(group.id, group.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
              <strong>{groups.length}</strong> total groups
              {groups.filter(g => g.is_active).length > 0 && (
                <span> • <strong>{groups.filter(g => g.is_active).length}</strong> active</span>
              )}
            </p>
          </div>
          <Link
            href="/settings/users"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage Users →
          </Link>
        </div>
      </div>
    </div>
  );
}