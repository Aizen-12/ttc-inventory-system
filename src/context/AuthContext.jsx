// ==================================
// FILE: src/context/AuthContext.jsx
// ==================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { loginUser, logoutUser } from '../services/api/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION immediately on mount —
    // this handles both "no session" and "existing session" in one place,
    // so we don't need a separate getSession() call.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') {
          // Fires once on mount — session is null if not logged in
          if (session?.user?.email) {
            await fetchProfile(session.user.email);
          } else {
            setLoading(false); // No session → stop loading, go to login
          }
        } else if (event === 'SIGNED_IN') {
          if (session?.user?.email) {
            await fetchProfile(session.user.email);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user?.email) {
          await fetchProfile(session.user.email);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (email) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, username, email, full_name, role, phone, status, last_login')
        .eq('email', email)
        .eq('status', 'Active')
        .single();

      if (error || !data) {
        setUser(null);
      } else {
        setUser(data);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const userData = await loginUser(username, password);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}