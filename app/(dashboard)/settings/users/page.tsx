'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { userAPI } from '@/lib/api';
import { UserPlus, Edit, Trash2, Users, Shield, UserCheck } from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<{[key: number]: string}>({});

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUsers(1, 100);
        if (response.success) {
        // Transform users to ensure role is a string. Backend may return
        // a nested `role` object or a `role_name` string depending on query.
        const transformedUsers = (response.data || []).map((user: any) => ({
          ...user,
          role:
            // if role is already a string
            (typeof user.role === 'string' && user.role) ? user.role :
            // if role is an object with role_name
            (user.role && typeof user.role === 'object' && user.role.role_name) ? user.role.role_name :
            // fallback to role_name field or default
            user.role_name || 'No Role',
        }));
        setUsers(transformedUsers);
      } else {
        setError(response.message || 'Failed to load users');
      }
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await userAPI.getRoles();
      if (response.success) {
        const roleMap: {[key: number]: string} = {};
        response.data.forEach((role: any) => {
          roleMap[role.id] = role.role_name;
        });
        setRoles(roleMap);
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'admin':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'finance':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleName = (user: User) => {
    return (user.role as any) || 'No Role';
  };

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      // Note: Delete user API endpoint might need to be implemented
      // For now, just show a message
      alert('Delete functionality will be implemented');
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
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
              <Users className="w-8 h-8 mr-3 text-blue-600" />
              User Management
            </h1>
            <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
          </div>
          <Link
            href="/settings/users/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Add User
          </Link>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
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
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No users found. Create your first user to get started.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        {getRoleIcon(getRoleName(user))}
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(getRoleName(user))}`}>
                          {getRoleName(user)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/settings/users/${user.id}/edit`}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete User"
                          onClick={() => handleDelete(user.id, user.username)}
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
              <strong>{users.length}</strong> total users
              {users.filter(u => u.is_active).length > 0 && (
                <span> • <strong>{users.filter(u => u.is_active).length}</strong> active</span>
              )}
            </p>
          </div>
          <Link
            href="/settings/roles"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage Roles →
          </Link>
        </div>
      </div>
    </div>
  );
}