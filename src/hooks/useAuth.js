// ==================================
// FILE: src/hooks/useAuth.js (FIXED)
// Fixes:
// - Removed import from utils/auth (wrong localStorage key)
// - Now imports from services/api/auth (correct session key)
// - Fixed typo: 'iisAuthenticated' -> 'isAuthenticated'
// - logoutUser() is async so we .finally() before navigating
// ==================================

import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../services/api/auth';

export default function useAuth() {
  const navigate = useNavigate();

  const logout = () => {
    logoutUser().finally(() => navigate('/login'));
  };

  const getUser = () => {
    return getCurrentUser();
  };

  return {
    logout,
    getUser,
    isAuthenticated: !!getCurrentUser(), // FIXED: was 'iisAuthenticated'
    user: getCurrentUser()
  };
}