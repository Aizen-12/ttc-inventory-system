// ==================================
// FILE: src/pages/users/UsersPage.jsx
// ==================================
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Users as UsersIcon, Search, Plus, Edit2, Trash2, Key, Ban, CheckCircle, Shield } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../../services/api/users';
import UserForm from './UserForm';
import ChangePasswordModal from './ChangePasswordModal';
import { showSuccess, showError, showConfirm } from '../../utils/alerts';

export default function UsersPage() {
  const navigate = useNavigate();
  const { users, loading, error, createUser, updateUser, updatePassword, deactivateUser, activateUser, deleteUser } = useUsers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, [users]);

  const loadStats = async () => {
    try {
      const statsData = await usersAPI.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleSave = async (userData) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.user_id, userData);
        showSuccess('User updated successfully!');
      } else {
        await createUser(userData);
        showSuccess('User created successfully!');
      }
      setShowForm(false);
      setEditingUser(null);
    } catch (err) {
      showError(err.message, 'Failed to save user');
    }
  };

  const handleChangePassword = async (newPassword) => {
    try {
      await updatePassword(selectedUser.user_id, newPassword);
      showSuccess('Password updated successfully!');
      setShowPasswordModal(false);
      setSelectedUser(null);
    } catch (err) {
      showError(err.message, 'Failed to update password');
    }
  };

  const handleDeactivate = async (userId) => {
    const result = await showConfirm(
      'Deactivate this user? They will not be able to log in.',
      'Deactivate User'
    );
    
    if (result.isConfirmed) {
      try {
        await deactivateUser(userId);
        showSuccess('User deactivated successfully');
      } catch (err) {
        showError(err.message, 'Failed to deactivate user');
      }
    }
  };

  const handleActivate = async (userId) => {
    try {
      await activateUser(userId);
      showSuccess('User activated successfully');
    } catch (err) {
      showError(err.message, 'Failed to activate user');
    }
  };

  const handleDelete = async (userId) => {
    const result = await showConfirm(
      'Delete this user? This action cannot be undone.',
      'Delete User'
    );
    
    if (result.isConfirmed) {
      try {
        await deleteUser(userId);
        showSuccess('User deleted successfully');
      } catch (err) {
        showError(err.message, 'Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role) => {
    const colors = {
      Admin: 'bg-red-100 text-red-700',
      Manager: 'bg-purple-100 text-purple-700',
      Staff: 'bg-blue-100 text-blue-700',
      Customer: 'bg-gray-100 text-gray-700'
    };

    const icons = {
      Admin: <Shield size={12} />,
      Manager: <Shield size={12} />,
      Staff: null,
      Customer: null
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${colors[role]}`}>
        {icons[role]}
        <span>{role}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <div onClick={() => navigate('/dashboard')} className="flex items-center mb-6 cursor-pointer">
        <ChevronLeft className="text-gray-400 mr-2" size={20} />
        <span className="text-sm text-gray-500">Back to Dashboard</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mr-3">
            <UsersIcon className="text-cyan-600" size={20} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        </div>

        <button
          onClick={() => { setShowForm(true); setEditingUser(null); }}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Add User</span>
        </button>
      </div>

      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-cyan-800">
          <strong>Purpose:</strong> Manage system users with role-based access control. Create accounts for staff 
          members, assign roles (Admin, Manager, Staff), and control permissions. Track user activity and manage 
          account status.
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Admins</p>
            <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Managers</p>
            <p className="text-2xl font-bold text-purple-600">{stats.managers}</p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Staff</p>
            <p className="text-2xl font-bold text-blue-600">{stats.staff}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Staff">Staff</option>
            <option value="Customer">Customer</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* User Form Modal */}
      {showForm && (
        <UserForm
          user={editingUser}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingUser(null); }}
        />
      )}

      {/* Change Password Modal */}
      {showPasswordModal && selectedUser && (
        <ChangePasswordModal
          user={selectedUser}
          onSave={handleChangePassword}
          onCancel={() => { setShowPasswordModal(false); setSelectedUser(null); }}
        />
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || roleFilter || statusFilter
                      ? 'No users match your filters'
                      : 'No users found. Create your first user!'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                          <span className="text-cyan-600 font-semibold">
                            {user.full_name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.username}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{user.email}</div>
                      {user.phone && (
                        <div className="text-xs text-gray-400">{user.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        user.status === 'Active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingUser(user); setShowForm(true); }}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit User"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => { setSelectedUser(user); setShowPasswordModal(true); }}
                          className="text-purple-600 hover:text-purple-800 p-1"
                          title="Change Password"
                        >
                          <Key size={16} />
                        </button>
                        {user.status === 'Active' ? (
                          <button
                            onClick={() => handleDeactivate(user.user_id)}
                            className="text-orange-600 hover:text-orange-800 p-1"
                            title="Deactivate"
                          >
                            <Ban size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(user.user_id)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Activate"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.user_id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Showing {filteredUsers.length} of {users.length} users</span>
          </div>
        </div>
      </div>
    </div>
  );
}