// src/components/layout/Header.jsx - EXAMPLE with Logout
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, Bell, LogOut, User, Settings } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-600 hover:text-gray-900"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="text-gray-600 hover:text-gray-900 relative">
          <NotificationBell size={20} />
          
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {getInitials(user?.full_name)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              
              <button onClick={() => navigate('/profile')}
            className={`w-full flex items-center space-x-2 px-4 py-2 text-sm ${
              isActive('/profile')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
                <User size={16} />
                <span>My Profile</span>
              </button>
              
              {user?.role === 'Admin' && (
              <button onClick={() => navigate('/settings')}
            className={`w-full flex items-center space-x-2 px-4 py-2 text-sm ${
              isActive('/settings')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
                <Settings size={16} />
                <span>Settings</span>
              </button>
              )}
              
              <div className="border-t my-1"></div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </header>
  );
}