// ==================================
// FILE: src/pages/profile/UserProfilePage.jsx
// ==================================
import React, { useState, useEffect } from 'react';
import { ChevronLeft, User, Mail, Phone, Shield, Calendar, MapPin, Edit2, Save, X, Key, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api/users';
import { auditLogsAPI } from '../../services/api/audit';
import { showSuccess, showError, showLoading, closeLoading } from '../../utils/alerts';
import ChangePasswordModal from '../users/ChangePasswordModal';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    username: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        username: user.username || ''
      });
      loadActivity();
    }
  }, [user]);

  const loadActivity = async () => {
    try {
      const logs = await auditLogsAPI.getByUser(user.user_id, 20);
      setRecentActivity(logs);
    } catch (err) {
      console.error('Error loading activity:', err);
    }
  };

  const handleSave = async () => {
    try {
      showLoading('Updating profile...');
      
      await usersAPI.update(user.user_id, formData);
      
      // Update auth context
      if (updateUser) {
        updateUser({ ...user, ...formData });
      }
      
      closeLoading();
      showSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      closeLoading();
      showError(err.message, 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      username: user.username || ''
    });
    setIsEditing(false);
  };

  const handleChangePassword = async (newPassword) => {
    try {
      await usersAPI.updatePassword(user.user_id, newPassword);
      showSuccess('Password changed successfully!');
      setShowPasswordModal(false);
    } catch (err) {
      showError(err.message, 'Failed to change password');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadge = (role) => {
    const colors = {
      Admin: 'bg-red-100 text-red-700',
      Manager: 'bg-purple-100 text-purple-700',
      Staff: 'bg-blue-100 text-blue-700',
      Customer: 'bg-gray-100 text-gray-700'
    };

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${colors[role]}`}>
        {role}
      </span>
    );
  };

  const getActionColor = (action) => {
    const colors = {
      INSERT: 'text-green-600',
      UPDATE: 'text-blue-600',
      DELETE: 'text-red-600',
      LOGIN: 'text-indigo-600',
      LOGOUT: 'text-gray-600'
    };
    return colors[action] || 'text-gray-600';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div>
      <div onClick={() => navigate('/Dashboard')} className="flex items-center mb-6 cursor-pointer">
        <ChevronLeft className="text-gray-400 mr-2" size={20} />
        <span className="text-sm text-gray-500">Back to Dashboard</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500">Manage your account settings and view your activity</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b">
          <nav className="flex space-x-4 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <User size={18} />
              <span>Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'activity'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Activity size={18} />
              <span>Recent Activity</span>
            </button>
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {getInitials(user.full_name)}
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.full_name}</h2>
                  <p className="text-gray-500">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {getRoleBadge(user.role)}
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center space-x-2"
                    >
                      <Edit2 size={16} />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Key size={16} />
                      <span>Change Password</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Save size={16} />
                      <span>Save Changes</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={user.role}
                    disabled
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Member Since</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={new Date(user.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                    disabled
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            
            {recentActivity.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((log) => (
                  <div key={log.log_id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      log.action === 'INSERT' ? 'bg-green-100' :
                      log.action === 'UPDATE' ? 'bg-blue-100' :
                      log.action === 'DELETE' ? 'bg-red-100' :
                      'bg-gray-100'
                    }`}>
                      <Activity className={getActionColor(log.action)} size={18} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">
                          {log.action} on {log.table_name}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {log.record_id && (
                        <p className="text-sm text-gray-500">Record ID: {log.record_id}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal
          user={user}
          onSave={handleChangePassword}
          onCancel={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  );
}