// src/components/LogoutButton.jsx
import React from 'react';
import { LogOut } from 'lucide-react';
import useAuth from '../hooks/useAuth';

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
      title="Logout"
    >
      <LogOut className="w-5 h-5" />
      <span>Logout</span>
    </button>
  );
}